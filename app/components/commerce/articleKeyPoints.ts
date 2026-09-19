import { parseFragment, textOf, type OxElementNode, type OxNode } from '../product/lib/sanitizeHtml';

/** Headings the key-points block is allowed to read, in either language. */
export const KEY_POINTS_HEADINGS: readonly string[] = ['الخلاصة', 'in short', 'key points']; // ox-allow: arabic-literal heading tokens the parser matches, not copy

const HEADING_TAGS = ['h2', 'h3'];
const LIST_TAGS = ['ul', 'ol'];

function isElement(node: OxNode): node is OxElementNode {
  return node.type === 'element';
}

function normalise(value: string): string {
  return value.trim().toLowerCase();
}

/**
 * The three bullets under the article's own "الخلاصة" heading
 * (DIRECTION 6.13 Article row 4).
 *
 * The article body is dashboard HTML, so it is parsed through the B3
 * sanitiser first and only its text is read: the block renders plain strings
 * and never re-injects markup. The parser looks for an h2 or h3 whose text is
 * one of `KEY_POINTS_HEADINGS` and takes the list items of the first list
 * after it. An article that does not carry that section gets no block at all,
 * which is why the block is never a summary we wrote ourselves.
 */
export function articleKeyPoints(html: string | null | undefined, max = 3): string[] {
  if (!html) return [];
  const nodes = parseFragment(html).filter(isElement);
  let seen = false;
  for (const node of nodes) {
    if (!seen) {
      if (HEADING_TAGS.indexOf(node.tag) >= 0) {
        const text = normalise(textOf([node]));
        if (KEY_POINTS_HEADINGS.some((heading) => text === normalise(heading))) seen = true;
      }
      continue;
    }
    if (HEADING_TAGS.indexOf(node.tag) >= 0) return [];
    if (LIST_TAGS.indexOf(node.tag) >= 0) {
      const items: string[] = [];
      for (const child of node.children) {
        if (!isElement(child) || child.tag !== 'li') continue;
        const text = textOf([child]).trim();
        if (text.length > 0) items.push(text);
        if (items.length === max) break;
      }
      return items;
    }
  }
  return [];
}
