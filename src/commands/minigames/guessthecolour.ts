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

import { SlashCommandBuilder } from "@discordjs/builders";
import {
	ButtonInteraction,
	Message,
	MessageActionRow,
	MessageButton,
	MessageEmbed,
	MessageInteraction,
} from "discord.js";
import cooldownTest from "../../lib/cooldown";
import { MGEmbed } from "../../lib/flavoured";
import MGStatus from "../../lib/statuses";
import withChecks from "../../lib/withs";
import MGCommand from "../../types/command";
import { MGFirebase } from "../../utils/firebase";

export async function changeRating(
	interaction: MessageInteraction | ButtonInteraction,
	won: boolean
) {
	let colourRating = await MGFirebase.getData(
		`user/${interaction.user.id}/minigames/guessthecolour`
	);
	console.log(colourRating);
	let toChange: number;
	if (won) {
		toChange = Math.ceil(colourRating * 0.05 * Math.random() * 3);
		colourRating += toChange;
	} else {
		toChange = -Math.ceil(colourRating * 0.02 * Math.random() * 3);
		colourRating += toChange;
	}
	console.log(colourRating);
	await MGFirebase.setData(
		`user/${interaction.user.id}/minigames/guessthecolour`,
		colourRating
	);
	return toChange;
}

function getRandomColor() {
	var letters = "0123456789ABCDEF";
	var color = "#";
	for (var i = 0; i < 6; i++) {
		color += letters[Math.floor(Math.random() * 16)];
	}
	return color;
}

const guessTheColour: MGCommand = {
	data: new SlashCommandBuilder()
		.setName("guessthecolour")
		.setDescription(
			"With a colour in the embed, choose which button has the right hex value!!"
		),
	async execute(interaction) {
		let colour = getRandomColor();
		let components = new MessageActionRow();
		let correct = Math.round(Math.random() * 3);
		for (let i = 0; i < 4; i++) {
			if (i === correct) {
				components.addComponents([
					new MessageButton()
						.setCustomId(`CORRECT-guessthecolour`)
						.setStyle("PRIMARY")
						.setLabel(colour.toLowerCase()),
				]);
			}
			let button = new MessageButton();
			let newColour = parseInt(colour.slice(1, 7), 16);
			newColour += Math.ceil(Math.random() * 16777215);
			if (newColour > 16777215) newColour -= 16777215;
			let convertedColour = newColour.toString(16);
			button.setStyle("PRIMARY");
			button.setLabel(`#${convertedColour}`);
			button.setCustomId(`${convertedColour}-${i}-guessthecolour`);
			components.addComponents([button]);
		}
		let embed = MGEmbed()
			.setTitle("Guess The Colour!")
			.setFooter("Time given to see colour: 3 seconds")
			.setDescription("<--- Guess embed's colour!")
			.addFields({ name: "User ID:", value: `${interaction.user.id}` })
			.setColor(`#${colour.slice(1, 7)}`);
		await interaction.reply({
			embeds: [embed],
			components: [components],
		});
		setTimeout(async () => {
			let newMessage = await interaction.fetchReply();
			if (
				newMessage.embeds[0].description !==
				"<--- Guess embed's colour!"
			)
				return;
			embed.setFooter("Time is up! You can no longer see the colour!");
			embed.setDescription(
				"The colour has been removed. You still have infinite time to guess it tho..."
			);
			embed.setColor("DARK_BUT_NOT_BLACK");
			await interaction.editReply({
				embeds: [embed],
				components: [components],
			});
		}, 3000);
	},
};

export default guessTheColour;
