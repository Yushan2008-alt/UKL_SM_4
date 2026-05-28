const fs = require('fs')
const path = require('path')

const sourcePath = path.join(__dirname, '..', 'src', '@generated', 'prisma', 'client.ts')
const distPath = path.join(__dirname, '..', 'dist', 'src', '@generated', 'prisma', 'client.js')

const oldLine = `globalThis['__dirname'] = path.dirname(fileURLToPath(import.meta.url))`
const newLine = `globalThis['__dirname'] = process.cwd()`

function patchFile(filePath) {
  if (!fs.existsSync(filePath)) {
    console.log(`skipped (not found): ${filePath}`)
    return
  }
  let content = fs.readFileSync(filePath, 'utf8')
  if (content.includes(newLine)) {
    console.log(`already patched: ${filePath}`)
    return
  }
  if (!content.includes(oldLine)) {
    console.log(`no patch needed: ${filePath}`)
    return
  }
  content = content.replace(oldLine, newLine)
  fs.writeFileSync(filePath, content, 'utf8')
  console.log(`patched: ${filePath}`)
}

patchFile(sourcePath)
patchFile(distPath)
