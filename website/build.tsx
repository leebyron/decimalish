/**
 * TODO:
 *
 * disable splitflap when not visible
 * share opengraph
 *
 * Docs:
 *
 * Getting started section
 * Compare to other libraries section
 * Give examples of rounding modes? Perhaps via a details/summary exposure
 * FAQ: using alongside Big.js
 *
 *
 */

import * as path from "path"
import * as fs from "fs"
import * as ts from "typescript"
import * as jsx from "hyperjsx"
import { compiler } from "markdown-to-jsx"
import * as shiki from "shiki"

const ROOT_DIR = __dirname + "/"
const OTHER_CATEGORY = "Et cetera"

// Everything private or otherwise missing from typescript's typedefs.
declare module "typescript" {
  export interface TypeElement {
    type: TypeNode
  }
  export interface Declaration {
    jsDoc?: ts.JSDoc[]
    name?: ts.Identifier
  }
  export function findPrecedingToken(
    position: number,
    sourceFile: ts.SourceFile
  ): ts.Token<ts.SyntaxKind>
  export function parseIsolatedJSDocComment(
    content: string,
    start: number,
    length: number
  ): { jsDoc: ts.JSDoc } | undefined
}

type Typedefs = { ids: TypedefsById; categories: TypedefsByCategory }

type TypedefsById = { [id: string]: Typedef | undefined }

type TypedefsByCategory = { [category: string]: Typedef[] }

type Typedef = {
  id: string
  name: string
  kind: string
  node: ts.Node
}

type JSDoc = {
  title?: string
  comment: string
  tags: { [name: string]: string | undefined }
}

function getTypedefByCategory(): Typedefs {
  const file = path.resolve(ROOT_DIR, "../decimalish.ts")
  const sourceFile = ts.createSourceFile(
    file,
    fs.readFileSync(file, "utf8"),
    ts.ScriptTarget.ES2015,
    /* parentReferences */ true
  )

  const ids: TypedefsById = {}
  const categories: TypedefsByCategory = {}

  for (const node of sourceFile.statements) {
    if (isExportedDeclaration(node)) {
      const name = node.name!.text
      const kind = ts.isFunctionDeclaration(node) ? "function" : "type"
      const id = name + (kind === "function" ? "()" : "")
      const category = getJSDoc(node)?.tags.category || OTHER_CATEGORY
      if (!ids[id]) {
        ;(categories[category] || (categories[category] = [])).push(
          (ids[id] = { id, name, kind, node })
        )

        // Interface field ids
        if (ts.isInterfaceDeclaration(node)) {
          for (const member of node.members) {
            const memberName = member.name!.getText()
            const id = `${name}.${memberName}`
            ids[id] = { id, name: memberName, kind: "label", node: member }
          }
        }

        // String union enum ids
        if (
          ts.isTypeAliasDeclaration(node) &&
          ts.isUnionTypeNode(node.type) &&
          node.type.types.every(
            type =>
              ts.isLiteralTypeNode(type) && ts.isStringLiteral(type.literal)
          )
        ) {
          for (const member of node.type.types) {
            const id = member.getText().slice(1, -1)
            ids[id] = { id, name: id, kind: "string", node: member }
          }
        }
      }
    }
  }

  return { ids, categories }
}

function isExportedDeclaration(node: ts.Node): node is ts.Declaration {
  return !!(
    ts.getCombinedModifierFlags(node as ts.Declaration) &
    ts.ModifierFlags.Export
  )
}

function last<T>(arr: T[] | undefined): T | undefined {
  return arr?.[arr?.length - 1]
}

const jsDocCache = new WeakMap<ts.Node, JSDoc | undefined>()

function getJSDoc(node: ts.Node): JSDoc | undefined {
  const source = node.getSourceFile()
  if (jsDocCache.has(node)) return jsDocCache.get(node)
  let rawJsDoc: ts.JSDoc | undefined = last((node as any).jsDoc)
  if (!rawJsDoc) {
    const comment = last(
      ts.getLeadingCommentRanges(source.text, node.pos) ||
        ts.getLeadingCommentRanges(
          source.text,
          ts.findPrecedingToken(node.pos, source).pos
        )
    )
    if (comment) {
      rawJsDoc = ts.parseIsolatedJSDocComment(
        source.text,
        comment.pos,
        comment.end - comment.pos
      )?.jsDoc
    }
  }
  let jsDoc
  if (rawJsDoc) {
    let title
    let comment = ts.getTextOfJSDocComment(rawJsDoc.comment) || ""
    const titleMatch = /^(?:([^\n]+)(?:\n*$|\n{2,}))?/.exec(comment)
    if (titleMatch) {
      title = titleMatch[1]
      comment = comment.slice(titleMatch[0].length)
    }
    const tags = Object.fromEntries(
      rawJsDoc.tags?.map(tag => [
        tag.tagName.getText(source),
        ts.getTextOfJSDocComment(tag.comment),
      ]) || []
    )
    jsDoc = { title, comment, tags }
  }
  jsDocCache.set(node, jsDoc)
  return jsDoc
}

