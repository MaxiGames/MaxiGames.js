import { SlashCommandBuilder } from "@discordjs/builders";
import { MessageEmbed, GuildMember } from "discord.js";
import MyCommand from "../../types/command";

const official: MyCommand = {
  data: new SlashCommandBuilder()
    .setName("official")
    .setDescription("Official Server Invite Link"),
  async execute(interaction) {
    const embed = new MessageEmbed()
      .setColor("#57F287")
      .setTitle(`Official Server Invite Link :D`)
      .setDescription("https://discord.gg/nGWhxNG2sf");

    await interaction.reply({ embeds: [embed] });
  },
};

export default official;
