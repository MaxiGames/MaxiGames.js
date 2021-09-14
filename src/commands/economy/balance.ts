import { SlashCommandBuilder } from "@discordjs/builders";
import type MyCommand from "../../types/command";
import { MGEmbed } from "../../lib/flavoured";
import MGStatus from "../../lib/statuses";
import { MGfirebase } from "../../utils/firebase";

const balance: MyCommand = {
  data: new SlashCommandBuilder()
    .setName("balance")
    .setDescription("Check your balance? Do you have money to spare? :D")
    .addUserOption((option) =>
      option
        .setName("user")
        .setDescription(
          "You can use this option to check another users' balance"
        )
        .setRequired(false)
    ),

  async execute(interaction) {
    await MGfirebase.initialisePerson(interaction.user.id);

    let user = interaction.options.getUser("user");
    if (user === null) user = interaction.user;
    let data = MGfirebase.getData(`user/${interaction.user.id}`);

    const embed = MGEmbed(MGStatus.Info)
      .setTitle("Balance!")
      .setDescription(`${user.username} #${user.discriminator}'s balance`)
      .addFields({ name: "Balance", value: `${data.money} MaxiCoins` });
    await interaction.reply({ embeds: [embed] });
  },
};

export default balance;
