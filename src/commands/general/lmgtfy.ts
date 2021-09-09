import { SlashCommandBuilder } from "@discordjs/builders";
import { MessageEmbed } from "discord.js";
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
      const embed = new MessageEmbed()
        .setColor("#57F287")
        .setTitle(`${searchstr}?`)
        .setDescription(`[Find ye answer](https://www.google.com)`);

      await interaction.reply({ embeds: [embed] });
    }

    if (searchstr.length > 128) {
      await interaction.reply({
        content: "Search string too long; must be less than 128 chars.",
        ephemeral: true,
      });
      return;
    }

    const iie = interaction.options.getBoolean("insult") ? "&iie=1" : "";
    const idiot = interaction.options.getUser("whichidiot");
    const idiotstr = idiot ? `<@${idiot.id}>, ` : "";

    const embed = new MessageEmbed()
      .setColor("#57F287")
      .setTitle(`${searchstr}?`)
      .setDescription(
        `${idiotstr}[Find ye answer](https://lmgtfy.app/?q=${encodeURI(
          searchstr
        )}${iie})`
      );

    await interaction.reply({ embeds: [embed] });
  },
};

export default lmgtfy;
