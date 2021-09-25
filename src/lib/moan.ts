import path from "path";
import MGStatus from "./statuses";
import process from "process";

// let out a (dying?) moan
export default function moan(status: MGStatus, msg: string | unknown) {
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

  if (typeof msg === "string") {
    e += ` (${msg})`;
  } else {
    e += ` (${JSON.stringify(msg)})`;
  }

  e += "\n          [@ ";

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

  e += "].\n";

  console.error(e);
}
