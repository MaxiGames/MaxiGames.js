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

/*
 * File: src/commands/economy/coinflip.ts
 * Description:
 */

import { SlashCommandBuilder } from "@discordjs/builders";
import { MGEmbed } from "../../lib/flavoured";
import MGStatus from "../../lib/statuses";
import { MGFirebase } from "../../utils/firebase";
import cooldownTest from "../../lib/cooldown";
import withChecks from "../../lib/withs";

function otherOption(name: boolean) {
	if (name) {
		return "tails";
	} else {
		return "heads";
	}
}

function toBoolean(toBool: int, trueState: int, falseState: int) {
	switch (toBool) {
		case trueState:
			return true;
		
		default:
			return false;
}

const gamble = withChecks([cooldownTest(10)], {
	data: new SlashCommandBuilder()
		.setName("coinflip")
		.setDescription(
			"Would you like to try your luck and see if the coins are in your favour?"
		)
		.addStringOption((option) =>
			option
				.setName("option")
				.setDescription("Will ya bet on Heads or Tails?")
				.setRequired(true)
				.addChoice("heads", "heads")
				.addChoice("tails", "tails")
		)
		.addIntegerOption((option) =>
			option
				.setName("amount")
				.setDescription("How much money are ya going to gamble?")
				.setRequired(true)
		),

	async execute(interaction) {
		const amt = interaction.options.getInteger("amount"); // read bet amt
		const option = interaction.options.getString("option"); // read bet on which coin side
		if (amt === null || option === null) {
			return;
		}

		// init firebase

		const data = await MGFirebase.getData(`user/${interaction.user.id}`); // get user balance
		if (data === undefined) {
			return;
		}
		
		// bad boi no cheat system
		// deduct balance as punishment
		if (amt <= 0) {
			const deduct = Math.ceil(Math.random() * 5);
			data["money"] -= deduct;
			interaction.reply({
				embeds: [
					MGEmbed(MGStatus.Error)
						.setTitle("Stop trying to trick the system, you fool!")
						.setDescription("No negative numbers.")
						.addField("Deducted money:", `${deduct}`),
				],
			});
			MGFirebase.setData(`user/${interaction.user.id}`, data);
			return;
		}

		if (data["money"] < amt) {
			interaction.reply({
				embeds: [
					MGEmbed(MGStatus.Success)
						.setTitle("Oops! Not enough money!!")
						.addFields(
							{ name: "Balance", value: `${data["money"]}` },
							{ name: "Amount required:", value: `${amt}` }
						),
				],
			});
		}

		// true: heads
		// false: tails
		const compOption = toBoolean(Math.ceil(Math.random() * 2), 1, 2);

		// user's option is correct
		if (
			(option === "heads" && compOption) ||
			(option === "tails" && !compOption)
		) {
			data["money"] += amt;
			MGFirebase.setData(`user/${interaction.user.id}`, data); // update user balance

			interaction.reply({
				embeds: [
					MGEmbed(MGStatus.Success)
						.setTitle("You won!")
						.setDescription(
							`You guessed the coin flip right! :) \n It flipped on **${option}**`
						)
						.addFields(
							{ name: "Balance", value: `${data["money"]}` },
							{ name: "Amount earned:", value: `${amt}` }
						),
				],
			});
		} else {
			data["money"] -= amt;
			MGFirebase.setData(`user/${interaction.user.id}`, data);
			interaction.reply({
				embeds: [
					MGEmbed(MGStatus.Success)
						.setTitle("You lost!")
						.setDescription(
							`You guessed the coin flip wrong! :( \n It flipped on **${otherOption( 
								option
							)}**`
						) // i know linter demands this, but having only one argument on a seperate line makes it more unreadable...
						.addFields(
							{ name: "Balance", value: `${data["money"]}` },
							{ name: "Amount lost:", value: `${amt}` }
						),
				],
			});
		}
	},
});

export default gamble;
