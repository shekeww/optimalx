import { describe, it, expect } from 'vitest';
import {
  ALLOWED_TAGS,
  MAX_DEPTH,
  decodeEntities,
  escapeText,
  isSafeHref,
  parseFragment,
  sanitizeHtml,
  textOf,
} from '../../app/components/product/lib/sanitizeHtml';

/** Characters built from codes so tooling cannot mangle an escape (PLAN 2.3). */
const TAB = String.fromCharCode(9);
const NEWLINE = String.fromCharCode(10);
const NUL = String.fromCharCode(0);
const LINE_SEP = String.fromCharCode(0x2028);
const PARA_SEP = String.fromCharCode(0x2029);
const BACKSLASH = String.fromCharCode(92);
const AMP = String.fromCharCode(38);

/** Every vector must leave the sanitiser inert: no live tag, no live handler. */
const XSS_CORPUS: { name: string; input: string; mustNotContain: string[] }[] = [
  {
    name: '1. script element',
    input: '<p>hello</p><script>alert(1)</script>',
    mustNotContain: ['<script', 'alert(1)'],
  },
  {
    name: '2. inline event handler',
    input: '<p onclick="alert(1)">hello</p>',
    mustNotContain: ['onclick', 'alert'],
  },
  {
    name: '3. javascript: href',
    input: '<a href="javascript:alert(1)">go</a>',
    mustNotContain: ['javascript', 'href'],
  },
  {
    name: '4. data: href',
    input: '<a href="data:text/html;base64,PHNjcmlwdD4=">go</a>',
    mustNotContain: ['data:', 'href'],
  },
  {
    name: '5. scheme split by a tab and a newline',
    input: '<a href="java' + TAB + 'script' + NEWLINE + ':alert(1)">go</a>',
    mustNotContain: ['javascript', 'href'],
  },
  {
    name: '6. entity-smuggled scheme',
    input: '<a href="&#106;avascript&#58;alert(1)">go</a>',
    mustNotContain: ['javascript', 'href'],
  },
  {
    name: '7. double-encoded script text',
    input: '<p>&amp;lt;script&amp;gt;alert(1)&amp;lt;/script&amp;gt;</p>',
    mustNotContain: ['<script', '</script'],
  },
  {
    name: '8. style attribute and style element',
    input: '<style>body{display:none}</style><p style="position:fixed">hi</p>',
    mustNotContain: ['style', 'position:fixed'],
  },
  {
    name: '9. iframe',
    input: '<iframe src="https://evil.example"></iframe><p>after</p>',
    mustNotContain: ['<iframe', 'evil.example'],
  },
  {
    name: '10. svg with an onload handler',
    input: '<svg><animate onbegin="alert(1)" /></svg><p>after</p>',
    mustNotContain: ['<svg', 'onbegin', 'alert'],
  },
  {
    name: '11. img with onerror',
    input: '<img src=x onerror=alert(1)><p>after</p>',
    mustNotContain: ['<img', 'onerror', 'alert'],
  },
  {
    name: '12. unterminated tag swallowing the rest',
    input: '<p>text<script src="https://evil.example/x.js"',
    mustNotContain: ['<script', 'evil.example'],
  },
  {
    name: '13. nested and mismatched tags',
    input: '<p><b>bold<i>both</p></b></i><script>x</script>',
    mustNotContain: ['<script'],
  },
  {
    name: '14. comment hiding a script',
    input: '<!--<script>alert(1)</script>--><p>after</p>',
    mustNotContain: ['<script', 'alert', '<!--'],
  },
  {
    name: '15. U+2028 and U+2029 separators',
    input: '<p>a' + LINE_SEP + 'b' + PARA_SEP + 'c</p>',
    mustNotContain: [LINE_SEP, PARA_SEP],
  },
  {
    name: '16. NUL byte inside a scheme',
    input: '<a href="java' + NUL + 'script:alert(1)">go</a>',
    mustNotContain: ['javascript', 'href'],
  },
  {
    name: '17. protocol-relative href',
    input: '<a href="//evil.example/x">go</a>',
    mustNotContain: ['href', 'evil.example'],
  },
  {
    name: '18. backslash-prefixed path',
    input: '<a href="' + BACKSLASH + BACKSLASH + 'evil.example">go</a>',
    mustNotContain: ['href'],
  },
  {
    name: '19. form and input controls',
    input: '<form action="https://evil.example"><input name="x"></form><p>after</p>',
    mustNotContain: ['<form', '<input', 'evil.example'],
  },
  {
    name: '20. uppercase tag name and attribute',
    input: '<P ONCLICK="alert(1)">hi</P><SCRIPT>alert(2)</SCRIPT>',
    mustNotContain: ['onclick', 'ONCLICK', 'alert', 'script', 'SCRIPT'],
  },
];

