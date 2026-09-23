import path from 'node:path';
import * as sass from 'sass';

/**
 * The theme's whole stylesheet, compiled once per test file from
 * `app/styles/app.scss` with the same `sass` the build uses, and split into
 * flat rules. Nesting (`&::-webkit-scrollbar`, `@media`, `[dir='ltr'] &`) is
 * resolved by the compiler, so a gate reading these rules sees every
 * declaration the browser does, not only the top-level blocks of a source
 * file.
 */
export interface CompiledRule {
  /** The rule's selector list, whitespace collapsed. */
  selector: string;
  /** `property: value` pairs, in source order. */
  declarations: { property: string; value: string }[];
  /** The enclosing at-rule preludes, outermost first (`@media (min-width: 640px)`). */
  atRules: string[];
}

let cache: CompiledRule[] | null = null;

/** Strip `/* ... *\/` comments; the compiled output has no `//` comments left. */
function stripComments(css: string): string {
  let out = '';
  let i = 0;
  while (i < css.length) {
    if (css.startsWith('/*', i)) {
      const end = css.indexOf('*/', i + 2);
      i = end === -1 ? css.length : end + 2;
      continue;
    }
    out += css[i];
    i += 1;
  }
  return out;
}

function parseDeclarations(body: string): CompiledRule['declarations'] {
  return body
    .split(';')
    .map((part) => part.trim())
    .filter((part) => part.includes(':'))
    .map((part) => {
      const colon = part.indexOf(':');
      return { property: part.slice(0, colon).trim(), value: part.slice(colon + 1).trim() };
    });
}

function parse(css: string): CompiledRule[] {
  const rules: CompiledRule[] = [];
  const stack: string[] = [];
  let buffer = '';
  for (let i = 0; i < css.length; i += 1) {
    const char = css[i];
    if (char === '{') {
      const prelude = buffer.trim().replace(/\s+/g, ' ');
      buffer = '';
      if (prelude.startsWith('@')) {
        stack.push(prelude);
        continue;
      }
      const close = css.indexOf('}', i + 1);
      rules.push({ selector: prelude, declarations: parseDeclarations(css.slice(i + 1, close)), atRules: [...stack] });
      i = close;
    } else if (char === '}') {
      stack.pop();
      buffer = '';
    } else if (char === ';' && buffer.trim().startsWith('@')) {
      buffer = '';
    } else {
      buffer += char;
    }
  }
  return rules;
}

/** Every style rule of the compiled theme stylesheet. */
export function compiledRules(): CompiledRule[] {
  if (cache) return cache;
  const result = sass.compile(path.join(process.cwd(), 'app', 'styles', 'app.scss'), {
    logger: sass.Logger.silent,
  });
  cache = parse(stripComments(result.css));
  return cache;
}

/** The value of `property` in `rule`, the last declaration winning, or undefined. */
export function declared(rule: CompiledRule, property: string): string | undefined {
  const matches = rule.declarations.filter((entry) => entry.property === property);
  return matches.length > 0 ? matches[matches.length - 1].value : undefined;
}

/** The rules whose selector list contains `selector` as one of its members. */
export function rulesFor(selector: string): CompiledRule[] {
  return compiledRules().filter((rule) =>
    rule.selector.split(',').some((member) => member.trim() === selector)
  );
}
