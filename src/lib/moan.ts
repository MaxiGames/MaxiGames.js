import path from "path";

// let out a dying moan and groan
export default function moan(...where: string[]) {
  const stack = new Error().stack;
  let e = "";
  if (stack === undefined) {
    e = "ERROR @ ???";
  } else {
    const caller = stack
      .split("\n")
      .map((x) => x.trim())
      .map((x) => [/\(.+\)/.exec(x), /at (.+) \(/.exec(x)])
      .filter((x) => x[0] !== null && x[1] !== null)
      .map((x) => [x[0]![0].slice(1).split(":")[0], x[1]![1]])
      .filter((x) => x[0] !== __filename)[0];

    e = `ERROR @ ${path.basename(caller[0])} in ${caller[1]}`;
  }
  for (let c of where) {
    e += ` (${c})`;
  }
  console.error(e + ".");
}
