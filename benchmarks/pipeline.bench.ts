import { strict as assert } from "assert"
import { Bench } from "tinybench"
import { cpus } from "os"
import {
  add,
  cmp,
  construct,
  decimal,
  deconstruct,
  isDecimal,
  mul,
  round,
  toExponential,
  toFixed,
  NumericString,
} from "../decimalish"

// Fixture construction and result checks happen outside measured batches.
const corpus: NumericString[] = Array.from(
  { length: 128 },
  (_, i) => `${i + 1}.23456789` as NumericString,
)
const long = ("1" + "23456789".repeat(128)) as NumericString
const prefixA = ("1." + "2".repeat(1000) + "3") as NumericString
const prefixB = ("1." + "2".repeat(1000) + "4") as NumericString
const batchSize = 64
let sink: unknown
let cursor = 0
const next = () => corpus[cursor++ & 127]
const observe = (value: string) =>
  value.length + value.charCodeAt(value.length >> 1)
const tasks: Record<string, () => unknown> = {
  "deconstruct / short": () => deconstruct(next()),
  "deconstruct / 1K digits": () => deconstruct(long),
  "decimal / canonical": () => decimal(next()),
  "decimal / normalization": () => decimal("+000123.4500e-3"),
  "decimal / padding": () => decimal("1e1000"),
  "decimal / padding consumed": () => observe(decimal("1e1000")),
  "construct / decimal": () => construct(1, "123456789", 2),
  "construct / padding consumed": () => observe(construct(1, "123", 1000)),
  "add / short": () => add(next(), "6.789"),
  "add / carry": () => add("999.99", "0.01"),
  "add / cancellation": () => add(long, ("-" + long) as NumericString),
  "add / aligned span": () => add("1e100", "1e-100"),
  "mul / short": () => mul("12.345", "0.6789"),
  "mul / balanced": () =>
    mul("1234567890123456789012345678", "9876543210987654321098765432"),
  "mul / asymmetric": () => mul(long, "7"),
  "cmp / long prefix": () => cmp(prefixA, prefixB),
  "isDecimal / canonical": () => isDecimal(next()),
  "isDecimal / exponent": () => isDecimal("1e100"),
  "round / no change": () => round(next(), { places: 12 }),
  "round / truncation": () => round(next(), { places: 2 }),
  "round / increment": () => round("123.4567", { places: 2 }),
  "round / carry": () => round("999.995", { places: 2 }),
  "toFixed / numeric options": () => toFixed(next(), { places: 2 }),
  "toFixed / string options": () => toFixed(next(), { places: "2" }),
  "toFixed / padding consumed": () =>
    observe(toFixed("1.23", { places: 1000 })),
  "toExponential / rounding": () => toExponential(next(), { places: 2 }),
}

async function run() {
  assert.equal(tasks["round / increment"](), "123.46")
  assert.equal(tasks["round / carry"](), "1000")
  const time = Number(process.env.BENCH_TIME_MS || 200)
  if (!(time > 0 && Number.isFinite(time)))
    throw new Error("BENCH_TIME_MS must be positive and finite")
  const bench = new Bench({ time, warmupTime: Math.min(time, 100) })
  for (const [name, fn] of Object.entries(tasks)) {
    fn()
    bench.add(name, () => {
      for (let i = 0; i < batchSize; i++) sink = fn()
    })
  }
  await bench.warmup()
  await bench.run()
  const report = {
    runtime: {
      node: process.version,
      v8: process.versions.v8,
      platform: process.platform,
      arch: process.arch,
      cpu: cpus()[0].model,
    },
    batchSize,
    // Consume the retained result without introducing per-operation string reads.
    retainedResultType: typeof sink,
    tasks: bench.tasks.map(task => {
      if (task.result?.error) throw task.result.error
      return {
        name: task.name,
        nsPerOperation: (task.result!.mean * 1e6) / batchSize,
        relativeMarginOfError: task.result!.rme,
      }
    }),
  }
  console.log(JSON.stringify(report, null, 2))
}
run().catch(error => {
  console.error(error)
  process.exitCode = 1
})
