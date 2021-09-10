import { MessageEmbed } from "discord.js";
import * as s from "./statuses";

export const MGEmbed = (stat = s.MGDefault) => {
  switch (stat) {
    case s.MGOk:
      return new MessageEmbed().setColor("#32A852");
    case s.MGError:
      return new MessageEmbed().setColor("#C9242A");
    default:
      return new MessageEmbed().setColor("#F7FF59");
  }
};
