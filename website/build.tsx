/**
 * TODO:
 *
 * Markdown in text?
 * Better highlight colors (and use css vars)
 * interface properties
 * favicon
 *
 */

import * as path from 'path'
import * as fs from 'fs'
import * as ts from 'typescript'
import * as jsx from 'hyperjsx'

const ROOT_DIR = __dirname + '/'
const OTHER_CATEGORY = 'Et cetera'

// Everything private or otherwise missing from typescript's typedefs.
declare module 'typescript' {
  export interface TypeElement {
    type: TypeNode
  }
  export interface Declaration {
    jsDoc?: ts.JSDoc[]
    name?: ts.Identifier
  }
  export function findPrecedingToken(position: number, sourceFile: ts.SourceFile): ts.Token<ts.SyntaxKind>
  export function parseIsolatedJSDocComment(content: string, start: number, length: number): { jsDoc: ts.JSDoc } | undefined
}

type Typedefs = { ids: TypedefsById, categories: TypedefsByCategory }

type TypedefsById = { [id: string]: TypedefMember }

type TypedefsByCategory = { [category: string]: TypedefMember[] }

type TypedefMember = {
  id: string,
  name: string,
  isFunction: boolean,
  decl: ts.Declaration
}

type JSDoc = {
  title?: string
  comment: string
  tags: { [name: string]: string | undefined }
}

function getTypedefByCategory(): Typedefs {
  const file = path.resolve(ROOT_DIR, '../decimalish.ts')
  const sourceFile = ts.createSourceFile(
    file,
    fs.readFileSync(file, 'utf8'),
    ts.ScriptTarget.ES2015,
    /* parentReferences */ true
  );

  const ids: TypedefsById = {}
  const categories: TypedefsByCategory = {}

  for (const decl of sourceFile.statements) {
    if (isExportedDeclaration(decl)) {
      const name = decl.name!.text
      const isFunction = ts.isFunctionDeclaration(decl)
      const id = name + (isFunction ? '()' : '')
      const category = getJSDoc(decl)?.tags.category || OTHER_CATEGORY
      if (!ids[id]) {
        (categories[category] || (categories[category] = [])).push(
          ids[id] = { id, name, isFunction, decl }
        )
      }
    }
  }

  return { ids, categories }
}

function isExportedDeclaration(node: ts.Node): node is ts.Declaration {
  return !!(ts.getCombinedModifierFlags(node as ts.Declaration) & ts.ModifierFlags.Export)
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
      ts.getLeadingCommentRanges(source.text, ts.findPrecedingToken(node.pos, source).pos)
    )
    if (comment) {
      rawJsDoc = ts.parseIsolatedJSDocComment(source.text, comment.pos, comment.end - comment.pos)?.jsDoc
    }
  }
  let jsDoc
  if (rawJsDoc) {
    let title;
    let comment = ts.getTextOfJSDocComment(rawJsDoc.comment) || ''
    const titleMatch = /^(?:([^\n]+)(?:\n*$|\n{2,}))?/.exec(comment)
    if (titleMatch) {
      title = titleMatch[1]
      comment = comment.slice(titleMatch[0].length)
    }
    const tags = Object.fromEntries(rawJsDoc.tags?.map(tag => [tag.tagName.getText(source), ts.getTextOfJSDocComment(tag.comment)]) || [])
    jsDoc = { title, comment, tags }
  }
  jsDocCache.set(node, jsDoc)
  return jsDoc
}

const TypedefsContext = jsx.createContext<Typedefs | null>(null)

function useTypedefs(): Typedefs {
  return jsx.useContext(TypedefsContext)!
}

const Index = () =>
  <html lang="en">
    <head>
      <title>
        Decimalish — arbitrary-precision decimal primitives for JavaScript.
      </title>
      <meta charset="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <link rel="apple-touch-icon" sizes="180x180" href="apple-touch-icon.png" />
      <link rel="icon" type="image/png" sizes="32x32" href="favicon-32x32.png" />
      <link rel="icon" type="image/png" sizes="16x16" href="favicon-16x16.png" />
      <style innerHTML={fs.readFileSync(ROOT_DIR + 'style.css', 'utf8')} />
      <script innerHTML={fs.readFileSync(path.resolve(ROOT_DIR, '../dist/decimalish.min.js'), 'utf8')} />
    </head>
    <body>
      <Header />
      <IntroSection />
      <APISection />
      <FAQSection />
      <Footer />
    </body>
  </html>

