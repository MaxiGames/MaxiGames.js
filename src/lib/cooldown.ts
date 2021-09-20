/*
 * This file is part of the MaxiGames.js bot.
 * Copyright (C) 2021  the MaxiGames dev team
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation, either version 3 of the
 * License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

import { CommandInteraction } from "discord.js";
import { MGfirebase } from "../utils/firebase";
import { MGEmbed } from "./flavoured";
import MGCommand from "../types/command";
import MGStatus from "./statuses";

function convertSecondsToDay(n: number) {
  let day = Math.floor(n / (24 * 60 * 60));
  n -= day * 24 * 60 * 60;

  let hour = Math.floor(n / (60 * 60));
  n -= hour * 60 * 60;

  let minutes = Math.floor(n / 60);
  n -= minutes * 60;

  let seconds = Math.floor(n);

  return (
    day +
    " " +
    "days " +
    hour +
    " " +
    "hours " +
    minutes.toFixed() +
    " " +
    "minutes " +
    seconds.toFixed() +
    " " +
    "seconds "
  );
}

function givecooldown(
  command: MGCommand,
  cooldown: number,
  validator: (interaction: CommandInteraction) => boolean = (_) => false
): MGCommand {
  return {
    data: command.data,
    async execute(interaction: CommandInteraction) {
      MGfirebase.initialisePerson(interaction.user.id);
      let data = MGfirebase.getData(`user/${interaction.user.id}`);
      let lastDate = data["cooldowns"][command.data.name!];
      let date = Math.ceil(new Date().getTime() / 1000);

      if (lastDate + cooldown < date || validator(interaction)) {
        data["cooldowns"][command.data.name!] = Math.ceil(
          new Date().getTime() / 1000
        );
        await MGfirebase.setData(`user/${interaction.user.id}`, data);
        await command.execute(interaction); // Execute original
      } else {
        console.log(lastDate);
        console.log(cooldown);
        console.log(date);
        await interaction.reply({
          embeds: [
            MGEmbed(MGStatus.Error)
              .setTitle(`The command ${command.data.name} is on cooldown!`)
              .setDescription("Be patient :)")
              .addField(
                "Time left",
                `${convertSecondsToDay(lastDate + cooldown - date)}`
              ),
          ],
        });
      }
    },
  };
}

export default givecooldown;
