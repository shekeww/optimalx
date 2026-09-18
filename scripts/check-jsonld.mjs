// Token-level duplicate-key scan for JSON / JSON-LD files.
//
// JSON.parse silently keeps the last of two identical keys, so a builder that
// declares a property twice would pass every runtime check while search
// engines see an ambiguous document. This walks the raw text instead and
// reports every key that repeats inside the same object, with its path.
//
// Usage: node scripts/check-jsonld.mjs <file | directory | glob> ...
// Exits 1 on any duplicate key, unparsable file or empty target list.

import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

/**
 * @typedef {{ path: string, key: string, line: number }} DuplicateKey
 */

/**
 * Scans JSON text and returns every duplicated key with its object path.
 * Keys are compared by their decoded value, exactly as JSON.parse would.
 * Throws SyntaxError on malformed input.
 *
 * @param {string} text
 * @returns {DuplicateKey[]}
 */
export function findDuplicateKeys(text) {
  /** @type {DuplicateKey[]} */
  const findings = [];
  const n = text.length;
  let i = 0;

  const fail = (what) => new SyntaxError(`${what} at offset ${i} (line ${lineAt(text, i)})`);
  const skipWs = () => {
    while (i < n && (text[i] === ' ' || text[i] === '\n' || text[i] === '\r' || text[i] === '\t')) i++;
  };

  const readString = () => {
    let j = i + 1;
    while (j < n) {
      const c = text[j];
      if (c === '\\') {
        j += 2;
        continue;
      }
      if (c === '"') break;
      j++;
    }
    if (j >= n) throw fail('Unterminated string');
    const raw = text.slice(i, j + 1);
    i = j + 1;
    return JSON.parse(raw);
  };

  const readLiteral = () => {
    const start = i;
    while (i < n && !/[\s,\]}]/.test(text[i])) i++;
    if (i === start) throw fail('Unexpected character');
    JSON.parse(text.slice(start, i));
  };

  const parseValue = (objectPath) => {
    skipWs();
    if (i >= n) throw fail('Unexpected end of input');
    const c = text[i];
    if (c === '{') return parseObject(objectPath);
    if (c === '[') return parseArray(objectPath);
    if (c === '"') return void readString();
    return readLiteral();
  };

  const parseObject = (objectPath) => {
    i++;
    const seen = new Set();
    skipWs();
    if (text[i] === '}') return void i++;
    for (;;) {
      skipWs();
      if (text[i] !== '"') throw fail('Expected a string key');
      const keyLine = lineAt(text, i);
      const key = readString();
      const childPath = objectPath ? `${objectPath}.${key}` : key;
      if (seen.has(key)) findings.push({ path: childPath, key, line: keyLine });
      seen.add(key);
      skipWs();
      if (text[i] !== ':') throw fail("Expected ':'");
      i++;
      parseValue(childPath);
      skipWs();
      if (text[i] === ',') {
        i++;
        continue;
      }
      if (text[i] === '}') return void i++;
      throw fail("Expected ',' or '}'");
    }
  };

  const parseArray = (objectPath) => {
    i++;
    skipWs();
    if (text[i] === ']') return void i++;
    let index = 0;
    for (;;) {
      parseValue(`${objectPath}[${index}]`);
      index++;
      skipWs();
      if (text[i] === ',') {
        i++;
        continue;
      }
      if (text[i] === ']') return void i++;
      throw fail("Expected ',' or ']'");
    }
  };

  parseValue('');
  skipWs();
  if (i < n) throw fail('Unexpected trailing content');
  return findings;
}

function lineAt(text, offset) {
  let line = 1;
  for (let k = 0; k < offset; k++) if (text[k] === '\n') line++;
  return line;
}

/** Expands file, directory and simple `dir/*.json` arguments to file paths. */
export function expandTargets(args) {
  const files = [];
  for (const arg of args) {
    if (arg.includes('*')) {
      files.push(...fs.globSync(arg));
      continue;
    }
    if (fs.existsSync(arg) && fs.statSync(arg).isDirectory()) {
      for (const name of fs.readdirSync(arg)) {
        if (name.endsWith('.json')) files.push(path.join(arg, name));
      }
      continue;
    }
    files.push(arg);
  }
  return files;
}

function main(args) {
  const files = expandTargets(args);
  if (files.length === 0) {
    console.error('check-jsonld: no files matched', args.join(' '));
    return 1;
  }
  let problems = 0;
  for (const file of files) {
    let findings;
    try {
      findings = findDuplicateKeys(fs.readFileSync(file, 'utf8'));
    } catch (error) {
      problems++;
      console.error(`${file}: ${error instanceof Error ? error.message : String(error)}`);
      continue;
    }
    for (const f of findings) {
      problems++;
      console.error(`${file}:${f.line}: duplicate key "${f.key}" at ${f.path}`);
    }
  }
  console.log(`check-jsonld: ${files.length} file(s), ${problems} problem(s)`);
  return problems === 0 ? 0 : 1;
}

const invokedDirectly =
  process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href;
if (invokedDirectly) process.exitCode = main(process.argv.slice(2));
