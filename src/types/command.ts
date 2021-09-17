import type { CommandInteraction } from "discord.js";
import type {
  SlashCommandBuilder,
  SlashCommandSubcommandsOnlyBuilder,
} from "@discordjs/builders";

export default interface MGCommand {
  data: Partial<SlashCommandBuilder> | SlashCommandSubcommandsOnlyBuilder;
  execute(interaction: CommandInteraction): Promise<void>;
}
