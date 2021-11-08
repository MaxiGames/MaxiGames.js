/*
 * This file is part of the MaxiGames.js bot.
 * Copyright (C) 2021  the MaxiGames dev team
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation, either version 3 of the
 * License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

import { TokenType } from "./lex";
import type { Token } from "./lex";

type atom = Token;
type AST = AST[] | atom;

function parse(input: Token[]): AST {
	// returns [AST, no. of tokens consumed]
	function inner(input: Token[]): [AST, number] {
		let pos = 0;
		let node: AST = [];

		if (input.length === 0) {
			return [node, 0];
		}

		while (pos < input.length) {
			switch (input[pos].type) {
				case TokenType.lparen: {
					const [subexpr, moved] = inner(input.slice(pos + 1));
					pos += moved;
					node.push(subexpr);
					break;
				}
				case TokenType.rparen: {
					return [node, pos + 2]; // lbrack + rbrack
					break;
				}
				default: {
					node.push(input[pos]);
					pos++;
					break;
				}
			}
		}

		return [node, input.length + 2];
	}

	return (inner(input)[0] as [AST])[0];
}

//const src = '(define (fact n) (if (or (= n 0) (= n 1)) 1 (* n (fact (- n 1))))) (fact 5)'
//
//console.log(
//	JSON.stringify(parse(require("./lex").lex(src)), null, 2)
//		.replaceAll(/"type": [0-9]+,\n/g, "")
//		.replaceAll(/{\s*/g, "")
//		.replaceAll(/\s*}/g, "")
//		.replaceAll(/".+"\: /g, "")
//		.replaceAll(/\s+/g, " ")
//		.replaceAll(/\s+\]/g, "]")
//		.replaceAll(/\[\s+/g, "[")
//);

export { parse };
export type { AST, atom };
