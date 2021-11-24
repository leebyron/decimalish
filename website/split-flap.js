class SplitFlap {
  static speed = 100;
  // prettier-ignore
  static symbols = [
    "0", "1", "2", "3", "4", "5", "6", "7", "8", "9",
    "a", "b", "c", "d", "e", "f", "g", "h", "i", "j",
    "k", "l", "m", "n", "o", "p", "q", "r", "s", "t",
    "u", "v", "w", "x", "y", "z"];
  static secretSymbols = [".", "-", "+", " ", "=", "?"];

  constructor() {
    const root = document.createElement("div");
    root.className = "sf-cell";
    root.innerHTML = `
      <svg viewBox="0 0 50 89"><use href="#sf-back" /></svg>
      <svg viewBox="0 0 50 89" class="behind">
        <use href="#sf-bottom" y="6" />
        <use href="#sf-bottom" y="4" />
        <use href="#sf-bottom" y="2" />
        <use href="#sf-top" />
        <use href="#sf- -top" class="next-top" />
        <use href="#sf- -bottom" y="2" class="last-bottom" />
      </svg>
      <svg viewBox="0 0 50 89"><use href="#sf-front" /></svg>
      <div class="flap">
        <svg viewBox="0 0 50 89" class="top">
          <use href="#sf-top" />
          <use href="#sf- -top" class="last-top" />
          <use href="#sf-shadow" class="shadow" />
        </svg>
        <svg viewBox="0 0 50 89" class="bottom">
          <use href="#sf-bottom" />
          <use href="#sf- -bottom" class="next-bottom" />
          <use href="#sf-shine" class="shine" />
        </svg>
      </div>`;
    this.root = root;
    this.lastTop = root.getElementsByClassName("last-top")[0];
    this.lastBottom = root.getElementsByClassName("last-bottom")[0];
    this.nextTop = root.getElementsByClassName("next-top")[0];
    this.nextBottom = root.getElementsByClassName("next-bottom")[0];
    this.behind = root.getElementsByClassName("behind")[0];
    this.flap = root.getElementsByClassName("flap")[0];
    this.shadow = root.getElementsByClassName("shadow")[0];
    this.shine = root.getElementsByClassName("shine")[0];
    this.reset(" ");
  }

  _updateDOM(char) {
    this.lastTop.setAttribute("href", this.nextTop.getAttribute("href"));
    this.lastBottom.setAttribute("href", this.nextBottom.getAttribute("href"));
    this.nextTop.setAttribute("href", `#sf-${char}-top`);
    this.nextBottom.setAttribute("href", `#sf-${char}-bottom`);
  }

  reset(char) {
    this.target = SplitFlap.symbols.indexOf(char);
    this.targetChar = char;
    this.extra = 0;
    this.current = this.target;
    this._updateDOM(char);
  }

  async set({ char, delay, immediate, extra }) {
    if (char === this.targetChar) return;

    // TODO: if it's starting and ending on a digit, don't circle all
    // around. Similar for letter to letter
    let index = SplitFlap.symbols.indexOf(char);
    if (index < 0) {
      if (SplitFlap.secretSymbols.indexOf(char) < 0) {
        throw new Error(`Cannot draw ${char}`);
      }
      index =
        (this.current + Math.floor(Math.random() * SplitFlap.symbols.length)) %
        SplitFlap.symbols.length;
    }
    this.target = index;
    this.targetChar = char;
    this.extra = extra;
    if (this.animating) return;
    this.animating = true;
    if (delay) {
      await sleep(delay);
    }
    while (this.current !== this.target || this.extra) {
      this.current = (this.current + 1) % SplitFlap.symbols.length;
      if (this.current === this.target && this.extra) {
        this.current =
          (this.current + SplitFlap.symbols.length - this.extra) %
          SplitFlap.symbols.length;
        this.extra = 0;
      }
      this._updateDOM(
        this.current === this.target && !this.extra
          ? this.targetChar
          : SplitFlap.symbols[this.current]
      );
      const timing = {
        duration: Math.round(SplitFlap.speed * (0.95 + 0.1 * Math.random())),
        easing: "ease-in",
      };
      const animation = this.behind.animate(
        [
          { transform: "translate3d(0, -2.25%, 0)" },
          { transform: "translate3d(0, 0, 0)", offset: 0.7 },
        ],
        timing
      );
      const perspective = 6 * this.flap.clientWidth;
      this.flap.animate(
        [
          {
            transform: `perspective(${perspective}px) rotateX(179deg)`,
          },
          {
            transform: `perspective(${perspective}px) rotateX(1deg)`,
            offset: 0.7,
          },
        ],
        timing
      );
      this.shadow.animate(
        [{ opacity: "0" }, { opacity: "1", offset: 0.7 }],
        timing
      );
      this.shine.animate(
        [
          { opacity: "0.5" },
          { opacity: "0.5", offset: 0.2 },
          { opacity: "0", offset: 0.7 },
        ],
        timing
      );
      await animation.finished;
    }
    this.animating = false;
  }
}

const host = document.getElementById("split-flap");
const cells = [];
for (let i = 0; i < 10; i++) {
  const cell = new SplitFlap();
  host.appendChild(cell.root);
  cells.push(cell);
}

function sfDisplay(text, reset) {
  text = Array.from(text).slice(0, 10);
  const padding = 10 - text.length;
  for (let i = Math.floor(padding / 2); i--; ) {
    text.unshift(" ");
  }
  for (let i = Math.ceil(padding / 2); i--; ) {
    text.push(" ");
  }
  text = text.map((v, i) =>
    typeof v === "string"
      ? { char: v, delay: i * 50 }
      : { ...v, delay: v.delay ?? i * 50 }
  );
  return Promise.all(
    text.map((data, i) =>
      reset ? cells[i].reset(data.char) : cells[i].set(data)
    )
  );
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

(async () => {
  sfDisplay("decimalish", true);

  // during development
  return

  while (true) {
    await sfDisplay([
      { char: "d", extra: 0 },
      { char: "e", extra: 0 },
      { char: "c", extra: 0 },
      { char: "i", extra: 0 },
      { char: "m", extra: 0 },
      { char: "a", extra: 0 },
      { char: "l", extra: 0 },
      { char: "i", extra: 17 },
      { char: "s", extra: 9 },
      { char: "h", extra: 22 },
    ]);
    await sleep(3000);
    // await sleep(2000);
    // await sfDisplay("0.1+0.2= ?");
    // await sleep(2000);
    // await sfDisplay("0.30000004");
    await sfDisplay("0123456789");
    await sleep(2000);
  }
})();
