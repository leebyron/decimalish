# Decimalish

is an arbitrary-precision decimal _(aka “BigNumber”)_ library for JavaScript and
TypeScript. How is this different from regular numbers and why would
you need such a thing? Consider this surprising fact about regular
numbers:

```js
0.1 + 0.2 != 0.3
0.1 + 0.2 == 0.30000000000000004
```

This isn't yet another JavaScript quirk, but an unfortunate
pitfall of nearly all numbers represented by computers.

While we read numbers in decimal, computers read binary and must
convert. Information can be lost when converting a fixed number of
bits and yield confusing results. In finance or engineering these
errors are simply unacceptable.

Decimalish addresses exactly this concern. It removes the need to
convert by directly representing numbers in decimal.

It's also unconstrained by size so it can represent exact numbers with
arbitrarily high precision (significant digits or decimal places).

**So what’s the catch?** Well speed for one, computers
are specifically designed to make working with floating point numbers
fast. While nowhere close to native speed, Decimalish is unlikely to
be your program’s bottleneck.

Then there's how you use them. While regular numbers can use the
familiar operators (`+`, `*`, `==`), Decimalish cannot and offers equivalent functions in their place (`add()`, `mul()`, `eq()`).

Finally there's how they’re represented. Like regular numbers,
Decimalish offers an _immutable primitive_. However …it’s a
string… hence the **–ish**. Decimalish decimals are
a specific format of [numeric string](#NumericString).
While this has its advantages, ideally decimal could be its own
primitive; but that’s just not JavaScript.

# Get started

Decimalish can be used anywhere you use JavaScript. It supports decades-old browsers, modern module-aware Node.js, and web compilers like Webpack. It comes with TypeScript definitions in the box.

For most, install decimalish via npm:

```shell
npm install decimalish
```

Otherwise, find a UMD module on your CDN of choice:

```html
<script src="https://unpkg.com/decimalish"></script>
```