const TypedefsContext = jsx.createContext<Typedefs | null>(null)

function useTypedefs(): Typedefs {
  return jsx.useContext(TypedefsContext)!
}

const HighlighterContext = jsx.createContext<shiki.Highlighter | null>(null)

function useHighlighter(): shiki.Highlighter {
  return jsx.useContext(HighlighterContext)!
}

const Index = () => (
  <html lang="en">
    <head>
      <title>
        Decimalish — arbitrary-precision decimal primitives for JavaScript.
      </title>
      <meta charset="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <meta name="theme-color" content="#56585b" />
      <link rel="icon" href="favicon.png" type="image/png" />
      <link rel="icon" href="favicon.svg" type="image/svg+xml" />
      <link rel="manifest" href="manifest.json" />
      <style innerHTML={fs.readFileSync(ROOT_DIR + "style.css", "utf8")} />
      <script
        innerHTML={fs.readFileSync(
          path.resolve(ROOT_DIR, "../dist/decimalish.min.js"),
          "utf8"
        )}
      />
    </head>
    <body>
      <ThemeToggle />
      <Header />
      <IntroSection />
      <GetStarted />
      <WhySection />
      <APISection />
      <FAQSection />
      <Footer />
    </body>
  </html>
)

const ThemeToggle = () => (
  <div class="theme-toggle">
    <svg
      viewBox="0 0 23 23"
      class="dark-toggle"
      onclick="document.body.className='light'"
    >
      <path
        fill-rule="evenodd"
        clip-rule="evenodd"
        d="M4.69421 14.6557C4.85337 14.9984 5.03766 15.327 5.24469 15.6392C6.5876 17.6646 8.88783 19 11.5 19C15.6421 19 19 15.6421 19 11.5C19 7.93459 16.5121 4.95028 13.1777 4.18832C12.825 4.10773 12.4628 4.052 12.0931 4.02307C12.1978 4.35361 12.2767 4.69787 12.3294 5.05229C12.5843 6.76486 12.2269 8.71464 11.1961 10.5C9.89591 12.752 7.83332 14.207 5.76797 14.5681C5.4088 14.6309 5.04955 14.6606 4.69421 14.6557Z"
      />
    </svg>
    <svg
      viewBox="0 0 23 23"
      class="light-toggle"
      onclick="document.body.className='dark'"
    >
      <path
        fill-rule="evenodd"
        clip-rule="evenodd"
        d="M3.01472 19.2782L3.72183 19.9853L5.13604 18.5711L4.42893 17.864L3.01472 19.2782Z M18.5711 17.864L17.864 18.5711L19.2782 19.9853L19.9853 19.2782L18.5711 17.864Z M3.01472 3.72182L4.42893 5.13604L5.13604 4.42893L3.72183 3.01472L3.01472 3.72182Z M17.864 4.42893L18.5711 5.13604L19.9853 3.72182L19.2782 3.01472L17.864 4.42893Z M0 12H2V11H0V12Z M12 2V0H11V2H12Z M12 23V21H11V23H12Z M21 12H23V11H21V12Z M11.5 19C15.6421 19 19 15.6421 19 11.5C19 7.35786 15.6421 4 11.5 4C7.35786 4 4 7.35786 4 11.5C4 15.6421 7.35786 19 11.5 19Z"
      />
    </svg>
  </div>
)

const Header = () => (
  <header>
    <nav>
      <a href="#intro" class="skip-nav">
        Skip nav
      </a>
      <a href="#getstarted">Get started</a>
      <a href="#api">API</a>
      <a href="#faq">FAQ</a>
      <a href="https://github.com/leebyron/decimalish" target="_blank">
        Github
      </a>
    </nav>
    <SplitFlap />
  </header>
)

const Footer = () => (
  <footer>
    <div>
      Made with &#9829; in San Francisco by{" "}
      <a href="https://twitter.com/leeb" target="_blank">
        @leeb
      </a>
    </div>
  </footer>
)

