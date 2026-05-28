import { readFileSync, writeFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const clientPath = join(__dirname, '..', 'src', '@generated', 'prisma', 'client.ts')

let content = readFileSync(clientPath, 'utf-8')
content = content.replace(
  "globalThis['__dirname'] = path.dirname(fileURLToPath(import.meta.url))",
  "globalThis['__dirname'] = typeof __dirname !== 'undefined' ? __dirname : path.dirname(fileURLToPath(import.meta.url))"
)
writeFileSync(clientPath, content, 'utf-8')
console.log('Fixed Prisma client.ts for CJS compatibility')
