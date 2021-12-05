type Cell = number; // bitfield: NESW openings

const N = 0b1000;
const E = 0b0100;
const S = 0b0010;
const W = 0b0001;
const dr = new Map([
	[N, -1],
	[E, 0],
	[S, 1],
	[W, 0],
]);
const dc = new Map([
	[N, 0],
	[E, 1],
	[S, 0],
	[W, -1],
]);
const opp = new Map([
	[N, S],
	[E, W],
	[S, N],
	[W, E],
]);

function randint(l: number, u: number) {
	return Math.floor(Math.random() * (u - l + 1)) + l;
}

function Dshuffle(input: any[]): any[] {
	let remaining = input.length;

	while (remaining > 0) {
		const i = randint(0, remaining - 1);
		const t = input[i];
		input[i] = input[input.length - 1];
		input[input.length - 1] = t;
		remaining -= 1;
	}

	return input;
}

function gen_maze(w: number, h: number) {
	function setchoose(s: Set<Cell>): Cell {
		return Array.from(s).at(-1) ?? -1;
	}

	const cellset = new Set<number>();
	const grid = [];
	for (let i = 0; i < h; ++i) {
		const ins = [];
		for (let j = 0; j < h; ++j) {
			ins.push(0);
		}
		grid.push(ins);
	}

	cellset.add(randint(0, h) * w + randint(0, w));

	while (cellset.size !== 0) {
		const cur = setchoose(cellset);
		const r0 = cur % w;
		const c0 = Math.floor(cur / w);

		console.log(`at (${r0},${c0})`);

		let n_deadends = 0;
		for (const dir of Dshuffle([N, E, S, W])) {
			const n = (r0 + dr.get(dir)!) * w + (c0 + dc.get(dir)!);
			const r = n % w;
			const c = Math.floor(n / w);
			console.log(`trying (${r},${c})`);

			if (r < 0 || r > h || c < 0 || c > w || grid[r][c] !== 0b0000) {
				n_deadends += 1;
				continue;
			}

			grid[r0][c0] |= dir;
			grid[r][c] |= opp.get(dir)!;
			cellset.add(n);
		}

		if (n_deadends === 4) {
			cellset.delete(cur);
		}

		n_deadends = 0;
	}

	return grid;
}

function maze2str(grid: Cell[][]) {
	for (const r of grid) {
		let s = "";
		for (const c of r) {
			switch (c) {
				case N:
					break;
			}
		}
		console.log(s);
	}
}

maze2str(gen_maze(50, 50));
