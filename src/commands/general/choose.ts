import { SlashCommandBuilder } from "@discordjs/builders";
import { MGEmbed } from "../../lib/flavoured";
import MGStatus from "../../lib/statuses";
import MGCommand from "../../types/command";

const choose: MGCommand = {
  data: new SlashCommandBuilder()
    .setName("choose")
    .setDescription("Choose a random item from a list of items!")
    .addStringOption((option) =>
      option
        .setName("choice_list")
        .setDescription(
          "list of possible choices separated by discriminator (default set as space)"
        )
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("discriminator")
        .setDescription(
          "string used to denote the end of a choice (default set as space)"
        )
        .setRequired(false)
    ),

  async execute(interaction) {
    let choices = interaction.options.getString("choice_list");
    let discriminator = interaction.options.getString("discriminator") || " ";
    if (choices == null) {
      choices = "javascript is stupid";
      // because javascript is stupid and it doesnt realise that this value can't even be null
      // but if it's null then javascript hates me :(
    }
    let choice_list = choices.split(discriminator);
    const item = choice_list[Math.floor(Math.random() * choice_list.length)];

    await interaction.reply({
      embeds: [
        MGEmbed(MGStatus.Info)
          .setTitle("Item Chosen:")
          .setDescription(`${item}`),
      ],
    });
  },
};

export default choose;
