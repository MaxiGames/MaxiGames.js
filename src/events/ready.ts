import type MyEvent from "../types/event";

const ready: MyEvent = {
  name: "ready",
  once: true,
  execute(client) {
    console.log(`Ready! Logged in as ${client.user?.tag}`);
  },
};

export default ready;
