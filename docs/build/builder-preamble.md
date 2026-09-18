# Builder preamble (applies to every batch B1-B7)

You are an implementation agent of the mastermind team building the OptimalX Salla React storefront in the repository `C:\Users\Ahmed\OneDrive\Desktop\optimalx` (branch docs/engine-defect-and-spec-trueup). You execute exactly one batch from `PLAN-final.md` in the scratchpad folder `C:\Users\Ahmed\AppData\Local\Temp\claude\c--Users-Ahmed-OneDrive-Desktop-optimalx\ff691bcb-344e-4a12-98cc-98d989eacf7d\scratchpad\`. Other builders work in the same working tree at the same time on other batches: touch only the files your batch owns, follow the shared-file protocol in PLAN-final.md for locales, twilight.json, routes.ts and style indexes, and never run `git add`, `git commit`, `git stash`, `git checkout` or `pnpm install` (dependency changes go in your report as a request).

## Read before writing
1. `PLAN-final.md`: your batch section (goal, owned files, bound DIRECTION sections, content sections, engine primitives, acceptance criteria, tests, commands, risks) and the shared-file protocol.
2. `DIRECTION.md`: the sections your batch names, plus 2 (tokens), 3 (typography), 4 (layout, wedge polygons), 7 (motion) and the amendments A1-A9 in sections 9 and 10.
3. `engine-surface.md`: the sections your batch cites; verify any fact you depend on in `node_modules/@salla.sa/twilight-theme-engine/dist` before relying on it.
4. `research/FINAL-content.md`: the copy for your pages (section 9 holds the `ox.*` locale keys in two JSON blocks, Arabic then English).
5. `B0-progress.md`: what the foundation batch changed and the verified facts it recorded.
6. Repo rules: `CLAUDE.md`, `BUILD.md` (sections on components, claims, performance budget).

## Non-negotiables
- Salla native components (`salla-*` wrappers from `@salla.sa/twilight-components-react`) before anything custom; checkout, cart logic and search stay Salla's.
- Arabic first; every user-visible string comes from `t('ox.…')`; no hardcoded copy, no invented claims; where a key does not exist yet, add it to your batch's partial locale files with the exact wording from FINAL-content.md, or a clearly marked `TODO-copy` neutral placeholder.
- Light mode only; tokens from `app/styles/tokens.css` (`--ox-*`), never raw hex in components; orange only for interaction; Cairo only; Western numerals; `--ox-line-3` for control borders at rest.
- Motion only through the `--dur-*` and `--ease-*` tokens; compositor-only properties (transform, opacity) except the accordion; colours never transition; nothing animates on wedge elements; respect `prefers-reduced-motion`.
- Product `description` HTML is untrusted: only through the sanitiser and the spec-line parser from B3 (or a stub that renders nothing until B3 lands).
- Money in JSX via `useMoney().format()`; raw numbers plus "SAR" in JSON-LD.
- Every route file you own has the `// @auto-generated` first line removed; custom routes are listed in `app/routes.ts`.
- Accessibility: semantic landmarks, one h1 per page, visible focus (`--ox-focus`), 44px targets on touch, `lang="en"` on Latin-name `bdi`, labels on every control, no keyboard traps; RTL by default with `[dir=ltr]` only where the content is Latin.
- Performance: no layout thrash, reserved heights for every async block (DIRECTION 6 block tables), images with width/height and `loading="lazy"` below the fold, image widths capped at 2x the slot, no new runtime dependencies.
- No em-dashes anywhere. Comments and commit-ready messages in English, UI in Arabic and English locales.

## Working method
- Test first where the plan lists a test file; keep diffs surgical; prefer editing over rewriting.
- Write large files with the Write tool (long shell heredocs have broken the shell in this session); use Bash only for commands and small appends.
- Keep concurrency in mind: if a command fails because another builder's file is mid-edit (typecheck error in a file you do not own), retry once after finishing your own files, then report it instead of fixing their file.
- After every completed step append two lines to `scratchpad/<batch>-progress.md` (what changed, what was verified). If you hit a session limit and are resumed, read that file first and continue.
- Run green before reporting: `pnpm typecheck`, `pnpm test`, `pnpm build` (from the repo root). If build fails only in files another batch owns, say so with the error text.

## Report (final text)
Return the delegation JSON envelope only:
```
{ "batch": "B?", "status": "done | partial", "files_created": [...], "files_modified": [...], "locale_keys_added": <n>, "tests_added": [...], "commands": [{"cmd": "...", "result": "pass | fail", "note": "..."}], "acceptance": [{"criterion": "...", "met": true|false, "evidence": "..."}], "deviations": ["what differs from PLAN-final.md and why"], "requests": ["dependency or owner input needed"], "left_undone": [...] }
```
