import fs from 'fs'
import sizeLimit from "size-limit"
import esbuildPlugin from "@size-limit/esbuild"
import filePlugin from "@size-limit/file"

async function getSize(name, gzip) {
  return (await sizeLimit([esbuildPlugin, filePlugin], {checks: [{ files: [name], gzip }]}))[0].size
}

const sizes = {}

for (const name of ["decimalish", "big.js", "bignumber.js", "decimal.js", "decimal.js-light", "js-big-decimal", "big-integer"]) {
  sizes[name] = {
    minified: await getSize(name, false),
    gzipped: await getSize(name, true)
  }
}

fs.writeFileSync('./dist/sizes.json', JSON.stringify(sizes, null, 2), 'utf8')
