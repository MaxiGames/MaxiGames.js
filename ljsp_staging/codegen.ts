import { TokenType } from "./lex";
import type { AST, atom } from "./parse";
import { js_prelude } from "./preludes";

// generators -- assume well-formed input
/*
 * List of special forms:
 * 1. (define <...> <...>)
 * 2. (lambda (<...>...) <...>)
 * 3. (if <...> <...> <...>)
 * 4. (let ((<...> <...>)...) <...>)
 * 5. (and <...> <...>)
 * 6. (or <...> <...>)
 * 7. (begin <...>...)
 */

const special_forms = [
	"define",
	"lambda",
	"if",
	"let",
	"and",
	"or",
	"begin",
].map((x) => [x, eval("gen_js_" + x)]) as [
	string,
	(body: AST | AST[] | atom) => string
][];

// form: <atom>
function gen_js_atom(body: atom): string {
	if (body.value === "nil") {
		return "(null)";
	} else {
		return (
			"(" +
			(body.type === TokenType.string ? '"' : "") +
			body.value +
			(body.type === TokenType.string ? '"' : "") +
			")"
		);
	}
}

// form: (define <name> <expr>)
function gen_js_define(body: AST[]): string {
	return `var ${(body[1] as atom).value}=${gen_js_dispatch(body[2])};`;
}

// form: (lambda (<param>...) <code>)
function gen_js_lambda(body: AST[]): string {
	let ret = "";
	ret += "((";
	let spread = false;
	for (let c of body[1] as atom[]) {
		ret +=
			c.value === "."
				? ""
				: (spread ? "..." : "") + c.value + (!spread ? "," : "");
		spread = c.value === ".";
	}
	ret += `)=>{return ${gen_js_dispatch(body[2])}})`;

	return ret;
}

// form: (if <cond> <expr-if-true> <expr-if-false>)
function gen_js_if(body: AST[]) {
	return (
		`((()=>{if(${gen_js_dispatch(body[1])})` +
		`{return ${gen_js_dispatch(body[2])}}` +
		`else{return ${gen_js_dispatch(body[3])}}})())`
	);
}

// form: (let ((<name> <expr>)...) (expr))
function gen_js_let(body: AST[]): string {
	let ret = "";

	ret += "(((";
	for (let pair of body[1] as AST[]) {
		ret += `${(pair as [atom, AST])[0].value}=${gen_js_dispatch(
			(pair as [atom, AST])[1]
		)},`;
	}
	ret += ")=>{return(";
	ret += gen_js_dispatch(body[2]);
	ret += ")})())";

	return ret;
}

// form: (and <expr>...)
function gen_js_and(body: AST[]): string {
	let ret = "";

	ret += "(";
	for (let node of body.slice(1)) {
		ret += gen_js_dispatch(node) + "&&";
	}
	ret += "true)";

	return ret;
}

// form: (or <expr>...)
function gen_js_or(body: AST[]): string {
	let ret = "";

	ret += "(";
	for (let node of body.slice(1)) {
		ret += gen_js_dispatch(node) + "||";
	}
	ret += "false)";

	return ret;
}

// form: (begin <expr>...)
function gen_js_begin(body: AST[]): string {
	let ret = "";

	ret += "((()=>{";
	for (let node of body.slice(1, body.length - 1)) {
		ret += gen_js_dispatch(node) + ";";
	}
	ret += `return ${gen_js_dispatch(body.slice(-1)[0])};})())`;

	return ret;
}

// form: (fn-name <arg-expr>...) OR <name>
function gen_js_call(body: AST): string {
	if (!(body instanceof Array)) {
		return "(" + body.value + ")";
	}

	let ret = "";
	if (body[0] instanceof Array) {
		ret += gen_js_dispatch(body[0]);
	} else {
		ret += "(" + (body[0] as atom).value + ")";
	}
	ret += "(";
	for (const node of body.slice(1)) {
		ret += gen_js_dispatch(node) + ",";
	}
	ret += ")";

	return ret;
}

function gen_gen_js_dispatch(
	specialforms: [string, (body: AST) => string][] // [name, rule]
): (body: AST) => string {
	function dispatch(body: AST): string {
		if (!(body instanceof Array)) {
			return gen_js_atom(body);
		}

		if (body[0] instanceof Array) {
			return gen_js_dispatch(body[0]);
		} else {
			switch (body[0].type) {
				case TokenType.string:
				case TokenType.number:
					return gen_js_atom(body[0]);
				// deal with special forms here
				case TokenType.binding:
					return (specialforms.find(
						(x) => x[0] === (body[0] as atom).value
					) ?? [0, gen_js_call])[1](body);
				default:
					throw new Error();
			}
		}
	}

	return dispatch;
}

const gen_js_dispatch = gen_gen_js_dispatch(special_forms);

function gen_js(body: AST): string {
	return `(()=>{${js_prelude}${gen_js_dispatch(body)}})()`;
}

export { js_prelude as prelude, gen_js };
