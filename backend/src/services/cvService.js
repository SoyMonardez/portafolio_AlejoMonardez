import fs from 'node:fs/promises';
import path from 'node:path';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import { env } from '../config/env.js';
import { settingsRepo } from '../repositories/settingsRepo.js';
import { settingsService } from './settingsService.js';
import { badRequest } from '../utils/httpError.js';

const DRAFT_KEY = 'admin_cv_draft';
const uploadDir = path.resolve(process.cwd(), env.upload.dir);
const cvDir = path.resolve(uploadDir, '..', 'cv');
const cvPublicBase = env.upload.publicBase.replace(/\/projects$/, '') + '/cv';

const str = (value, max = 4000) => typeof value === 'string' ? value.trim().slice(0, max) : '';
const array = (value, max = 12) => Array.isArray(value) ? value.slice(0, max) : [];
const safePdfText = value => str(value)
  .normalize('NFKC')
  .replace(/[\u2010-\u2015]/g, '-')
  .replace(/[\u2022\u25CF\u25A0\u2605]/g, '-')
  .replace(/\u00A0/g, ' ')
  .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, '')
  // Las fuentes estándar de PDF usan WinAnsi. Sustituimos glifos externos para evitar PDFs corruptos.
  .replace(/[^\x20-\x7E\u00A0-\u00FF]/g, '?');

function normalizeDraft(input) {
  const source = input && typeof input === 'object' ? input : {};
  const personal = source.personal && typeof source.personal === 'object' ? source.personal : {};
  const draft = {
    language: source.language === 'en' ? 'en' : 'es',
    targetRole: str(source.targetRole, 180),
    jobDescription: str(source.jobDescription, 20000),
    personal: {
      fullName: str(personal.fullName, 160), email: str(personal.email, 180), phone: str(personal.phone, 80),
      location: str(personal.location, 160), website: str(personal.website, 220),
      linkedin: str(personal.linkedin, 220), github: str(personal.github, 220),
    },
    summary: str(source.summary, 2500),
    experience: array(source.experience).map(item => ({
      id: str(item?.id, 100), role: str(item?.role, 220), company: str(item?.company, 220),
      location: str(item?.location, 180), start: str(item?.start, 80), end: str(item?.end, 80),
      bullets: array(item?.bullets, 8).map(value => str(value, 700)).filter(Boolean),
    })),
    education: array(source.education, 8).map(item => ({
      id: str(item?.id, 100), institution: str(item?.institution, 250), degree: str(item?.degree, 250),
      location: str(item?.location, 180), start: str(item?.start, 80), end: str(item?.end, 80),
    })),
    projects: array(source.projects, 10).map(item => ({
      id: str(item?.id, 100), name: str(item?.name, 220), link: str(item?.link, 300),
      description: str(item?.description, 1200), bullets: array(item?.bullets, 6).map(value => str(value, 700)).filter(Boolean),
    })),
    technicalSkills: str(source.technicalSkills, 2500), softSkills: str(source.softSkills, 1800),
    languages: str(source.languages, 700), certifications: str(source.certifications, 1800),
  };
  return draft;
}

function validateDraft(draft) {
  if (!draft.personal.fullName) throw badRequest('Completá el nombre antes de generar el PDF');
  if (!draft.personal.email || !draft.personal.phone) throw badRequest('Completá email y teléfono para que el CV sea contactable');
  if (!draft.summary && !draft.experience.length && !draft.education.length) throw badRequest('Agregá perfil, experiencia o formación antes de generar el PDF');
}

