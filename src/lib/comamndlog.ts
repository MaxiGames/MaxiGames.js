export let commandLogArr: {
	commandName: string;
	userGuild: string;
	message: string;
}[] = [];

export default function commandLog(
	commandName: string,
	userGuild: string,
	message: string
): void {
	//log it to discord
	commandLogArr.push({
		commandName: commandName,
		userGuild: userGuild,
		message: message,
	});
}

export function setCommandLog() {
	commandLogArr = [];
}
