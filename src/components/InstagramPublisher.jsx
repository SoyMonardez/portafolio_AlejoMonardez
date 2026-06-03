import React, { useState, useRef } from 'react';
import { API_URL } from '../config';
import { FiUploadCloud, FiInstagram, FiExternalLink, FiX } from 'react-icons/fi';

export default function InstagramPublisher() {
    const [file, setFile]               = useState(null);
    const [preview, setPreview]         = useState(null);
    const [description, setDescription] = useState('');
    const [status, setStatus]           = useState('idle'); // idle | loading | done | error
    const [result, setResult]           = useState(null);   // { caption, permalink }
    const [errorMsg, setErrorMsg]       = useState('');
    const [dragging, setDragging]       = useState(false);
    const inputRef = useRef();

    const handleFile = (f) => {
        if (!f) return;
        setFile(f);
        setPreview(URL.createObjectURL(f));
        setStatus('idle');
        setResult(null);
    };

    const onInputChange = (e) => handleFile(e.target.files[0]);

    const onDrop = (e) => {
        e.preventDefault();
        setDragging(false);
        handleFile(e.dataTransfer.files[0]);
    };

    const clearImage = () => {
        setFile(null);
        setPreview(null);
        setStatus('idle');
        setResult(null);
        if (inputRef.current) inputRef.current.value = '';
    };

    const handlePublish = async (e) => {
        e.preventDefault();
        if (!file || !description.trim()) return;

        setStatus('loading');
        setErrorMsg('');
        setResult(null);

        const token = localStorage.getItem('admin_token');
        const body  = new FormData();
        body.append('file', file);
        body.append('description', description.trim());

        try {
            const res = await fetch(`${API_URL}/instagram/publish`, {
                method: 'POST',
                headers: { Authorization: token },
                body,
            });
            const data = await res.json();
            if (!res.ok || !data.success) throw new Error(data.error || data.message || 'Error desconocido');
            setResult(data);
            setStatus('done');
        } catch (err) {
            setErrorMsg(err.message);
            setStatus('error');
        }
    };

    return (
        <div className="max-w-2xl mx-auto space-y-8">
            <div>
                <h2 className="font-serif text-2xl mb-1">Publicar en Instagram</h2>
                <p className="text-white/40 text-sm">
                    Subí una foto, describila brevemente y la IA redacta el caption completo con hashtags.
                </p>
            </div>

            <form onSubmit={handlePublish} className="space-y-6">

                {/* Drop zone */}
                {!preview ? (
                    <div
                        onClick={() => inputRef.current?.click()}
                        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
                        onDragLeave={() => setDragging(false)}
                        onDrop={onDrop}
                        className={`relative border-2 border-dashed rounded-none transition-colors cursor-pointer flex flex-col items-center justify-center gap-3 py-16
                            ${dragging ? 'border-white bg-white/5' : 'border-white/20 hover:border-white/50'}`}
                    >
                        <FiUploadCloud className="text-4xl text-white/40" />
                        <p className="text-xs uppercase tracking-widest text-white/40">
                            Arrastrá o hacé click para subir
                        </p>
                        <p className="text-[10px] text-white/25">JPEG · PNG · máx. 8 MB</p>
                        <input
                            ref={inputRef}
                            type="file"
                            accept="image/jpeg,image/png"
                            onChange={onInputChange}
                            className="hidden"
                        />
                    </div>
                ) : (
                    <div className="relative group">
                        <img
                            src={preview}
                            alt="Preview"
                            className="w-full max-h-96 object-contain bg-white/5"
                        />
                        <button
                            type="button"
                            onClick={clearImage}
                            className="absolute top-3 right-3 bg-black/70 hover:bg-red-500 text-white rounded-full p-1.5 transition-colors"
                        >
                            <FiX size={14} />
                        </button>
                    </div>
                )}

                {/* Descripción */}
                <div>
                    <label className="block text-xs uppercase tracking-widest text-white/40 mb-2">
                        Descripción breve del post
                    </label>
                    <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Ej: lanzamiento de mi nuevo portafolio web, link a alejomonardez.com"
                        rows={3}
                        className="w-full bg-transparent border border-white/20 focus:border-white outline-none p-3 text-white text-sm resize-none transition-colors placeholder:text-white/25"
                    />
                    <p className="text-[10px] text-white/30 mt-1">
                        No hace falta que sea perfecto — la IA transforma esto en un caption profesional.
                    </p>
                </div>

                {/* Botón */}
                <button
                    type="submit"
                    disabled={!file || !description.trim() || status === 'loading'}
                    className="w-full py-4 flex items-center justify-center gap-2 bg-white text-black text-xs font-bold uppercase tracking-[0.2em] hover:bg-gray-200 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                >
                    {status === 'loading' ? (
                        <>
                            <span className="animate-spin inline-block w-4 h-4 border-2 border-black border-t-transparent rounded-full" />
                            Generando caption y publicando...
                        </>
                    ) : (
                        <>
                            <FiInstagram size={14} />
                            Publicar en Instagram
                        </>
                    )}
                </button>
            </form>

            {/* Error */}
            {status === 'error' && (
                <div className="border border-red-500/30 bg-red-500/5 p-4 text-sm text-red-400">
                    <p className="font-bold uppercase tracking-widest text-xs mb-1">Error</p>
                    <p>{errorMsg}</p>
                </div>
            )}

            {/* Resultado */}
            {status === 'done' && result && (
                <div className="border border-white/10 bg-white/3 p-6 space-y-4">
                    <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-white/50 mb-2">
                        <FiInstagram size={12} />
                        <span>Publicado exitosamente</span>
                    </div>

                    {/* Caption generado */}
                    <div>
                        <p className="text-[10px] uppercase tracking-widest text-white/30 mb-2">Caption generado por IA</p>
                        <pre className="text-white/80 text-sm whitespace-pre-wrap font-sans leading-relaxed bg-black/30 p-4 max-h-64 overflow-y-auto">
                            {result.caption}
                        </pre>
                    </div>

                    {/* Link al post */}
                    <a
                        href={result.permalink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-xs uppercase tracking-widest border border-white/20 text-white/70 px-4 py-2 hover:bg-white hover:text-black transition-all"
                    >
                        <FiExternalLink size={12} />
                        Ver post en Instagram
                    </a>

                    {/* Botón para publicar otra */}
                    <button
                        onClick={() => { clearImage(); setDescription(''); setStatus('idle'); }}
                        className="block text-xs uppercase tracking-widest text-white/30 hover:text-white transition-colors"
                    >
                        Publicar otra foto
                    </button>
                </div>
            )}
        </div>
    );
}
