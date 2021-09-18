/*
 * File: src/commands/economy/coinflip.ts
 * Description:
 */

import { SlashCommandBuilder } from "@discordjs/builders";
import { MGEmbed } from "../../../lib/flavoured";
import MGStatus from "../../../lib/statuses";
import MyCommand from "../../../types/command";
import { MGfirebase } from "../../../utils/firebase";

const Discord = require("discord.js");

function otherOption(name: string) {
  if (name === "heads") return "tails";
  else return "heads";
}

const gamble: MyCommand = {
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
    if (amt === null || option === null) return;

    await MGfirebase.initialisePerson(interaction.user.id); // init firebase

    let data = MGfirebase.getData(`user/${interaction.user.id}`); // get user balance

    if (data["money"] < amt) {
      // not enough mony
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

    // confusing indentation ahead!
    if (
      (option === "heads" && compOption === 1) ||
      (option === "tails" && compOption === 2)
    ) {
      data["money"] += amt;
      MGfirebase.setData(`user/${interaction.user.id}`, data); // update user balance

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
        ],
      });
    } else {
      data["money"] -= amt;
      MGfirebase.setData(`user/${interaction.user.id}`, data);
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
              { name: "Amount earned:", value: `${amt}` }
            ),
        ],
      });
    }
  },
};

export default gamble;
