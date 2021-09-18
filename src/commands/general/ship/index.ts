import { SlashCommandBuilder } from "@discordjs/builders";
import { MGEmbed } from "../../../lib/flavoured";
import MGStatus from "../../../lib/statuses";
import MGCommand from "../../../types/command";

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
        .setDescription(
          "First object (Any string, use ASCII characters if possible)"
        )
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("object2")
        .setDescription(
          "Second object (use ASCII characters if possible. Default set as your username)"
        )
        .setRequired(false)
    )
    .addIntegerOption((option) =>
      option
        .setName("leniency")
        .setDescription(
          "Set as any value from 63 to 128. Using 63 results in higher leniency/ship results. [Default 80]"
        )
        .setRequired(false)
    ),

  async execute(interaction) {
    const firstname: string =
      interaction.options.getString("object") || "maxigames";
    const secondname: string =
      interaction.options.getString("object2") || interaction.user.username;
    const leniency: number = interaction.options.getInteger("leniency") || 80;

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
    if (leniency > 128) {
      await interaction.reply({
        content:
          "Your leniency was too high. Set a value from 1 to 128 [80 default]!",
        ephemeral: true,
      });
      return;
    }
    if (leniency < 63) {
      await interaction.reply({
        content:
          "Your leniency was too low. Set a value from 1 to 128 [80 default]!",
        ephemeral: true,
      });
      return;
    }
    let calculated_length = Math.min(secondname.length, firstname.length);
    let length_penalty = Math.sqrt(
      calculated_length / Math.max(secondname.length, firstname.length)
    );

    var dice_rolls = "";
    let percentage = length_penalty * 100;
    for (let i = 0; i < calculated_length; i++) {
      let char_of_1 = firstname[i];
      let char_of_2 = secondname[i];
      let asc1 = char_of_1.codePointAt(0) || 0;
      let asc2 = char_of_2.codePointAt(0) || 0;
      let complementation = (((asc1 + asc2) % 128) + 1) / leniency;
      percentage *= complementation;
    }
    let actual_percentage = percentage;
    actual_percentage = Math.floor(actual_percentage * 1000) / 1000;
    percentage = Math.min(100, Math.floor(percentage));
    percentage = Math.max(1, percentage);

    const embed = MGEmbed(MGStatus.Info)
      .setColor("#00ff00")
      .setTitle(`How well do ${firstname} and ${secondname} ship?`)
      .setDescription(`**${percentage}%**`)
      .addFields(
        {
          name: "Actual Percentage :O",
          value: actual_percentage + "%",
          inline: false,
        },
        { name: "Leniency", value: leniency + " leniency", inline: false }
      );
    await interaction.reply({
      embeds: [embed],
    });
  },
};

export default ship;
