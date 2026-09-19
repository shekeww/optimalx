/**
 * Reads the product description apart into the four things the PDP renders
 * separately: the spec line, the nutrition facts table, the how-to-use
 * paragraph, the warning paragraph, and whatever prose is left.
 *
 * The convention is the catalogue's (FINAL-catalogue reading rules, verified
 * against research/catalogue.json): spec line paragraph, prose paragraphs,
 * the first <table> holding the label's nutrition facts, then a paragraph
 * beginning "طريقة الاستخدام:" and one beginning "تنبيه:".
 *
 * Everything here works on the sanitised node tree, never on raw HTML, so a
 * merchant cannot reach the DOM through this path either.
 */
import { parseFragment, serialize, textOf, type OxElementNode, type OxNode } from './sanitizeHtml';
import { parseSpecLineText, type SpecLine } from './specLine';

export interface NutritionRow {
  /** Nutrient name, exactly as printed on the label. */
  name: string;
  /** Amount in one serving, exactly as printed. */
  perServing: string;
  /**
   * Locale key for the plain-Arabic explanation, or null when the glossary
   * has no entry. A null renders an empty cell; it is never filled in.
   */
  meaningKey: string | null;
}

export interface NutritionTable {
  /** The table's own header cells, when it has a header row. */
  headers: string[];
  rows: NutritionRow[];
}

export interface DescriptionParts {
  specLine: SpecLine | null;
  nutrition: NutritionTable | null;
  /** Sanitised HTML of the prose paragraphs, with the parsed parts removed. */
  bodyHtml: string;
  /** The "طريقة الاستخدام" sentence, split into steps on the sentence stop. */
  howToUse: string[];
  /** The "تنبيه" sentence(s), rendered as the warning row. */
  warning: string[];
  /** Plain text of the whole description, for meta and JSON-LD. */
  text: string;
}

export const PREFIX_HOW_TO_USE = 'طريقة الاستخدام';
export const PREFIX_WARNING = 'تنبيه';

/** Lookup the third nutrition column uses: a nutrient name to a locale key. */
export type GlossaryLookup = (nutrientName: string) => string | null;

const ARABIC_FULL_STOP = String.fromCharCode(0x06d4);
const FULL_STOP = String.fromCharCode(46);

function isElement(node: OxNode): node is OxElementNode {
  return node.type === 'element';
}

/** Depth-first search for the first element with one of `tags`. */
function findElement(nodes: readonly OxNode[], tags: readonly string[]): OxElementNode | null {
  for (const node of nodes) {
    if (!isElement(node)) continue;
    if (tags.indexOf(node.tag) >= 0) return node;
    const nested = findElement(node.children, tags);
    if (nested) return nested;
  }
  return null;
}

function collectRows(node: OxElementNode, out: OxElementNode[]): void {
  for (const child of node.children) {
    if (!isElement(child)) continue;
    if (child.tag === 'tr') out.push(child);
    else collectRows(child, out);
  }
}

function cellsOf(row: OxElementNode): { text: string; header: boolean }[] {
  const cells: { text: string; header: boolean }[] = [];
  for (const child of row.children) {
    if (!isElement(child)) continue;
    if (child.tag !== 'td' && child.tag !== 'th') continue;
    cells.push({ text: textOf(child.children), header: child.tag === 'th' });
  }
  return cells;
}

/**
 * The first table in the tree as `{name, perServing}` rows, with the third
 * column resolved through the glossary. A row whose name is empty is skipped;
 * a row with one cell keeps an empty amount rather than shifting columns.
 */
export function readNutritionTable(
  nodes: readonly OxNode[],
  glossary?: GlossaryLookup
): NutritionTable | null {
  const table = findElement(nodes, ['table']);
  if (!table) return null;
  const trs: OxElementNode[] = [];
  collectRows(table, trs);
  if (trs.length === 0) return null;
  let headers: string[] = [];
  const rows: NutritionRow[] = [];
  for (let i = 0; i < trs.length; i += 1) {
    const cells = cellsOf(trs[i]);
    if (cells.length === 0) continue;
    if (i === 0 && cells.every((cell) => cell.header)) {
      headers = cells.map((cell) => cell.text);
      continue;
    }
    const name = (cells[0]?.text ?? '').trim();
    if (name.length === 0) continue;
    rows.push({
      name,
      perServing: (cells[1]?.text ?? '').trim(),
      meaningKey: glossary ? glossary(name) : null,
    });
  }
  if (rows.length === 0) return null;
  return { headers, rows };
}

/** Splits a sentence run into separate lines on the Arabic and Latin full stop. */
function sentences(value: string): string[] {
  const out: string[] = [];
  let current = '';
  for (let i = 0; i < value.length; i += 1) {
    const char = value.charAt(i);
    current += char;
    if (char === ARABIC_FULL_STOP || char === FULL_STOP) {
      const trimmed = current.trim();
      if (trimmed.length > 1) out.push(trimmed);
      current = '';
    }
  }
  const tail = current.trim();
  if (tail.length > 0) out.push(tail);
  return out;
}

/** Text after the "label:" prefix of a labelled paragraph. */
function afterPrefix(text: string, prefix: string): string {
  const at = text.indexOf(prefix);
  if (at !== 0) return text;
  const rest = text.slice(prefix.length).trim();
  const colon = rest.charCodeAt(0);
  // 58 is ":", 1563 is the Arabic semicolon some copy uses instead.
  return colon === 58 || colon === 1563 ? rest.slice(1).trim() : rest;
}

/**
 * Parses a raw description into its parts. `bodyHtml` is already sanitised
 * and is the only string the PDP passes to dangerouslySetInnerHTML.
 */
export function splitDescription(
  descriptionHtml: string | null | undefined,
  glossary?: GlossaryLookup
): DescriptionParts {
  const nodes = parseFragment(descriptionHtml);
  const nutrition = readNutritionTable(nodes, glossary);
  let specLine: SpecLine | null = null;
  const howToUse: string[] = [];
  const warning: string[] = [];
  const body: OxNode[] = [];
  let seenFirstParagraph = false;
  let droppedTable = false;

  for (const node of nodes) {
    if (!isElement(node)) {
      if (node.value.trim().length > 0) body.push(node);
      continue;
    }
    if (node.tag === 'table' && !droppedTable) {
      droppedTable = true;
      continue;
    }
    if (node.tag === 'p') {
      const text = textOf(node.children).trim();
      if (!seenFirstParagraph) {
        seenFirstParagraph = true;
        const parsed = parseSpecLineText(text);
        if (parsed) {
          specLine = parsed;
          continue;
        }
      }
      if (text.indexOf(PREFIX_HOW_TO_USE) === 0) {
        howToUse.push(...sentences(afterPrefix(text, PREFIX_HOW_TO_USE)));
        continue;
      }
      if (text.indexOf(PREFIX_WARNING) === 0) {
        warning.push(...sentences(afterPrefix(text, PREFIX_WARNING)));
        continue;
      }
      if (text.length === 0) continue;
    }
    body.push(node);
  }

  return {
    specLine,
    nutrition,
    bodyHtml: serialize(body),
    howToUse,
    warning,
    text: textOf(nodes),
  };
}
