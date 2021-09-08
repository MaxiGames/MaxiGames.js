const { SlashCommandBuilder } = require("@discordjs/builders");

module.exports = {
  data: new SlashCommandBuilder().setName("ping").setDescription("man ping"),
  async execute(interaction) {
    await interaction.reply(
      "69 bytes from localhost (0.0.0.0): icmp_seq=1 ttl=107 time=3.14 ms"
    );
  },
};
