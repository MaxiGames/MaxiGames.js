import path from "path";
import MGStatus from "./statuses";

const SPC1 = 10; // space for status info
const SPC2 = 40; // max width for message

// Readjust string to fit n columns + indent size.
function refmtstr(str: string, threshold: number, indent: number): string {
  function iter(xs: string[], c: string, n: number): string {
    if (xs.length === 0) {
      return c;
    } else {
      if (n + xs[0].length > threshold) {
        return iter(
          xs.slice(1),
          `${c.slice(0, -1)}\n${xs[0]} `,
          xs[0].length + 1
        );
      } else {
        return iter(xs.slice(1), `${c}${xs[0]} `, n + xs[0].length + 1);
      }
    }
  }

  return (
    `\x1b[${indent}C` +
    iter(
      str
        .split(" ")
        .flatMap((x) => x.split("\n"))
        .filter((x) => x != " "),
      "",
      0
    ).replaceAll("\n", "\n" + `\x1b[${indent}C`)
  );
}

// Let out a (dying?) moan.
export default function moan(status: MGStatus, msg: string | unknown): void {
  let e: string = "";

  e += "\x1b[1m";

  switch (status) {
    case MGStatus.Default:
    case MGStatus.Error:
      e += "\x1b[31mERROR    ";
      break;
    case MGStatus.Success:
      e += "\x1b[32mSUCCESS  ";
      break;
    case MGStatus.Info:
      e += "\x1b[34mINFO     ";
      break;
    case MGStatus.Warn:
      e += "\x1b[33mWARN     ";
      break;
  }

  e += "\x1b[0m";

  e += "\x1b[0G";
  if (typeof msg === "string") {
    e += refmtstr(msg, SPC2, SPC1);
  } else {
    e += ` Object:\n\x1b[${SPC1}C| ${JSON.stringify(msg, null, 2).replaceAll(
      "\n",
      `\n|\x1b[${SPC1}C|`
    )}`;
  }

  e += `\x1b[1G\x1b[${SPC1}\n[@ `;

  // black magic
  // do not touch
  const stack = new Error().stack;
  if (stack === undefined) {
    e += "\x1b[1m???\x1b[0m";
  } else {
    const caller = stack
      .split("\n")
      .map((x) => x.trim())
      .map((x) => [/\(.+\)/.exec(x), /at (.+) \(/.exec(x)])
      .filter((x) => x[0] !== null && x[1] !== null)
      .map((x) => [x[0]![0].slice(1).split(":")[0], x[1]![1]])
      .filter((x) => x[0] !== __filename)[0];

    e +=
      `\x1b[4m\x1b[2m${path.dirname(caller[0])}/` +
      `\x1b[1m${path.basename(caller[0])}\x1b[0m ` +
      `in \x1b[1m${caller[1]}\x1b[0m`;
  }

  e += "].";

  console.error(e);
}
