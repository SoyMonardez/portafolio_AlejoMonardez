import React, { useState, useRef } from 'react';
import { API_URL } from '../config';
import { FiUploadCloud, FiInstagram, FiExternalLink, FiX, FiPlus, FiVideo, FiImage } from 'react-icons/fi';

const MAX_IMAGES = 10;

export default function InstagramPublisher() {
    const [mode, setMode]               = useState('post');  // 'post' | 'reel'
    const [files, setFiles]             = useState([]);      // Array<{ file, preview }> (post)
    const [video, setVideo]             = useState(null);    // { file, preview } (reel)
    const [description, setDescription] = useState('');
    const [status, setStatus]           = useState('idle');  // idle | loading | done | error
    const [result, setResult]           = useState(null);
    const [errorMsg, setErrorMsg]       = useState('');
    const [dragging, setDragging]       = useState(false);
    const inputRef = useRef();
    const videoRef = useRef();

    const switchMode = (m) => {
        if (m === mode) return;
        // limpiar el estado del modo anterior
        files.forEach(f => URL.revokeObjectURL(f.preview));
        if (video) URL.revokeObjectURL(video.preview);
        setFiles([]); setVideo(null); setStatus('idle'); setResult(null); setErrorMsg('');
        setMode(m);
    };

    const addVideo = (fileList) => {
        const f = Array.from(fileList).find(x => x.type === 'video/mp4' || x.type === 'video/quicktime');
        if (!f) { setErrorMsg('El reel debe ser un video .mp4 o .mov'); setStatus('error'); return; }
        if (video) URL.revokeObjectURL(video.preview);
        setVideo({ file: f, preview: URL.createObjectURL(f) });
        setStatus('idle'); setResult(null); setErrorMsg('');
    };

    const addFiles = (newFiles) => {
        const valid = Array.from(newFiles).filter(f =>
            f.type === 'image/jpeg' || f.type === 'image/png'
        );
        setFiles(prev => {
            const combined = [...prev, ...valid.map(f => ({ file: f, preview: URL.createObjectURL(f) }))];
            return combined.slice(0, MAX_IMAGES); // nunca más de 10
        });
        setStatus('idle');
        setResult(null);
    };

    const removeFile = (idx) => {
        setFiles(prev => {
            URL.revokeObjectURL(prev[idx].preview);
            return prev.filter((_, i) => i !== idx);
        });
    };

    const clearAll = () => {
        files.forEach(f => URL.revokeObjectURL(f.preview));
        if (video) URL.revokeObjectURL(video.preview);
        setFiles([]);
        setVideo(null);
        setStatus('idle');
        setResult(null);
        if (inputRef.current) inputRef.current.value = '';
        if (videoRef.current) videoRef.current.value = '';
    };

    const onInputChange = (e) => { addFiles(e.target.files); e.target.value = ''; };

    const onDrop = (e) => {
        e.preventDefault();
        setDragging(false);
        addFiles(e.dataTransfer.files);
    };

    const handlePublish = async (e) => {
        e.preventDefault();
        const hasMedia = mode === 'reel' ? !!video : files.length > 0;
        if (!hasMedia || !description.trim()) return;

        setStatus('loading');
        setErrorMsg('');
        setResult(null);

        const token = localStorage.getItem('admin_token');
        const body  = new FormData();
        body.append('description', description.trim());

        let endpoint;
        if (mode === 'reel') {
            body.append('file', video.file);
            endpoint = `${API_URL}/instagram/publish-reel`;
        } else {
            files.forEach(({ file }) => body.append('files', file));
            endpoint = `${API_URL}/instagram/publish`;
        }

        try {
            const res  = await fetch(endpoint, {
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

    const canAddMore = files.length < MAX_IMAGES && files.length > 0;
    const isCarousel = files.length > 1;

    return (
        <div className="max-w-2xl mx-auto space-y-8">
            <div>
                <h2 className="font-serif text-2xl mb-1">Publicar en Instagram</h2>
                <p className="text-white/40 text-sm">
                    {mode === 'reel'
                        ? 'Subí un video vertical 9:16 (.mp4/.mov, 3-90s). La IA redacta el caption.'
                        : `Subí hasta ${MAX_IMAGES} fotos — 1 publica directo, 2+ como carousel. La IA redacta el caption.`}
                </p>
            </div>

            {/* Selector de tipo de contenido */}
            <div className="flex gap-2 border border-white/10 p-1 w-fit">
                <button
                    type="button"
                    onClick={() => switchMode('post')}
                    className={`flex items-center gap-2 px-4 py-2 text-xs uppercase tracking-widest transition-colors ${
                        mode === 'post' ? 'bg-white text-black' : 'text-white/50 hover:text-white'
                    }`}
                >
                    <FiImage size={13} /> Post / Carousel
                </button>
                <button
                    type="button"
                    onClick={() => switchMode('reel')}
                    className={`flex items-center gap-2 px-4 py-2 text-xs uppercase tracking-widest transition-colors ${
                        mode === 'reel' ? 'bg-white text-black' : 'text-white/50 hover:text-white'
                    }`}
                >
                    <FiVideo size={13} /> Reel
                </button>
            </div>

            <form onSubmit={handlePublish} className="space-y-6">

                {/* ===== Modo REEL: zona de video ===== */}
                {mode === 'reel' && (
                    <div>
                        {!video ? (
                            <div
                                onClick={() => videoRef.current?.click()}
                                onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
                                onDragLeave={() => setDragging(false)}
                                onDrop={(e) => { e.preventDefault(); setDragging(false); addVideo(e.dataTransfer.files); }}
                                className={`border-2 border-dashed transition-colors cursor-pointer flex flex-col items-center justify-center gap-3 py-16
                                    ${dragging ? 'border-white bg-white/5' : 'border-white/20 hover:border-white/50'}`}
                            >
                                <FiVideo className="text-4xl text-white/40" />
                                <p className="text-xs uppercase tracking-widest text-white/40">Arrastrá o hacé click para subir el video</p>
                                <p className="text-[10px] text-white/25">.mp4 · .mov · vertical 9:16 · 3-90s · máx. 300 MB</p>
                            </div>
                        ) : (
                            <div className="relative w-fit mx-auto">
                                <video
                                    src={video.preview}
                                    controls
                                    className="max-h-96 rounded border border-white/10"
                                />
                                <button
                                    type="button"
                                    onClick={() => { URL.revokeObjectURL(video.preview); setVideo(null); }}
                                    className="absolute top-2 right-2 bg-black/60 hover:bg-red-500 text-white rounded-full p-1.5 transition-colors"
                                >
                                    <FiX size={12} />
                                </button>
                            </div>
                        )}
                        <input
                            ref={videoRef}
                            type="file"
                            accept="video/mp4,video/quicktime"
                            onChange={(e) => { addVideo(e.target.files); e.target.value = ''; }}
                            className="hidden"
                        />
                    </div>
                )}

                {/* Drop zone vacío (solo modo post) */}
                {mode === 'post' && files.length === 0 && (
                    <div
                        onClick={() => inputRef.current?.click()}
                        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
                        onDragLeave={() => setDragging(false)}
                        onDrop={onDrop}
                        className={`border-2 border-dashed transition-colors cursor-pointer flex flex-col items-center justify-center gap-3 py-16
                            ${dragging ? 'border-white bg-white/5' : 'border-white/20 hover:border-white/50'}`}
                    >
                        <FiUploadCloud className="text-4xl text-white/40" />
                        <p className="text-xs uppercase tracking-widest text-white/40">
                            Arrastrá o hacé click para subir
                        </p>
                        <p className="text-[10px] text-white/25">JPEG · PNG · máx. 8 MB por imagen · hasta {MAX_IMAGES} fotos</p>
                    </div>
                )}

                {/* Grid de previews */}
                {files.length > 0 && (
                    <div>
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-xs text-white/40 uppercase tracking-widest">
                                {files.length} {files.length === 1 ? 'foto' : 'fotos'}
                                {isCarousel && <span className="ml-2 text-white/25">· se publicará como carousel</span>}
                            </span>
                            <button type="button" onClick={clearAll} className="text-xs text-white/30 hover:text-red-400 transition-colors uppercase tracking-widest">
                                Limpiar todo
                            </button>
                        </div>

                        <div className="grid grid-cols-3 gap-2">
                            {files.map(({ preview }, idx) => (
                                <div key={idx} className="relative aspect-square group">
                                    <img
                                        src={preview}
                                        alt={`foto ${idx + 1}`}
                                        className="w-full h-full object-cover"
                                    />
                                    {/* Número de orden */}
                                    <span className="absolute top-1 left-1 bg-black/60 text-white text-[10px] w-5 h-5 flex items-center justify-center rounded-full">
                                        {idx + 1}
                                    </span>
                                    {/* Botón eliminar */}
                                    <button
                                        type="button"
                                        onClick={() => removeFile(idx)}
                                        className="absolute top-1 right-1 bg-black/60 hover:bg-red-500 text-white rounded-full p-1 transition-colors opacity-0 group-hover:opacity-100"
                                    >
                                        <FiX size={10} />
                                    </button>
                                </div>
                            ))}

                            {/* Celda para agregar más */}
                            {canAddMore && (
                                <button
                                    type="button"
                                    onClick={() => inputRef.current?.click()}
                                    className="aspect-square border-2 border-dashed border-white/20 hover:border-white/50 flex flex-col items-center justify-center gap-1 transition-colors"
                                >
                                    <FiPlus className="text-white/40" size={20} />
                                    <span className="text-[10px] text-white/30">Agregar</span>
                                </button>
                            )}
                        </div>
                    </div>
                )}

                {/* Input oculto (múltiple) */}
                <input
                    ref={inputRef}
                    type="file"
                    accept="image/jpeg,image/png"
                    multiple
                    onChange={onInputChange}
                    className="hidden"
                />

                {/* Área drag cuando ya hay fotos */}
                {files.length > 0 && files.length < MAX_IMAGES && (
                    <div
                        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
                        onDragLeave={() => setDragging(false)}
                        onDrop={onDrop}
                        className={`border border-dashed py-3 text-center text-[10px] uppercase tracking-widest transition-colors
                            ${dragging ? 'border-white text-white' : 'border-white/10 text-white/20'}`}
                    >
                        Arrastrá más fotos aquí ({MAX_IMAGES - files.length} disponibles)
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
                        No hace falta que sea perfecto — la IA lo transforma en un caption profesional con hashtags.
                    </p>
                </div>

                {/* Botón publicar */}
                <button
                    type="submit"
                    disabled={(mode === 'reel' ? !video : !files.length) || !description.trim() || status === 'loading'}
                    className="w-full py-4 flex items-center justify-center gap-2 bg-white text-black text-xs font-bold uppercase tracking-[0.2em] hover:bg-gray-200 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                >
                    {status === 'loading' ? (
                        <>
                            <span className="animate-spin inline-block w-4 h-4 border-2 border-black border-t-transparent rounded-full" />
                            {mode === 'reel' ? 'Subiendo reel (puede tardar)...' : isCarousel ? 'Creando carousel...' : 'Generando caption y publicando...'}
                        </>
                    ) : (
                        <>
                            <FiInstagram size={14} />
                            {mode === 'reel'
                                ? 'Publicar Reel'
                                : isCarousel
                                ? `Publicar carousel (${files.length} fotos)`
                                : 'Publicar en Instagram'}
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
                <div className="border border-white/10 p-6 space-y-4">
                    <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-white/50">
                        <FiInstagram size={12} />
                        <span>
                            {result.type === 'carousel'
                                ? `Carousel de ${result.count} fotos publicado`
                                : 'Foto publicada exitosamente'}
                        </span>
                    </div>

                    <div>
                        <p className="text-[10px] uppercase tracking-widest text-white/30 mb-2">Caption generado por IA</p>
                        <pre className="text-white/80 text-sm whitespace-pre-wrap font-sans leading-relaxed bg-black/30 p-4 max-h-64 overflow-y-auto">
                            {result.caption}
                        </pre>
                    </div>

                    <a
                        href={result.permalink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-xs uppercase tracking-widest border border-white/20 text-white/70 px-4 py-2 hover:bg-white hover:text-black transition-all"
                    >
                        <FiExternalLink size={12} />
                        Ver post en Instagram
                    </a>

                    <button
                        onClick={() => { clearAll(); setDescription(''); }}
                        className="block text-xs uppercase tracking-widest text-white/30 hover:text-white transition-colors"
                    >
                        Publicar otro post
                    </button>
                </div>
            )}
        </div>
    );
}
