export function validateImageContent(extension: string, buffer: Buffer): Buffer | null {
  if (extension === '.png') return buffer.length > 8 && buffer.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])) ? buffer : null;
  if (extension === '.jpg' || extension === '.jpeg') return buffer.length > 3 && buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff ? buffer : null;
  if (extension === '.webp') return buffer.length > 12 && buffer.toString('ascii', 0, 4) === 'RIFF' && buffer.toString('ascii', 8, 12) === 'WEBP' ? buffer : null;
  if (extension !== '.svg') return null;

  const svg = buffer.toString('utf8');
  const sanitized = svg.replace(/<!DOCTYPE[\s\S]*?>/gi, '').replace(/<\?xml[^>]*\?>/gi, '');
  const safe = /^\s*<svg[\s>]/i.test(sanitized)
    && !/<\s*(script|foreignObject|iframe|object|embed)\b/i.test(sanitized)
    && !/\bon\w+\s*=|(?:href|src)\s*=\s*["']\s*(?:javascript:|https?:|data:)/i.test(sanitized)
    && !/@import\b|url\(\s*["']?\s*(?:https?:|javascript:|data:)/i.test(sanitized);
  if (!safe) return null;
  return Buffer.from(sanitized);
}
