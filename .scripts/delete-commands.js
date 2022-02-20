"use strict";

const { REST } = require("@discordjs/rest");
const { Routes } = require("discord-api-types/v9");
const { config } = require("../dist/src/utils/config.js");

const rest = new REST({ version: "9" }).setToken(config.tokenId);

// delete slash commands
rest.get(Routes.applicationCommands(config.clientId)).then((data) => {
	const promises = [];
	for (const command of data) {
		const deleteUrl = `${Routes.applicationCommands(config.clientId)}/${
			command.id
		}`;
		promises.push(
			(async () => {
				return rest
					.delete(deleteUrl)
					.then(() => console.log(`Deleting ${command.name}.`));
			})()
		);
	}
	return Promise.all(promises);
}).then(
	() => console.log("Successfully deleted all commands.")
);
