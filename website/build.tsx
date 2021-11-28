/**
 * TODO:
 *
 * Color code and link signature
 * Markdown in text?
 * Thread down reflection as data?
 * Watch mode
 *
 */

import * as path from 'path'
import * as fs from 'fs'
import * as TypeDoc from 'typedoc'
import * as util from 'util'

// Simple JSX to HTML

declare global {
  namespace JSX {
    type Component<P=null> = (props: P) => Element
    type Element<P=any> = { name: string | Component<P>, props?: P, children: Child[] }
    type Child = Child[] | Element | string | number | false | null | undefined
    type HTMLTags = HTMLElementTagNameMap & Omit<SVGElementTagNameMap, 'a'>
    type IntrinsicElements = { [K in keyof HTMLTags]: Partial<Omit<HTMLTags[K], 'children' | 'className' | 'style'> & { children: Child[], class: string, style: string }> }
  }
}

function jsx<P>(name: string | JSX.Component<P>, props: P, ...children: JSX.Child[]): JSX.Element<P> {
  return { name, props, children }
}

// prettier-ignore
const SINGLETONS: {[tag: string]: boolean} = { area: true, base: true, br: true, col: true, embed: true, hr: true, img: true, input: true, keygen: true, link: true, meta: true, param: true, source: true, track: true, wbr: true };

