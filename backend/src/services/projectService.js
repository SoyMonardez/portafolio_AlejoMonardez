import { projectRepo } from '../repositories/projectRepo.js';
import { slugify } from '../utils/slug.js';
import { badRequest } from '../utils/httpError.js';
import crypto from 'crypto';

/**
 * Normaliza el campo `images` aceptando tanto la forma nueva (array) como
 * la legacy (`image` string único).
 */
function normalizeImages(data) {
    if (Array.isArray(data.images)) {
        return data.images.filter(v => typeof v === 'string' && v !== '');
    }
    if (typeof data.image === 'string' && data.image) return [data.image];
    return [];
}

/**
 * Normaliza credenciales de demo: array de { label, user, password, note? }.
 * Filtra entradas vacías y trimea cada campo.
 */
function normalizeCredentials(creds) {
    if (!Array.isArray(creds)) return [];
    return creds
        .map(c => ({
            label:    String(c?.label    || '').trim().slice(0, 60),
            user:     String(c?.user     || '').trim().slice(0, 100),
            password: String(c?.password || '').trim().slice(0, 100),
            note:     String(c?.note     || '').trim().slice(0, 200),
        }))
        .filter(c => c.user || c.password);   // descarta filas sin nada útil
}

export const projectService = {
    async list({ featuredOnly = false } = {}) {
        return projectRepo.findAll({ featuredOnly });
    },

    async create(data) {
        if (!data.title || !data.description) {
            throw badRequest('Faltan campos obligatorios: title, description');
        }

        let slug = data.slug ? slugify(data.slug) : slugify(data.title);
        if (await projectRepo.slugExists(slug)) {
            slug = `${slug}-${crypto.randomBytes(2).toString('hex').slice(0, 4)}`;
        }

        const id = await projectRepo.create({
            slug,
            title:                data.title,
            title_en:             data.title_en             ?? '',
            category:             data.category             ?? '',
            category_en:          data.category_en          ?? '',
            badge:                data.badge                ?? '',
            badge_en:             data.badge_en             ?? '',
            description_short:    data.description_short    ?? '',
            description_short_en: data.description_short_en ?? '',
            description:          data.description,
            description_en:       data.description_en       ?? '',
            images:               normalizeImages(data),
            demo_url:             data.demo_url             ?? '',
            status:               data.status               ?? 'production',
            github_url:           data.github_url           ?? '',
            tech:                 Array.isArray(data.tech) ? data.tech : [],
            credentials:          normalizeCredentials(data.credentials),
            featured:             !!data.featured,
            sort_order:           Number.isFinite(data.sort_order) ? data.sort_order : 0,
        });

        return { id, slug };
    },

    async update(id, data) {
        if (!id) throw badRequest('Falta id');

        const editable = [
            'slug', 'title', 'title_en', 'category', 'category_en',
            'badge', 'badge_en', 'description_short', 'description_short_en',
            'description', 'description_en', 'demo_url', 'status', 'github_url'
        ];

        const fields = {};
        for (const k of editable) {
            if (data[k] !== undefined) {
                fields[k] = k === 'slug' ? slugify(data[k]) : data[k];
            }
        }

        if (data.images !== undefined || data.image !== undefined) {
            fields.images = normalizeImages(data);
        }
        if (Array.isArray(data.tech)) {
            fields.tech = data.tech;
        }
        if (data.credentials !== undefined) {
            fields.credentials = normalizeCredentials(data.credentials);
        }
        if (data.featured !== undefined) {
            fields.featured = data.featured ? 1 : 0;
        }
        if (data.sort_order !== undefined) {
            fields.sort_order = Number(data.sort_order) || 0;
        }

        return projectRepo.update(id, fields);
    },

    async delete(id) {
        if (!id) throw badRequest('Falta id');
        return projectRepo.delete(id);
    },
};
