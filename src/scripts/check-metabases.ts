import { promises as fs } from 'node:fs'
import path from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const metabasesDir = path.resolve(__dirname, '../metabases')
const rootIndexPath = path.join(metabasesDir, 'index.ts')

async function readText(p: string) {
  return await fs.readFile(p, 'utf-8')
}

async function getAllNames() {
  const content = await readText(rootIndexPath)
  const m = content.match(/export const all[\s\S]*?=\s*\{([\s\S]*?)\}/)
  if (!m)
    throw new Error('无法在 metabases/index.ts 中找到 all 映射')
  const body = m[1]
  const names = [...body.matchAll(/\b(MetabaseFor\w+)\b/g)].map(i => i[1])
  return Array.from(new Set(names))
}

async function getDimensionInfo() {
  const dirents = await fs.readdir(metabasesDir, { withFileTypes: true })
  const results: { name: string, hasRequired: boolean, path: string, requiredItems: string[] | null }[] = []
  for (const d of dirents) {
    if (!d.isDirectory())
      continue
    const indexPath = path.join(metabasesDir, d.name, 'index.ts')
    try {
      const content = await readText(indexPath)
      const nameMatch = content.match(/export const\s+(\w+)\s*:\s*JSONSchema/)
      if (!nameMatch)
        continue
      const name = nameMatch[1]
      const reqMatch = content.match(/(?:^|[\s,])required\s*:\s*\[([\s\S]*?)\]/m)
      const hasRequired = !!reqMatch
      const requiredItems = reqMatch
        ? [...reqMatch[1].matchAll(/['"]([^'"]+)['"]/g)].map(i => i[1])
        : null
      results.push({ name, hasRequired, path: indexPath, requiredItems })
    }
    catch {
      // 忽略没有 index.ts 的目录
    }
  }
  return results
}

async function main() {
  const allNames = await getAllNames()
  const dims = await getDimensionInfo()
  const dirNames = dims.map(d => d.name)
  const missingInAll = dirNames.filter(n => !allNames.includes(n)).sort()
  const extraInAll = allNames.filter(n => !dirNames.includes(n)).sort()
  const noRequired = dims.filter(d => !d.hasRequired).map(d => d.name).sort()

  const idNumberSecondLevelViolations = dims
    .filter(d => d.name.startsWith('MetabaseForIdNumberAnd'))
    .filter(d => !d.requiredItems || d.requiredItems[0] === 'idNumber')
    .map(d => d.name)
    .sort()

  const lines = [
    `总维度数: ${dirNames.length}`,
    `all 中维度数: ${allNames.length}`,
    `all 缺少的维度: ${missingInAll.length ? missingInAll.join(', ') : '(无)'}`,
    `all 多余的维度: ${extraInAll.length ? extraInAll.join(', ') : '(无)'}`,
    `缺少 required 的维度: ${noRequired.length ? noRequired.join(', ') : '(无)'}`,
    `二级维度 required 以 idNumber 开头: ${idNumberSecondLevelViolations.length ? idNumberSecondLevelViolations.join(', ') : '(无)'}`,
  ]

  console.log(lines.join('\n'))
}

main().catch((e) => {
  console.error(e)
  process.exitCode = 1
})
