import { MessageEmbed } from "discord.js";
import { MGStatus as s } from "./statuses";
import COLOR_PALETTE from "./colors";

export const MGEmbed = (stat: s = s.MGDefault) =>
  new MessageEmbed().setColor(COLOR_PALETTE[stat]);
