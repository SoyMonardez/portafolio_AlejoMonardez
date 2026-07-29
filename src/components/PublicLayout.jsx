import React from 'react';
import { Link } from 'react-router-dom';
import { IoDocumentTextOutline } from 'react-icons/io5';
import CustomCursor from './CustomCursor';
import SmoothScroll from './SmoothScroll';
import { useLang } from '../data/useLang';
import { useSettings } from '../data/useSettings';
import logo from '../assets/logo.png';

export default function PublicLayout({ children }) {
    const [lang, , toggleLang] = useLang();
    const { settings } = useSettings();
    const labels = lang === 'es'
        ? { home: 'Inicio', about: 'Sobre mí', projects: 'Proyectos', services: 'Servicios', contact: 'Contacto', cv: 'Descargar CV' }
        : { home: 'Home', about: 'About', projects: 'Projects', services: 'Services', contact: 'Contact', cv: 'Download CV' };

    return (
        <div className="min-h-screen overflow-x-clip bg-brand-bg text-brand-text selection:bg-white selection:text-black cursor-none">
            <CustomCursor />
            <SmoothScroll />
            <a href="#main-content" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:bg-white focus:px-4 focus:py-3 focus:text-black">
                {lang === 'es' ? 'Saltar al contenido' : 'Skip to content'}
            </a>
            <nav aria-label={lang === 'es' ? 'Navegación principal' : 'Main navigation'} className="sticky top-0 z-40 border-b border-brand-bg/10 bg-white/95 text-brand-bg backdrop-blur">
                <div className="mx-auto flex min-h-16 w-full max-w-[1440px] items-center justify-between gap-4 px-4 sm:px-6 md:px-12">
                    <Link to="/" aria-label={labels.home} className="shrink-0">
                        <img src={logo} alt="Alejo Monárdez" className="h-5 w-auto object-contain md:h-7" />
                    </Link>
                    <div className="hidden items-center gap-5 text-[10px] uppercase tracking-[0.2em] md:flex">
                        <Link to="/sobre-mi" className="hover:opacity-50">{labels.about}</Link>
                        <Link to="/proyectos" className="hover:opacity-50">{labels.projects}</Link>
                        <Link to="/servicios" className="hover:opacity-50">{labels.services}</Link>
                        <Link to="/contacto" className="hover:opacity-50">{labels.contact}</Link>
                    </div>
                    <div className="flex items-center gap-2">
                        <a href={settings.cv_url || '/Monardez_Alejo_2026_CV.pdf'} download="Monardez_Alejo_CV.pdf" aria-label={labels.cv} title={labels.cv} className="inline-flex min-h-10 min-w-10 items-center justify-center rounded-full border border-brand-bg/20 md:px-4">
                            <IoDocumentTextOutline className="md:hidden" />
                            <span className="hidden text-[10px] font-bold uppercase tracking-widest md:inline">{labels.cv}</span>
                        </a>
                        <button type="button" onClick={toggleLang} aria-label={lang === 'es' ? 'Change language to English' : 'Cambiar idioma a español'} className="min-h-10 rounded-full border border-brand-bg/20 px-3 text-[10px] uppercase tracking-widest">
                            {lang === 'es' ? 'EN' : 'ES'}
                        </button>
                    </div>
                </div>
                <div className="flex min-h-11 items-center justify-center gap-4 overflow-x-auto border-t border-brand-bg/10 px-4 text-[9px] uppercase tracking-[0.16em] md:hidden">
                    <Link to="/sobre-mi">{labels.about}</Link><Link to="/proyectos">{labels.projects}</Link><Link to="/servicios">{labels.services}</Link><Link to="/contacto">{labels.contact}</Link>
                </div>
            </nav>
            <main id="main-content">{children}</main>
            <footer className="border-t border-white/10 px-6 py-10 text-center text-[10px] uppercase tracking-widest text-white/35">© 2026 Alejo Monárdez · San Juan, Argentina</footer>
        </div>
    );
}
