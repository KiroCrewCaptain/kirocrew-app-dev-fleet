/**
 * Dev Fleet's UI imports only its own modules and the modules the host provides.
 *
 * The built-in's version of this test pinned that the core SPA reached the page
 * only through the built-in registry. Here the page is a bundle: every import in
 * `src/` must be relative (inside `src/`) or one of the seven modules the
 * dashboard's import map serves, so nothing of the host's own source is reached.
 */
import { readFileSync, readdirSync, statSync } from 'node:fs'
import { dirname, isAbsolute, join, relative, resolve } from 'node:path'

import { describe, expect, it } from 'vitest'
import { HOST_MODULES } from '../vite.config'

const SRC = resolve(__dirname, '..', 'src')
const SPEC_RE = /(?:from\s+|import\s*\(?\s*)['"]([^'"]+)['"]/g

function walk(dir: string, out: string[] = []): string[] {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name)
    if (statSync(p).isDirectory()) walk(p, out)
    else if (/\.(ts|tsx)$/.test(name) && !name.endsWith('.d.ts')) out.push(p)
  }
  return out
}

describe('Dev Fleet UI boundary', () => {
  it('imports only its own modules and the host-provided ones', () => {
    const bad: string[] = []
    for (const file of walk(SRC)) {
      for (const [, spec] of readFileSync(file, 'utf8').matchAll(SPEC_RE)) {
        if (spec.startsWith('.')) {
          const rel = relative(SRC, resolve(dirname(file), spec))
          if (rel.startsWith('..') || isAbsolute(rel)) {
            // The catalogs one level up are the app's own, bundled at build time.
            if (!/^\.\.\/i18n\/[\w-]+\.json$/.test(relative(SRC, resolve(dirname(file), spec)).split('\\').join('/'))) {
              bad.push(`${relative(SRC, file)}: ${spec}`)
            }
          }
        } else if (!HOST_MODULES.includes(spec)) {
          bad.push(`${relative(SRC, file)}: ${spec}`)
        }
      }
    }
    expect(bad).toEqual([])
  })
})
