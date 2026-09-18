import { readFileSync, readdirSync } from 'node:fs'
import { extname, join, relative } from 'node:path'
import { describe, expect, it } from 'vitest'

const sourceRoot = join(process.cwd(), 'src')
const testDirectories = new Set(['__tests__', 'test', 'tests'])
const zipConstants = /\b(?:export\s+)?const\s+(?:TICKETS|ADVISORS|FAQS|CATEGORIES)\s*(?::[^=\r\n]+)?=\s*\[/
const syntheticRecords = /(?:ticket|user|faq|category)-00\d\b|\bGNB-\d{5}\b|\b(?:asesor|supervisor|cliente)@(?:gnb|banco)/i

function hasZipFixtureIdentifiers(source: string): boolean {
  return zipConstants.test(source) || syntheticRecords.test(source)
}

function productionSourceFiles(directory = sourceRoot): string[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name)
    if (entry.isDirectory()) return testDirectories.has(entry.name) ? [] : productionSourceFiles(path)
    if (!['.ts', '.tsx'].includes(extname(entry.name)) || /\.(?:test|spec|stories)\./.test(entry.name)) return []
    return [path]
  })
}

function productionSources(): Array<{ path: string; source: string }> {
  return productionSourceFiles().map((path) => ({
    path: relative(sourceRoot, path).replaceAll('\\', '/'),
    source: readFileSync(path, 'utf8'),
  }))
}

describe('invariantes del runtime', () => {
  it('no incorpora el copy prohibido del paquete visual', () => {
    const prohibitedCopy = /\b(prototipo|acad[eé]mic[oa]|demo(?:straci[oó]n|strativo)?|simulad[oa]s?|datos ficticios|uso educativo|no oficial)\b/i
    const violations = productionSources()
      .filter(({ source }) => prohibitedCopy.test(source))
      .map(({ path }) => path)

    expect(violations).toEqual([])
  })

  it('no contiene credenciales o identificadores ficticios del paquete visual', () => {
    const violations = productionSources()
      .filter(({ source }) => hasZipFixtureIdentifiers(source))
      .map(({ path }) => path)

    expect(violations).toEqual([])
  })

  it('reconoce declaraciones de fixtures tipadas e identificadores GNB del paquete visual', () => {
    expect(hasZipFixtureIdentifiers('export const TICKETS: Ticket[] = [record]')).toBe(true)
    expect(hasZipFixtureIdentifiers("const code = 'GNB-24815'")).toBe(true)
    expect(hasZipFixtureIdentifiers('const tickets: Ticket[] = response.items')).toBe(false)
  })

  it('mantiene tokens fuera de localStorage y rechaza primitivas DOM inseguras', () => {
    const unsafeRuntime = /localStorage\.(?:setItem|getItem|removeItem)\([^\n)]*token|dangerouslySetInnerHTML|\.innerHTML\s*=|\.outerHTML\s*=|insertAdjacentHTML|document\.write|\beval\s*\(|new\s+Function\b|javascript\s*:/i
    const violations = productionSources()
      .filter(({ source }) => unsafeRuntime.test(source))
      .map(({ path }) => path)

    expect(violations).toEqual([])
  })
})
