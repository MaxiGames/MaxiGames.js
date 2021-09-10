import type { Client } from "discord.js";

export default interface MGEvent {
  name: string;
  once: boolean;
  execute(client: Client): void;
}
