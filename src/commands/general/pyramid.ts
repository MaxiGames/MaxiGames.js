import { SlashCommandBuilder } from "@discordjs/builders";
import { MGEmbed } from "../../lib/flavoured";
import MGStatus from "../../lib/statuses";
import MGCommand from "../../types/command";

const pyramid: MGCommand = {
  data: new SlashCommandBuilder()
    .setName("pyramid")
    .setDescription("Print a pyramid")
    .addIntegerOption((option) =>
      option
        .setName("height")
        .setDescription("Height of pyramid")
        .setRequired(true)
    ),

  async execute(interaction) {
    // RePLiCate a string c n times
    function rplc(c: string, n: number) {
      let r: string = "";
      for (let i = 0; i < n; i++) {
        r += c;
      }
      return r;
    }

    const height: number = interaction.options.getInteger("height")!;

    // ¡C°NSTRÜCT LE PYRÁMÏD!
    let pyr = "```";
    for (let i = 1; i <= height; i++) {
      pyr += rplc(" ", height - i);
      pyr += rplc("*", 2 * i - 1);
      pyr += "\n";
    }
    pyr += "```";

    const embed = MGEmbed().setTitle("Pyramid!").setDescription(pyr);

    await interaction.reply({ embeds: [embed] });
  },
};

export default pyramid;
