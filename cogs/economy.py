import discord
import time
from discord.ext import commands
from discord.ext.commands import cooldown, BucketType
from firebase_admin import firestore
from utils import check
import random
import math
import asyncio
from discord_slash import cog_ext
from utils.paginator import Paginator


class Economy(commands.Cog):
    def __init__(self, client):
        self.client = client
        self.db = firestore.client()
        self.init = self.client.get_cog("Init")
        self.hidden = False

    # Curb gambling addiction
    @check.is_banned()
    @commands.command(
        name="coinflip",
        help="provide 2 arguments, the choice of your coin: head/tail, and the amount you want to bet",
        aliases=["cf"],
        usage="<choice> <amount>",
    )
    @cooldown(1, 8, BucketType.user)
    async def _coinflip(self, ctx, choice: str, amount: int = 1):
        self.init = self.client.get_cog("Init")
        await self.init.checkserver(ctx)
        doc_ref = self.db.collection("users").document("{}".format(str(ctx.author.id)))
        doc = doc_ref.get()
        if doc.exists:
            dict1 = doc.to_dict()
            if dict1["money"] < amount:
                embed = discord.Embed(
                    title="Amount in bank too low",
                    description="The amount that you want to gamble is more than what you have in your bank.",
                    color=self.client.primary_colour,
                )
                embed.set_author(
                    name=ctx.author.display_name, icon_url=ctx.author.avatar_url
                )
                await ctx.reply(embed=embed)
                return
            if amount <= 0:
                doc_ref = self.db.collection("users").document(
                    "{}".format(str(ctx.author.id))
                )
                doc = doc_ref.get()
                if doc.exists:
                    dict1 = doc.to_dict()
                    dict1["money"] = -1
                    doc_ref.set(dict1)
                embed = discord.Embed(
                    title="Amount gambled unacceptable",
                    description="It appears that you have been attempting to exploit the system and this is very bad!!! Therefore, your balance will be set to negative 1.",
                    color=self.client.primary_colour,
                )
                embed.set_author(
                    name=ctx.author.display_name, icon_url=ctx.author.avatar_url
                )
                await ctx.reply(embed=embed)

            side = 0
            if choice == "head" or choice == "heads":
                side = 0
            elif choice == "tail" or choice == "tails":
                side = 1
            else:
                raise discord.ext.commands.errors.MissingRequiredArgument

            result = random.randint(0, 100) >= 40
            if result:
                embed = discord.Embed(
                    title="Coinflip results",
                    description=f"Welp, the coin flipped to **{'tails' if not side else 'heads'}**. You lost {amount} points to coinflipping :(",
                    colour=self.client.primary_colour,
                )
                embed.set_author(
                    name=ctx.author.display_name, icon_url=ctx.author.avatar_url
                )
                await ctx.reply(embed=embed)
                dict1["money"] -= amount
                # await ctx.send(f"Welp you lost {amount} points to coinflipping :(")
                ctx.send
            else:
                dict1["money"] += amount
                # await ctx.send(f"Oh wow, you won {amount} points to coinflipping :O")
                embed = discord.Embed(
                    title="Coinflip results",
                    description=f"Oh wow, the coin flipped to **{'tails' if side else 'heads'}**. You won {amount} points from the coin flip :O",
                    colour=self.client.primary_colour,
                )
                embed.set_author(
                    name=ctx.author.display_name, icon_url=ctx.author.avatar_url
                )
                await ctx.reply(embed=embed)
            doc_ref.set(dict1)
        else:
            await self.init.init(ctx)

    @commands.command(
        name="gamble",
        help="Try to beat the computer at dice rolling. Keep rolling until you're happy :D",
        aliases=["g", "gg", "bet", "roll"],
        usage="<amount>",
    )
    @cooldown(1, 8, BucketType.user)
    async def _gamble(self, ctx, amount: int = 5):
        self.init = self.client.get_cog("Init")
        await self.init.checkserver(ctx)
        doc_ref = self.db.collection("users").document("{}".format(str(ctx.author.id)))
        doc = doc_ref.get()
        if doc.exists:
            dict1 = doc.to_dict()
            if dict1["money"] < amount:
                embed = discord.Embed(
                    title="Amount in bank too low",
                    description="The amount that you want to gamble is more than what you have in your bank.",
                    color=self.client.primary_colour,
                )
                embed.set_author(
                    name=ctx.author.display_name, icon_url=ctx.author.avatar_url
                )
                await ctx.reply(embed=embed)
                return
            if amount <= 0:
                doc_ref = self.db.collection("users").document(
                    "{}".format(str(ctx.author.id))
                )
                doc = doc_ref.get()
                if doc.exists:
                    dict1 = doc.to_dict()
                    dict1["money"] -= 0
                    if dict1["money"] < 0:
                        dict1["money"] = 0
                    doc_ref.set(dict1)
                embed = discord.Embed(
                    title="Amount gambled unacceptable",
                    description="It appears that you have been trying to exploit the system and this is very bad!!!",
                    color=self.client.primary_colour,
                )
                embed.set_author(
                    name=ctx.author.display_name, icon_url=ctx.author.avatar_url
                )
                await ctx.reply(embed=embed)
                return
            botnum = random.randint(1, 12)
            yournum = random.randint(1, 15)
            if yournum >= 13:
                yournum = random.randint(1, 6)
            if yournum > botnum:
                dict1["money"] += amount
                embed = discord.Embed(
                    title="Gambling results",
                    description="Bot rolled: "
                    + str(botnum)
                    + "\nYou rolled: "
                    + str(yournum)
                    + "\nYou won! Congrats. You now have "
                    + str(dict1["money"])
                    + " money",
                    colour=self.client.primary_colour,
                )
                embed.set_author(
                    name=ctx.author.display_name, icon_url=ctx.author.avatar_url
                )

                await ctx.reply(
                    embed=embed, allowed_mentions=discord.AllowedMentions.none()
                )
                doc_ref.set(dict1)
            elif yournum == botnum:
                dict1["money"] -= math.ceil(amount / 2)
                embed = discord.Embed(
                    title="Gambling results",
                    description="Bot rolled: "
                    + str(botnum)
                    + "\nYou rolled: "
                    + str(yournum)
                    + "\nYou drawed and lost half of your bet.\nYou now have "
                    + str(dict1["money"])
                    + " money.",
                    colour=0xFFFF00,
                )
                embed.set_author(
                    name=ctx.author.display_name, icon_url=ctx.author.avatar_url
                )

                await ctx.reply(
                    embed=embed, allowed_mentions=discord.AllowedMentions.none()
                )
                doc_ref.set(dict1)
            else:
                dict1["money"] -= amount
                embed = discord.Embed(
                    title="Gambling results",
                    description="Bot rolled: "
                    + str(botnum)
                    + "\nYou rolled: "
                    + str(yournum)
                    + "\nYou lost your whole bet.\nYou now have "
                    + str(dict1["money"])
                    + " money.",
                    colour=0xFF0000,
                )
                await ctx.reply(
                    embed=embed, allowed_mentions=discord.AllowedMentions.none()
                )
                doc_ref.set(dict1)
        else:
            await check.init(ctx)

    @check.is_banned()
    @commands.command(
        name="money",
        help="Allows you to get a source of unlimited points :O",
        usage="",
        aliases=["m"],
    )
    @cooldown(1, 30, BucketType.user)
    async def _money(self, ctx):
        self.init = self.client.get_cog("Init")
        await self.init.checkserver(ctx)
        doc_ref = self.db.collection("users").document("{}".format(str(ctx.author.id)))
        doc = doc_ref.get()
        if doc.exists:
            dict1 = doc.to_dict()
            dict1["money"] = dict1["money"] + random.randint(1, 30)
            doc_ref.set(dict1)
            embed = discord.Embed(
                title="Money added",
                description="Money has been added to your bank. ",
                colour=self.client.primary_colour,
            )
            embed.set_author(
                name=ctx.author.display_name,
                url="https://google.com",
                icon_url=ctx.author.avatar_url,
            )
            embed.add_field(name="New Balance", value=f'{dict1["money"]}', inline=True)
            embed.set_footer(
                text="Find our more about how to use other currency functions by typing 'm!help currency' :D"
            )
            await ctx.reply(
                embed=embed, allowed_mentions=discord.AllowedMentions.none()
            )
        else:
            await self.init.init(ctx)
            # await ctx.send("Now you can start running currency commands :D")

    @check.is_banned()
    @commands.command(
        name="bal",
        help="Allows you to check your current balance",
        usage="",
        aliases=["balance", "b"],
    )
    @cooldown(1, 5, BucketType.user)
    async def bal(self, ctx, user: discord.User = None):
        actualUser = ctx.author
        if user != None:
            actualUser = user

        self.init = self.client.get_cog("Init")
        await self.init.checkserver(ctx)
        doc_ref = self.db.collection("users").document("{}".format(str(actualUser.id)))
        doc = doc_ref.get()
        if doc.exists:
            embed = discord.Embed(
                title="Current Amount",
                description="How much money do you have in your bank?",
                colour=self.client.primary_colour,
            )
            embed.set_author(
                name=actualUser.display_name,
                url="https://google.com",
                icon_url=actualUser.avatar_url,
            )
            embed.add_field(
                name="Balance", value=f'{doc.to_dict()["money"]}', inline=True
            )
            embed.set_footer(
                text="Requested by: {}".format(str(ctx.author.display_name)),
                icon_url=ctx.author.avatar_url,
            )
            await ctx.reply(
                embed=embed, allowed_mentions=discord.AllowedMentions.none()
            )
        else:
            await self.init.init(ctx)
            # return False

    @commands.command(
        name="leaderboard",
        help="Shows you the richest and most wealthy people in the server you are in :O",
        usage="",
        aliases=["l", "rich", "r", " lb"],
    )
    @cooldown(1, 10, BucketType.user)
    async def _leaderboard(self, ctx):
        self.init = self.client.get_cog("Init")
        await self.init.checkserver(ctx)
        msg = await ctx.send(
            embed=discord.Embed(
                title="Loading...",
                description="Hang in tight! We will be done in a jiffy!",
            )
        )

        doc_ref = self.db.collection("servers").document("{}".format(str(ctx.guild.id)))
        doc = doc_ref.get()
        dict2 = doc.to_dict()["users"]
        dict3 = {}
        for i in dict2.keys():
            doc_ref = self.db.collection("users").document("{}".format(i))
            doc = doc_ref.get()
            dict1 = doc.to_dict()
            if dict1 == None or "money" not in dict1:
                continue
            dict3[i] = dict1["money"]
        description = []
        count = 1
        embed = discord.Embed(
            title=f"Leaderboard in {ctx.message.guild.name}:",
            description=f"Richest people in {ctx.message.guild.name}! Check out the currency section in m!help for more details!",
            colour=self.client.primary_colour,
        )
        for i in sorted(dict3.items(), key=lambda kv: (kv[1]), reverse=True):
            user = await self.client.fetch_user(int(i[0]))
            description.append(f"{user.mention}: **{i[1]} money**")
            count += 1

        pages = []
        count = 1
        count1 = 0
        for i in description:
            if count > 10:
                pages.append(embed)
                embed = discord.Embed(
                    title=f"Leaderboard in {ctx.message.guild.name}:",
                    description="Currency leaderboards! Check out the currency section in m!help for more details!",
                    colour=self.client.primary_colour,
                )
                count = 0
            embed.add_field(name=f"**#{count}**", value=i, inline=False)
            count += 1
            count1 += 1

        if count1 != 1:
            pages.append(embed)

        page_num = 0
        await msg.edit(
            embed=pages[page_num], allowed_mentions=discord.AllowedMentions.none()
        )

        page = Paginator(self.client, ctx, msg, pages, timeout=60)
        await page.start()

    @commands.command(
        name="hourly",
        help="Collect your hourly money :D",
        usage="",
        aliases=["h"],
    )
    @cooldown(1, 3600, BucketType.user)
    async def hourly(self, ctx):
        self.init = self.client.get_cog("Init")
        await self.init.checkserver(ctx)
        doc_ref = self.db.collection("users").document("{}".format(str(ctx.author.id)))
        doc = doc_ref.get()
        booster = 1
        if doc.exists:
            dict1 = doc.to_dict()
            # value = int(doc.to_dict()['money'])
            dict1["money"] = dict1["money"] + booster * (random.randint(20, 50))
            doc_ref.set(dict1)
            embed = discord.Embed(
                title="Hourly claimed :D",
                description="Money earned from saying hourly!",
                colour=self.client.primary_colour,
            )
            embed.set_author(
                name=ctx.author.display_name,
                url="https://google.com",
                icon_url=ctx.author.avatar_url,
            )
            embed.add_field(name="New Balance", value=f'{dict1["money"]}', inline=True)
            await ctx.reply(
                embed=embed, allowed_mentions=discord.AllowedMentions.none()
            )

    @cog_ext.cog_slash(name="hourly", description="Claim your hourly money here! :D")
    async def _hourly_cog(self, ctx):
        await self.hourly(ctx)

    @commands.command(
        name="daily",
        help="Collect your daily money! :D",
        usage="",
        aliases=["d"],
    )
    @cooldown(1, 86400, BucketType.user)
    async def daily(self, ctx):
        # await self.init.checkserver(ctx)
        doc_ref = self.db.collection("users").document("{}".format(str(ctx.author.id)))
        doc = doc_ref.get()
        booster = 1
        if (
            "voteReward" in doc.to_dict()
            and time.time() - doc.to_dict()["voteReward"] < 86400
        ):
            booster = 1.1

        if doc.exists:
            dict1 = doc.to_dict()
            # value = int(doc.to_dict()['money'])
            dict1["money"] = int(dict1["money"] + booster * (random.randint(20, 200)))
            doc_ref.set(dict1)
            embed = discord.Embed(
                title="Daily claimed :D",
                description="Daily money",
                colour=self.client.primary_colour,
            )
            embed.set_author(
                name=ctx.author.display_name,
                url="https://google.com",
                icon_url=ctx.author.avatar_url,
            )
            embed.add_field(name="New Balance", value=f'{dict1["money"]}', inline=True)
            if booster == 1.1:
                embed.add_field(
                    name="Vote Booster On!",
                    value="You have claimed daily within 24 hours of voting for the bot! You got a 10% buff to the daily reward.",
                    inline=False,
                )
            await ctx.reply(
                embed=embed, allowed_mentions=discord.AllowedMentions.none()
            )

    @check.is_staff()
    @commands.command(
        hidden=True,
    )
    async def _setmoney(self, ctx, amount: int, name: discord.Member = None):
        if name == None:
            uid = str(ctx.author.id)
        else:
            uid = str(name.id)

        doc_ref = self.db.collection("users").document("{}".format(uid))
        doc = doc_ref.get()
        if doc.exists:
            dict2 = doc.to_dict()
            dict2["money"] = amount
            doc_ref.set(dict2)
            embed = discord.Embed(
                title="User amount set",
                description=f"Amount of <@{uid}> has been set to {amount}.",
                colour=self.client.primary_colour,
            )
            await ctx.send(embed=embed)

        else:
            embed = discord.Embed(
                title="User's account not initiated.",
                description="This user has not initiated an account. Please make sure that the person has used hallo bot before :D",
                color=self.client.primary_colour,
            )
            await ctx.send(embed=embed)

    @check.is_banned()
    @commands.command(
        name="snakeeyes",
        help="When you roll a 1 on a die, you win money!",
        usage="",
        aliases=["se", "snakeyes"],
    )
    @cooldown(1, 5, BucketType.user)
    async def se(self, ctx, amount: int):
        self.init = self.client.get_cog("Init")
        await self.init.checkserver(ctx)
        doc_ref = self.db.collection("users").document("{}".format(str(ctx.author.id)))
        doc = doc_ref.get()

        booster = 1
        if (
            "voteReward" in doc.to_dict()
            and time.time() - doc.to_dict()["voteReward"] < 86400
        ):
            booster = 1.1

        if doc.exists:
            dict1 = doc.to_dict()
            if dict1["money"] < amount:
                #! bank account money too low
                embed = discord.Embed(
                    title="Amount in bank too low",
                    description="The amount that you want to gamble is more than what you have in your bank.",
                    color=self.client.primary_colour,
                )
                embed.set_author(
                    name=ctx.author.display_name, icon_url=ctx.author.avatar_url
                )
                await ctx.reply(embed=embed)
                return

            if amount <= 0:
                #! tried to gamble negative amount
                embed = discord.Embed(
                    title="Amount gambled unacceptable",
                    description="You have to bet a positive amount of money!",
                    color=self.client.primary_colour,
                )
                embed.set_author(
                    name=ctx.author.display_name, icon_url=ctx.author.avatar_url
                )
                await ctx.reply(embed=embed)
                return

            embed = discord.Embed(
                title="Rolling dice...",
                description=":game_die::game_die:",
                color=self.client.primary_colour,
            )

            message = await ctx.reply(embed=embed)
            await asyncio.sleep(0.5)

            dice1 = random.randint(1, 6)
            dice2 = random.randint(1, 6)
            if dice1 != 1 and dice2 != 1:
                dict1["money"] -= amount
                print(amount)
                nowmoney = dict1["money"]
                doc_ref.set(dict1)
                embed = discord.Embed(
                    title="You rolled " + str(dice1) + " and " + str(dice2) + "!",
                    description="You didn't get any snake eyes. You lost your bet. You now have "
                    + str(nowmoney)
                    + " money.",
                    color=0xFF0000,
                )
                await message.edit(embed=embed)

            elif (dice1 == 1 and dice2 != 1) or (dict1 != 1 and dice2 == 1):
                earnt = math.floor(amount * 2)
                dict1["money"] += int(earnt * booster)
                doc_ref.set(dict1)
                nowmoney = dict1["money"]
                embed = discord.Embed(
                    title="You rolled " + str(dice1) + " and " + str(dice2) + "!",
                    description="You got one snake eye! You won 2x your bet. You now have "
                    + str(nowmoney)
                    + " money.",
                    color=self.client.primary_colour,
                )
                await message.edit(embed=embed)

            else:
                earnt = math.floor(10 * amount)
                dict1["money"] += int(earnt * booster)
                nowmoney = dict1["money"]
                doc_ref.set(dict1)
                embed = discord.Embed(
                    title="You rolled " + str(dice1) + " and " + str(dice2) + "!",
                    description="You got two snake eyes! You won 10x your bet. You now have "
                    + str(nowmoney)
                    + " money. Woo!",
                    color=self.client.primary_colour,
                )
                await message.edit(embed=embed)
            if booster == 1.1:
                await ctx.reply(
                    embed=discord.Embed(
                        title="Vote booster was applied for the snake-eyes result!",
                        description="It will not be applied if you have lost :)",
                        colour=self.client.primary_colour,
                    )
                )
        else:
            await self.init.init(ctx)

    @commands.command(
        name="search",
        help="Look for stuff! Who knows what you might get.",
        usage="",
        aliases=["scout", "find"],
    )
    @cooldown(1, 60, BucketType.user)
    async def search(self, ctx):
        num = random.randint(1, 1000)
        self.init = self.client.get_cog("Init")
        await self.init.checkserver(ctx)
        doc_ref = self.db.collection("users").document("{}".format(str(ctx.author.id)))
        doc = doc_ref.get()
        if doc.exists:
            dict1 = doc.to_dict()
            if num < 8:
                dict1["money"] = 0
                embed = discord.Embed(
                    title="You were so depressed at not being able to find anything that you died.",
                    description="You lost all your money!",
                    color=0xFF0000,
                )
                await ctx.reply(embed=embed)
            elif num < 190:
                dict1["money"] += 5
                embed = discord.Embed(
                    title="You found a 5 dollar note on the floor!",
                    description="Money +5",
                    color=self.client.primary_colour,
                )
                await ctx.reply(embed=embed)
            elif num < 360:
                dict1["money"] += 10
                embed = discord.Embed(
                    title="You found a crumpled ten dollar bill on the floor!",
                    description="Money +10",
                    color=self.client.primary_colour,
                )
                await ctx.reply(embed=embed)
            elif num < 390:
                dict1["money"] += 69
                embed = discord.Embed(
                    title="You found a HUGE pile of coins on the floor, totaling to 69 dollars!",
                    description="Money +69",
                    color=self.client.primary_colour,
                )
                await ctx.reply(embed=embed)
            elif num < 465:
                moneynow = dict1["money"]
                to_remove = math.floor(moneynow / 3)
                dict1["money"] -= to_remove
                embed = discord.Embed(
                    title="A policeman caught you rummaging through the dumps and fined you a third of your money!",
                    description="Money -" + str(to_remove),
                    color=0xFF0000,
                )
                await ctx.reply(embed=embed)
            else:
                embed = discord.Embed(
                    title="Welp. You didn't find anything, but at least you didn't die :D",
                    description="Money ±0",
                    color=0xFFFF00,
                )
                await ctx.reply(embed=embed)
        doc_ref.set(dict1)

    @commands.command(
        name="lottery",
        help="Buy as many lottery tickets as you want :D\nEach cost 10 dollars and you can win up to 900000 dollars.",
        usage="[num1 num2 num3 num4 num5 num6] (6 distinct numbers between 1 and 35)",
        aliases=["raffle", "lotto"],
    )
    @cooldown(1, 60, BucketType.user)
    async def lottery(self, ctx, *msgg: int):
        msg = list(msgg)
        if len(msg) != 6:
            embed = discord.Embed(
                title="You didn't enter 6 arguments!", description="", color=0xFF0000
            )
            await ctx.reply(embed=embed)
            return
        for i in msg:
            if int(i) > 35 or int(i) < 1:
                embed = discord.Embed(
                    title="Invalid option for lottery!",
                    description="Your guess "
                    + str(i)
                    + " was invalid\nYou need to input 6 space-separated integers between 1 and 35 :D",
                    color=0xFF0000,
                )
                await ctx.reply(embed=embed)
                return
        for i in range(6):
            for j in range(i + 1, 6):
                if msg[i] == msg[j]:
                    embed = discord.Embed(
                        title="You can't use the same number twice!",
                        description="",
                        color=0xFF0000,
                    )
                    await ctx.reply(embed=embed)
                    return

        correct = []
        count = 0
        curr = [
            1,
            2,
            3,
            4,
            5,
            6,
            7,
            8,
            9,
            10,
            11,
            12,
            13,
            14,
            15,
            16,
            17,
            18,
            19,
            20,
            21,
            22,
            23,
            24,
            25,
            26,
            27,
            28,
            29,
            30,
            31,
            32,
            33,
            34,
            35,
        ]
        for i in range(6):
            elem = random.choice(curr)
            correct.append(elem)
            curr.remove(elem)
        correct.sort()
        msg.sort()
        for i in range(6):
            for j in range(6):
                if msg[i] == correct[j]:
                    count += 1
        win = [0, 2, 60, 600, 2000, 10000, 90000]
        self.init = self.client.get_cog("Init")
        await self.init.checkserver(ctx)
        doc_ref = self.db.collection("users").document("{}".format(str(ctx.author.id)))
        doc = doc_ref.get()
        for i in range(6):
            msg[i] = str(msg[i])
            correct[i] = str(correct[i])
        if doc.exists:
            dict1 = doc.to_dict()
            if dict1["money"] < 10:
                embed = discord.Embed(
                    title="You don't have enough money! You need 10 money.",
                    description="",
                    color=0xFF0000,
                )
                await ctx.reply(embed=embed)

            if count == 0:
                dict1["money"] -= 10
                moneynow = dict1["money"]
                embed = discord.Embed(
                    title="You didn't get any numbers correct! You lost your bet and now have "
                    + str(moneynow)
                    + " money.",
                    description="Your guess was: "
                    + " ".join(msg)
                    + "\nThe correct guess was: "
                    + " ".join(correct),
                    color=0xFF0000,
                )
                await ctx.reply(embed=embed)
            elif count == 1:
                dict1["money"] += 15
                moneynow = dict1["money"]
                embed = discord.Embed(
                    title="You got 1 number correct! You won 1.5x (15 coins)! You now have "
                    + str(moneynow)
                    + " money.",
                    description="Your guess was: "
                    + " ".join(msg)
                    + "\nThe correct guess was: "
                    + " ".join(correct),
                    color=0xFFFF00,
                )
                await ctx.reply(embed=embed)
            else:
                dict1["money"] += win[count] * 10
                moneynow = dict1["money"]
                embed = discord.Embed(
                    title="You got "
                    + str(count)
                    + " numbers correct! You won "
                    + str(win[count])
                    + "x ("
                    + str(win[count])
                    + "0 money)! You now have "
                    + str(moneynow)
                    + " money.",
                    description="Your guess was: "
                    + " ".join(msg)
                    + "\nThe correct guess was: "
                    + " ".join(correct),
                    color=self.client.primary_colour,
                )
                await ctx.reply(embed=embed)
        doc_ref.set(dict1)

    @commands.command(
        name="share",
        help="Sharing is caring! Share some money to your friends now!",
        usage="<amount>",
        aliases=["give", "pay", "offer"],
    )
    @cooldown(1, 5, BucketType.user)
    async def share(self, ctx, user: discord.User, amount: int):
        if discord.User == None:
            embed = discord.Embed(title="Invalid user!", description="", color=0xFF1100)
            await ctx.reply(embed=embed)
            return
        if amount <= 0:
            await ctx.reply(
                embed=discord.Embed(
                    title="Error", description="You can't share negative money!"
                ),
                colour=0xFF1100,
            )
            return

        msg = await ctx.reply(
            embed=discord.Embed(
                title="Sharing...",
                description="Your kind deed will be delivered to "
                + str(user)
                + "! Hang in tight!",
            )
        )

        self.init = self.client.get_cog("Init")
        await self.init.checkserver(ctx)
        doc_ref = self.db.collection("users").document("{}".format(str(ctx.author.id)))
        doc = doc_ref.get().to_dict()

        if "money" not in doc or doc["money"] < amount:
            await msg.edit(
                embed=discord.Embed(
                    title="Error",
                    description="You don't have enough money to share it with your friends :(",
                ),
                colour=0xFF1100,
            )
            return

        doc_ref_2 = self.db.collection("users").document("{}".format(str(user.id)))
        doc_2 = doc_ref_2.get().to_dict()

        # share success
        if "money" not in doc_2:
            doc_2["money"] = amount
        else:
            doc_2["money"] += amount
        doc_ref_2.set(doc_2)
        doc["money"] -= amount
        doc_ref.set(doc)

        await msg.edit(
            embed=discord.Embed(
                title="Success",
                description="You gave "
                + str(amount)
                + " coins to "
                + user.mention
                + "!",
                color=self.client.primary_colour,
            )
        )


def setup(client):
    client.add_cog(Economy(client))
