import { SlashCommandBuilder } from "@discordjs/builders";
import MGCommand from "../../types/command";

const Discord = require("discord.js");
const ship: MGCommand = {
  data: new SlashCommandBuilder()
    .setName("ship")
    .setDescription("Test your relationship :O [Gives a percentage based on how well two strings complement each other]")
    .addIntegerOption((option) =>
      option
        .setName("object")
        .setDescription("First object (Any string)")
        .setRequired(true)
    )
    .addIntegerOption((option) =>
      option
        .setName("object2")
        .setDescription("Second object (if left blank, default set as your username)")
        .setRequired(false)
    ),
  async execute(interaction) {
    const sides: number = interaction.options.getInteger("sides") || 6;
    const dice: number = interaction.options.getInteger("dice_count") || 1;
    if (dice > 200) {
      await interaction.reply({
        content: "Maxigames doesn't own that many dice :(",
        ephemeral: true,
      });
      return;
    }
    if (sides > 1000) {
      await interaction.reply({
        content: "Maxigames doesn't have dice with that many sides :(",
        ephemeral: true,
      });
      return;
    }
    if (dice < 1) {
      await interaction.reply({
        content: ":thinking: Maxigames won't do that.",
        ephemeral: true,
      });
      return;
    }
    if (sides < 2) {
      await interaction.reply({
        content: "Dice can't have that many sides :(",
        ephemeral: true,
      });
      return;
    }
    var dice_rolls = "";
    for (var i = 0; i < dice; i++) {
      const die_roll = Math.ceil(Math.random() * sides);
      dice_rolls += die_roll;
      dice_rolls += " ";
    }
    const Embed = new Discord.MessageEmbed()
      .setColor("#00ff00")
      .setTitle(`Dice roll results for ${dice} dice with ${sides} sides:`)
      .setDescription(`${dice_rolls}`);
    await interaction.reply({
      embeds: [Embed],
    });
  },
};

export default ship;
