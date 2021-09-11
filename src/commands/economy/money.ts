import { SlashCommandBuilder } from "@discordjs/builders";
import type MyCommand from "../../types/command";

const current: MyCommand = {
  data: new SlashCommandBuilder()
    .setName("dad")
    .setDescription("Get the current date and time"),

  async execute(interaction) {},
};

export default current;
