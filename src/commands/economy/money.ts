import { SlashCommandBuilder } from "@discordjs/builders";
import type MGCommand from "../../types/command";
import { MGEmbed } from "../../lib/flavoured";
import MGStatus from "../../lib/statuses";
import { MGfirebase } from "../../utils/firebase";

const money: MGCommand = {
  data: new SlashCommandBuilder()
    .setName("money")
    .setDescription("Get more money!!!"),

  async execute(interaction) {
    await MGfirebase.initialisePerson(interaction.user.id);

    let data = MGfirebase.getData(`user/${interaction.user.id}`);
    let toAdd = Math.ceil(Math.random() * 30);
    data.money += toAdd;

    await MGfirebase.setData(`user/${interaction.user.id}`, data);

    const embed = MGEmbed(MGStatus.Success)
      .setTitle("You have successfully earned MaxiCoins!")
      .setDescription("Yay!")
      .addFields(
        { name: "Added:", value: `${toAdd}`, inline: true },
        { name: "Balance:", value: `${data.money}`, inline: true }
      );
    await interaction.reply({ embeds: [embed] });
  },
};

export default money;
