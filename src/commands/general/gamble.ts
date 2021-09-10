import { SlashCommandBuilder } from "@discordjs/builders";
import MyCommand from "../../types/command";

const Discord = require("discord.js");
const gamble: MyCommand = {
  data: new SlashCommandBuilder()
    .setName("gamble")
    .setDescription("gamble some money :O")
    .addIntegerOption((option) =>
      option
        .setName("amount")
        .setDescription(
          "How much money are you going to gamble :O [default = 5]"
        )
        .setRequired(false)
    ),
  async execute(interaction) {
    const amt: number = interaction.options.getInteger("amount") || 5;
    if (amt < 5) {
      interaction.reply({
        content: "You need to gamble at least 5 :(",
        ephemeral: true,
      });
      return;
    }
    if (amt > 10000) {
      interaction.reply({
        content: "You can't gamble more than 10000 :(",
        ephemeral: true,
      });
      return;
    }
    //check if player has enough money to pay for what they are gambling

    //waiting for firebase to be implemented, so all firebase-related code below will be commented out.

    let bot_roll = Math.ceil(Math.random() * 12);
    if (bot_roll < 3) {
      bot_roll = Math.ceil(Math.random() * 12);
    }
    let player_roll = Math.ceil(Math.random() * 12);
    if (player_roll > bot_roll) {
      let gain = ((player_roll - bot_roll) / bot_roll) * 1.5;
      gain *= amt;
      gain = Math.ceil(gain);
      //interaction.author["balance"] += gain;
      const Embed = new Discord.MessageEmbed()
        .setColor("#00ff00")
        .setTitle(
          `You won! You rolled ${player_roll} and the bot rolled ${bot_roll}`
        )
        .setDescription(`You bet ${amt} money and won ${gain} money!`);
      await interaction.reply({
        embeds: [Embed],
      });
    } else if (player_roll < bot_roll) {
      //interaction.author["balance"] -= amt;
      const Embed = new Discord.MessageEmbed()
        .setColor("#ff0000")
        .setTitle(
          `You lost! You rolled ${player_roll} and the bot rolled ${bot_roll}`
        )
        .setDescription(`You bet ${amt} money and lost all of it!`);
      await interaction.reply({
        embeds: [Embed],
      });
    } else {
      const Embed = new Discord.MessageEmbed()
        .setColor("#ffff00")
        .setTitle(
          `You drawed! You rolled ${player_roll} and the bot also rolled ${bot_roll}`
        )
        .setDescription(
          `You bet ${amt} money and didn't gain or lose any money!`
        );
      await interaction.reply({
        embeds: [Embed],
      });
    }
    // HUGE DISCLAIMER: I HAVE NO IDEA IF THIS SYSTEM FOR HOW MUCH MONEY YOU WIN
    // IS BALANCED. IT COULD MEAN YOU WIN A LOT OF MONEY, OR IT COULD MEAN
    // YOU LOSE A LOT OF MONEY. I WILL CHECK THO.
  },
};

export default gamble;
