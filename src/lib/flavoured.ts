import { MessageEmbed } from "discord.js";
import MGStatus from "./statuses";
import COLOR_PALETTE from "./colors";

export function MGEmbed(stat: MGStatus = MGStatus.Default): MessageEmbed {
  return new MessageEmbed().setColor(COLOR_PALETTE[stat]);
}