const Header = () =>
  <header>
    <nav>
      <a href="#getstarted">Get started</a>
      <a href="#api">API</a>
      <a href="#faq">FAQ</a>
      <a href="https://github.com/leebyron/decimalish" target="_blank">Github</a>
    </nav>
    <SplitFlap />
  </header>

const Footer = () =>
  <footer>
    <div>
      Made with &#9829; in San Francisco by <a href="https://twitter.com/leeb" target="_blank">@leeb</a>
    </div>
  </footer>

const SplitFlap = () =>
  <div id="split-flap">
    <style innerHTML={fs.readFileSync(ROOT_DIR + 'split-flap.css', 'utf8')} />
    <svg outerHTML={fs.readFileSync(ROOT_DIR + 'split-flap.svg', 'utf8')} />
    <script innerHTML={fs.readFileSync(ROOT_DIR + 'split-flap.js', 'utf8')} />
  </div>

const IntroSection = () =>
  <section id="intro">
    <div>
      <h3><a href="#intro">Decimalish</a></h3>
      <div class="two-col">
        <p>
          &nbsp;is an arbitrary-precision decimal <em>(aka &ldquo;BigNumber&rdquo;)
          </em> library for JavaScript and TypeScript. How is this different
          from regular numbers and why would you need such a thing?
        </p>
        <p>
          Consider this surprising fact about regular numbers: <code>0.1 + 0.2 != 0.3</code>.
          This isn&apos;t yet another JavaScript quirk, but an unfortunate pitfall of
          nearly all numbers represented by computers (floating point numbers).
        </p>
        <p>
          While we read and write numbers in decimal, computers use binary and
          must convert between them. This can cause trouble when doing so with a
          fixed number of bits, information can be lost along the way and yield
          confusing results. In areas like finance or engineering these errors
          are simply unacceptable.
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
          familiar operators (<code>+</code>, <code>*</code>, <code>&equals;</code>),
          Decimalish cannot and offers equivalent functions in their place
          (<code>add</code>, <code>mul</code>, <code>eq</code>).
        </p>
        <p>
          Finally there's how they’re represented. Like regular numbers,
          Decimalish offers an <em>immutable primitive</em>. However …it’s a
          string… hence the <strong>&ndash;ish</strong>. Decimalish decimals
          are a specific format of <a href="#NumericString">numeric string</a>.
          While this has its advantages, ideally decimal could be its own
          primitive; but that’s just not JavaScript.
        </p>
      </div>
    </div>
  </section>

const APISection = () =>
  <>
    <section id="api" class="api-toc-sec">
      <h2><a href="#api">API</a></h2>
      <div>
        {Object.entries(useTypedefs().categories).map(([category, members]) =>
          <div>
            <h3>{category}</h3>
            <ul>
              {members.map(member =>
                <li>
                  <a href={'#' + member.id}>
                    {getJSDoc(member.decl)?.title} <pre class={member.isFunction ? 'fn' : 'type'}>{member.id}</pre>
                  </a>
                </li>
              )}
            </ul>
          </div>
        )}
      </div>
    </section>
    {Object.entries(useTypedefs().categories).map(([category, members], index) =>
      <section class={{ odd: index % 2 !== 0 }}>
        <h2>{category}</h2>
        {members.map(member => <APIItemSection member={member} />)}
      </section>
    )}
  </>

