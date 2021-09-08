import discord
from discord.ext import commands
from discord.ext.commands import cooldown, BucketType
import random
import requests
import math
import json
import asyncio
import firebase_admin
from firebase_admin import firestore
from utils.paginator import Paginator
import os
import copy
from utils import check
from utils.leaderboard import leaderboard_generate
from discord_components import Button, ButtonStyle

alpha = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"


class Games(commands.Cog):
    def __init__(self, client):
        self.client = client
        self.init = self.client.get_cog("Init")
        self.db = firestore.client()
        self.hidden = False

    @commands.command(
        name="trivia",
        help="Answer a trivia question using reactions! Provide a number from 1 to 3 specifying the difficulty of the trivia question you want. Note that this is taken from https://opentdb.com/",
        usage="<difficulty>",
        alias=["funfact", "fact"],
    )
    @cooldown(1, 15, BucketType.user)
    async def trivia(self, ctx, difficulty=100000000000):
        self.init = self.client.get_cog("Init")
        word = "hard"
        moneyToAdd = 0
        if difficulty == 1:
            word = "easy"
            moneyToAdd = 2
        elif difficulty == 2:
            word = "medium"
            moneyToAdd = 5
        elif difficulty == 3:
            word = "hard"
            moneyToAdd = 10
        else:
            await ctx.reply(
                embed=discord.Embed(
                    title="Error",
                    description="A difficulty level of 1, 2 or 3 is required! Note that the harder the question is, the more points you will get if you get it right! (Check syntax with help command)",
                    colour=self.client.primary_colour,
                )
            )
            return
        r = {
            "response_code": "value1",
            "results": [
                {
                    "category": "value2",
                    "type": "value3",
                    "difficulty": "value4",
                    "question": "value5",
                    "correct_answer": "value6",
                    "incorrect_answers": "value7",
                }
            ],
        }
        result = json.loads(
            requests.post(
                f"https://opentdb.com/api.php?amount=1&difficulty={word}&type=multiple",
                data=r,
            ).text
        )
        results = result["results"][0]

        arr = results["incorrect_answers"]
        arr.append(str(results["correct_answer"]))
        random.shuffle(arr)
        count = 0
        description = ""
        for i in arr:
            description += f"({count+1}) {i}\n"
            count += 1
        embed = discord.Embed(
            title=f"TRIVIA- You have 10 seconds to answer ({word})",
            description=results["question"]
            .replace("&quot;", '"')
            .replace("&#039;", "'")
            + "\n"
            + description,
            colour=self.client.primary_colour,
        )
        message = await ctx.reply(embed=embed)
        await message.add_reaction("1️⃣")
        await message.add_reaction("2️⃣")
        await message.add_reaction("3️⃣")
        await message.add_reaction("4️⃣")

        def check(reaction, user):
            return user == ctx.author and reaction.message == message

        try:
            reaction, user = await self.client.wait_for(
                "reaction_add", timeout=10.0, check=check
            )
        except asyncio.TimeoutError:
            embed = discord.Embed(
                title="You were too slow! Try again next time.",
                description=" ",
                color=self.client.primary_colour,
            )
            await ctx.reply(embed=embed)

        else:
            index = None
            if reaction.emoji == "1️⃣":
                index = 0
            elif reaction.emoji == "2️⃣":
                index = 1
            elif reaction.emoji == "3️⃣":
                index = 2
            elif reaction.emoji == "4️⃣":
                index = 3
            else:
                return
            ans = arr[index]
            self.init = self.client.get_cog("Init")
            await self.init.checkserver(ctx)
            doc_ref = self.db.collection("users").document(
                "{}".format(str(ctx.author.id))
            )
            doc = doc_ref.get()
            if doc.exists:
                dict1 = doc.to_dict()
                if dict1 == None:
                    dict1 = {}
                if ans == str(results["correct_answer"]):
                    dict1["money"] = dict1["money"] + random.randint(0, moneyToAdd)
                    if "trivia" in dict1.keys():
                        dict1["trivia"] = 0
                    dict1["trivia"] += 1
                    embed = discord.Embed(
                        title="Correct Answer! You win 3 money!",
                        description="You now have " + str(dict1["money"]) + " money!",
                        color=self.client.primary_colour,
                    )
                    await ctx.reply(embed=embed)

                else:

                    dict1["money"] = dict1["money"] - int(
                        random.randint(1, moneyToAdd) // 3
                    )
                    embed = discord.Embed(
                        title="Wrong Answer! You lost 1 money!",
                        description=f"You now have "
                        + str(dict1["money"])
                        + f" money! The correct answer was {results['correct_answer']} :",
                        color=self.client.primary_colour,
                    )
                    await ctx.reply(embed=embed)
                doc_ref.set(dict1)

    @commands.command(
        name="trivialb",
        description="retrieves the trivia leaderboard",
        aliases=["trivialeaderboard", "tlb"],
        usage="",
    )
    @cooldown(1, 10, BucketType.user)
    async def trivia_leaderboard(self, ctx):
        await leaderboard_generate(self, ctx, "trivia")

    @commands.command(
        name="math",
        help="Answer a math question correctly to earn coins. If you don't get it correct you lose coins!",
        usage="",
    )
    @cooldown(1, 15, BucketType.user)
    async def math(self, ctx):
        first = random.randint(1, 100)
        second = random.randint(1, 100)
        operandation = random.randint(1, 100)
        oper = "+"
        bonus = 1
        if operandation < 9:
            oper = "*"
            theanswer = str(first * second)
            timehehe = 8 + (first + second - 69) / 20
            bonus = 4
        elif operandation < 40:
            oper = "-"
            theanswer = str(first - second)
            timehehe = 6 + (first + second - 49) / 30
            bonus = 2
        else:
            timehehe = 4 + (first + second - 69) / 60
            theanswer = str(first + second)
        timehehe = int(timehehe)

        question_ask = "What is " + str(first) + oper + str(second) + "?"

        embed = discord.Embed(
            title=question_ask,
            description="You have "
            + str(timehehe)
            + " seconds to answer! You only have one chance.",
            color=self.client.primary_colour,
        )
        await ctx.reply(embed=embed)

        def check(msg):
            return msg.author == ctx.author and msg.channel == ctx.channel

        try:
            messageanswer = await self.client.wait_for(
                "message", timeout=timehehe, check=check
            )
            msgcontent = messageanswer.content

            self.init = self.client.get_cog("Init")
            await self.init.checkserver(ctx)
            doc_ref = self.db.collection("users").document(
                "{}".format(str(ctx.author.id))
            )
            doc = doc_ref.get()
            dict1 = doc.to_dict()
            if dict1 == None:
                dict1 = {}
            if msgcontent == theanswer:
                added = random.randint(1, 3 * bonus)
                embed = discord.Embed(
                    title="Your answer " + theanswer + " was correct!",
                    description=f"You are veery beeg brain! You earned {added} money",
                    color=self.client.primary_colour,
                )
                dict1["money"] += added
                await ctx.reply(embed=embed)

            else:
                embed = discord.Embed(
                    title="Your answer was wrong! The correct answer was " + theanswer,
                    description=f"Not beeg brain :'( you lost 1 money!",
                    color=self.client.primary_colour,
                )
                dict1["money"] -= 1
                if dict1["money"] < 0:
                    dict1["money"] = 0
                await ctx.reply(embed=embed)
            doc_ref.set(dict1)
        except asyncio.TimeoutError:
            embed = discord.Embed(
                title="You took too long. You math noob.",
                description="How saddening",
                color=self.client.primary_colour,
            )
            await ctx.reply(embed=embed)

    @commands.command(
        name="scramble",
        help="Try to unscramble a series of 5 words and earn coins when you unscramble them! (You may also lose coins if you don't unscramble) Do be warned, it isn't easy...",
        usage="",
        aliases=["unscramble"],
    )
    @cooldown(1, 300, BucketType.user)
    async def scramble(self, ctx):
        wordCount = 5
        chosenWords = []
        correctWords = []
        with open(file=str(os.getcwd()) + "/cogs/word.txt", mode="r") as f:
            wordDict = f.read().split("\n")
            for i in range(wordCount):
                firstWord = list(random.choice(wordDict))
                word = copy.copy(firstWord)
                random.shuffle(firstWord)
                newWord = "".join(word)
                newStartWord = "".join(firstWord)
                chosenWords.append(newStartWord)
                correctWords.append(newWord)
        embed = discord.Embed(
            title="Scrambled words",
            description=f"The words you have to unscramble are: {', '.join(chosenWords)}",
            color=self.client.primary_colour,
        )
        await ctx.reply(embed=embed)
        await ctx.send(
            "You have 45 seconds to unscramble the word. Everytime you send a message and it contains a correct word, the timer will reset. Do note that your balance will only be updated after the game is over."
        )

        # firebase
        def check(msg):
            return msg.author == ctx.author and msg.channel == ctx.channel

        self.init = self.client.get_cog("Init")
        await self.init.checkserver(ctx)
        doc_ref = self.db.collection("users").document("{}".format(str(ctx.author.id)))
        doc = doc_ref.get()
        if doc.exists == False:
            return
        dict1 = doc.to_dict()

        while True:
            try:
                messageanswer = await self.client.wait_for(
                    "message", timeout=45, check=check
                )
                msgcontent = messageanswer.content
                if msgcontent in correctWords:
                    toAdd = len(msgcontent)
                    toAdd = math.floor(toAdd * 3.5)
                    dict1["money"] += toAdd
                    moneynow = dict1["money"]
                    embed = discord.Embed(
                        title="Correct answer",
                        description=f"The word was {msgcontent}, you earned {toAdd} money! You now have {moneynow} money! :D",
                        color=self.client.primary_colour,
                    )
                    await messageanswer.reply(embed=embed)
                    correctWords.remove(msgcontent)
                    if len(correctWords) == 0:
                        embed = discord.Embed(
                            title="You won!",
                            description="You have won the game!",
                            color=self.client.primary_colour,
                        )
                        await messageanswer.reply(embed=embed)
                        break
                else:
                    dict1["money"] -= 1
                    embed = discord.Embed(
                        title="Wrong answer",
                        description="You lost 1 money! Continue guessing.",
                        color=0xFF0000,
                    )
                    await messageanswer.reply(embed=embed)

            except asyncio.TimeoutError:
                lost = random.randint(1, 1 + len(correctWords))
                dict1["money"] -= lost
                embed = discord.Embed(
                    title="Time has run out...",
                    description=f"How saddening, you lost {lost} money, you currently have {dict1['money']}",
                    color=self.client.primary_colour,
                )
                await ctx.reply(embed=embed)
                break
        doc_ref.set(dict1)


def setup(client):
    client.add_cog(Games(client))


def check(msg, ctx):
    return msg.author == ctx.author and msg.channel == ctx.channel
