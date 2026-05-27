import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_URL } from '../config';
import CustomCursor from '../components/CustomCursor';
import ProjectEditor from '../components/ProjectEditor';
import SettingsEditor from '../components/SettingsEditor';
import { useInboxNotifications } from '../data/useInboxNotifications';
import { SiWhatsapp, SiGmail } from 'react-icons/si';
import { motion, AnimatePresence } from 'framer-motion';

export default function Dashboard() {
  const [messages, setMessages] = useState([]);
  const [tab, setTab] = useState('projects'); // 'projects' | 'inbox' | 'config'
  const [messageToDelete, setMessageToDelete] = useState(null);
  const navigate = useNavigate();

  // Notifica al admin (Service Worker + sonido) cuando aparecen mensajes nuevos.
  useInboxNotifications(messages);

  const fetchMessages = async () => {
    const token = localStorage.getItem('admin_token');
    if (!token) return;

    try {
        const res = await fetch(`${API_URL}/messages`, {
            headers: { 'Authorization': token }
        });

        if (res.status === 401) {
            localStorage.removeItem('admin_token');
            navigate('/admin');
            return;
        }

        const data = await res.json();
        if (Array.isArray(data)) setMessages(data);
    } catch (err) {
        console.error(err);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    if (!token) {
      navigate('/admin');
      return;
    }

    fetchMessages();
    const interval = setInterval(fetchMessages, 15000);
    return () => clearInterval(interval);
  }, [navigate]);

  const handleDelete = async (id) => {
    setMessageToDelete(id);
  };

  const confirmDelete = async () => {
    const id = messageToDelete;
    if (!id) return;

    const token = localStorage.getItem('admin_token');
    await fetch(`${API_URL}/messages/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': token }
    });
    setMessages(messages.filter(m => m.id !== id));
    setMessageToDelete(null);
  };

  const handleLogout = () => {
      localStorage.removeItem('admin_token');
      navigate('/');
  };

  return (
    <div className="min-h-screen bg-brand-bg text-white p-6 md:p-12 font-sans cursor-none">
        <CustomCursor />
        <header className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-12 border-b border-white/10 pb-6">
            <h1 className="text-2xl font-serif uppercase tracking-widest">Admin Panel</h1>
            <div className="flex gap-6 text-xs uppercase tracking-[0.2em]">
                <button onClick={() => navigate('/')} className="hover:text-white/50">Site</button>
                <button onClick={() => navigate('/proyectos')} className="hover:text-white/50">Proyectos (público)</button>
                <button onClick={handleLogout} className="hover:text-white/50 text-red-300">Logout</button>
            </div>
        </header>

        {/* Tabs */}
        <div className="flex gap-2 mb-12 border-b border-white/10 flex-wrap">
            <TabButton active={tab === 'projects'} onClick={() => setTab('projects')}>
                Proyectos
            </TabButton>
            <TabButton active={tab === 'config'} onClick={() => setTab('config')}>
                Configuración
            </TabButton>
            <TabButton active={tab === 'inbox'} onClick={() => setTab('inbox')}>
                Inbox {messages.length > 0 && <span className="ml-2 text-[10px] bg-white text-black rounded-full px-2 py-0.5">{messages.length}</span>}
            </TabButton>
        </div>

        <div className="max-w-6xl mx-auto">
            {tab === 'projects' && <ProjectEditor />}

            {tab === 'config' && <SettingsEditor />}

            {tab === 'inbox' && (
                <div className="space-y-4">
                    {messages.length === 0 ? (
                        <p className="text-center text-white/30 uppercase tracking-widest mt-24">No messages yet.</p>
                    ) : (
                        messages.map(msg => <InboxMessage key={msg.id} msg={msg} onDelete={handleDelete} />)
                    )}
                </div>
            )}
        </div>

        {/* Custom Confirmation Modal */}
        <AnimatePresence>
            {messageToDelete && (
                <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md"
                >
                    <motion.div 
                        initial={{ scale: 0.95, y: 20 }}
                        animate={{ scale: 1, y: 0 }}
                        exit={{ scale: 0.95, y: 20 }}
                        className="bg-[#0a0a0a] border border-white/10 p-8 md:p-12 max-w-lg w-full mx-4 shadow-2xl relative"
                    >
                        {/* Decorative minimal border accent */}
                        <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-red-500/50 to-transparent" />
                        
                        <h2 className="font-serif text-3xl md:text-4xl mb-4 text-white">Eliminar Mensaje</h2>
                        <p className="font-sans text-white/50 text-sm md:text-base leading-relaxed mb-10">
                            Esta acción es irreversible. ¿Confirmás que deseás eliminar este mensaje permanentemente del servidor?
                        </p>
                        
                        <div className="flex justify-end gap-4">
                            <button 
                                onClick={() => setMessageToDelete(null)}
                                className="text-xs uppercase tracking-[0.2em] text-white/50 hover:text-white transition-colors px-4 py-2"
                            >
                                Cancelar
                            </button>
                            <button 
                                onClick={confirmDelete}
                                className="text-xs uppercase tracking-[0.2em] bg-red-500/10 text-red-400 border border-red-500/30 hover:bg-red-500 hover:text-black hover:border-red-500 transition-all px-6 py-3 rounded-none"
                            >
                                Eliminar
                            </button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    </div>
  );
}

/**
 * Tarjeta de un mensaje del inbox. Muestra nombre, email, teléfono (si hay),
 * y botones de acción rápida para responder por WhatsApp / Gmail.
 */
function InboxMessage({ msg, onDelete }) {
    const hasPhone = msg.phone && msg.phone.replace(/\D/g, '').length >= 6;
    const phoneDigits = hasPhone ? msg.phone.replace(/\D/g, '') : '';

    const whatsAppText = encodeURIComponent(
        `Hola ${msg.name}, te respondo por tu consulta en alejomonardez.com:\n\n> ${msg.message.slice(0, 100)}${msg.message.length > 100 ? '...' : ''}\n\n`
    );
    const whatsappUrl = hasPhone
        ? `https://wa.me/${phoneDigits}?text=${whatsAppText}`
        : null;

    const emailSubject = encodeURIComponent(`Re: tu consulta — alejomonardez.com`);
    const emailBody = encodeURIComponent(
        `Hola ${msg.name},\n\nGracias por escribirme.\n\n--- Tu mensaje ---\n${msg.message}\n--- Fin ---\n\n`
    );
    const gmailUrl  = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(msg.email)}&su=${emailSubject}&body=${emailBody}`;
    const mailtoUrl = `mailto:${msg.email}?subject=${emailSubject}&body=${emailBody}`;

    const dateStr = new Date(msg.created_at).toLocaleString('es-AR', {
        day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
    });

    return (
        <div className="group border border-white/10 p-6 hover:bg-white/5 transition-colors relative overflow-hidden">
            <div className="flex flex-col md:flex-row justify-between md:items-start gap-4 mb-4">
                <div className="min-w-0 flex-1">
                    <h3 className="font-serif text-xl mb-1 break-words">{msg.name}</h3>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-white/50">
                        <a href={mailtoUrl} className="hover:text-white break-all">{msg.email}</a>
                        {hasPhone && (
                            <a href={`tel:${phoneDigits}`} className="hover:text-white break-all">📞 {msg.phone}</a>
                        )}
                    </div>
                </div>
                <span className="text-xs text-white/40 uppercase tracking-wider whitespace-nowrap">{dateStr}</span>
            </div>

            <p className="text-white/70 leading-relaxed font-light text-sm md:text-base border-l border-white/20 pl-4 whitespace-pre-wrap break-words [overflow-wrap:anywhere] mb-6 max-h-64 overflow-y-auto">
                {msg.message}
            </p>

            {/* Acciones rápidas */}
            <div className="flex flex-wrap gap-2 items-center">
                {whatsappUrl ? (
                    <a
                        href={whatsappUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-xs uppercase tracking-widest border border-green-500/30 text-green-400 px-4 py-2 rounded-full hover:bg-green-500 hover:text-black transition-all"
                    >
                        <SiWhatsapp className="text-base" />
                        Responder WhatsApp
                    </a>
                ) : (
                    <span className="inline-flex items-center gap-2 text-xs uppercase tracking-widest border border-white/10 text-white/30 px-4 py-2 rounded-full" title="No dejó teléfono">
                        <SiWhatsapp className="text-base" />
                        Sin teléfono
                    </span>
                )}

                <a
                    href={gmailUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-xs uppercase tracking-widest border border-red-400/30 text-red-300 px-4 py-2 rounded-full hover:bg-red-500 hover:text-black hover:border-red-500 transition-all"
                >
                    <SiGmail className="text-base" />
                    Responder Gmail
                </a>

                <a
                    href={mailtoUrl}
                    className="inline-flex items-center gap-2 text-xs uppercase tracking-widest border border-white/20 text-white/60 px-4 py-2 rounded-full hover:bg-white hover:text-black transition-all"
                    title="Abrir en tu cliente de mail por defecto"
                >
                    Mail nativo
                </a>

                <button
                    onClick={() => onDelete(msg.id)}
                    className="ml-auto text-xs uppercase tracking-widest text-white/30 hover:text-red-400 transition-colors"
                >
                    Eliminar
                </button>
            </div>
        </div>
    );
}

function TabButton({ active, children, onClick }) {
    return (
        <button
            onClick={onClick}
            className={`px-6 py-3 text-xs uppercase tracking-[0.25em] border-b-2 transition-all ${
                active
                    ? 'border-white text-white'
                    : 'border-transparent text-white/40 hover:text-white/70'
            }`}
        >
            {children}
        </button>
    );
}
