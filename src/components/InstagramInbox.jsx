import React, { useEffect, useState, useCallback } from 'react';
import { API_URL } from '../config';
import { FiRefreshCw, FiSend, FiUser, FiCpu, FiAlertCircle } from 'react-icons/fi';

/**
 * Bandeja de entrada del chatbot de Instagram.
 * Lista los chats clasificados por la IA, muestra el historial, permite
 * responder manualmente y apagar/encender el bot por chat.
 */

const STATUS_META = {
    bot_active:     { label: 'Bot activo',      cls: 'border-green-400/30 text-green-300/80' },
    pending_human:  { label: 'Pendiente vos',   cls: 'border-amber-400/40 text-amber-300/90' },
    human_handled:  { label: 'Atendido x vos',  cls: 'border-blue-400/30 text-blue-300/80' },
    closed:         { label: 'Cerrado',         cls: 'border-white/20 text-white/40' },
};

const INTENT_LABEL = {
    GREETING: 'Saludo', INFO: 'Info', PRICING: 'Precio', SUPPORT: 'Soporte',
    URGENT: 'Urgente', COMPLEX: 'Complejo', SPAM: 'Spam', OTHER: 'Otro',
};

export default function InstagramInbox() {
    const [chats, setChats]       = useState([]);
    const [filter, setFilter]     = useState('all'); // all | pending_human
    const [active, setActive]     = useState(null);  // chat seleccionado
    const [messages, setMessages] = useState([]);
    const [reply, setReply]       = useState('');
    const [loading, setLoading]   = useState(false);
    const [sending, setSending]   = useState(false);
    const token = typeof window !== 'undefined' ? localStorage.getItem('admin_token') : null;

    const authHeaders = { Authorization: token, 'Content-Type': 'application/json' };

    const loadChats = useCallback(async () => {
        setLoading(true);
        try {
            const q = filter === 'all' ? '' : `?status=${filter}`;
            const res = await fetch(`${API_URL}/instagram/chats${q}`, { headers: { Authorization: token } });
            const data = await res.json();
            if (data.success) setChats(data.chats);
        } catch { /* silencioso */ }
        finally { setLoading(false); }
    }, [filter, token]);

    useEffect(() => { loadChats(); }, [loadChats]);

    const openChat = async (chat) => {
        setActive(chat);
        setMessages([]);
        try {
            const res = await fetch(`${API_URL}/instagram/chats/${chat.id}/messages`, { headers: { Authorization: token } });
            const data = await res.json();
            if (data.success) { setMessages(data.messages); setActive(data.chat); }
        } catch { /* silencioso */ }
    };

    const sendReply = async () => {
        if (!reply.trim() || !active) return;
        setSending(true);
        try {
            const res = await fetch(`${API_URL}/instagram/chats/${active.id}/reply`, {
                method: 'POST', headers: authHeaders,
                body: JSON.stringify({ text: reply.trim() }),
            });
            const data = await res.json();
            if (data.success) { setReply(''); await openChat(active); loadChats(); }
        } catch { /* silencioso */ }
        finally { setSending(false); }
    };

    const toggleBot = async () => {
        if (!active) return;
        const enabled = !active.bot_enabled;
        try {
            const res = await fetch(`${API_URL}/instagram/chats/${active.id}/bot`, {
                method: 'POST', headers: authHeaders,
                body: JSON.stringify({ enabled }),
            });
            const data = await res.json();
            if (data.success) { setActive({ ...active, bot_enabled: enabled ? 1 : 0 }); loadChats(); }
        } catch { /* silencioso */ }
    };

    const pendingCount = chats.filter(c => c.status === 'pending_human').length;

    return (
        <div>
            <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
                <div>
                    <h2 className="font-serif text-2xl mb-1">Bandeja de Instagram</h2>
                    <p className="text-white/40 text-sm">
                        Mensajes clasificados por la IA. {pendingCount > 0 && (
                            <span className="text-amber-300">{pendingCount} esperan tu respuesta.</span>
                        )}
                    </p>
                </div>
                <button onClick={loadChats} className="flex items-center gap-2 text-xs uppercase tracking-widest border border-white/20 px-4 py-2 hover:bg-white hover:text-black transition-colors">
                    <FiRefreshCw size={12} className={loading ? 'animate-spin' : ''} /> Actualizar
                </button>
            </div>

            {/* Filtros */}
            <div className="flex gap-2 mb-6">
                {[['all', 'Todos'], ['pending_human', 'Pendientes']].map(([val, label]) => (
                    <button
                        key={val}
                        onClick={() => setFilter(val)}
                        className={`text-[10px] uppercase tracking-widest border px-3 py-1.5 transition-colors ${
                            filter === val ? 'bg-white text-black border-white' : 'border-white/20 text-white/50 hover:text-white'
                        }`}
                    >
                        {label}
                    </button>
                ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Lista de chats */}
                <div className="md:col-span-1 space-y-2 max-h-[70vh] overflow-y-auto">
                    {chats.length === 0 && (
                        <p className="text-white/30 text-sm uppercase tracking-widest text-center py-12">
                            {loading ? 'Cargando...' : 'Sin conversaciones todavía.'}
                        </p>
                    )}
                    {chats.map(chat => {
                        const sm = STATUS_META[chat.status] || STATUS_META.closed;
                        return (
                            <button
                                key={chat.id}
                                onClick={() => openChat(chat)}
                                className={`w-full text-left border p-3 transition-colors ${
                                    active?.id === chat.id ? 'border-white bg-white/5' : 'border-white/10 hover:border-white/30'
                                }`}
                            >
                                <div className="flex items-center justify-between gap-2 mb-1">
                                    <span className="text-sm font-medium truncate">
                                        {chat.username ? `@${chat.username}` : chat.ig_user_id}
                                    </span>
                                    <span className={`text-[8px] uppercase tracking-wider border px-1.5 py-0.5 shrink-0 ${sm.cls}`}>
                                        {sm.label}
                                    </span>
                                </div>
                                <p className="text-white/40 text-xs truncate">{chat.last_message || '—'}</p>
                            </button>
                        );
                    })}
                </div>

                {/* Conversación */}
                <div className="md:col-span-2 border border-white/10 flex flex-col min-h-[60vh]">
                    {!active ? (
                        <div className="flex-1 flex items-center justify-center text-white/30 text-sm uppercase tracking-widest">
                            Elegí una conversación
                        </div>
                    ) : (
                        <>
                            {/* Header del chat */}
                            <div className="flex items-center justify-between p-4 border-b border-white/10 flex-wrap gap-2">
                                <div>
                                    <p className="font-medium">{active.username ? `@${active.username}` : active.ig_user_id}</p>
                                    {active.last_intent && (
                                        <p className="text-[10px] uppercase tracking-widest text-white/40">
                                            Última intención: {INTENT_LABEL[active.last_intent] || active.last_intent}
                                        </p>
                                    )}
                                </div>
                                <button
                                    onClick={toggleBot}
                                    className={`text-[10px] uppercase tracking-widest border px-3 py-1.5 transition-colors ${
                                        active.bot_enabled
                                            ? 'border-green-400/40 text-green-300/90 hover:bg-green-400/10'
                                            : 'border-white/20 text-white/50 hover:bg-white/10'
                                    }`}
                                >
                                    {active.bot_enabled ? '🤖 Bot ON — apagar' : '🤖 Bot OFF — encender'}
                                </button>
                            </div>

                            {/* Mensajes */}
                            <div className="flex-1 overflow-y-auto p-4 space-y-3 max-h-[45vh]">
                                {messages.map(m => {
                                    const isCustomer = m.direction === 'inbound';
                                    const Icon = m.sender === 'bot' ? FiCpu : m.sender === 'human' ? FiUser : FiAlertCircle;
                                    return (
                                        <div key={m.id} className={`flex ${isCustomer ? 'justify-start' : 'justify-end'}`}>
                                            <div className={`max-w-[75%] p-3 text-sm ${
                                                isCustomer ? 'bg-white/5 border border-white/10'
                                                : m.sender === 'bot' ? 'bg-green-400/10 border border-green-400/20'
                                                : 'bg-white text-black'
                                            }`}>
                                                {!isCustomer && (
                                                    <span className="flex items-center gap-1 text-[9px] uppercase tracking-widest opacity-60 mb-1">
                                                        <Icon size={9} /> {m.sender === 'bot' ? 'Bot IA' : 'Vos'}
                                                    </span>
                                                )}
                                                <p className="whitespace-pre-wrap leading-relaxed">{m.text}</p>
                                            </div>
                                        </div>
                                    );
                                })}
                                {messages.length === 0 && (
                                    <p className="text-white/30 text-xs text-center py-8 uppercase tracking-widest">Sin mensajes</p>
                                )}
                            </div>

                            {/* Responder */}
                            <div className="p-4 border-t border-white/10 flex gap-2">
                                <input
                                    value={reply}
                                    onChange={e => setReply(e.target.value)}
                                    onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendReply(); } }}
                                    placeholder="Escribí tu respuesta..."
                                    className="flex-1 bg-transparent border border-white/20 focus:border-white outline-none p-2.5 text-sm transition-colors placeholder:text-white/25"
                                />
                                <button
                                    onClick={sendReply}
                                    disabled={!reply.trim() || sending}
                                    className="bg-white text-black px-4 flex items-center gap-2 text-xs uppercase tracking-widest hover:bg-gray-200 transition-colors disabled:opacity-30"
                                >
                                    <FiSend size={12} /> {sending ? '...' : 'Enviar'}
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