describe('sanitizeHtml: XSS corpus', () => {
  for (const vector of XSS_CORPUS) {
    it(vector.name, () => {
      const output = sanitizeHtml(vector.input);
      for (const forbidden of vector.mustNotContain) {
        expect(output.toLowerCase(), vector.name).not.toContain(forbidden.toLowerCase());
      }
    });
  }

  it('keeps the readable text of every vector that carried one', () => {
    expect(sanitizeHtml(XSS_CORPUS[0].input)).toContain('hello');
    expect(sanitizeHtml(XSS_CORPUS[8].input)).toContain('after');
    expect(sanitizeHtml(XSS_CORPUS[11].input)).toContain('text');
  });

  it('never emits a tag outside the allowlist', () => {
    const output = XSS_CORPUS.map((vector) => sanitizeHtml(vector.input)).join('');
    const tags = output.split(String.fromCharCode(60)).slice(1);
    for (const tag of tags) {
      const name = tag
        .replace(String.fromCharCode(47), '')
        .split(new RegExp('[ >]'))[0]
        .toLowerCase();
      if (name.length === 0) continue;
      expect(ALLOWED_TAGS, name).toContain(name);
    }
  });
});

describe('sanitizeHtml: allowlist behaviour', () => {
  it('keeps the allowed structural tags', () => {
    const html = '<h2>t</h2><p>a<br>b</p><ul><li>x</li></ul><table><tr><th>h</th><td>v</td></tr></table>';
    const output = sanitizeHtml(html);
    expect(output).toContain('<h2>t</h2>');
    expect(output).toContain('<li>x</li>');
    expect(output).toContain('<th>h</th>');
    expect(output).toContain('<br />');
  });

  it('unwraps an unknown element and keeps its text', () => {
    expect(sanitizeHtml('<div><section>kept</section></div>')).toBe('kept');
  });

  it('drops a raw element with its whole subtree', () => {
    expect(sanitizeHtml('<p>a</p><script>var x = 1;</script><p>b</p>')).toBe('<p>a</p><p>b</p>');
  });

  it('keeps an http href and adds rel', () => {
    const output = sanitizeHtml('<a href="https://optimalx.com.sa/x">x</a>');
    expect(output).toContain('href="https://optimalx.com.sa/x"');
    expect(output).toContain('rel="nofollow noopener"');
  });

  it('keeps a relative href, a query and a fragment', () => {
    expect(sanitizeHtml('<a href="/ar/p1">x</a>')).toContain('href="/ar/p1"');
    expect(sanitizeHtml('<a href="?sort=1">x</a>')).toContain('href="?sort=1"');
    expect(sanitizeHtml('<a href="#faq-1">x</a>')).toContain('href="#faq-1"');
  });

  it('keeps th scope and a numeric colspan, drops anything else', () => {
    const output = sanitizeHtml('<table><tr><th scope="col" class="x" colspan="2">h</th></tr></table>');
    expect(output).toContain('scope="col"');
    expect(output).toContain('colspan="2"');
    expect(output).not.toContain('class');
  });

  it('drops a colspan that is not a positive integer above one', () => {
    const output = sanitizeHtml('<table><tr><td colspan="abc">v</td><td colspan="1">w</td></tr></table>');
    expect(output).not.toContain('colspan');
  });

  it('re-escapes the text it keeps', () => {
    expect(sanitizeHtml('<p>5 &lt; 7 &amp; 8 &gt; 6</p>')).toBe('<p>5 &lt; 7 &amp; 8 &gt; 6</p>');
  });

  it('treats a lone angle bracket as text', () => {
    expect(sanitizeHtml('<p>a < b</p>')).toBe('<p>a &lt; b</p>');
  });

  it('is idempotent', () => {
    const once = sanitizeHtml('<p>a &amp; b</p><script>x</script><a href="/y">l</a>');
    expect(sanitizeHtml(once)).toBe(once);
  });

  it('returns an empty string for empty input', () => {
    expect(sanitizeHtml(null)).toBe('');
    expect(sanitizeHtml(undefined)).toBe('');
    expect(sanitizeHtml('')).toBe('');
  });
});

