import { TokenType } from "./lex";
import type { AST, atom } from "./parse";

// generators -- assume well-formed input
/*
 * List of special forms:
 * 1. (define <...> <...>)
 * 2. (<and/or> <...> <...>)           (TODO)
 * 3. (if <...> <...> <...>)
 * 4. (let ((<...> <...>)...) <...>)   (TODO)
 */

// form: <atom>
function gen_js_atom(body: atom): string {
	return "(" + body.value + ")";
}

// form: (lambda (<param>...) <code>)
function gen_js_lambda(body: AST[]): string {
	let ret = "";
	ret += "(function(";
	for (let pname of body[1] as atom[]) {
		ret += " " + pname.value;
	}
	ret += `){return ${gen_js_maindispatch(body[2])}})`;

	return ret;
}

// form: (define <name> <val>)
function gen_js_define(body: AST[]): string {
	return `let ${(body[1] as atom).value} = ${gen_js_maindispatch(body[2])};`;
}

// form: (fn-name <arg>...) OR <name>
function gen_js_call(body: AST): string {
	if (!(body instanceof Array)) {
		// self-evaluating literal
		return "(" + body.value + ")";
	}

	let ret = "";
	if (body[0] instanceof Array) {
		ret += gen_js_maindispatch(body[0]);
	} else {
		ret += "(" + (body[0] as atom).value + ")";
	}
	ret += "(";
	for (const node of body.slice(1)) {
		ret += " " + gen_js_maindispatch(node) + ",";
	}
	ret += ")";

	return ret;
}

// form: (if <cond> <if-true> <if-false>)
function gen_js_if(body: AST[]) {
	return (
		`(function(){if(${gen_js_maindispatch(body[1])})` +
		`{return ${gen_js_maindispatch(body[2])}}` +
		`else{return ${gen_js_maindispatch(body[3])}}})()`
	);
}

function gen_js_maindispatch(body: AST): string {
	if (!(body instanceof Array)) {
		return gen_js_atom(body);
	}

	if (body[0] instanceof Array) {
		return gen_js_maindispatch(body[0]);
	} else {
		switch (body[0].type) {
			case TokenType.string:
			case TokenType.number:
				return gen_js_atom(body[0]);
			case TokenType.binding:
				switch (body[0].value) {
					case "define":
						return gen_js_define(body);
					case "lambda":
						return gen_js_lambda(body);
					case "if":
						return gen_js_if(body);
					default:
						return gen_js_call(body);
				}
			default:
				throw new Error();
		}
	}
}

const src =
	"(define factorial" +
	"  (lambda (n)" +
	"    (if (lessthan n 2)" +
	"        1" +
	"        (mult n (factorial (sub n 1))))))";
console.log(
	gen_js_maindispatch(
		require("./parse").parse(
			require("./lex").lex(
				"(define factorial (lambda (n) (if (lessthan n 2) 1 (mult n (factorial (sub n 1))))))"
			)
		)
	)
);
