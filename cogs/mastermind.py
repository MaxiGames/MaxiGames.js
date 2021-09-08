import discord
from discord.ext import commands
from discord.ext.commands import cooldown, BucketType
import random
import asyncio
from firebase_admin import firestore
import os
import copy
from utils import check
import asyncio


class Mastermind(commands.Cog):
    def __init__(self, client):
        self.client = client
        self.db = firestore.client()
        self.init = self.client.get_cog("Init")
        self.hidden = False

    @commands.command(
        name="mastermind",
        help="Play a game of mastermind, a fun and interactive code-breaking game! Codes are auto-generated randomly. If you don't know how the game works, check out\n**https://en.wikipedia.org/wiki/Mastermind**! (Rewards the more money the lesser guesses it takes you to solve it)",
        usage="",
        aliases=["mm"],
    )
    @cooldown(1, 30, BucketType.user)
    async def mastermind(self, ctx):
        self.init = self.client.get_cog("Init")
        player = ctx.author.id
        player_name = ctx.author
        this_channel = ctx.channel.id
        code = []
        colors = [
            "red",
            "green",
            "blue",
            "purple",
            "brown",
            "white",
            "yellow",
            "orange",
        ]
        board = "|:negative_squared_cross_mark: :negative_squared_cross_mark: :negative_squared_cross_mark: :negative_squared_cross_mark: :question::question::question::question: :negative_squared_cross_mark: :negative_squared_cross_mark: :negative_squared_cross_mark: :negative_squared_cross_mark:|"

        prev_boards = []
        set_of_code = [1, 2, 3, 4, 5, 6, 7, 8]
        emojies = [
            ":one:",
            ":two:",
            ":three:",
            ":four:",
            ":five:",
            ":six:",
            ":seven:",
            ":eight:",
        ]
        for i in range(4):
            elem = random.choice(set_of_code)
            code.append(elem)
            set_of_code.remove(elem)
        message = board

        embed = discord.Embed(
            title=str(player_name) + "'s mastermind game\n12 guesses left",
            description=message,
            color=self.client.primary_colour,
        )
        embed.add_field(
            name="Tip:",
            value="Guess using 4 space-separated integers from 1 to 8!",
            inline=True,
        )
        await ctx.reply(embed=embed, user_mention=False)

        def check(ctx):
            return ctx.author.id == player and this_channel == ctx.channel.id

        guess = ctx
        guesses = 0
        invalidTries = 0
        while True:
            if invalidTries == 4:
                await ctx.reply(
                    embed=discord.Embed(title="You have almost reached the maximum number of invalid tries.")
                )
            elif invalidTries == 5:
                await ctx.reply(
                    embed = discord.Embed(title="You have reached the maximum number of invalid tries. The game has been aborted (This is to prevent spam).")
                )
                return
            if guesses > 11:
                embed = discord.Embed(
                    title="You used up all your guesses :(",
                    description="You lost the game!",
                    color=0xFF0000,
                )
                await guess.reply(embed=embed)
                break

            try:
                guess = await self.client.wait_for("message", timeout=90, check=check)
                # check if message contains 4 space-separated
                # integers between 1 and 8
                if (
                    guess.content.lower() == "exit"
                    or guess.content.lower() == "exitgame"
                ):
                    embed = discord.Embed(
                        title="Mastermind game aborted.", description="", color=0xFF0000
                    )
                    await guess.reply(embed=embed)
                    return
                choices = guess.content.split(" ")
                transfer = True
                if len(choices) == 4:
                    try:
                        ok = 1
                        for i in range(4):
                            choices[i] = int(choices[i])
                            transfer = choices[i] >= 1 and choices[i] <= 8
                            if not transfer:
                                embed = discord.Embed(
                                    title="That is not a valid guess! Use integers from 1 to 8!",
                                    description="",
                                    color=0xFF0000,
                                )
                                await guess.reply(embed=embed)
                                ok = 0
                                invalidTries += 1
                                break
                        if ok == 0:
                            continue

                    except ValueError:
                        embed = discord.Embed(
                            title="You need to enter space-separated integers between 1 and 8.",
                            description="",
                            color=0xFF0000,
                        )
                        await guess.reply(embed=embed)
                        invalidTries += 1
                        continue

                else:
                    embed = discord.Embed(
                        title="You did not enter the right number of arguments for a guess!",
                        description="You need to input 4 space-separated integers between 1 and 8!",
                        color=0xFF0000,
                    )
                    await guess.reply(embed=embed)
                    invalidTries += 1
                    continue
                if transfer:
                    guesses += 1
                    reds = 0
                    whites = 0
                    guess_string = ""
                    for g in range(4):
                        guess_string += emojies[int(choices[g]) - 1]
                        guess_string += " "
                        ref = ["n", "n", "n", "n"]
                        for g in range(4):
                            for j in range(4):
                                if choices[g] == code[j]:
                                    if g == j:
                                        ref[j] = "r"

                                    else:
                                        if ref[j] != "r":
                                            ref[j] = "w"
                    for col in ref:
                        if col == "r":
                            reds += 1
                        elif col == "w":
                            whites += 1
                    prelimreds = ""

                    for c in range(reds):
                        prelimreds += ":red_square: "
                    for c in range(4 - reds):
                        prelimreds += ":negative_squared_cross_mark: "
                    prelimreds = prelimreds[:-1]
                    prelimreds += "|"
                    prelimwhites = "|"
                    for c in range(4 - whites):
                        prelimwhites += ":negative_squared_cross_mark: "
                    for c in range(whites):
                        prelimwhites += ":white_large_square: "

                    prev_boards.append(prelimwhites + guess_string + prelimreds)

            except asyncio.TimeoutError:
                embed = discord.Embed(
                    title="You took too long to respond!",
                    description="Time out!",
                    color=0xFF0000,
                )
                await guess.reply(embed=embed)
                break

            message = ""
            for i in prev_boards:
                message += i
                message += "\n"
            if guesses != 11:
                embed = discord.Embed(
                    title=str(player_name)
                    + "'s mastermind game\n"
                    + str(12 - guesses)
                    + " guesses left",
                    description=message + board,
                    color=self.client.primary_colour,
                )
            else:
                embed = discord.Embed(
                    title=str(player_name)
                    + "'s mastermind game\n"
                    + str(12 - guesses)
                    + " guess left",
                    description=message + board,
                    color=self.client.primary_colour,
                )

            await guess.reply(embed=embed)
            correct_guess = True
            for i in range(4):
                if int(choices[i]) != code[i]:
                    correct_guess = False
                    break
            if correct_guess:
                self.init = self.client.get_cog("Init")
                await self.init.checkserver(ctx)
                doc_ref = self.db.collection("users").document(
                    "{}".format(str(ctx.author.id))
                )
                doc = doc_ref.get()
                if doc.exists:
                    dict1 = doc.to_dict()
                    dict1["money"] = dict1["money"] + (13 - guesses)
                    money_now = dict1["money"]
                    doc_ref.set(dict1)

                    embed = discord.Embed(
                        title="You won the game!",
                        description="You guessed the code! The answer was: "
                        + str(guess.content)
                        + "!\nYou earned "
                        + str(13 - guesses)
                        + " money and you now have "
                        + str(money_now)
                        + " money!",
                        color=self.client.primary_colour,
                    )

                else:
                    embed = discord.Embed(
                        title="Hey, it looks like you don't have an account yet!",
                        description="Initiate your account with ```m!money```",
                        color=0xFF0000,
                    )
                await guess.reply(embed=embed)
                break


def setup(client):
    client.add_cog(Mastermind(client))
