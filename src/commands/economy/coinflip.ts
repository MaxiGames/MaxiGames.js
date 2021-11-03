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
 * Description: Code for coinflip command
 */

import { SlashCommandBuilder } from "@discordjs/builders";
import { MGEmbed } from "../../lib/flavoured";
import MGStatus from "../../lib/statuses";
import { MGFirebase } from "../../lib/firebase";
import cooldownTest from "../../lib/checks/cooldown";
import withChecks from "../../lib/checks";

function otherOption(name: string) {
	if (name === "heads") {
		return "tails";
	} else {
		return "heads";
	}
}


const jackpot = 1000; // jackpot value in MaxiCoins


const gamble = withChecks([cooldownTest(10)], {
	data: new SlashCommandBuilder()
		.setName("coinflip")
		.setDescription(
			"Would you like to try your luck and see if the coins are in your favour?"
		)
		.addStringOption((option) =>
			option
				.setName("option")
				.setDescription("Heads or Tails?")
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

		const compOption = Math.ceil(Math.random() * 2);
		const coinOnSide = Math.ceil(Math.random() * 1000) > 999 ? true : false; // if coinSide is true, this will override normal coinflip

		// user's option is correct...
		if (
			(
				(option === "heads" && compOption === 1) || // user's choice matches rng?
				(option === "tails" && compOption === 2)	// ^
			) &&
			!(coinOnSide) // AND the coin is not on its side
		) {
			data["money"] += amt;
			MGFirebase.setData(`user/${interaction.user.id}`, data); // update user balance

			interaction.reply({
				embeds: [
					MGEmbed(MGStatus.Success)
						.setTitle("You won!")
						.setDescription(
							`You guessed the coin flip right! :) it flipped on **${option}**`
						)
						.addFields(
							{ name: "Balance", value: `${data["money"]}` },
							{ name: "Amount earned:", value: `${amt}` }
						),
				]
			});
		} else if (
			coinOnSide
		) {
			// user's choice DOES NOT match rng
			// BUT coin is  on side
			// jackpot :D
			data["money"] += jackpot; // jackpot amt (change line 40)
			MGFirebase.setData(`user/${interaction.user.id}`, data);
			
			interaction.reply({
				embeds: [
					MGEmbed(MGStatus.Success)
						.setTitle("JACKPOT!")
						.setDescription(
							`The coin landed on its side :O You win ${jackpot}`
						)
						.addFields(
							{ name: "Balance", value: `${data["money"]}` },
							{ name: "Amount earned:", value: `${jackpot}` }
						)
				]
			});
		} else {
			// user's choice DOES NOT match rng...
			// BUT the coin is not on the side D:
			// you lost the bet :(
			data["money"] -= amt;
			MGFirebase.setData(`user/${interaction.user.id}`, data);
			interaction.reply({
				embeds: [
					MGEmbed(MGStatus.Success)
						.setTitle("You lost!")
						.setDescription(
							`You guessed the coin flip wrong! :( it flipped on **${otherOption(
								option
							)}**`
						)
						.addFields(
							{ name: "Balance", value: `${data["money"]}` },
							{ name: "Amount lost:", value: `${amt}` }
						)
				]
			});
		}
	},
});

export default gamble;
