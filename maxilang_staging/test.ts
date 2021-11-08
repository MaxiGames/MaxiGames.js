import { lex } from "./lex";
import { parse } from "./parse";
import { gen_js } from "./codegen";

const fact_src = `
(begin
  (define factorial (lambda (n) (begin
	(if (lt n 2)
	  1
	  (mult n (factorial (sub n 1)))))))
  (console.log (factorial 20)))
`;

const fib_src = `
(begin
  (define fib (lambda (n) (begin
    (define iter (lambda (a b i) (begin
      (if (eq i n)
        (add a b)
        (iter b (add a b) (add i 1))))))
    (iter 0 1 2))))
  (console.log (fib 30))
`;

function bprint(msg: string) {
	console.log("\x1b[1m" + msg + "\x1b[0m");
}

bprint("JS code to compute and print 20!:");
console.log(gen_js(parse(lex(fact_src))));
bprint("Results:");
eval(gen_js(parse(lex(fact_src))));

console.log();

bprint("JS code to compute and print 30th fibonacci number:");
console.log(gen_js(parse(lex(fib_src))));
bprint("Results:");
eval(gen_js(parse(lex(fib_src))));
