import type MyEvent from "../types/event";

const ready: MyEvent = {
  name: "ready",
  once: true,
  execute(client) {
    console.log(`Ready! Logged in as ${client.user.tag}`);
    // client.application.commands.set([])
    // client.guilds.cache.map(guild => guild.commands.set([]));
    console.log(
      client.application.commands.cache.map((command) => command.name)
    );
  },
};

export default ready;
