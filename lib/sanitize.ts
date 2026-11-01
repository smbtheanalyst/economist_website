/**
 * Server-side Rich-Text and HTML Sanitizer for Institutional Content
 * Ensures safe rendering of formatted text, headings, lists, links and images
 * while strictly disallowing script execution, iframes, inline event handlers,
 * and dangerous URI schemes.
 */

const ALLOWED_TAGS = new Set([
  'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
  'p', 'br', 'hr',
  'strong', 'b', 'em', 'i', 'u', 's', 'strike',
  'ul', 'ol', 'li',
  'blockquote',
  'a',
  'img',
  'code', 'pre',
  'table', 'thead', 'tbody', 'tr', 'th', 'td',
  'span', 'div'
]);

const ALLOWED_ATTRIBUTES: Record<string, Set<string>> = {
  a: new Set(['href', 'title', 'target', 'rel', 'class']),
  img: new Set(['src', 'alt', 'title', 'width', 'height', 'class', 'loading']),
  span: new Set(['class']),
  div: new Set(['class']),
  th: new Set(['class', 'colspan', 'rowspan', 'align']),
  td: new Set(['class', 'colspan', 'rowspan', 'align']),
  code: new Set(['class']),
  pre: new Set(['class'])
};

const SAFE_URL_PATTERN = /^(?:(?:https?|mailto|tel):|\/|#)/i;

export function sanitizeHtml(html: string): string {
  if (!html || typeof html !== 'string') return '';

  // 1. Strip script, iframe, object, embed, form, input, button tags and their contents
  let clean = html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
  clean = clean.replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '');
  clean = clean.replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '');
  clean = clean.replace(/<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi, '');
  clean = clean.replace(/<embed\b[^<]*(?:(?!<\/embed>)<[^<]*)*<\/embed>/gi, '');
  clean = clean.replace(/<form\b[^<]*(?:(?!<\/form>)<[^<]*)*<\/form>/gi, '');

  // 2. Parse tags and sanitize attributes
  clean = clean.replace(/<(\/?[a-zA-Z0-9]+)([^>]*)>/g, (match, tagNameRaw, attrString) => {
    const isClosing = tagNameRaw.startsWith('/');
    const tag = (isClosing ? tagNameRaw.slice(1) : tagNameRaw).toLowerCase();

    if (!ALLOWED_TAGS.has(tag)) {
      // Disallowed tag: return empty or plain text representation
      return '';
    }

    if (isClosing) {
      return `</${tag}>`;
    }

    // Process attributes
    const allowedAttrsForTag = ALLOWED_ATTRIBUTES[tag] || new Set(['class']);
    const sanitizedAttrs: string[] = [];

    // Match attribute key-value pairs
    const attrRegex = /([a-zA-Z0-9_\-]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+)))?/g;
    let attrMatch;

    let hasTargetBlank = false;
    let hasRel = false;

    while ((attrMatch = attrRegex.exec(attrString)) !== null) {
      const attrName = attrMatch[1].toLowerCase();
      const attrVal = attrMatch[2] ?? attrMatch[3] ?? attrMatch[4] ?? '';

      // Block all inline JS event handlers (e.g. onclick, onerror, onload)
      if (attrName.startsWith('on')) {
        continue;
      }

      if (allowedAttrsForTag.has(attrName)) {
        // Check URL safety for href and src
        if (attrName === 'href' || attrName === 'src') {
          const trimmed = attrVal.trim();
          if (SAFE_URL_PATTERN.test(trimmed) && !trimmed.toLowerCase().includes('javascript:')) {
            sanitizedAttrs.push(`${attrName}="${escapeAttribute(trimmed)}"`);
          }
        } else if (attrName === 'target') {
          if (attrVal === '_blank') {
            hasTargetBlank = true;
            sanitizedAttrs.push(`target="_blank"`);
          }
        } else if (attrName === 'rel') {
          hasRel = true;
          sanitizedAttrs.push(`rel="${escapeAttribute(attrVal)}"`);
        } else {
          sanitizedAttrs.push(`${attrName}="${escapeAttribute(attrVal)}"`);
        }
      }
    }

    if (tag === 'a' && hasTargetBlank && !hasRel) {
      sanitizedAttrs.push('rel="noopener noreferrer"');
    }

    const attrsFormatted = sanitizedAttrs.length > 0 ? ' ' + sanitizedAttrs.join(' ') : '';
    const selfClosing = ['img', 'br', 'hr'].includes(tag) ? ' /' : '';
    return `<${tag}${attrsFormatted}${selfClosing}>`;
  });

  return clean;
}

function escapeAttribute(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

/**
 * Validates slug format and checks against reserved application routes
 */
export const RESERVED_SLUGS = new Set([
  'about',
  'research',
  'projects',
  'partners',
  'news',
  'events',
  'insights',
  'consultation',
  'ask',
  'subscribe',
  'privacy',
  'health',
  'admin',
  'api',
  'uploads',
  'login',
  'media-gallery',
  'who-we-are',
  'mission-vision',
  'leadership',
  'partner-with-us',
  'preview'
]);

export function isValidSlug(slug: string): boolean {
  if (!slug || typeof slug !== 'string') return false;
  // Slugs must be lowercase alphanumeric with hyphens, 2 to 100 chars, no leading/trailing hyphen
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug) && slug.length >= 2 && slug.length <= 100;
}

export function isReservedSlug(slug: string): boolean {
  return RESERVED_SLUGS.has(slug.toLowerCase());
}
