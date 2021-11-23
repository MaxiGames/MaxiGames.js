import { Client, TextChannel } from "discord.js";
import commandLog, { commandLogArr, setCommandLog } from "../lib/comamndlog";
import { setMoan, toLog } from "../lib/moan";
import MGS from "../lib/statuses";

export default function logToDiscord(client: Client) {
	const arr = toLog;
	const maxigamesOfficial = client.guilds.cache.get(
		`${
			process.env.NODE_ENV == "production"
				? "837522963389349909"
				: "866939574419849216"
		}`
	)!;
	maxigamesOfficial.channels
		.fetch(
			`${
				process.env.NODE_ENV == "production"
					? "904995742349922304"
					: "905023522278113320"
			}`
		)
		.then((logs) => {
			for (const i of arr) {
				const { status, logged } = i;
				const botlogs = logs as TextChannel;
				let title: string;
				let colour: string;
				let append: string;
				let toPing = "";
				if (status === MGS.Error) {
					title = "❌";
					colour = "diff";
					append = "-";
					if (process.env.NODE_ENV === "production")
						toPing =
							"<@712942935129456671>, <@676748194956181505>, <@782247763542016010>, <@682592012163481616>, <@697747732772814921>";
				} else if (status === MGS.Success) {
					title = "✅";
					colour = "diff";
					append = "+";
				} else if (status === MGS.Info) {
					title = "ℹ️";
					colour = "fix";
					append = ".";
				} else if (status === MGS.Warn) {
					title = "⚠️";
					colour = "fix";
					append = "";
				} else {
					title = "📝";
					colour = "";
					append = "";
				}
				botlogs.send(
					`${toPing}\n\`\`\`${colour}\n${append}${title}: ${logged}\`\`\``
				);
			}
		});
	let arr2 = commandLogArr;
	const maxigamesOfficial2 = client.guilds.cache.get(
		`${
			process.env.NODE_ENV == "production"
				? "837522963389349909"
				: "866939574419849216"
		}`
	)!;
	maxigamesOfficial2.channels
		.fetch(
			`${
				process.env.NODE_ENV == "production"
					? "905458096372084777"
					: "905458135358124073"
			}`
		)
		.then((channel) => {
			for (let i of arr2) {
				let textChannel = channel as TextChannel;
				textChannel.send(
					`**User/Guild:** \`${i.userGuild}\`\n**Command:** \`${i.commandName}\`\n**Message:**\`\`\`${i.message}\`\`\``
				);
			}
		});
	setCommandLog();
	setMoan();
	setTimeout(() => {
		logToDiscord(client);
	}, 2000);
}