function renderJSX(element: JSX.Element) {
  let html = ''
  const stack: { children: JSX.Child[], index: number, close?: string }[] = [
    { children: [element], index: 0 }
  ]
  while (stack.length) {
    const frame = stack[stack.length - 1]
    const child = frame.children[frame.index++];
    if (frame.index > frame.children.length) {
      stack.pop()
      if (frame.close) {
        html += frame.close
      }
    } else if (typeof child !== 'object' || !child) {
      if (typeof child === 'string' || typeof child === 'number') {
        html += String(child).replace(/</g, '&lt;')
      }
    } else if (Array.isArray(child)) {
      stack.push({ children: child, index: 0 })
    } else if (child.name === jsx) {
      stack.push({ children: child.children, index: 0 })
    } else if (typeof child.name === 'function') {
      stack.push({ children: [child.name({...child.props, children: child.children})], index: 0 })
    } else if (child.props?.outerHTML) {
      html += child.props?.outerHTML
    } else {
      if (child.name === 'html') html += '<!DOCTYPE html>\n'
      html += '<' + child.name
      for (const [key, value] of Object.entries(child.props || {})) {
        if (value != null && key !== 'innerHTML') {
          html += ' ' + key + '="' + String(value).replace(/"/g, '&quot;') + '"'
        }
      }
      html += '>'
      if (!SINGLETONS[child.name]) {
        if (child.props?.innerHTML) html += child.props?.innerHTML
        stack.push({ children: child.children, index: 0, close: '</' + child.name + '>' })
      }
    }
  }
  return html
}

function cx(obj: {[className: string]: boolean}): string | undefined {
  return Object.entries(obj)
    .filter(([, value]) => value)
    .map(([className]) => className)
    .join(' ') || undefined
}

// Reflection over typedefs

const rootDir = __dirname + '/'

type ProjectReflection = Omit<TypeDoc.JSONOutput.ProjectReflection, 'children' | 'categories'> & {
  children?: DeclarationReflection[]
  categories?: ReflectionCategory[]
}
type DeclarationReflection = TypeDoc.JSONOutput.DeclarationReflection & {
  ref?: string
  link?: string
  title?: string
}
type ReflectionCategory = TypeDoc.JSONOutput.ReflectionCategory & {
  childrenRefs?: DeclarationReflection[]
}

function getTypedocData(): ProjectReflection {
  const app = new TypeDoc.Application();
  app.options.addReader(new TypeDoc.TSConfigReader());
  app.bootstrap({
    entryPoints: [path.resolve(rootDir, '../decimalish.ts')],
    intentionallyNotExported: ['$decimal'],
    sort: ['source-order'],
    categorizeByGroup: false
  });

  // NOTE: convertAndWatch
  const project = app.convert()!;
  app.validate(project)
  if (app.logger.hasErrors() || app.logger.hasWarnings()) {
    process.exit(1);
  }

  const reflection: ProjectReflection = app.serializer.projectToObject(project)

  // Create frequently accessed derived data as properties.
  for (const child of reflection.children!) {
    child.ref = child.name + (child.kindString === 'Function' ? '()' : '')
    child.link = '#' + child.ref
    child.comment = child.signatures?.[0].comment ?? child.comment
    child.title = child.comment?.shortText
  }

  // Sort categories by the same as children.
  reflection.categories!.sort((a, b) =>
    reflection.children!.findIndex(c => c.id === a.children![0]) -
    reflection.children!.findIndex(c => c.id === b.children![0])
  )

  // Reconnect references
  for (const category of reflection.categories!) {
    category.childrenRefs = category.children?.map(id => reflection.children!.find(c => c.id === id)!)
  }

  return reflection
}


const reflection = getTypedocData()

const Index = () =>
  <html lang="en">
    <head>
      <title>
        Decimalish — arbitrary-precision decimal primitives for JavaScript.
      </title>
      <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <style innerHTML={fs.readFileSync(rootDir + 'style.css', 'utf8')} />
      <script innerHTML={fs.readFileSync(path.resolve(rootDir, '../dist/decimalish.min.js'), 'utf8')} />
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
    <style innerHTML={fs.readFileSync(rootDir + 'split-flap.css', 'utf8')} />
    <svg outerHTML={fs.readFileSync(rootDir + 'split-flap.svg', 'utf8')} />
    <script innerHTML={fs.readFileSync(rootDir + 'split-flap.js', 'utf8')} />
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
      <div>
        <h2><a href="#api">API</a></h2>
        <div>
          {reflection.categories?.map(category =>
            <div>
              <h3>{category.title}</h3>
              <ul>
                {category.childrenRefs?.map(child =>
                  child && <li>
                    <a href={child.link}>{child.title} <pre>{child.ref}</pre></a>
                  </li>
                )}
              </ul>
            </div>
          )}
        </div>
      </div>
    </section>
    {reflection.categories?.map(category =>
      <>
        <section><h2>{category.title}</h2></section>
        {category.childrenRefs?.map(child => <APIItemSection child={child} />)}
      </>
    )}
  </>

const APIItemSection = ({ child }: { child: DeclarationReflection }) =>
  <>
    <section id={child.ref} class={cx({ api: true, error: child.name === 'ErrorCode' })}>
      <div>
        <h3><a href={child.link}>{child.title}</a></h3>
        <div>
          <pre>add(a: <a href="#Numeric">Numeric</a>, b: <a href="#Numeric">Numeric</a>): <a href="#decimal">decimal</a></pre>
          <p>{child.comment?.text}</p>
        </div>
      </div>
    </section>
    {child.kindString === 'Enumeration' && (
      child.children?.map(member =>
        <section id={member.name} class={cx({ api: true, member: true, error: child.name === 'ErrorCode' })}>
          <div>
            <h3><a href={'#' + member.name}>{member.comment?.shortText}</a></h3>
            <div>
              <pre>{member.defaultValue}</pre>
              <p>{member.comment?.text}</p>
            </div>
          </div>
        </section>
      )
    )}
  </>

const FAQSection = () =>
  <section id="faq">
    <div>
      <h2><a href="#faq">FAQ</a></h2>
      <p>Who knows</p>
    </div>
  </section>

fs.writeFileSync(rootDir + 'dist/index.html', renderJSX(<Index />), 'utf8')
fs.writeFileSync(rootDir + 'dist/api.json', JSON.stringify(reflection, null, 2), 'utf8')
