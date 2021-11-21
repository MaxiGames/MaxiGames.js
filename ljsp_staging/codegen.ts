import { TokenType } from "./lex";
import type { AST, atom } from "./parse";
import { js_prelude } from "./preludes";

// generators -- assume well-formed input
/*
 * List of special forms:
 * 1. (define <...> <...>)
 * 2. (lambda (<...>... [. <...>]) <...>)
 * 3. (if <...> <...> <...>)
 * 4. (let ((<...> <...>)...) <...>)
 * 5. (and <...> <...>)
 * 6. (or <...> <...>)
 * 7. (begin <...>...)
 */

type Specials = [string, Generator][];
type Generator = (body: AST | AST[] | atom, special: Specials) => string;

const special_forms = [
	"define",
	"lambda",
	"if",
	"let",
	"and",
	"or",
	"begin",
].map((x) => [x, eval("gen_js_" + x)]) as Specials;

// form: <atom>
function gen_js_atom(body: atom, _: Specials): string {
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
function gen_js_define(body: AST[], specials: Specials): string {
	return `var ${(body[1] as atom).value}=${gen_js_dispatch(
		body[2],
		specials
	)};`;
}

// form: (lambda (<param>... [. <spread-param>]) <code>)
function gen_js_lambda(body: AST[], specials: Specials): string {
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
	ret += `)=>{return ${gen_js_dispatch(body[2], specials)}})`;

	return ret;
}

// form: (if <cond> <expr-if-true> <expr-if-false>)
function gen_js_if(body: AST[], specials: Specials) {
	return (
		`((()=>{if(${gen_js_dispatch(body[1], specials)})` +
		`{return ${gen_js_dispatch(body[2], specials)}}` +
		`else{return ${gen_js_dispatch(body[3], specials)}}})())`
	);
}

// form: (let ((<name> <expr>)...) (expr))
function gen_js_let(body: AST[], specials: Specials): string {
	let ret = "";

	ret += "(((";
	for (let pair of body[1] as AST[]) {
		ret += `${(pair as [atom, AST])[0].value}=${gen_js_dispatch(
			(pair as [atom, AST])[1],
			specials
		)},`;
	}
	ret += ")=>{return(";
	ret += gen_js_dispatch(body[2], specials);
	ret += ")})())";

	return ret;
}

// form: (and <expr>...)
function gen_js_and(body: AST[], specials: Specials): string {
	let ret = "";

	ret += "(";
	for (let node of body.slice(1)) {
		ret += gen_js_dispatch(node, specials) + "&&";
	}
	ret += "true)";

	return ret;
}

// form: (or <expr>...)
function gen_js_or(body: AST[], specials: Specials): string {
	let ret = "";

	ret += "(";
	for (let node of body.slice(1)) {
		ret += gen_js_dispatch(node, specials) + "||";
	}
	ret += "false)";

	return ret;
}

// form: (begin <expr>...)
function gen_js_begin(body: AST[], specials: Specials): string {
	let ret = "";

	ret += "((()=>{";
	for (let node of body.slice(1, body.length - 1)) {
		ret += gen_js_dispatch(node, specials) + ";";
	}
	ret += `return ${gen_js_dispatch(body.slice(-1)[0], specials)};})())`;

	return ret;
}

// form: (fn-name <arg-expr>...) OR <name>
function gen_js_call(body: AST, specials: Specials): string {
	if (!(body instanceof Array)) {
		return "(" + body.value + ")";
	}

	let ret = "";
	if (body[0] instanceof Array) {
		ret += gen_js_dispatch(body[0], specials);
	} else {
		ret += "(" + (body[0] as atom).value + ")";
	}
	ret += "(";
	for (const node of body.slice(1)) {
		ret += gen_js_dispatch(node, specials) + ",";
	}
	ret += ")";

	return ret;
}

// form: (defspecial <name> <arg-name> <body>)
function gen_gen_js_defspecial(
	body: AST[],
	specials: Specials
): [string, Generator] {
	const name = (body[1] as atom).value as string;
	const arg_name = (body[2] as atom).value as string;
	const reader = body[3] as AST;

	return [
		name,
		eval(`(${arg_name})=>{${gen_js_dispatch(reader, specials)}};`),
	];
}

function gen_js_dispatch(body: AST, specials: Specials): string {
	if (!(body instanceof Array)) {
		return gen_js_atom(body, specials);
	}

	if (body[0] instanceof Array) {
		return gen_js_dispatch(body[0], specials);
	} else {
		switch (body[0].type) {
			case TokenType.string:
			case TokenType.number:
				return gen_js_atom(body[0], specials);
			// deal with special forms here
			case TokenType.binding:
				if (body[0].value === "defspecial") {
					// copy
					const new_specialforms = specials.map((a) =>
						a.map((a) => a)
					) as Specials;
					new_specialforms.push(
						gen_gen_js_defspecial(body, specials)
					);
					specials = new_specialforms; // will not mutate original
				}

				return (specials.find(
					(x) => x[0] === (body[0] as atom).value
				) ?? [0, gen_js_call])[1](body, specials);
			default:
				throw new Error();
		}
	}
}

function gen_js(body: AST): string {
	return `(()=>{${js_prelude}${gen_js_dispatch(body, special_forms)}})()`;
}

export { js_prelude as prelude, gen_js };
