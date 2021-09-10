import { SlashCommandBuilder } from "@discordjs/builders";
import { MGEmbed } from "../../lib/flavoured";
import * as s from "../../lib/statuses";
import MyCommand from "../../types/command";

const lmgtfy: MyCommand = {
  data: new SlashCommandBuilder()
    .setName("lmgtfy")
    .setDescription("For people who don't know how to STFW")
    .addStringOption((option) =>
      option
        .setName("searchstring")
        .setDescription("what to search for")
        .setRequired(true)
    )
    .addUserOption((option) =>
      option
        .setName("whichidiot")
        .setDescription("which idiot didn't know how to STFW?")
        .setRequired(false)
    )
    .addBooleanOption((option) =>
      option.setName("bruhmode").setDescription("very bruh").setRequired(false)
    )
    .addBooleanOption((option) =>
      option
        .setName("insult")
        .setDescription(
          "enable the internet explainer; has no effect if bruh mode was activated"
        )
        .setRequired(false)
    ),

  async execute(interaction) {
    let searchstr: string = interaction.options.getString("searchstring")!;

    // the bruh mode
    if (interaction.options.getBoolean("bruhmode")) {
      const embed = MGEmbed()
        .setColor("#57F287")
        .setTitle(`${searchstr}?`)
        .setDescription(`[Find ye answer](https://www.google.com)`);

      await interaction.reply({ embeds: [embed] });
    }

    if (searchstr.length > 128) {
      await interaction.reply({
        embeds: [
          MGEmbed(s.MGError)
            .setTitle(`Search string too long...`)
            .setDescription(
              "search string should be less than or equal to 128 chars"
            ),
        ],
        ephemeral: true,
      });
      return;
    }

    const iie = interaction.options.getBoolean("insult") ? "&iie=1" : "";
    const idiot = interaction.options.getUser("whichidiot");
    const prefixstr = idiot ? `<@${idiot.id}>, [f` : "[F";

    await interaction.reply({
      embeds: [
        MGEmbed()
          .setTitle(`${searchstr}?`)
          .setDescription(
            `${prefixstr}ind ye answer](https://lmgtfy.app/?q=${encodeURI(
              searchstr
            )}${iie}).`
          ),
      ],
    });
  },
};

export default lmgtfy;
