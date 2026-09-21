/**
 * Splitting one how-to-use sentence into the design's two lines.
 *
 * The approved image draws each step as a bold line over a dimmer line. The
 * catalogue writes one sentence per step, so the split has to come out of the
 * sentence itself rather than out of an editor's head: the first clause, up to
 * the first comma, is the instruction, and whatever follows is the qualifier.
 * A sentence with no comma stays one line and the panel is drawn for it.
 *
 * Nothing here rewrites, shortens or paraphrases the merchant's words.
 */
const ARABIC_COMMA = String.fromCharCode(0x060c);
const COMMA = String.fromCharCode(44);

export interface StepParts {
  lead: string;
  tail: string;
}

export function splitStep(step: string): StepParts {
  const text = step.trim();
  let at = text.indexOf(ARABIC_COMMA);
  if (at < 0) at = text.indexOf(COMMA);
  if (at <= 0 || at >= text.length - 1) return { lead: text, tail: '' };
  return { lead: text.slice(0, at).trim(), tail: text.slice(at + 1).trim() };
}
