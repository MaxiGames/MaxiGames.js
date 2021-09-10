import { SlashCommandBuilder } from "@discordjs/builders";
import { MessageEmbed, GuildMember } from "discord.js";

import MyCommand from "../../types/command";
import { MGEmbed } from "../../lib/flavoured";
import { MGStatus as s } from "../../lib/statuses";

const official: MyCommand = {
  data: new SlashCommandBuilder()
    .setName("official")
    .setDescription("Official Server Invite Link"),
  async execute(interaction) {
    const embed = MGEmbed(s.MGInfo)
      .setTitle("Official Server Invite Link :D")
      .setDescription(
        "[Clicke ye here to join!](https://discord.gg/nGWhxNG2sf)"
      );

    await interaction.reply({ embeds: [embed] });
  },
};

export default official;
