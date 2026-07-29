/**
 * Parser mínimo de metadata de video MP4/MOV (ISOBMFF) en JS puro.
 *
 * Evita depender de ffprobe/ffmpeg (no están en el contenedor). Lee solo los
 * átomos necesarios para validar un Reel:
 *   - mvhd  → timescale + duration  ⇒ duración en segundos
 *   - tkhd  → width/height (16.16 fixed point) ⇒ relación de aspecto
 *
 * MP4 y MOV comparten el formato de cajas (boxes), así que el mismo parser sirve.
 * Es defensivo: si algo no calza, devuelve null en ese campo y el caller decide
 * (típicamente, dejar que Meta haga la validación final).
 */

import fs from 'node:fs/promises';

/** Recorre las cajas hijas dentro de [start, end) buscando una con `type`. */
function findBox(buf, type, start, end) {
    let offset = start;
    while (offset + 8 <= end) {
        let size = buf.readUInt32BE(offset);
        const boxType = buf.toString('ascii', offset + 4, offset + 8);
        let headerSize = 8;
        if (size === 1) {
            // tamaño de 64 bits (largeSize) en los siguientes 8 bytes
            size = Number(buf.readBigUInt64BE(offset + 8));
            headerSize = 16;
        } else if (size === 0) {
            size = end - offset; // se extiende hasta el final
        }
        if (size < headerSize) break; // corrupto
        if (boxType === type) {
            return { start: offset, end: offset + size, contentStart: offset + headerSize };
        }
        offset += size;
    }
    return null;
}

function parseMvhd(buf, box) {
    // version(1) flags(3) ... según versión cambia el tamaño de los timestamps
    const version = buf.readUInt8(box.contentStart);
    let p = box.contentStart + 4;
    let timescale, duration;
    if (version === 1) {
        p += 8 + 8;                       // creation_time + modification_time (64b)
        timescale = buf.readUInt32BE(p);  p += 4;
        duration  = Number(buf.readBigUInt64BE(p));
    } else {
        p += 4 + 4;                       // creation_time + modification_time (32b)
        timescale = buf.readUInt32BE(p);  p += 4;
        duration  = buf.readUInt32BE(p);
    }
    if (!timescale) return null;
    return duration / timescale; // segundos
}

function parseTkhd(buf, box) {
    const version = buf.readUInt8(box.contentStart);
    // width/height están en los últimos 8 bytes del box, como 16.16 fixed point.
    const w = buf.readUInt32BE(box.end - 8) / 65536;
    const h = buf.readUInt32BE(box.end - 4) / 65536;
    void version;
    if (!w || !h) return null;
    return { width: Math.round(w), height: Math.round(h) };
}

/**
 * Devuelve { durationSec, width, height, ratio } o campos en null si no se
 * pudieron leer. No lanza: ante cualquier problema retorna lo que pudo.
 */
export async function readVideoMeta(filePath) {
    const out = { durationSec: null, width: null, height: null, ratio: null };
    try {
        const buf = await fs.readFile(filePath);
        const moov = findBox(buf, 'moov', 0, buf.length);
        if (!moov) return out;

        const mvhd = findBox(buf, 'mvhd', moov.contentStart, moov.end);
        if (mvhd) out.durationSec = parseMvhd(buf, mvhd);

        // Buscar el primer trak con tkhd que tenga dimensiones (la pista de video).
        let p = moov.contentStart;
        while (p + 8 <= moov.end) {
            const trak = findBox(buf, 'trak', p, moov.end);
            if (!trak) break;
            const tkhd = findBox(buf, 'tkhd', trak.contentStart, trak.end);
            if (tkhd) {
                const dim = parseTkhd(buf, tkhd);
                if (dim && dim.width && dim.height) {
                    out.width = dim.width;
                    out.height = dim.height;
                    out.ratio = +(dim.width / dim.height).toFixed(4);
                    break; // primera pista con dimensiones = video
                }
            }
            p = trak.end;
        }
    } catch {
        // archivo no legible / formato inesperado → devolvemos lo que haya (todo null)
    }
    return out;
}