function wrapText(text, font, size, maxWidth) {
  const paragraphs = safePdfText(text).split(/\r?\n/);
  const lines = [];
  for (const paragraph of paragraphs) {
    if (!paragraph) { lines.push(''); continue; }
    const words = paragraph.split(/\s+/);
    let line = '';
    for (let word of words) {
      while (font.widthOfTextAtSize(word, size) > maxWidth && word.length > 1) {
        let cut = word.length - 1;
        while (cut > 1 && font.widthOfTextAtSize(word.slice(0, cut) + '-', size) > maxWidth) cut--;
        const part = word.slice(0, cut) + '-';
        if (line) { lines.push(line); line = ''; }
        lines.push(part);
        word = word.slice(cut);
      }
      const candidate = line ? `${line} ${word}` : word;
      if (font.widthOfTextAtSize(candidate, size) <= maxWidth) line = candidate;
      else { if (line) lines.push(line); line = word; }
    }
    if (line) lines.push(line);
  }
  return lines;
}

export async function buildResumePdf(draft) {
  const pdf = await PDFDocument.create();
  const regular = await pdf.embedFont(StandardFonts.Helvetica);
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold);
  const italic = await pdf.embedFont(StandardFonts.HelveticaOblique);
  const pageSize = [595.28, 841.89];
  const margin = 47;
  const contentWidth = pageSize[0] - margin * 2;
  const black = rgb(0.08, 0.08, 0.08);
  const gray = rgb(0.28, 0.28, 0.28);
  let page;
  let y;

  const addPage = () => {
    page = pdf.addPage(pageSize);
    y = pageSize[1] - margin;
    return page;
  };
  const ensure = height => { if (y - height < margin) addPage(); };
  const drawLines = (text, { font = regular, size = 9.3, lineHeight = 12.4, indent = 0, color = black, gap = 0 } = {}) => {
    const lines = wrapText(text, font, size, contentWidth - indent);
    ensure(lines.length * lineHeight + gap);
    for (const line of lines) {
      if (line) page.drawText(line, { x: margin + indent, y, size, font, color });
      y -= lineHeight;
    }
    y -= gap;
  };
  const section = title => {
    ensure(28);
    y -= 5;
    page.drawText(safePdfText(title).toUpperCase(), { x: margin, y, size: 10.2, font: bold, color: black, characterSpacing: 0.8 });
    y -= 5;
    page.drawLine({ start: { x: margin, y }, end: { x: margin + contentWidth, y }, thickness: 0.8, color: black });
    y -= 14;
  };
  const metaLine = values => values.map(value => safePdfText(value)).filter(Boolean).join(' | ');
  const entry = ({ title, meta, description, bullets }) => {
    ensure(38);
    drawLines(title, { font: bold, size: 9.7, lineHeight: 12 });
    if (meta) drawLines(meta, { font: italic, size: 8.6, lineHeight: 11, color: gray, gap: 1 });
    if (description) drawLines(description, { size: 9.1, lineHeight: 12.2, gap: 1 });
    for (const bullet of bullets || []) {
      const clean = safePdfText(bullet);
      if (!clean) continue;
      const lines = wrapText(clean, regular, 9.1, contentWidth - 13);
      ensure(lines.length * 12.1);
      page.drawText('-', { x: margin + 2, y, size: 9.1, font: bold, color: black });
      lines.forEach(line => { page.drawText(line, { x: margin + 13, y, size: 9.1, font: regular, color: black }); y -= 12.1; });
    }
    y -= 7;
  };

  addPage();
  const name = safePdfText(draft.personal.fullName).toUpperCase();
  const nameSize = name.length > 32 ? 17 : 21;
  page.drawText(name, { x: margin + (contentWidth - bold.widthOfTextAtSize(name, nameSize)) / 2, y, size: nameSize, font: bold, color: black });
  y -= 20;
  if (draft.targetRole) {
    const role = safePdfText(draft.targetRole);
    page.drawText(role, { x: margin + Math.max(0, (contentWidth - bold.widthOfTextAtSize(role, 10)) / 2), y, size: 10, font: bold, color: black });
    y -= 16;
  }
  const contact = metaLine([draft.personal.email, draft.personal.phone, draft.personal.location, draft.personal.website, draft.personal.linkedin, draft.personal.github]);
  const contactLines = wrapText(contact, regular, 8.2, contentWidth);
  contactLines.forEach(line => { page.drawText(line, { x: margin + Math.max(0, (contentWidth - regular.widthOfTextAtSize(line, 8.2)) / 2), y, size: 8.2, font: regular, color: gray }); y -= 10; });
  y -= 5;
  page.drawLine({ start: { x: margin, y }, end: { x: margin + contentWidth, y }, thickness: 1, color: black });
  y -= 10;

  if (draft.summary) { section('Perfil profesional'); drawLines(draft.summary, { lineHeight: 12.6, gap: 2 }); }
  if (draft.experience.length) {
    section('Experiencia');
    draft.experience.forEach(item => entry({
      title: item.role,
      meta: metaLine([item.company, item.location, item.start && item.end ? `${item.start} - ${item.end}` : item.start || item.end]),
      bullets: item.bullets,
    }));
  }
  if (draft.projects.length) {
    section('Proyectos relevantes');
    draft.projects.forEach(item => entry({ title: item.name, meta: item.link, description: item.description, bullets: item.bullets }));
  }
  if (draft.education.length) {
    section('Formación');
    draft.education.forEach(item => entry({
      title: item.degree,
      meta: metaLine([item.institution, item.location, item.start && item.end ? `${item.start} - ${item.end}` : item.start || item.end]),
    }));
  }
  section('Habilidades');
  if (draft.technicalSkills) drawLines(`Técnicas: ${draft.technicalSkills}`, { size: 9.1, lineHeight: 12.2 });
  if (draft.softSkills) drawLines(`Profesionales: ${draft.softSkills}`, { size: 9.1, lineHeight: 12.2 });
  if (draft.languages) drawLines(`Idiomas: ${draft.languages}`, { size: 9.1, lineHeight: 12.2 });
  if (draft.certifications) { section('Cursos y certificaciones'); drawLines(draft.certifications, { size: 9.1, lineHeight: 12.2 }); }

  pdf.setTitle(`${draft.personal.fullName} - CV`);
  pdf.setAuthor(draft.personal.fullName);
  pdf.setSubject(`CV ATS - ${draft.targetRole || 'Perfil profesional'}`);
  pdf.setKeywords(draft.technicalSkills.split(',').map(value => value.trim()).filter(Boolean).slice(0, 20));
  pdf.setCreator('alejomonardez.com - Creador de CV Harvard/ATS');
  pdf.setProducer('alejomonardez.com');
  return pdf.save();
}

