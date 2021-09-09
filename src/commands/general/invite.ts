import { SlashCommandBuilder } from "@discordjs/builders";
import MyCommand from "../../types/command";
import { MessageEmbed } from "discord.js";

const invite: MyCommand = {
  data: new SlashCommandBuilder()
    .setName("invite")
    .setDescription("Invite maxigames to your server :D"),
  async execute(interaction) {
    const embed = new MessageEmbed()
      .setTitle("Invite link for Maxigames :D")
      .setDescription(
        "https://discord.com/api/oauth2/authorize?client_id=863419048041381920&permissions=399397481590&scope=bot%20applications.commands"
      )
      .setColor("#009090");
    await interaction.reply({ embeds: [embed] });
  },
};

export default invite;