const SplitFlap = () => (
  <div id="split-flap">
    <style innerHTML={fs.readFileSync(ROOT_DIR + "split-flap.css", "utf8")} />
    <svg outerHTML={fs.readFileSync(ROOT_DIR + "split-flap.svg", "utf8")} />
    <script innerHTML={fs.readFileSync(ROOT_DIR + "split-flap.js", "utf8")} />
  </div>
)

const IntroSection = () => (
  <section id="intro">
    <div>
      <h3>
        <a href="#intro">Decimalish</a>
      </h3>
      <div class="two-col">
        <p>
          &nbsp;is an arbitrary-precision decimal{" "}
          <em>(aka &ldquo;BigNumber&rdquo;)</em> library for JavaScript and
          TypeScript. How is this different from regular numbers and why would
          you need such a thing? Consider this surprising fact about regular
          numbers:
        </p>
        <pre>
          <Code>
            {"0.1 + 0.2 != 0.3\n" + "0.1 + 0.2 == 0.30000000000000004"}
          </Code>
        </pre>
        <p>
          This isn&apos;t yet another JavaScript quirk, but an unfortunate
          pitfall of nearly all numbers represented by computers.
        </p>
        <p>
          While we read numbers in decimal, computers read binary and must
          convert. Information can be lost when converting a fixed number of
          bits and yield confusing results. In finance or engineering these
          errors are simply unacceptable.
        </p>
        <p>
          Decimalish addresses exactly this concern. It removes the need to
          convert by directly representing numbers in decimal.
        </p>
        <p>
          It's also unconstrained by size so it can represent exact numbers with
          arbitrarily high precision (significant digits or decimal places).
        </p>
        <p>
          <strong>So what’s the catch?</strong> Well speed for one, computers
          are specifically designed to make working with floating point numbers
          fast. While nowhere close to native speed, Decimalish is unlikely to
          be your program’s bottleneck.
        </p>
        <p>
          Then there's how you use them. While regular numbers can use the
          familiar operators (<Code>+</Code>, <Code>*</Code>,{" "}
          <Code>{"=="}</Code>
          ), Decimalish cannot and offers equivalent functions in their place (
          <Code>add()</Code>, <Code>mul()</Code>, <Code>eq()</Code>).
        </p>
        <p>
          Finally there's how they’re represented. Like regular numbers,
          Decimalish offers an <em>immutable primitive</em>. However …it’s a
          string… hence the <strong>&ndash;ish</strong>. Decimalish decimals are
          a specific format of <a href="#NumericString">numeric string</a>.
          While this has its advantages, ideally decimal could be its own
          primitive; but that’s just not JavaScript.
        </p>
      </div>
    </div>
  </section>
)

const GetStarted = () => (
  <section id="get-started" class="odd">
    <div>
      <h2>
        <a href="#get-started">Get started</a>
      </h2>
      <Markdown>
        {`
Decimalish can be used anywhere you use JavaScript. It supports decades-old browsers, modern module-aware Node.js, and web compilers like [Webpack](https://webpack.js.org/). It comes with TypeScript definitions in the box.

For most, install decimalish via npm:

\`\`\`shell
npm install decimalish
\`\`\`

Otherwise, find a UMD module on your CDN of choice:

\`\`\`html
<script src="https://unpkg.com/decimalish"></script>
\`\`\`
        `}
      </Markdown>
    </div>
  </section>
)