async function prune(keep) {
  const files = await fs.readdir(cvDir).catch(() => []);
  await Promise.all(files.filter(name => name.startsWith('cv_') && name.endsWith('.pdf') && name !== keep).map(name => fs.unlink(path.join(cvDir, name)).catch(() => {})));
}

export const cvService = {
  normalizeDraft,
  async getDraft() {
    const raw = await settingsRepo.findOne(DRAFT_KEY);
    if (!raw) return null;
    try { return normalizeDraft(JSON.parse(raw)); } catch { return null; }
  },
  async saveDraft(input) {
    const draft = normalizeDraft(input);
    await settingsService.update({ [DRAFT_KEY]: draft });
    return draft;
  },
  async generate(input) {
    const draft = normalizeDraft(input);
    validateDraft(draft);
    await fs.mkdir(cvDir, { recursive: true });
    const bytes = await buildResumePdf(draft);
    const filename = `cv_${Date.now()}.pdf`;
    const temp = path.join(cvDir, `${filename}.tmp`);
    const final = path.join(cvDir, filename);
    await fs.writeFile(temp, bytes);
    await fs.rename(temp, final);
    const url = `${cvPublicBase}/${filename}`;
    await settingsService.update({ cv_url: url, [DRAFT_KEY]: draft });
    await prune(filename);
    return { url, filename, pages: (await PDFDocument.load(bytes)).getPageCount() };
  },
};
