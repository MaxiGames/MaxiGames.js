import { SlashCommandBuilder } from "@discordjs/builders";
import { MGEmbed } from "../../lib/flavoured";
import MGStatus from "../../lib/statuses";
import MGCommand from "../../types/command";

const official: MGCommand = {
  data: new SlashCommandBuilder()
    .setName("official")
    .setDescription("Official Server Invite Link"),
  async execute(interaction) {
    const embed = MGEmbed(MGStatus.Info)
      .setTitle("Official Server Invite Link :D")
      .setDescription(
        "[Clicke ye here to join!](https://discord.gg/nGWhxNG2sf)"
      );

    await interaction.reply({ embeds: [embed] });
  },
};

export default official;
