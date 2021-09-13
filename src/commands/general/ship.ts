import { SlashCommandBuilder } from "@discordjs/builders";
import { MGEmbed } from "../../lib/flavoured";
import MGStatus from "../../lib/statuses";
import MGCommand from "../../types/command";

const Discord = require("discord.js");
const ship: MGCommand = {
  data: new SlashCommandBuilder()
    .setName("ship")
    .setDescription(
      "Test your relationship :O [Gives a percentage based on how well two strings complement each other]"
    )
    .addStringOption((option) =>
      option
        .setName("object")
        .setDescription("First object (Any string)")
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("object2")
        .setDescription(
          "Second object (if left blank, default set as your username)"
        )
        .setRequired(false)
    ),
  async execute(interaction) {
    const firstname: string =
      interaction.options.getString("object") || "maxigames";
    const secondname: string =
      interaction.options.getString("object2") || interaction.user.username;
    if (firstname.length > 1000) {
      await interaction.reply({
        content: "Your first name was too long! Try something shorter!",
        ephemeral: true,
      });
      return;
    }
    if (secondname.length > 1000) {
      await interaction.reply({
        content: "Your second name was too long! Try something shorter!",
        ephemeral: true,
      });
      return;
    }
    let calculated_length = Math.min(secondname.length, firstname.length);
    let length_penalty =
      calculated_length / Math.max(secondname.length, firstname.length);
    var dice_rolls = "";
    let percentage = length_penalty * 100;
    for (let i = 0; i < calculated_length; i++) {
      let char_of_1 = firstname[i];
      let char_of_2 = secondname[i];
      let asc1 = char_of_1.codePointAt(0) || 0;
      let asc2 = char_of_2.codePointAt(0) || 0;
      let complementation = (((asc1 + asc2) % 128) + 1) / 100;
      percentage *= complementation;
    }
    percentage = Math.min(100, Math.floor(percentage));

    const Embed = new Discord.MessageEmbed()
      .setColor("#00ff00")
      .setTitle(`How well do ${firstname} and ${secondname} ship?`)
      .setDescription(`**${percentage}%**`);
    await interaction.reply({
      embeds: [Embed],
    });
  },
};

export default ship;