const APIItemSection = ({ member }: { member: TypedefMember }) =>
  <section id={member.id} class={{ api: true, error: member.name === 'ErrorCode' }}>
    <div>
      <h3><a href={'#' + member.id}>{getJSDoc(member.decl)?.title}</a></h3>
      <div>
        <pre class="decl"><Source node={member.decl} /></pre>
        <p>{getJSDoc(member.decl)?.comment}</p>
      </div>
    </div>
    {ts.isTypeAliasDeclaration(member.decl) &&
      ts.isUnionTypeNode(member.decl.type) &&
      member.decl.type.types.every(type =>
        ts.isLiteralTypeNode(type) && ts.isStringLiteral(type.literal)) &&
      <StringEnumMembers type={member.decl.type} />}
  </section>

const StringEnumMembers = ({ type }: { type: ts.UnionTypeNode }) =>
  <>{type.types.map(member =>
    <section id={member.getText().slice(1, -1)} class="api member">
      <div>
        <div/>
        <div>
          <pre class="literal">{member.getText()}</pre>
          <h4><a href={'#' + member.getText().slice(1, -1)}>{getJSDoc(member)?.title}</a></h4>
          <p>{getJSDoc(member)?.comment}</p>
        </div>
      </div>
    </section>
  )}</>

const Source = ({ node }: { node: ts.Node }) =>
  ts.isTypeAliasDeclaration(node) ?
    <><span class="keyword">type</span> <span class="type">{node.name.text}</span></> :
  ts.isInterfaceDeclaration(node) ?
    <><span class="keyword">interface</span> <span class="type">{node.name.text}</span></> :
  ts.isFunctionDeclaration(node) ?
    <>
      <span class="fn">{node.name!.text}</span>
      {'('}<wbr/>{node.parameters.map((param, index) =>
        <>
          {index > 0 && ', '}{param.dotDotDotToken && '...'}
          <span class="param">{param.name.getText()}</span>
          {param.questionToken && '?'}{':\u00A0'}
          <Source node={param.type!} />
        </>
      )}<wbr/>{'):\u00A0'}<Source node={node.type!} />
    </> :
  ts.isToken(node) ?
    <span class="type">{node.getText()}</span> :
  ts.isLiteralTypeNode(node) ?
    <span class="literal">{node.literal.getText()}</span> :
  ts.isTypeReferenceNode(node) ?
    <a href={'#' + node.typeName.getText()} class="type">{node.typeName.getText()}</a> :
  ts.isTypePredicateNode(node) ?
    <>
      <span class="param">{node.parameterName.getText()}</span>
      {'\u00A0'}<span class="keyword">is</span>{'\u00A0'}
      <Source node={node.type!} />
    </> :
  ts.isArrayTypeNode(node) ?
    <><Source node={node.elementType} />{'[]'}</> :
  ts.isTupleTypeNode(node) ?
    <>{'['}<wbr/>{node.elements.map((elem, index) =>
      <>{index > 0 && ', '}<Source node={elem} /></>
    )}<wbr/>{']'}</> :
  ts.isNamedTupleMember(node) ?
    <><span class="prop">{node.name.text}</span>{':\u00A0'}<Source node={node.type} /></> :
  ts.isUnionTypeNode(node) ?
    <>{node.types.map((member, index) =>
      <>{index > 0 && '\u00A0|\u00A0'}<Source node={member} /></>
    )}</> :
  ts.isTypeLiteralNode(node) ?
    <>{'{ '}{node.members.map((member, index) =>
      <>{index > 0 && ', '}<span class="prop">{member.name!.getText()}</span>
      {member.questionToken && '?'}{':\u00A0'}
      {<Source node={member.type} />}</>
    )}{' }'}</> :
  (() => { throw new Error(`Unexpected ${ts.SyntaxKind[node.kind]}`) })()

const FAQSection = () =>
  <section id="faq">
    <div>
      <h2><a href="#faq">FAQ</a></h2>
      <p>Who knows</p>
    </div>
  </section>

// Run
const typeDefs = getTypedefByCategory()
const page = <TypedefsContext value={typeDefs}><Index /></TypedefsContext>
fs.writeFileSync(ROOT_DIR + 'dist/index.html', jsx.render(page), 'utf8')
console.log(
  path.relative(process.cwd(), path.resolve(ROOT_DIR, '../decimalish.tsx')) +
  ' → ' +
  path.relative(process.cwd(), ROOT_DIR + 'dist/index.html')
)
