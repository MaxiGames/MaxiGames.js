enum TokenType {
	unknown = 0,
	lparen,
	rparen,
	number,
	string,
	binding,
}

interface Token {
	type: TokenType;
	value: boolean | number | string | null;
}

// checks whether a character terminates a token.
// do not use for string parsing!
function term_tok_p(input: string /* should be single char */): boolean {
	if (input === " " || input === "(" || input === ")" || input === '"') {
		return true;
	} else {
		return false;
	}
}

function lex(input: string): Token[] {
	function inner(input: string, realpos: number): Token[] {
		let pos = 0;
		let tok: Token = { type: TokenType.unknown, value: null };

		// skip whitespace
		while (input[pos] === " ") {
			pos++;
		}

		if (pos >= input.length) {
			return [];
		}

		const t_start = pos; // save pos of start of token

		if (input[pos] === "(") {
			tok = { type: TokenType.lparen, value: null };
		} else if (input[pos] === ")") {
			tok = { type: TokenType.rparen, value: null };
		} else if (input[pos] === '"') {
			// handle string lol
			pos++; // into string
			tok.type = TokenType.string;
			tok.value = "";
			for (;;) {
				if (input[pos] === "\\") {
					// keep it simple for now-- only handle single-char escapes
					tok.value += input[pos + 1];
					pos += 2;
					continue;
				}
				if (input[pos] === '"') {
					break;
				}
				tok.value += input[pos];
				pos += 1;
			}
		} else {
			// if not string or brackets, then either number or binding
			while (!term_tok_p(input[pos])) {
				// to find end of token
				pos++;
			}
			pos--; // or next recurse will skip next char!

			const tok_str = input.slice(t_start, pos + 1);
			if (isNaN(parseFloat(tok_str))) {
				// token NOT a number; must be a binding name
				tok.type = TokenType.binding;
				tok.value = tok_str;
			} else {
				tok.type = TokenType.number;
				tok.value = parseFloat(tok_str);
			}
		}

		return [tok].concat(inner(input.slice(pos + 1), realpos + pos + 1));
	}

	return inner(input, 0);
}

export { TokenType, lex };
export type { Token };
