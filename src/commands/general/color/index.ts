import { SlashCommandBuilder } from "@discordjs/builders";
import MGCommand from "../../../types/command";
import { ColorResolvable, MessageEmbed } from "discord.js";

const color: MGCommand = {
  data: new SlashCommandBuilder()
    .setName("randcolor")
    .setDescription("Get a random color :D"),
  async execute(interaction) {
    const arr = [
      "0",
      "1",
      "2",
      "3",
      "4",
      "5",
      "6",
      "7",
      "8",
      "9",
      "a",
      "b",
      "c",
      "d",
      "e",
      "f",
    ];
    let color = "#";
    for (let i = 0; i < 6; i++) {
      const randomChar = arr[Math.floor(Math.random() * arr.length)];
      //append this hex character to our color code
      color += randomChar;
    }
    const colorEmbed = new MessageEmbed()
      .setColor(color as ColorResolvable)
      .setTitle(`Your random color was: ${color}`);
    await interaction.reply({
      embeds: [colorEmbed],
    });
    // if (love > 1800) {
    //   await interaction.reply({
    //     content: "Ono we only have 1800 love to give ;-;",
    //     ephemeral: true,
    //   });
    // } else if (love < 1) {
    //   await interaction.reply({
    //     content: "No hate! >:(",
    //     ephemeral: true,
    //   });
    // } else {
    //   await interaction.reply(`Hall${"o".repeat(love)} ${name}!!!`);
    // }
  },
};

export default color;
