import { Bench } from "tinybench"
import Big from "big.js"
import DecimalJs from "decimal.js"
import { add, decimal, div, mod, mul, pow } from "../decimalish"

type BenchmarkCase = {
  name: string
  prepare: () => Record<string, () => unknown>
}

interface TaskReport {
  name: string
  hz: number
  rme: number
  samples: number
}

interface ScenarioReport {
  name: string
  tasks: TaskReport[]
}

// Config some libraries up front
Big.DP = 40
Big.RM = Big.roundHalfEven

DecimalJs.set({
  precision: 40,
  rounding: DecimalJs.ROUND_HALF_EVEN,
  toExpNeg: -50,
  toExpPos: 50,
})

const cases: BenchmarkCase[] = [
  {
    name: "Construct · 123456789123456789123456789",
    prepare: () => ({
      decimalish: () => decimal("123456789123456789123456789"),
      "Big.js": () => new Big("123456789123456789123456789").toString(),
      "decimal.js": () =>
        new DecimalJs("123456789123456789123456789").toString(),
      native: () => BigInt("123456789123456789123456789").toString(),
    }),
  },
  {
    name: "Construct · -123456789123456789123456789.123456789",
    prepare: () => ({
      decimalish: () => decimal("-123456789123456789123456789.123456789"),
      "Big.js": () =>
        new Big("-123456789123456789123456789.123456789").toString(),
      "decimal.js": () =>
        new DecimalJs("-123456789123456789123456789.123456789").toString(),
      native: () =>
        parseFloat("-123456789123456789123456789.123456789").toString(),
    }),
  },
  {
    name: "Addition · 1.2345 + 6.789",
    prepare: () => ({
      decimalish: () => add("1.2345", "6.789"),
      "Big.js": () => new Big("1.2345").plus("6.789"),
      "decimal.js": () => new DecimalJs("1.2345").add("6.789"),
      native: () => parseFloat("1.2345") + parseFloat("6.789"),
    }),
  },
  {
    name: "Addition · 900719925474099 + 123456789012345",
    prepare: () => ({
      decimalish: () => add("900719925474099", "123456789012345"),
      "Big.js": () => new Big("900719925474099").plus("123456789012345"),
      "decimal.js": () =>
        new DecimalJs("900719925474099").add("123456789012345"),
      native: () => BigInt("900719925474099") + BigInt("123456789012345"),
    }),
  },
  {
    name: "Addition · 1234567890.12345678901234567890 + 0.00000000009876543210987654321",
    prepare: () => ({
      decimalish: () =>
        add(
          "1234567890.12345678901234567890",
          "0.00000000009876543210987654321",
        ),
      "Big.js": () =>
        new Big("1234567890.12345678901234567890").plus(
          "0.00000000009876543210987654321",
        ),
      "decimal.js": () =>
        new DecimalJs("1234567890.12345678901234567890").add(
          "0.00000000009876543210987654321",
        ),
      native: () =>
        parseFloat("1234567890.12345678901234567890") +
        parseFloat("0.00000000009876543210987654321"),
    }),
  },
  {
    name: "Multiplication · 12.345 × 0.6789",
    prepare: () => ({
      decimalish: () => mul("12.345", "0.6789"),
      "Big.js": () => new Big("12.345").times("0.6789"),
      "decimal.js": () => new DecimalJs("12.345").mul("0.6789"),
      native: () => parseFloat("12.345") * parseFloat("0.6789"),
    }),
  },
  {
    name: "Multiplication · 987654321.1234567890123456789 × 123456789.9876543210987654321",
    prepare: () => ({
      decimalish: () =>
        mul("987654321.1234567890123456789", "123456789.9876543210987654321"),
      "Big.js": () =>
        new Big("987654321.1234567890123456789").times(
          "123456789.9876543210987654321",
        ),
      "decimal.js": () =>
        new DecimalJs("987654321.1234567890123456789").mul(
          "123456789.9876543210987654321",
        ),
      native: () =>
        parseFloat("987654321.1234567890123456789") *
        parseFloat("123456789.9876543210987654321"),
    }),
  },
  {
    name: "Multiplication · 999999999999999999999999 × 888888888888888888888888",
    prepare: () => ({
      decimalish: () =>
        mul("999999999999999999999999", "888888888888888888888888"),
      "Big.js": () =>
        new Big("999999999999999999999999").times("888888888888888888888888"),
      "decimal.js": () =>
        new DecimalJs("999999999999999999999999").mul(
          "888888888888888888888888",
        ),
      native: () =>
        BigInt("999999999999999999999999") * BigInt("888888888888888888888888"),
    }),
  },
  {
    name: "Division · 987654321.012345 ÷ 0.25",
    prepare: () => ({
      decimalish: () => div("987654321.012345", "0.25"),
      "Big.js": () => new Big("987654321.012345").div("0.25"),
      "decimal.js": () => new DecimalJs("987654321.012345").div("0.25"),
      native: () => parseFloat("987654321.012345") / parseFloat("0.25"),
    }),
  },
  {
    name: "Division · 12345678901234567890 ÷ 0.00001",
    prepare: () => ({
      decimalish: () => div("12345678901234567890", "0.00001"),
      "Big.js": () => new Big("12345678901234567890").div("0.00001"),
      "decimal.js": () => new DecimalJs("12345678901234567890").div("0.00001"),
      native: () => parseFloat("12345678901234567890") / parseFloat("0.00001"),
    }),
  },
  {
    name: "Division · 10 ÷ 3 (precision 34, half even)",
    prepare: () => ({
      decimalish: () => div("10", "3", { precision: 34, mode: "half even" }),
      "Big.js": () => new Big("10").div("3"),
      "decimal.js": () => new DecimalJs("10").div("3"),
      native: () => parseFloat("10") / parseFloat("3"),
    }),
  },
  {
    name: "Modulo · 12345.678 % 0.901",
    prepare: () => ({
      decimalish: () => mod("12345.678", "0.901"),
      "Big.js": () => new Big("12345.678").mod("0.901"),
      "decimal.js": () => new DecimalJs("12345.678").mod("0.901"),
      native: () => {
        const dividend = parseFloat("12345.678")
        const divisor = parseFloat("0.901")
        const result = dividend % divisor
        return result < 0 && divisor > 0 ? result + divisor : result
      },
    }),
  },
  {
    name: "Modulo · 999999999999999999 % 123456789",
    prepare: () => ({
      decimalish: () => mod("999999999999999999", "123456789"),
      "Big.js": () => new Big("999999999999999999").mod("123456789"),
      "decimal.js": () => new DecimalJs("999999999999999999").mod("123456789"),
      native: () => BigInt("999999999999999999") % BigInt("123456789"),
    }),
  },
  {
    name: "Modulo · -123456789 % 97",
    prepare: () => ({
      decimalish: () => mod("-123456789", "97"),
      "Big.js": () => new Big("-123456789").mod("97"),
      "decimal.js": () => new DecimalJs("-123456789").mod("97"),
      native: () => {
        const dividend = BigInt("-123456789")
        const divisor = BigInt("97")
        const result = dividend % divisor
        return result < 0n && divisor > 0n ? result + divisor : result
      },
    }),
  },
  {
    name: "Power · 1.2345 ^ 6",
    prepare: () => ({
      decimalish: () => pow("1.2345", 6),
      "Big.js": () => new Big("1.2345").pow(6),
      "decimal.js": () => new DecimalJs("1.2345").pow(6),
      native: () => Math.pow(parseFloat("1.2345"), 6),
    }),
  },
  {
    name: "Power · 0.999999 ^ 20",
    prepare: () => ({
      decimalish: () => pow("0.999999", 20),
      "Big.js": () => new Big("0.999999").pow(20),
      "decimal.js": () => new DecimalJs("0.999999").pow(20),
      native: () => Math.pow(parseFloat("0.999999"), 20),
    }),
  },
  {
    name: "Power · 987654321 ^ 5",
    prepare: () => ({
      decimalish: () => pow("987654321", 5),
      "Big.js": () => new Big("987654321").pow(5),
      "decimal.js": () => new DecimalJs("987654321").pow(5),
      native: () => BigInt("987654321") ** 5n,
    }),
  },
]

