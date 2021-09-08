import discord
from discord.ext import commands
from firebase_admin import firestore
import threading
import time
from discord.ext.commands import cooldown, BucketType
from utils.paginator import Paginator
from datetime import datetime
import asyncio


class VoteRewards(commands.Cog):
    def __init__(self, client):
        self.client = client
        self.hidden = False
        self.autoresponse = {}
        self.db = firestore.client()

    @commands.Cog.listener()
    async def on_message(self, ctx):
        if ctx.author.bot and ctx.channel.id == 879697234340491274:
            #! is sent by the bot
            now = datetime.now()
            # get the id of the user
            content = ctx.content
            print(content)
            userId = int(
                content.replace("Thank you for the upvote <@", "")
                .replace(">", "")
                .replace("!", "")
            )
            doc_ref = self.db.collection("users").document("{}".format(str(userId)))
            doc = doc_ref.get().to_dict()
            if doc == None:
                doc = {"voteReward": time.time()}
            else:
                doc["voteReward"] = time.time()
                if "money" in doc.keys():
                    doc["money"] += 300
                else:
                    doc["money"] = 300

                if "notifications" not in doc.keys():
                    doc["notifications"] = []
                date_time = now.strftime("%m/%d/%Y, %H:%M:%S")
                doc["notifications"].append(
                    {
                        "title": "Vote Reward Added!",
                        "description": "+300 money and other rewards added on "
                        + date_time,
                    }
                )
            doc_ref.set(doc)

            ## remind the person to re-vote if needed
            if "remindVote" in doc:
                if doc["remindVote"] == True:
                    await asyncio.sleep(43200)
                    user = self.client.get_user(userId)
                    await user.send(
                        embed=discord.Embed(
                            title="You can vote for MaxiGames again!",
                            description="Link: https://top.gg/bot/863419048041381920/vote",
                        )
                    )

    @commands.command(
        name="notifications",
        help="Checks for any notifications from the bot",
        usage="",
        aliases=["notif", "notifs", "n", "alert"],
    )
    @cooldown(1, 15, BucketType.user)
    async def notifs(self, ctx):
        doc_ref = self.db.collection("users").document("{}".format(str(ctx.author.id)))
        doc = doc_ref.get().to_dict()
        if "notifications" not in doc:
            await ctx.send(embed=discord.Embed(title="You have no notifications!"))
            return
        notifs = doc["notifications"]

        if len(notifs) == 0:
            await ctx.send(embed=discord.Embed(title="You have no notifications!"))
            return

        #! PAGES
        pages = []
        defaultPage = discord.Embed(
            title="Notifications!",
            description="List of user notifications",
            colour=self.client.primary_colour,
        )
        defaultPage.set_author(
            name=self.client.user.name, icon_url=self.client.user.avatar_url
        )
        defaultPage.set_footer(text="Press Next to see the next page of notifications!")
        page = defaultPage
        count = 0
        count1 = 0
        for i in range(0, len(notifs)):
            page.add_field(
                name=f"{count+1}. `{notifs[count]['title']}`",
                value=notifs[count]["description"],
            )
            if count1 == 4:
                pages.append(page)
                page = defaultPage
                count1 = 0
            else:
                count1 += 1
            count += 1

        pages.append(page)
        page_num = 0
        msg = await ctx.send(
            embed=pages[page_num],
        )
        page = Paginator(self.client, ctx, msg, pages, timeout=120)
        await page.start()

    @commands.command(
        name="voteRewards",
        help="By voting for the bot, you will earn these rewards!",
        usage="",
        aliases=["vr", "rewards", "reward", "votereward"],
    )
    @cooldown(1, 15, BucketType.user)
    async def r(self, ctx):
        await ctx.send(
            embed=discord.Embed(
                title="Rewards for voting the bot!!",
                description="Try `m!vote` to get the link to voting maxigames :D",
                colour=self.client.primary_colour,
            )
            .add_field(name="Instant Reward:", value="`+300 Money!`", inline=False)
            .add_field(
                name="Claimable Reward:",
                value="`Daily 10% boost within the next 24 hrs!`",
                inline=False,
            )
            .add_field(
                name="Usable Reward:",
                value="`Snake eyes reward boost by 10% within the next 24 hrs!`",
                inline=False,
            )
        )

    @commands.command(
        name="clearNotifs",
        help="Clears for any notifications from the bot",
        usage="",
        aliases=["cn", "clearNotif", "clearNotifications"],
    )
    @cooldown(1, 15, BucketType.user)
    async def clearNotif(self, ctx):
        doc_ref = self.db.collection("users").document("{}".format(str(ctx.author.id)))
        doc = doc_ref.get().to_dict()
        if "notifications" in doc:
            doc["notifications"] = []
        doc_ref.set(doc)
        await ctx.reply("Done!")

    @commands.command(
        name="remindVote",
        help="Toggles whether the bot reminds you when you can vote again for it, after every 12 hours",
        usage="",
        aliases=["rv", "remindToVote", "remindV"],
    )
    @cooldown(1, 15, BucketType.user)
    async def remindVote(self, ctx):
        doc_ref = self.db.collection("users").document("{}".format(str(ctx.author.id)))
        doc = doc_ref.get().to_dict()
        if "remindVote" in doc and doc["remindVote"] == True:
            doc["remindVote"] = False
            doc_ref.set(doc)
            await ctx.reply(
                "The bot will **not** remind you when you can vote for it again :D"
            )
            return
        doc["remindVote"] = True
        doc_ref.set(doc)
        await ctx.reply("The bot will remind you when you can vote for it again :D")


def setup(client):
    client.add_cog(VoteRewards(client))
