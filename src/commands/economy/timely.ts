import { SlashCommandBuilder } from "@discordjs/builders";
import { MGEmbed } from "../../lib/flavoured";
import MGStatus from "../../lib/statuses";
import MyCommand from "../../types/command";
import { MGfirebase } from "../../utils/firebase";

function convertSecondsToDay(n: number) {
  let day = Number(n / (24 * 3600));

  n = n % (24 * 3600);
  let hour = Number(n / 3600);

  n %= 3600;
  let minutes = n / 60;

  n %= 60;
  let seconds = n;

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

const timely: MyCommand = {
  data: new SlashCommandBuilder()
    .setName("timely")
    .setDescription(
      "Time and time again...you'll get to get richer and richer!!!"
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName(`hourly`)
        .setDescription("Claim some $$$ hourly!! (30-60 MaxiCoins every hour)")
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName(`daily`)
        .setDescription("Claim some $$$ daily!! (100-200 MaxiCoins every day)")
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName(`weekly`)
        .setDescription(
          "Claim some $$$ weekly!! (250-500 MaxiCoins every week)"
        )
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName(`monthly`)
        .setDescription(
          "Claim some $$$ monthly!! (1000-2000 MaxiCoins every hour)"
        )
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName(`yearly`)
        .setDescription(
          "Claim some $$$ yearly!! (5000-10000 MaxiCoins every year)"
        )
    ),

  async execute(interaction) {
    let subCommand = interaction.options.getSubcommand();
    let moneyAdd: number;

    if (subCommand === "hourly") moneyAdd = 30 + Math.ceil(Math.random() * 30);
    else if (subCommand === "daily")
      moneyAdd = 50 + Math.ceil(Math.random() * 50);
    else if (subCommand === "weekly")
      moneyAdd = 250 + Math.ceil(Math.random() * 250);
    else if (subCommand === "monthly")
      moneyAdd = 1000 + Math.ceil(Math.random() * 1000);
    else moneyAdd = 5000 + Math.ceil(Math.random() * 5000);

    MGfirebase.initialisePerson(`${interaction.user.id}`);

    let data = MGfirebase.getData(`user/${interaction.user.id}`);

    //lazy
    let interval: number;
    if (subCommand === "hourly") interval = 36000;
    else if (subCommand === "daily") interval = 86400;
    else if (subCommand === "weekly") interval = 604800;
    else if (subCommand === "monthly") interval = 18144100;
    else interval = 220752000;

    if (data["timelyClaims"][subCommand] - interval < Date.now()) {
      data["money"] += moneyAdd;
      data["timelyClaims"][subCommand] = Date.now();
      await MGfirebase.setData(`user/${interaction.user.id}`, data).then(() => {
        console.log(data);
      });
      interaction.reply({
        embeds: [
          MGEmbed(MGStatus.Success)
            .setTitle(`Claimed ${subCommand}!`)
            .setDescription(`Yay! You claimed your ${subCommand}!`)
            .addFields(
              { name: "Added:", value: `${moneyAdd}` },
              { name: "Balance", value: `${data["money"]}` }
            ),
        ],
      });
    } else {
      //still got time left
      interaction.reply({
        embeds: [
          MGEmbed(MGStatus.Error)
            .setTitle(`Cannot claim ${subCommand} yet!`)
            .setDescription(`Be patient :)`)
            .addFields({
              name: "Time left:",
              value: `${convertSecondsToDay(
                Date.now() - data["timelyClaims"][subCommand]
              )}`,
            }),
        ],
      });
    }
  },
};

export default timely;
