/**
 * Tiny safe calculator (no eval): + - * / ( ), decimals ("," or "."),
 * "x" and "×" for multiply, "÷" for divide, scientific notation (2e6).
 * Returns null for anything it can't evaluate.
 */
export function evalExpression(src: string): number | null {
  const s = src
    .toLowerCase()
    .replace(/\s+/g, "")
    .replace(/,/g, ".")
    .replace(/[×x]/g, "*")
    .replace(/÷/g, "/");
  if (!s) return null;
  let i = 0;

  function atom(): number {
    if (s[i] === "(") {
      i++;
      const v = sum();
      if (s[i] !== ")") throw new Error("paren");
      i++;
      return v;
    }
    if (s[i] === "-") {
      i++;
      return -atom();
    }
    if (s[i] === "+") {
      i++;
      return atom();
    }
    const m = /^\d+(\.\d+)?(e[+-]?\d+)?/.exec(s.slice(i));
    if (!m) throw new Error("number");
    i += m[0].length;
    return Number(m[0]);
  }
  function product(): number {
    let v = atom();
    while (s[i] === "*" || s[i] === "/") {
      const op = s[i++];
      const r = atom();
      v = op === "*" ? v * r : v / r;
    }
    return v;
  }
  function sum(): number {
    let v = product();
    while (s[i] === "+" || s[i] === "-") {
      const op = s[i++];
      const r = product();
      v = op === "+" ? v + r : v - r;
    }
    return v;
  }

  try {
    const v = sum();
    return i === s.length && Number.isFinite(v) ? v : null;
  } catch {
    return null;
  }
}
