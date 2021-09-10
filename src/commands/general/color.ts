import { SlashCommandBuilder } from "@discordjs/builders";
import MyCommand from "../../types/command";

const Discord = require("discord.js");
const fibo: MyCommand = {
  data: new SlashCommandBuilder()
    .setName("randcolor")
    .setDescription("Get a random color :D"),
  async execute(interaction) {
    var arr = [
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
    var color = "#";
    for (var i = 0; i < 6; i++) {
      const randomChar = arr[Math.floor(Math.random() * arr.length)];
      //append this hex character to our color code
      color += randomChar;
    }
    const colorEmbed = new Discord.MessageEmbed()
      .setColor(color)
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

export default fibo;
