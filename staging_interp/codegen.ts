import { TokenType } from "./lex";
import type { AST, atom } from "./parse";

// stdlib that must be done in js
// currently only math
const prelude =
	"const add=(a,b)=>a+b;const sub=(a,b)=>a-b;const mult=(a,b)=>a*b;const div=(a,b)=>a/b;const mod=(a,b)=>a%b;" +
	"const lt=(a,b)=>a<b;const gt=(a,b)=>a>b;const eq=(a,b)=>a===b;";

// generators -- assume well-formed input
/*
 * List of special forms:
 * 1. (define <...> <...>)
 * 2. (lambda (<...>...) <...>)
 * 3. (if <...> <...> <...>)
 * 4. (let ((<...> <...>)...) <...>)
 * 5. (<and/or> <...> <...>)
 * 6. (begin <...>...)
 * 7. (; <...>)
 */

// form: <atom>
function gen_js_atom(body: atom): string {
	return "(" + body.value + ")";
}

// form: (define <name> <expr>)
function gen_js_define(body: AST[]): string {
	return `let ${(body[1] as atom).value}=${_gen_js(body[2])};`;
}

// form: (lambda (<param>...) <code>)
function gen_js_lambda(body: AST[]): string {
	let ret = "";
	ret += "((";
	for (let pname of body[1] as atom[]) {
		ret += " " + pname.value;
	}
	ret += `)=>{return ${_gen_js(body[2])}})`;

	return ret;
}

// form: (if <cond> <expr-if-true> <expr-if-false>)
function gen_js_if(body: AST[]) {
	return (
		`((()=>{if(${_gen_js(body[1])})` +
		`{return ${_gen_js(body[2])}}` +
		`else{return ${_gen_js(body[3])}}})())`
	);
}

// form: (let ((<name> <expr>)...) (expr))
function gen_js_let(body: AST[]): string {
	let ret = "";

	ret += "(((";
	for (let pair of body[1] as AST[]) {
		ret += `${(pair as [atom, AST])[0].value}=${_gen_js(
			(pair as [atom, AST])[1]
		)},`;
	}
	ret += ")=>{return(";
	ret += _gen_js(body[2]);
	ret += ")})())";

	return ret;
}

// form: (and <expr>...) OR (or <expr>...)
function gen_js_andor(body: AST[]): string {
	let ret = "";

	ret += "(";
	for (let node of body.slice(1)) {
		ret += _gen_js(node) + (body[0] as atom).value === "and" ? "&&" : "||";
	}
	ret += (body[0] as atom).value === "and" ? "true" : "false" + ")";

	return ret;
}

// form: (begin <expr>...)
function gen_js_begin(body: AST[]): string {
	let ret = "";

	ret += "((()=>{";
	for (let node of body.slice(1, body.length - 1)) {
		ret += _gen_js(node) + ";";
	}
	ret += `return ${_gen_js(body.slice(-1))};})())`;

	return ret;
}

// form: (; <comment>)
function gen_js_comment(_: AST[]): string {
	return "";
}

// form: (fn-name <arg-expr>...) OR <name>
function gen_js_call(body: AST): string {
	if (!(body instanceof Array)) {
		// self-evaluating literal
		return "(" + body.value + ")";
	}

	let ret = "";
	if (body[0] instanceof Array) {
		ret += _gen_js(body[0]);
	} else {
		ret += "(" + (body[0] as atom).value + ")";
	}
	ret += "(";
	for (const node of body.slice(1)) {
		ret += " " + _gen_js(node) + ",";
	}
	ret += ")";

	return ret;
}

function _gen_js(body: AST): string {
	if (!(body instanceof Array)) {
		return gen_js_atom(body);
	}

	if (body[0] instanceof Array) {
		return _gen_js(body[0]);
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
					case "let":
						return gen_js_let(body);
					case "and":
					case "or":
						return gen_js_andor(body);
					case "begin":
						return gen_js_begin(body);
					case ";":
						return gen_js_comment(body);
					default:
						return gen_js_call(body);
				}
			default:
				throw new Error();
		}
	}
}

function gen_js(body: AST): string {
	return `(()=>{${prelude}${_gen_js(body)}})()`;
}

console.log(
	gen_js(
		require("./parse").parse(
			require("./lex").lex(
				"(begin (define factorial (lambda (n) (if (lt n 2) 1 (mult n (factorial (sub n 1)))))) (console.log (factorial 20)))"
			)
		)
	)
);
console.log(
	gen_js(
		require("./parse").parse(
			require("./lex").lex(
				"(define ho (lambda () (let ((a 3) (b 4)) (add a b))))"
			)
		)
	)
);
