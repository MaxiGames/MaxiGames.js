import { MessageEmbed } from "discord.js";
import MGStatus from "./statuses";
import COLOR_PALETTE from "./colors";

export const MGEmbed = (stat: MGStatus = MGStatus.Default) => {
  return new MessageEmbed().setColor(COLOR_PALETTE[stat]);
};
