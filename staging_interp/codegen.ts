import { TokenType } from "./lex";
import type { AST, atom } from "./parse";

// generators -- assume well-formed input
/*
 * List of special forms:
 * 1. (define <...> <...>)
 * 2. (lambda (<...>...) <...>)
 * 3. (if <...> <...> <...>)
 * 4. (let ((<...> <...>)...) <...>)
 * 5. (<and/or> <...> <...>)
 */

// form: <atom>
function gen_js_atom(body: atom): string {
	return "(" + body.value + ")";
}

// form: (define <name> <expr>)
function gen_js_define(body: AST[]): string {
	return `let ${(body[1] as atom).value}=${gen_js(body[2])};`;
}

// form: (lambda (<param>...) <code>)
function gen_js_lambda(body: AST[]): string {
	let ret = "";
	ret += "(function(";
	for (let pname of body[1] as atom[]) {
		ret += " " + pname.value;
	}
	ret += `){return ${gen_js(body[2])}})`;

	return ret;
}

// form: (if <cond> <expr-if-true> <expr-if-false>)
function gen_js_if(body: AST[]) {
	return (
		`(function(){if(${gen_js(body[1])})` +
		`{return ${gen_js(body[2])}}` +
		`else{return ${gen_js(body[3])}}})()`
	);
}

// form: (let ((<name> <expr>)...) (expr))
function gen_js_let(body: AST[]): string {
	let ret = "";

	ret += "(function (";
	for (let pair of body[1] as AST[]) {
		ret += `${(pair as [atom, AST])[0].value}=${gen_js(
			(pair as [atom, AST])[1]
		)},`;
	}
	ret += "){return(";
	ret += gen_js(body[2]);
	ret += ")})()";

	return ret;
}

// form: (and <expr>...) OR (or <expr>...)
function gen_js_andor(body: AST[]): string {
	let ret = "";

	ret += "(";
	for (let node of body.slice(1)) {
		ret += gen_js(node) + (body[0] as atom).value === "and" ? "&&" : "||";
	}
	ret += (body[0] as atom).value === "and" ? "true" : "false" + ")";

	return ret;
}

// form: (fn-name <arg-expr>...) OR <name>
function gen_js_call(body: AST): string {
	if (!(body instanceof Array)) {
		// self-evaluating literal
		return "(" + body.value + ")";
	}

	let ret = "";
	if (body[0] instanceof Array) {
		ret += gen_js(body[0]);
	} else {
		ret += "(" + (body[0] as atom).value + ")";
	}
	ret += "(";
	for (const node of body.slice(1)) {
		ret += " " + gen_js(node) + ",";
	}
	ret += ")";

	return ret;
}

function gen_js(body: AST): string {
	if (!(body instanceof Array)) {
		return gen_js_atom(body);
	}

	if (body[0] instanceof Array) {
		return gen_js(body[0]);
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
					default:
						return gen_js_call(body);
				}
			default:
				throw new Error();
		}
	}
}

console.log(
	gen_js(
		require("./parse").parse(
			require("./lex").lex(
				"(define factorial (lambda (n) (if (lessthan n 2) 1 (mult n (factorial (sub n 1))))))"
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
