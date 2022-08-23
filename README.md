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

# Why use Decimalish?

"BigDecimal" arbitrary-precision decimal arithmetic libraries are
nothing new. Some programming languages like Java and Python come with
one built-in. There are decades-old standards to consult. In JavaScript
there are many existing decimal libraries, such as the very popular
[Big.js](https://mikemcl.github.io/big.js), as well as a
[proposal](https://github.com/tc39/proposal-decimal) to add a native
BigDecimal type. So why choose Decimalish?

Simply put, Decimalish is easy to use, runs everywhere without
dependencies or polyfills, reduces common mistakes, and feels JavaScript
native, all while keeping a light footprint.

### Lightweight

Decimalish is smaller than any library with comparable features. The
entire library is 5KB minified and 2.3KB gzipped. Even better,
Decimalish supports _tree shaking_ so you only bundle what you
use, as little as 0.45KB.

See how this <a href="#comparison">compares</a> to other libraries.

### Functional API

All methods in Decimalish's API are provided as top level functions,
not prototype methods. This maintains similarity to the built-in
`Math` module, enables tree-shaking, and works well with functional
utility libraries like [ramda](https://ramdajs.com/) or
[lodash](https://lodash.com/).

### Native primitive type

Most BigDecimal libraries introduce a Decimal type as an Object, which
is potentially mutable, not comparable, and often require writing
bulky code with repeated calls to constructors. Decimalish’s `decimal`
type, much like the built in `number`, is an _immutable primitive_
…because it is a string.

A `decimal` can be used as an object key, compared for equality,
safely cached, written to or read from a JSON file, printed to a
console or debugger, or anything else you can do with a string.

### No special values

Unlike other BigDecimal libraries, Decimalish does not support the
"special values" `NaN`, `Infinity`, or `-0`. Forgetting to handle
these special values can be a common source of bugs, so that’s one
less thing to worry about.

Operations that cannot return a finite `decimal` value will throw an
error (such as `"DIV_ZERO"`).

### No implicit rounding

Many BigDecimal libraries automatically round the result of every
operation if too bigger, too smaller, or too high precision based on
some globally defined config. This can be confusing, cumbersome to
configure, and another common source of bugs.

Decimalish almost always returns exact results, only rounding when it
must (such as non-terminating division) and always allowing locally
configured behavior without any global state.

### No trailing zeros

Some BigDecimal libraries attempt to visually preserve precision after
an operation by adding trailing zeros. While this can be useful for
quick number formatting, this conflates mathematical value with
presentation, require multiple kinds of equality (is `1.0` equal to
`1`?), and sometimes operations such as multiple result in surprising
results and thus, you guessed it, another source of bugs.

Decimalish's `decimal()` constructor, and all other math functions
always return canonical normalized decimal values without any leading
or trailing zeros.

### Places or precision

When determining how many digits should be in a rounded value, most
BigDecimal libraries only interpret this as either decimal places or
precision (significant digits). It's not always clear which based on
reading code alone.

Decimalish offers both for all methods that might round with an easy
to read API, alongside a rich set of rounding and division modes.

### Extensible

Decimalish exposes the core functions it uses to convert between
`decimal` string values and an internal normalized form, making it
straightforward to introduce new operations and functionality on an
equal footing to Decimalish’s own API.

# FAQ

TK

### Why doesn't Decimalish support -0?

Negative zero (`-0`) is a corner case of floating point numbers and frequent
source of confusion...

### What's the difference between remainder and modulo?

Decimalish provides the `rem()` function as a `decimal` friendly version of `%`
which uses the same behavior as JavaScript (round down truncation).
While JavaScript officially calls this the "remainder" operator, it's often
referred to as the modulus or modulo operator. However there are many potential
ways to define modulo and standard math definitions and different programming
languages differ in how they choose this definition.

https://en.wikipedia.org/wiki/Modulo_operation#Variants_of_the_definition
