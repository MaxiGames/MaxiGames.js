import type MGEvent from "../types/event";
import { Client } from "discord.js";

const ready: MGEvent = {
  name: "ready",
  once: true,
  execute(client) {
    if (client.user === null) return;
    console.log(`Ready! Logged in as ${client.user.tag}`);
    // client.application.commands.set([])
    // client.guilds.cache.map(guild => guild.commands.set([]));
    // console.log(
    //   client.application.commands.cache.map((command) => command.name)
    // );
  },
};

export default ready;
