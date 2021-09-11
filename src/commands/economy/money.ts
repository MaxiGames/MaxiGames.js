import { SlashCommandBuilder } from "@discordjs/builders";
import type MGCommand from "../../types/command";
import * as admin from "firebase-admin";
import { MGEmbed } from "../../lib/flavoured";
import MGStatus from "../../lib/statuses";

const money: MGCommand = {
  data: new SlashCommandBuilder()
    .setName("money")
    .setDescription("Get more money!!!"),

  async execute(interaction) {
    let ref = admin.database().ref(`/users/${interaction.user.id}`);
    ref.get().then((snapshot) => {
      let data = snapshot.val();
      if (snapshot.exists() === false || "money"! in data) {
        data = { money: 0 };
      }
      let toAdd = Math.ceil((Math.random() + 1) * 30);
      data["money"] += toAdd;
      ref.set(data).then(() => {
        interaction.reply({
          embeds: [
            MGEmbed(MGStatus.Success)
              .setTitle("You have successfully earned MaxiCoins!")
              .setFields(
                { name: "Amount earned", value: `${toAdd}` },
                { name: "Amount in bank", value: `${data["money"]}` }
              ),
          ],
        });
      });
    });
  },
};

export default money;
