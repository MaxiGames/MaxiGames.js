import { SlashCommandBuilder } from "@discordjs/builders";
import MGCommand from "../../types/command";

const Discord = require("discord.js");
const dice: MGCommand = {
  data: new SlashCommandBuilder()
    .setName("dice")
    .setDescription("Roll some dice :O")
    .addIntegerOption((option) =>
      option
        .setName("sides")
        .setDescription("How many sides does each die have?")
        .setRequired(false)
    )
    .addIntegerOption((option) =>
      option
        .setName("dice_count")
        .setDescription("Number of dice you want to roll!")
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

export default dice;
