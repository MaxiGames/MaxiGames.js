import { SlashCommandBuilder } from "@discordjs/builders";
import { MGEmbed } from "../../lib/flavoured";
import MGStatus from "../../lib/statuses";
import MyCommand from "../../types/command";
import { MGfirebase } from "../../utils/firebase";

const gamble: MyCommand = {
  data: new SlashCommandBuilder()
    .setName("share")
    .setDescription(
      "Be kind! Share your money with another member of the server! :D"
    )
    .addUserOption((option) =>
      option
        .setName("user")
        .setDescription("Who do you want to share your money to?")
        .setRequired(true)
    )
    .addIntegerOption((option) =>
      option
        .setName("amount")
        .setDescription("How much money are you going to share?")
        .setRequired(true)
    ),

  async execute(interaction) {
    const amt = interaction.options.getInteger("amount");
    const usr = interaction.options.getUser("user");

    if (amt === null || usr === null) return;

    await MGfirebase.initialisePerson(interaction.user.id);
    await MGfirebase.initialisePerson(usr.id);

    let data = MGfirebase.getData(`user/${interaction.user.id}`);

    if (data["money"] < amt) {
      interaction.reply({
        embeds: [
          MGEmbed(MGStatus.Error)
            .setTitle("Not enough money!!")
            .addFields(
              { name: "Balance", value: `${data["money"]}` },
              { name: "Amount required:", value: `${amt}` }
            ),
        ],
      });
      return;
    }

    if (usr.id === interaction.user.id) {
      interaction.reply({
        embeds: [
          MGEmbed(MGStatus.Error)
            .setTitle("Cannot share to yourself >:(!")
            .setDescription("Stop trying to exploit the system!!!!"),
        ],
      });
      return;
    }

    let otherUserData = MGfirebase.getData(`user/${usr.id}`);
    data["money"] -= amt;
    otherUserData["money"] += amt;
    MGfirebase.setData(`user/${usr.id}`, otherUserData);
    MGfirebase.setData(`user/${interaction.user.id}`, data);

    interaction.reply({
      embeds: [
        MGEmbed(MGStatus.Success)
          .setTitle("Success!")
          .setDescription(
            `Thanks for the donation, I\'m sure <@!${usr.id}> will appreciate it! `
          )
          .addFields(
            { name: "Shared:", value: `${amt}`, inline: false },
            { name: "Your balance:", value: `${data["money"]}`, inline: false },
            {
              name: `${usr.username}'s' balance`,
              value: `${otherUserData["money"]}`,
              inline: false,
            }
          ),
      ],
    });
  },
};

export default gamble;