const benchSettings = {
  time: 200,
  warmupIterations: 5,
  iterations: 0,
}

function formatHz(hz: number): string {
  if (hz > 1e6) {
    return `${(hz / 1e6).toFixed(2)}M ops/sec`
  }
  if (hz > 1e3) {
    return `${(hz / 1e3).toFixed(2)}K ops/sec`
  }
  return `${hz.toFixed(2)} ops/sec`
}

function collectReports(bench: Bench): TaskReport[] {
  return bench.tasks
    .map(task => {
      const result = task.result
      const samples =
        result == null
          ? 0
          : Array.isArray(result.samples)
            ? result.samples.length
            : (result.samples ?? 0)
      return {
        name: task.name,
        hz: result?.hz ?? 0,
        rme: result?.rme ?? 0,
        samples,
      }
    })
    .sort((a, b) => b.hz - a.hz)
}

function printReports(reports: ScenarioReport[]): void {
  console.log("\nBenchmark results")
  for (const report of reports) {
    console.log(`\n${report.name}`)
    const fastest = report.tasks[0]?.hz ?? 0
    for (const task of report.tasks) {
      const relative = fastest ? task.hz / fastest : 0
      const label =
        task === report.tasks[0] ? "fastest" : `${(relative * 100).toFixed(1)}%`
      console.log(
        `  ${task.name.padEnd(16)} ${formatHz(task.hz).padEnd(16)} ±${task.rme.toFixed(2)}% (${task.samples} samples) ${label}`,
      )
    }
  }
}

async function runCase(testCase: BenchmarkCase): Promise<ScenarioReport> {
  const bench = new Bench(benchSettings)
  const tasks = testCase.prepare()

  for (const [name, task] of Object.entries(tasks)) {
    bench.add(name, task)
  }

  await bench.run()

  return {
    name: testCase.name,
    tasks: collectReports(bench),
  }
}

async function run(): Promise<void> {
  const reports: ScenarioReport[] = []
  for (const testCase of cases) {
    reports.push(await runCase(testCase))
  }
  printReports(reports)
}

run().catch(error => {
  console.error(error)
  process.exitCode = 1
})