const WhySection = () => (
  <section id="why">
    <div>
      <h2>
        <a href="#why">Why use Decimalish?</a>
      </h2>
      <P>
        "BigDecimal" arbitrary-precision decimal arithmetic libraries are
        nothing new. Some programming languages like Java and Python come with
        one built-in. There are decades-old standards to consult. In JavaScript
        there are many existing decimal libraries, such as the very popular
        [Big.js](https://mikemcl.github.io/big.js), as well as a
        [proposal](https://github.com/tc39/proposal-decimal) to add a native
        BigDecimal type. So why choose Decimalish?
      </P>
      <p>
        Simply put, Decimalish is easy to use, runs everywhere without
        dependencies or polyfills, reduces common mistakes, and feels JavaScript
        native, all while keeping a light footprint.
      </p>
    </div>
    <div class="two-grid">
      <div id="lightweight">
        <h3>
          <a href="#lightweight">Lightweight</a>
        </h3>
        <p>
          Decimalish is smaller than any library with comparable features. The
          entire library is 5KB minified and 2.3KB gzipped. Even better,
          Decimalish supports <em>tree shaking</em> so you only bundle what you
          use, as little as 0.45KB.
        </p>
        <p>
          See how this <a href="#comparison">compares</a> to other libraries.
        </p>
      </div>
      <div id="functional">
        <h3>
          <a href="#functional">Functional API</a>
        </h3>
        <P>
          All methods in Decimalish's API are provided as top level functions,
          not prototype methods. This maintains similarity to the built-in
          `Math` module, enables tree-shaking, and works well with functional
          utility libraries like [ramda](https://ramdajs.com/) or
          [lodash](https://lodash.com/).
        </P>
      </div>
      <div id="primitive-type">
        <h3>
          <a href="#primitive-type">Native primitive type</a>
        </h3>
        <P>
          Most BigDecimal libraries introduce a Decimal type as an Object, which
          is potentially mutable, not comparable, and often require writing
          bulky code with repeated calls to constructors. Decimalish’s `decimal`
          type, much like the built in `number`, is an *immutable primitive*
          …because it is a string.
        </P>
        <P>
          A `decimal` can be used as an object key, compared for equality,
          safely cached, written to or read from a JSON file, printed to a
          console or debugger, or anything else you can do with a string.
        </P>
      </div>
      <div id="no-special-values">
        <h3>
          <a href="#no-special-values">No special values</a>
        </h3>
        <P>
          Unlike other BigDecimal libraries, Decimalish does not support the
          "special values" `NaN`, `Infinity`, or `-0`. Forgetting to handle
          these special values can be a common source of bugs, so that’s one
          less thing to worry about.
        </P>
        <P>
          Operations that cannot return a finite `decimal` value will throw an
          error (such as `"DIV_ZERO"`).
        </P>
      </div>
      <div id="no-implicit-rounding">
        <h3>
          <a href="#no-implicit-rounding">No implicit rounding</a>
        </h3>
        <p>
          Many BigDecimal libraries automatically round the result of every
          operation if too bigger, too smaller, or too high precision based on
          some globally defined config. This can be confusing, cumbersome to
          configure, and another common source of bugs.
        </p>
        <p>
          Decimalish almost always returns exact results, only rounding when it
          must (such as non-terminating division) and always allowing locally
          configured behavior without any global state.
        </p>
      </div>
      <div id="no-trailing-zeros">
        <h3>
          <a href="#no-trailing-zeros">No trailing zeros</a>
        </h3>
        <P>
          Some BigDecimal libraries attempt to visually preserve precision after
          an operation by adding trailing zeros. While this can be useful for
          quick number formatting, this conflates mathematical value with
          presentation, require multiple kinds of equality (is `1.0` equal to
          `1`?), and sometimes operations such as multiple result in surprising
          results and thus, you guessed it, another source of bugs.
        </P>
        <P>
          Decimalish's `decimal()` constructor, and all other math functions
          always return canonical normalized decimal values without any leading
          or trailing zeros.
        </P>
      </div>
      <div id="places-or-precision">
        <h3>
          <a href="#places-or-precision">Places or precision</a>
        </h3>
        <p>
          When determining how many digits should be in a rounded value, most
          BigDecimal libraries only interpret this as either decimal places or
          precision (significant digits). It's not always clear which based on
          reading code alone.
        </p>
        <p>
          Decimalish offers both for all methods that might round with an easy
          to read API, alongside a rich set of rounding and division modes.
        </p>
      </div>
      <div id="extensible">
        <h3>
          <a href="#extensible">Extensible</a>
        </h3>
        <P>
          Decimalish exposes the core functions it uses to convert between
          `decimal` string values and an internal normalized form, making it
          straightforward to introduce new operations and functionality on an
          equal footing to Decimalish’s own API.
        </P>
      </div>
    </div>
  </section>
)

const APISection = () => (
  <>
    <section id="api" class="api-toc-sec">
      <h2>
        <a href="#api">API</a>
      </h2>
      <div>
        {Object.entries(useTypedefs().categories).map(([category, members]) => (
          <div>
            <h3>{category}</h3>
            <ul>
              {members.map(member => (
                <li>
                  <a href={"#" + member.id}>
                    <span>{getJSDoc(member.node)?.title}</span>
                    <code class={member.kind}>{member.id}</code>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
    {Object.entries(useTypedefs().categories).map(
      ([category, members], index) => (
        <section class={{ odd: index % 2 !== 0 }}>
          <h2>{category}</h2>
          {members.map(member => (
            <APIItemSection item={member} />
          ))}
        </section>
      )
    )}
  </>
)

const colorClass: { [color: string]: string | undefined } = {
  "#569cd6": "keyword",
  "#dcdcaa": "function",
  "#9cdcfe": "param",
  "#4ec9b0": "type",
  "#c8c8c8": "label",
  "#c586c0": "operator",
  "#b5cea8": "number",
  "#ce9178": "string",
  "#6a9955": "comment",
}

const Markdown = ({
  children,
  ...props
}: {
  children?: string
  wrapper?: string
  forceBlock?: boolean
}) => {
  if (!children) return null

  return compiler(children, {
    wrapper: null,
    ...props,
    overrides: { a: Link, code: Code },
    createElement: jsx.h as any,
  })
}

const P = ({ children }: { children: string }) => (
  <Markdown wrapper="p" forceBlock={true}>
    {children}
  </Markdown>
)

const Link = ({ children, ...props }: any) => (
  <a target={props.href?.startsWith("http") && "_blank"} {...props}>
    {children}
  </a>
)

const Code = ({
  children,
  className,
}: {
  children: string
  className?: string
}) => {
  const language = (className && className.replace("lang-", "")) || "typescript"
  const ids = useTypedefs().ids

  const highlighter = useHighlighter()

  // Convert inline code blocks into relative links.
  const typeDef = children.startsWith('"')
    ? ids[children.slice(1, -1)]
    : ids[children]
  if (typeDef) {
    return (
      <code>
        <a href={"#" + typeDef.id} class={typeDef.kind}>
          {children}
        </a>
      </code>
    )
  }

  // Otherwise color and link as typescript.
  const tokenLines = highlighter.codeToThemedTokens(
    children,
    language,
    "dark-plus"
  )
  const lines = tokenLines.map(line => (
    <>
      {line.map(({ content, color }, index) => {
        const className = color && colorClass[color.toLowerCase()]
        const typeDef = content.startsWith('"')
          ? ids[content.slice(1, -1)]
          : ids[content + (line[index + 1]?.content[0] === "(" ? "()" : "")]
        return typeDef ? (
          <a href={"#" + typeDef.id} class={className}>
            {content}
          </a>
        ) : className ? (
          <span class={className}>{content}</span>
        ) : (
          content
        )
      })}
    </>
  ))

  return (
    <code>
      {lines.map((line, index) => (index === 0 ? line : ["\n", line]))}
    </code>
  )
}

const APIItemSection = ({ item }: { item: Typedef }) => (
  <section id={item.id} class={{ api: true, error: item.name === "ErrorCode" }}>
    <div>
      <h3>
        <a href={"#" + item.id}>{getJSDoc(item.node)?.title}</a>
      </h3>
      <div>
        <code class="decl">
          <Source node={item.node} />
        </code>
        <Markdown>{getJSDoc(item.node)?.comment}</Markdown>
      </div>
    </div>
    {ts.isInterfaceDeclaration(item.node) &&
      item.node.members.map(member => (
        <TypeMemberSection
          member={member}
          id={`${item.id}.${member.name!.getText()}`}
        />
      ))}
    {ts.isTypeAliasDeclaration(item.node) &&
      ts.isUnionTypeNode(item.node.type) &&
      item.node.type.types.every(
        type => ts.isLiteralTypeNode(type) && ts.isStringLiteral(type.literal)
      ) &&
      item.node.type.types.map(member => (
        <TypeMemberSection member={member} id={member.getText().slice(1, -1)} />
      ))}
  </section>
)

const TypeMemberSection = ({ member, id }: { member: ts.Node; id: string }) => (
  <section id={id} class="api member">
    <div>
      <div />
      <Details forId={id}>
        <summary>
          <code class="decl">
            <Source node={member} />
          </code>
        </summary>
        <h4>
          <a href={"#" + id}>{getJSDoc(member)?.title}</a>
        </h4>
        <Markdown>{getJSDoc(member)?.comment}</Markdown>
      </Details>
    </div>
  </section>
)

const Details = ({ children, forId }: any) => (
  <details>
    <script
      innerHTML={`{
              const details = document.currentScript.parentElement
              document.currentScript.remove()
              const update = () => {
                const hash = decodeURIComponent(window.location.hash.slice(1))
                if (hash && hash === ${JSON.stringify(
                  forId
                )}) details.open = true
              }
              window.addEventListener('hashchange', update)
              update()
            }`}
    />
    {children}
  </details>
)

const Source = ({ node }: { node: ts.Node }) =>
  ts.isTypeAliasDeclaration(node) ? (
    <>
      <span class="keyword">type</span>{" "}
      <span class="type">{node.name.text}</span>
    </>
  ) : ts.isInterfaceDeclaration(node) ? (
    <>
      <span class="keyword">interface</span>{" "}
      <span class="type">{node.name.text}</span>
    </>
  ) : ts.isFunctionDeclaration(node) ? (
    <>
      <span class="function">{node.name!.text}</span>
      {"("}
      <wbr />
      {node.parameters.map((param, index) => (
        <>
          {index > 0 && ", "}
          {param.dotDotDotToken && "..."}
          <span class="param">{param.name.getText()}</span>
          {param.questionToken && "?"}
          {":\u00A0"}
          <Source node={param.type!} />
        </>
      ))}
      <wbr />
      {"):"}
      {ts.isTupleTypeNode(node.type!) ? <br /> : "\u00A0"}
      <Source node={node.type!} />
    </>
  ) : ts.isToken(node) ? (
    <span class="type">{node.getText()}</span>
  ) : ts.isLiteralTypeNode(node) ? (
    <span class={ts.isStringLiteralLike(node.literal) ? "string" : "number"}>
      {node.literal.getText()}
    </span>
  ) : ts.isTypeReferenceNode(node) ? (
    <a href={"#" + node.typeName.getText()} class="type">
      {node.typeName.getText()}
    </a>
  ) : ts.isTypePredicateNode(node) ? (
    <>
      <span class="param">{node.parameterName.getText()}</span>
      {"\u00A0"}
      <span class="keyword">is</span>
      {"\u00A0"}
      <Source node={node.type!} />
    </>
  ) : ts.isArrayTypeNode(node) ? (
    <>
      <Source node={node.elementType} />
      {"[]"}
    </>
  ) : ts.isTupleTypeNode(node) ? (
    <>
      {"["}
      <wbr />
      {node.elements.map((elem, index) => (
        <>
          {index > 0 && ", "}
          <Source node={elem} />
        </>
      ))}
      <wbr />
      {"]"}
    </>
  ) : ts.isNamedTupleMember(node) ? (
    <>
      <span class="label">{node.name.text}</span>
      {":\u00A0"}
      <Source node={node.type} />
    </>
  ) : ts.isUnionTypeNode(node) ? (
    <>
      {node.types.map((member, index) => (
        <>
          {index > 0 && "\u00A0|\u00A0"}
          <Source node={member} />
        </>
      ))}
    </>
  ) : ts.isTypeLiteralNode(node) ? (
    <>
      {"{ "}
      {node.members.map((member, index) => (
        <>
          {index > 0 && ", "}
          <Source node={member} />
        </>
      ))}
      {" }"}
    </>
  ) : ts.isTypeElement(node) ? (
    <>
      <span class="label">{node.name!.getText()}</span>
      {node.questionToken && "?"}
      {":\u00A0"}
      {<Source node={node.type} />}
    </>
  ) : (
    (() => {
      throw new Error(`Unexpected ${ts.SyntaxKind[node.kind]}`)
    })()
  )

const FAQSection = () => (
  <section id="faq">
    <div>
      <h2>
        <a href="#faq">FAQ</a>
      </h2>
      <p>Who knows</p>
    </div>
    <div class="two-grid">
      <div id="faq-why-modulo">
        <Details forId="faq-why-modulo">
          <summary>
            <h3>
              <a href="#faq-why-modulo">Why modulo?</a>
            </h3>
          </summary>
          <P>Testing</P>
        </Details>
      </div>
    </div>
  </section>
)

// Run
;(async () => {
  const highlighter = await shiki.getHighlighter({
    langs: ["typescript", "shell", "html"],
    theme: "dark-plus",
  })
  const typeDefs = getTypedefByCategory()
  const page = (
    <HighlighterContext value={highlighter}>
      <TypedefsContext value={typeDefs}>
        <Index />
      </TypedefsContext>
    </HighlighterContext>
  )
  fs.writeFileSync(ROOT_DIR + "dist/index.html", jsx.render(page), "utf8")
  console.log(
    path.relative(process.cwd(), path.resolve(ROOT_DIR, "../decimalish.tsx")) +
      " → " +
      path.relative(process.cwd(), ROOT_DIR + "dist/index.html")
  )
})()