describe('sanitizeHtml helpers', () => {
  it('decodeEntities handles named, decimal and hex forms and leaves the rest alone', () => {
    expect(decodeEntities('&amp;&lt;&gt;&quot;&#39;')).toBe('&<>"' + String.fromCharCode(39));
    expect(decodeEntities('&#1571;')).toBe(String.fromCharCode(1571));
    expect(decodeEntities('&#x41;')).toBe('A');
    expect(decodeEntities('R&D and Q&A')).toBe('R&D and Q&A');
  });

  it('escapeText encodes the five characters plus the line separators', () => {
    expect(escapeText('<>&"' + String.fromCharCode(39))).toBe('&lt;&gt;&amp;&quot;&#39;');
    expect(escapeText(LINE_SEP)).toBe('&#8232;');
    expect(escapeText(PARA_SEP)).toBe('&#8233;');
  });

  it('isSafeHref accepts http, https and relative and rejects everything else', () => {
    for (const ok of ['https://a.test/x', 'http://a.test', '/ar/x', '#a', '?q=1', 'p1.html', 'a/b:c']) {
      expect(isSafeHref(ok), ok).toBe(true);
    }
    for (const bad of [
      'javascript:alert(1)',
      'JaVaScRiPt:alert(1)',
      'data:text/html,x',
      'vbscript:x',
      'file:///etc/passwd',
      'mailto:a@b.test',
      '//evil.test',
      '',
    ]) {
      expect(isSafeHref(bad), bad).toBe(false);
    }
  });

  it('parseFragment merges adjacent text and textOf flattens it', () => {
    const nodes = parseFragment('<p>a<b>b</b>c</p>');
    expect(nodes).toHaveLength(1);
    expect(textOf(nodes)).toBe('abc');
  });
});

/**
 * The G1 security review's findings (scratchpad/G1-report.md). None was an
 * exploitable XSS: two were availability (a quadratic scan and an unbounded
 * recursion), two were parser-boundary bugs that contradicted the file's own
 * guarantee about matching what a browser matches, and one leaked the text of
 * a dropped element into the page as visible copy.
 */
