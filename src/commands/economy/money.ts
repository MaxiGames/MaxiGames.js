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
    const embed = MGEmbed(MGStatus.Success)
      .setTitle("You have successfully earned MaxiCoins!")
      .setDescription("Yay!")
      .addFields();
    await interaction.reply({ embeds: [embed] });
    await MGfirebase.setData(`user/${interaction.user.id}`, {
      money: 100,
    }).then((value) => {
      console.log(value);
    });
  },
};

export default money;
/*
    const embed = MGEmbed(MGStatus.Info)
      .setTitle("Balance!")
      .setDescription("'s balance")
      .addFields();
    await interaction.reply({ embeds: [embed] });
  },
  */
