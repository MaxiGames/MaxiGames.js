import type { Client } from "discord.js";

export default interface MyEvent {
  name: string;
  once: boolean;
  execute(client: Client): void;
}
