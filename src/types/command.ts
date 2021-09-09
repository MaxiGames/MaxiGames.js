import type { CommandInteraction } from "discord.js";
import type { SlashCommandBuilder } from "@discordjs/builders";

export default interface MyCommand {
  data: Partial<SlashCommandBuilder>;
  execute(interaction: CommandInteraction): Promise<void>;
}
