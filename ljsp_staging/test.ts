import { lex } from "./lex";
import { parse } from "./parse";
import { gen_js } from "./codegen";
import { lang_prelude } from "./ljsp_prelude";

const fact_src = `
(define factorial (lambda (n) (begin
(if (< n 2)
  1
  (* n (factorial (- n 1)))))))
(console.log (factorial 20))
`;

const fib_src = `
(define fib (lambda (n) (begin
(define iter (lambda (a b i) (begin
  (if (= i n)
	(+ a b)
	(iter b (+ a b) (+ i 1))))))
(iter 0 1 2))))
(console.log (fib 30))
`;

const constest_src = `
(define p (cons 5 6))
(console.log (car p))
(console.log (cdr p))
(define q (cons 7 (cons 8 9)))
(console.log (car q))
(console.log (car (cdr q)))
(console.log (cdr (cdr q)))
`;

function bprint(msg: string) {
	console.log("\x1b[1m" + msg + "\x1b[0m");
}

function prep_src(src: string) {
	return "(begin " + lang_prelude + src + ")";
}

bprint("JS code to compute and print 20!:");
console.log(gen_js(parse(lex(prep_src(fact_src)))));
bprint("Result:");
eval(gen_js(parse(lex(prep_src(fact_src)))));

console.log();

bprint("JS code to compute and print 30th fibonacci number:");
console.log(gen_js(parse(lex(prep_src(fib_src)))));
bprint("Result:");
eval(gen_js(parse(lex(prep_src(fib_src)))));

console.log();

bprint("JS code to test conses:");
console.log(gen_js(parse(lex(prep_src(constest_src)))));
bprint("Result:");
eval(gen_js(parse(lex(prep_src(constest_src)))));
