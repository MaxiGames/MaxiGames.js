import { SlashCommandBuilder } from "@discordjs/builders";
import { MGEmbed } from "../../../lib/flavoured";
import MGStatus from "../../../lib/statuses";
import type MGCommand from "../../../types/command";

const current: MGCommand = {
  data: new SlashCommandBuilder()
    .setName("current")
    .setDescription("Get the current date and time"),

  async execute(interaction) {
    const now = new Date();
    const days = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];
    const embed = MGEmbed(MGStatus.Info)
      .setTitle("Current Date and Time")
      .setDescription("Find the current date and time below :D")
      .addFields(
        { name: "Date", value: now.toDateString(), inline: true },
        { name: "Day", value: days[now.getDay()], inline: true },
        {
          name: "Time",
          value: `${now.getHours()}:${now.getMinutes()}:${now.getSeconds()}`,
          inline: true,
        }
      );
    await interaction.reply({ embeds: [embed] });
  },
};

export default current;
