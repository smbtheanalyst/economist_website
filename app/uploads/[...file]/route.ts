import { NextRequest, NextResponse } from 'next/server';
import fs from 'node:fs';
import path from 'node:path';

const MIME_TYPES: Record<string, string> = {
  '.pdf': 'application/pdf',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
};

interface RouteContext {
  params: Promise<{ file: string[] }>;
}

export async function GET(req: NextRequest, { params }: RouteContext) {
  const { file } = await params;
  if (!file || file.length === 0) {
    return new NextResponse('File Not Found', { status: 404 });
  }

  // Sanitize path to prevent directory traversal
  const rawPath = file.join('/');
  const filename = path.basename(rawPath);
  if (filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
    return new NextResponse('Bad Request', { status: 400 });
  }

  // 1. Primary storage path: Configurable UPLOAD_DIR (e.g. /data/uploads on Railway)
  const configuredDir = path.resolve(process.env.UPLOAD_DIR || './data/uploads');
  let targetPath = path.join(configuredDir, filename);

  // 2. Fallback to public/uploads if not found in primary UPLOAD_DIR
  if (!fs.existsSync(targetPath)) {
    const fallbackDir = path.resolve('./public/uploads');
    const fallbackPath = path.join(fallbackDir, filename);
    if (fs.existsSync(fallbackPath)) {
      targetPath = fallbackPath;
    } else {
      return new NextResponse('File Not Found', { status: 404 });
    }
  }

  try {
    const ext = path.extname(filename).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';
    const fileBuffer = fs.readFileSync(targetPath);

    return new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Content-Length': fileBuffer.length.toString(),
        'Cache-Control': 'public, max-age=31536000, immutable',
        'X-Content-Type-Options': 'nosniff',
      },
    });
  } catch (err) {
    console.error('Error serving persistent upload:', err);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
