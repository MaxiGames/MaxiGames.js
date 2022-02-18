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
import commandLog from "../../lib/comamndlog";

function otherOption(name: string) {
	if (name === "heads") {
		return "tails";
	} else {
		return "heads";
	}
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
			commandLog(
				"coinflip",
				`${interaction.user.id}`,
				`Tried to trick the system!, Deducted: ${deduct}`
			);
			await interaction.reply({
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
			commandLog(
				"coinflip",
				`${interaction.user.id}`,
				`Not enough money, balance: ${data["money"]}`
			);
			await interaction.reply({
				embeds: [
					MGEmbed(MGStatus.Success)
						.setTitle("Oops! Not enough money!!")
						.addFields(
							{ name: "Balance", value: `${data["money"]}` },
							{ name: "Amount required:", value: `${amt}` }
						),
				],
			});
			return;
		}

		const jackpot = Math.ceil(Math.random() * 1000) > 998;
		if ({ heads: 1, tails: 2 }[option] === Math.ceil(Math.random() * 2)) {
			data["money"] += amt * (jackpot ? 30 : 1);
			MGFirebase.setData(`user/${interaction.user.id}`, data); // update user balance

			await interaction.reply({
				embeds: [
					MGEmbed(MGStatus.Success)
						.setTitle("You won!")
						.setDescription(
							`You guessed the coin flip right! It landed on **${option}**. ` +
								(jackpot
									? "Lucky you, you also won the jackpot!!!"
									: "")
						)
						.addFields(
							{ name: "Balance", value: `${data["money"]}` },
							{
								name: "Amount earned:",
								value: `${amt * (jackpot ? 30 : 1)}`,
							}
						),
				],
			});
			commandLog(
				"coinflip",
				`${interaction.user.id}`,
				`Coinflipped on the right side, earned ${amt}, balance ${data["money"]}`
			);
		} else {
			data["money"] -= amt;
			MGFirebase.setData(`user/${interaction.user.id}`, data); // update user balance

			await interaction.reply({
				embeds: [
					MGEmbed(MGStatus.Success)
						.setTitle("You lost!")
						.setDescription(
							`You're just bad! It landed on **${option}**.`
						)
						.addFields(
							{ name: "Balance", value: `${data["money"]}` },
							{
								name: "Amount lost:",
								value: `${amt}`,
							}
						),
				],
			});
			commandLog(
				"coinflip",
				`${interaction.user.id}`,
				`Coinflipped on the wrong side, lost ${amt}, balance ${data["money"]}`
			);
		}
	},
});

export default gamble;