describe('sanitizeHtml: G1 hardening', () => {
  it('1. decodeEntities stays linear on a run of bare ampersands', () => {
    // Quadratic before the fix: 15k 6ms, 30k 20ms, 60k 81ms, 120k 316ms.
    // The assertion is on the SHAPE of the growth, not on absolute ms, so it
    // does not flake on a slow machine: four times the input must not cost
    // anything like sixteen times the time.
    const time = (n: number) => {
      const input = new Array(n).fill(AMP).join('');
      const start = Date.now();
      decodeEntities(input);
      return Math.max(1, Date.now() - start);
    };
    time(50000); // warm up, so the first JIT pass is not charged to the ratio
    const small = time(50000);
    const large = time(200000);
    expect(large / small).toBeLessThan(8);
  });

  it('1b. a bounded scan still decodes real entities and leaves junk alone', () => {
    expect(decodeEntities('&amp;')).toBe(AMP);
    expect(decodeEntities('&#39;')).toBe(String.fromCharCode(39));
    // No semicolon within the bound: a literal ampersand, not a swallowed run.
    expect(decodeEntities('&' + 'a'.repeat(64) + ';')).toBe('&' + 'a'.repeat(64) + ';');
    expect(decodeEntities('R&D')).toBe('R&D');
  });

  it('1c. a megabyte of adversarial input completes', () => {
    const input = new Array(1000000).fill(AMP).join('');
    const start = Date.now();
    const out = sanitizeHtml(input);
    expect(Date.now() - start).toBeLessThan(5000);
    expect(out.indexOf('<')).toBe(-1);
  });

  it('2. deep nesting is flattened, never thrown', () => {
    for (const depth of [600, 5000, 20000]) {
      const input = '<span>'.repeat(depth) + 'x' + '</span>'.repeat(depth);
      let output = '';
      expect(() => {
        output = sanitizeHtml(input);
      }, 'depth ' + depth).not.toThrow();
      expect(output, 'depth ' + depth).toContain('x');
    }
  });

  it('2b. the tree never nests deeper than MAX_DEPTH', () => {
    const nodes = parseFragment('<span>'.repeat(4000) + 'x' + '</span>'.repeat(4000));
    let depth = 0;
    let current = nodes;
    while (current.length > 0 && current[0].type === 'element') {
      depth += 1;
      current = current[0].children;
    }
    expect(depth).toBeLessThanOrEqual(MAX_DEPTH + 1);
    expect(textOf(nodes)).toBe('x');
  });

  it('2c. content below the cap is kept, not dropped', () => {
    const input = '<p>'.repeat(600) + 'deep text' + '</p>'.repeat(600);
    expect(textOf(parseFragment(input))).toContain('deep text');
  });

  it('3. isSafeHref judges a scheme by the URI grammar, not by punctuation', () => {
    // A colon AFTER the first separator belongs to the path.
    for (const ok of ['a/b:c', 'x/y?q=a:b', 'p1.html', '/ar/x', '#a', '?q=1']) {
      expect(isSafeHref(ok), ok).toBe(true);
    }
    // A colon in the FIRST segment is a scheme or nothing: `notes:` is a
    // well-formed scheme that is simply not one we render, and a malformed
    // one is refused outright rather than read as a relative path.
    for (const rejected of ['notes:2026/plan', 'a b:c', 'java&#0;script:x']) {
      expect(isSafeHref(rejected), rejected).toBe(false);
    }
    // A stray `#` used to push the colon past the "first separator" and win
    // the benefit of the doubt; the scheme grammar rejects it outright now.
    for (const bad of [
      'java&#0;script:alert(1)',
      'javascript:alert(1)#x',
      'j+a-v.a1:alert(1)',
      'data:text/html,x?y',
      BACKSLASH + 'evil',
    ]) {
      expect(isSafeHref(bad), bad).toBe(false);
    }
  });

  it('3b. a scheme name may hold digits, plus, dot and dash, and is still gated', () => {
    expect(isSafeHref('h2+x.y-z:payload')).toBe(false);
    expect(isSafeHref('https://a.test/x')).toBe(true);
    expect(isSafeHref('HTTPS://a.test/x')).toBe(true);
  });

  it('4. a longer close tag does not terminate a raw element', () => {
    const output = sanitizeHtml(
      '<p>before</p><script>1</scripts><b>bold</b></script><p>after</p>'
    );
    // Everything from <script> to its real close is gone, including the
    // decoy content that used to escape through the mis-matched boundary.
    expect(output).toBe('<p>before</p><p>after</p>');
  });

  it('4b. the real close tag still terminates, with any spacing', () => {
    expect(sanitizeHtml('<p>a</p><script>x</script >< p>b</p>')).toContain('a');
    expect(sanitizeHtml('<p>a</p><script>x</script >')).toBe('<p>a</p>');
    expect(sanitizeHtml('<style>x</style/>')).toBe('');
  });

  it('5. a CDATA section ends at its own terminator, not at the first bracket', () => {
    const output = sanitizeHtml('<p>x</p><![CDATA[<script>alert(1)</script>]]><p>y</p>');
    expect(output).toBe('<p>x</p><p>y</p>');
    // The leak this closes: script source became visible body copy.
    expect(output).not.toContain('alert(1)');
    expect(output).not.toContain(']]');
  });

  it('5b. a doctype and a comment still take their own paths', () => {
    expect(sanitizeHtml('<!DOCTYPE html><p>a</p>')).toBe('<p>a</p>');
    expect(sanitizeHtml('<!-- c --><p>a</p>')).toBe('<p>a</p>');
    // An unterminated CDATA consumes to the end rather than spilling markup.
    expect(sanitizeHtml('<p>a</p><![CDATA[<script>x')).toBe('<p>a</p>');
  });

  it('every G1 vector is still inert after the fixes', () => {
    const vectors = [
      '<p>x</p><![CDATA[<script>alert(1)</script>]]><p>y</p>',
      '<script>1</scripts><b>b</b></script>',
      '<a href="java&#0;script:alert(1)">x</a>',
      '<a href="&#X6A;avascript&#X3A;alert(1)">x</a>',
      '<a href="mailto:a@b.test?x=javascript:alert(1)">x</a>',
      '<th scope="javascript:alert(1)">h</th>',
      '<base href="evil">',
      '<ScRipT SrC="https://evil.example"></ScRipT>',
    ];
    for (const vector of vectors) {
      const output = sanitizeHtml(vector).toLowerCase();
      expect(output, vector).not.toContain('<script');
      expect(output, vector).not.toContain('javascript:');
      expect(output, vector).not.toContain('href=');
      expect(sanitizeHtml(sanitizeHtml(vector)), vector).toBe(sanitizeHtml(vector));
    }
  });
});
