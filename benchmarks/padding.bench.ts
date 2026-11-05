import { strict as assert } from "assert"
import { cpus } from "os"
import { Bench } from "tinybench"
import * as sourceApi from "../decimalish"

// Run after npm run build; PADDING_BUILD=cjs selects the shipped ES3 bundle.
const api: typeof sourceApi =
  process.env.PADDING_BUILD === "cjs"
    ? require("../dist/decimalish.js")
    : sourceApi
const values = Array.from({ length: 128 }, (_, i) => String((100 + i) * 10 + 1))
const signs = values.map((_, i) => (i & 1 ? -1 : 1) as 1 | -1)
const fractions = values.map(
  (value, i) =>
    ((signs[i] < 0 ? "-" : "") + value + ".4") as sourceApi.NumericString,
)
const tasks: Record<string, (i: number) => string> = {}
for (const count of [0, 1, 2, 3, 4, 5, 6, 16, 128, 1000]) {
  const trailing = `construct / trailing ${count}`
  const leading = `construct / leading ${count}`
  tasks[trailing] = i =>
    api.construct(signs[i], values[i], values[i].length + count - 1)
  tasks[leading] = i => api.construct(signs[i], values[i], -count - 1)
  for (const i of [0, 1, 63, 127]) {
    const sign = signs[i] < 0 ? "-" : ""
    assert.equal(tasks[trailing](i), sign + values[i] + "0".repeat(count))
    assert.equal(tasks[leading](i), sign + "0." + "0".repeat(count) + values[i])
  }
}
for (const places of [0, 1, 2, 6, 16]) {
  const name = `toFixed / integer, ${places} places`
  tasks[name] = i =>
    api.toFixed(values[i] as sourceApi.NumericString, { places })
  assert.equal(
    tasks[name](0),
    values[0] + (places ? "." + "0".repeat(places) : ""),
  )
}
tasks["toFixed / fractional currency"] = i =>
  api.toFixed(fractions[i], { places: 2 })
tasks["toFixed / zero currency"] = () => api.toFixed("0", { places: 2 })
tasks["toFixed / zero, 3 places"] = () => api.toFixed("0", { places: 3 })
assert.equal(tasks["toFixed / fractional currency"](0), values[0] + ".40")
assert.equal(tasks["toFixed / zero currency"](0), "0.00")
assert.equal(tasks["toFixed / zero, 3 places"](0), "0.000")

let sink = 0
let cursor = 0
const batchSize = 64
async function run() {
  const time = Number(process.env.BENCH_TIME_MS || 100)
  if (!(time > 0 && Number.isFinite(time)))
    throw new Error("Invalid BENCH_TIME_MS")
  const bench = new Bench({ time, warmupTime: Math.min(time, 100) })
  for (const [name, fn] of Object.entries(tasks)) {
    bench.add(name, () => {
      for (let i = 0; i < batchSize; i++) {
        const value = fn(cursor++ & 127)
        // Read the produced string so both implementations pay for flattening.
        sink = (sink + value.length + value.charCodeAt(value.length >> 1)) | 0
      }
    })
  }
  await bench.warmup()
  await bench.run()
  console.log(
    JSON.stringify(
      {
        build:
          process.env.PADDING_BUILD === "cjs"
            ? "CommonJS ES3"
            : "TypeScript source",
        runtime: {
          node: process.version,
          v8: process.versions.v8,
          platform: process.platform,
          arch: process.arch,
          cpu: cpus()[0].model,
        },
        batchSize,
        sink,
        tasks: bench.tasks.map(task => {
          if (task.result?.error) throw task.result.error
          return {
            name: task.name,
            nsPerOperation: (task.result!.mean * 1e6) / batchSize,
            relativeMarginOfError: task.result!.rme,
          }
        }),
      },
      null,
      2,
    ),
  )
}
run().catch(error => {
  console.error(error)
  process.exitCode = 1
})
