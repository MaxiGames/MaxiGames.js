import { SlashCommandBuilder } from "@discordjs/builders";
import MGCommand from "../../types/command";

const Discord = require("discord.js");
const kawaii: MGCommand = {
  data: new SlashCommandBuilder()
    .setName("kawaii")
    .setDescription("Turns your message into something cute! OwO")
    .addStringOption((option) =>
      option
        .setName("message")
        .setDescription("Your message to be kawaii-ified")
        .setRequired(true)
    ),
  async execute(interaction) {
    const msg: string =
      interaction.options.getString("message") || "Invalid :(";
    if (msg.length > 2000) {
      const Embed = new Discord.MessageEmbed()
        .setColor("#ff0000")
        .setTitle("Your message is too long! Try a shorter one.");
      await interaction.reply({
        embeds: [Embed],
        ephemeral: true,
      });
      return;
    }
    let message_1 = msg;
    let message_2 = msg.replace("ss", "s");
    let message_2_storage = message_2;
    while (message_1 != message_2) {
      message_2_storage = message_2;
      message_2 = message_2.replace("ss", "s");
      message_1 = message_2_storage;
    }

    message_2 = message_2
      .replace("sh", "s")
      .replace("s", "sh")
      .replace("nine", "9")
      .replace("one", "1")
      .replace("for", "4")
      .replace("rr", "ww");
    const Embed = new Discord.MessageEmbed()
      .setColor("#00ff00")
      .setTitle(`Your kawaii-ified message: `)
      .setDescription(`${message_2}`);
    await interaction.reply({
      embeds: [Embed],
    });
  },
};

export default kawaii;
