import { SlashCommandBuilder } from "@discordjs/builders";
import { GuildMember } from "discord.js";

import MyCommand from "../../types/command";
import { MGEmbed } from "../../lib/flavoured";
import { MGStatus as s } from "../../lib/statuses";

const whoami: MyCommand = {
  data: new SlashCommandBuilder()
    .setName("whoami")
    .setDescription("Analyse ur statistics! :D"),
  async execute(interaction) {
    const embed = MGEmbed(s.MGInfo)
      .setTitle(
        `You are ${interaction.user.username}#${interaction.user.discriminator} :D`
      )
      .setDescription("What a cool name! :D")
      .addFields(
        {
          name: "Created On:",
          value: `${interaction.user.createdAt}`.replace(
            "(Singapore Standard Time)",
            ""
          ),
        },
        {
          name: "Joined On:",
          value: `${interaction.guild?.joinedAt}`.replace(
            "(Singapore Standard Time)",
            ""
          ),
        }
      )
      .setThumbnail(`${interaction.user.displayAvatarURL()}`)
      .setFooter(`ID: ${interaction.user.id}`);
    if (interaction.member instanceof GuildMember) {
      const roles: string = interaction.member.roles.cache.reduce(
        (previousValue, currentValue) => `${previousValue} ${currentValue}`
      );
      embed.addField("Roles", roles);
    }

    await interaction.reply({ embeds: [embed] });
  },
};

export default whoami;
