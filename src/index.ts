import { Bot } from "./bot"; //from ./bot import Bot

let bot = new Bot();
bot
  .listen()
  .then(() => {
    console.log("Logged in!");
  })
  .catch((error) => {
    console.log("Oh no! This is so depressing! ", error);
  });
