import { SlashCommandBuilder } from "@discordjs/builders";
import MyCommand from "../../types/command";
import { MGEmbed } from "../../lib/flavoured";
import { MGStatus as s } from "../../lib/statuses";
import { Client } from "discord.js";

const servercount: MyCommand = {
  data: new SlashCommandBuilder()
    .setName("servercount")
    .setDescription("How many servers is MaxiGames in?"),
  async execute(interaction) {},
};

export default servercount;
