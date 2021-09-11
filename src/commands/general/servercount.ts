import { SlashCommandBuilder } from "@discordjs/builders";
import MyCommand from "../../types/command";

const servercount: MyCommand = {
  data: new SlashCommandBuilder()
    .setName("servercount")
    .setDescription("How many servers is MaxiGames in?"),
  async execute(interaction) {},
};

export default servercount;
