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

import cooldownCheck from "../../lib/checks/cooldown";
import got from "got-cjs";
import { MGEmbed } from "../../lib/flavoured";
import { MGModule } from "../../types/command";
import MGS from "../../lib/statuses";
import { SlashCommandBuilder } from "@discordjs/builders";
import withChecks from "../../lib/checks";
import {
  ButtonInteraction,
  InteractionReplyOptions,
  MessageActionRow,
  MessageButton,
  MessageInteraction,
} from "discord.js";
import { MGFirebase } from "../../lib/firebase";
import { APIButtonComponent } from "discord.js/node_modules/discord-api-types";

type DifficultyT = "easy" | "medium" | "hard";

interface TriviaMultiQn {
  difficulty: DifficultyT;
  question: string;
  choices: string[];
  correct: string;
}

const trivia: MGModule = {
  command: withChecks([cooldownCheck(10)], {
    data: new SlashCommandBuilder()
      .setName("trivia")
      .setDescription("Answer some simple questions correctly for points!")
      .addStringOption((option) =>
        option
          .setName("difficulty")
          .setDescription("difficulty level")
          .setRequired(true)
          .addChoice("easy", "easy")
          .addChoice("medium", "medium")
          .addChoice("hard", "hard")
      ),
    async execute(interaction) {
      const difficulty = interaction.options.getString(
        "difficulty"
      ) as DifficultyT;

      const triv = await getTrivia(difficulty);
      if (triv) {
        triv.choices = triv.choices
          .map((value) => ({ value, sort: Math.random() }))
          .sort((a, b) => a.sort - b.sort)
          .map(({ value }) => value);
      }

      await interaction.reply(mkTriviaMsg(triv, difficulty, 3));
      setTimeout(async () => {
        // prettier-ignore
        const rfoot = (await interaction.fetchReply()).embeds[0].footer?.text;
        if (rfoot == "waiting...") {
          await interaction.editReply(mkTriviaMsg(triv, difficulty, 2));
        }
      }, 8000);
    },
  }),

  events: [
    {
      name: "interactionCreate",
      async execute(interaction) {
        if (!interaction.isButton()) {
          return;
        }

        const idstr = interaction.customId.split("-");
        const msg = interaction.message;
        if (idstr[0] == "trivia") {
          const triv = {
            difficulty: idstr[1] as DifficultyT,
            question: msg.embeds[0].description!,
            choices: msg.components![0].components.map(
              (b) => (b as APIButtonComponent).label!
            ),
            correct: b64d(idstr[2]),
          };

          if (idstr[2] == idstr[3]) {
            await interaction.update(mkTriviaMsg(triv, triv.difficulty, 0));
            await changeRating(interaction, true, triv.difficulty);
          } else {
            await interaction.update(mkTriviaMsg(triv, triv.difficulty, 1));
            await changeRating(interaction, false, triv.difficulty);
          }
        }
      },
    },
  ],
};

const catmax = 32;
const b64d = (s: string) => Buffer.from(s, "base64").toString();
const b64e = (s: string) => Buffer.from(s, "utf8").toString("base64");

async function getTrivia(
  difficulty: DifficultyT
): Promise<TriviaMultiQn | null> {
  const triviajson: any = await got(
    "https://opentdb.com/api.php?" +
      `amount=1&difficulty=${difficulty}&type=multiple&encode=base64`
  ).json();

  if (triviajson.response_code !== 0) {
    return null;
  }

  return {
    difficulty: b64d(triviajson.results[0].difficulty) as DifficultyT,
    question: b64d(triviajson.results[0].question),
    choices: [b64d(triviajson.results[0].correct_answer)].concat(
      triviajson.results[0].incorrect_answers.map(b64d)
    ),
    correct: b64d(triviajson.results[0].correct_answer),
  };
}

function mkTriviaMsg(
  triv: TriviaMultiQn | null,
  difficulty: DifficultyT,
  status: 0 | 1 | 2 | 3 // 0 = correct, 1 = wrong, 2 = timeout, 3 = initial creation
): InteractionReplyOptions {
  if (triv == null) {
    return {
      embeds: [
        MGEmbed(MGS.Error)
          .setTitle("Trivia time!")
          .setDescription(
            "There was an error while trying to fetch a question."
          )
          .setFooter("error :("),
      ],
    };
  }

  let row = new MessageActionRow();
  for (let i = 0; i < 4; i++) {
    row = row.addComponents(
      new MessageButton()
        .setCustomId(
          `trivia-${difficulty}-${b64e(triv.correct)}-${b64e(triv.choices[i])}`
        )
        .setStyle(
          status == 3
            ? "PRIMARY"
            : triv.choices[i] == triv.correct
              ? "SUCCESS"
              : "DANGER" // prettier-ignore
        )
        .setLabel(triv.choices[i])
        .setDisabled(status == 3 ? false : true)
    );
  }

  return {
    embeds: [
      MGEmbed(status == 3 ? MGS.Info : status == 0 ? MGS.Success : MGS.Error)
        .setTitle(`Trivia time! (difficulty: ${difficulty})`)
        .setDescription(triv.question)
        .setFooter(
          status == 0 ? "correct!" :
          status == 1 ? "wrong :(" :
          status == 2 ? "timeout :(" :
                        "waiting..." // prettier-ignore
        ),
    ],
    components: [row],
  };
}

export async function changeRating(
  interaction: MessageInteraction | ButtonInteraction,
  won: boolean,
  difficulty: DifficultyT
) {
  const rating = await MGFirebase.getData(`user/${interaction.user.id}`);
  let triviaRating = rating.minigames.trivia;
  let toChange: number;
  const difficultyMultiplier =
    difficulty === "easy" ? 0.2 : difficulty === "medium" ? 0.5 : 1;
  if (won) {
    toChange = Math.ceil(
      triviaRating * 0.05 * Math.random() * 3 * difficultyMultiplier
    );
    triviaRating += toChange;
  } else {
    toChange = -Math.ceil(
      triviaRating * 0.02 * Math.random() * 3 * difficultyMultiplier
    );
    triviaRating += toChange;
  }
  await MGFirebase.setData(
    `user/${interaction.user.id}/minigames/trivia`,
    triviaRating
  );
  return toChange;
}

export default trivia;
