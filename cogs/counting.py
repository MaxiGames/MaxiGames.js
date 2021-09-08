import discord
from discord.ext import commands
from firebase_admin import firestore
from utils import check
import copy
from utils.paginator import Paginator


class Counting(commands.Cog):
    def __init__(self, client):
        self.client = client
        self.db = firestore.client()
        self.data = {}
        self.cooldown = {}
        self.init = self.client.get_cog("Init")
        self.hidden = False

    @check.is_admin()
    @commands.command(
        name="countingChannelAdd",
        help="Sets a counting channel by specifing the channel",
        usage="<channel>",
        aliases=["countCa", "countingChannel"],
    )
    async def counting_channel_add(self, ctx, channelarg: str = None):
        # sets the key "counting_channel"
        if channelarg == None:
            channelarg = str(ctx.channel.id)

        try:
            t = int("".join(list(filter(str.isdigit, channelarg))))
            channel = t
            data = (
                self.db.collection("servers")
                .document(str(ctx.guild.id))
                .get()
                .to_dict()
            )

            init_channel_count = {"count": 0, "previous_author": None}

            if "counting_channels" not in data:
                data["counting_channels"] = {}

            ##
            chann = discord.utils.get(ctx.guild.channels, id=channel)
            if chann == None or not isinstance(chann, discord.channel.TextChannel):
                await ctx.reply(
                    embed=discord.Embed(
                        title="Error: channel does not exist, or is not a text channel.",
                        colour=self.client.primary_colour,
                    )
                )
                return
            del chann
        except ValueError:
            await ctx.reply(
                embed=discord.Embed(
                    title="Error: channel does not exist, or is not a text channel.",
                    colour=self.client.primary_colour,
                )
            )
            return

        if str(ctx.guild.id) in data["counting_channels"]:  # do not merge with and!
            if str(channel) not in data["counting_channels"][str(ctx.guild.id)]:
                data["counting_channels"][str(ctx.guild.id)][
                    str(channel)
                ] = copy.deepcopy(init_channel_count)
                data["counting_channels"][str(ctx.guild.id)]["counterUR"] = {}
                await ctx.reply(embed=discord.Embed(title="Success! Channel Added!"))
            else:
                await ctx.reply(
                    embed=discord.Embed(
                        title="Error: channel is already a counting channel.",
                        colour=self.client.primary_colour,
                    )
                )

        else:
            data["counting_channels"] = {
                str(ctx.guild.id): {
                    str(channel): copy.deepcopy(init_channel_count),
                    "counterUR": {},
                }
            }
            await ctx.send("OK")

        self.db.collection("servers").document(str(ctx.guild.id)).set(data)

        return

    @check.is_admin()
    @commands.command(
        name="countingChannelRemove",
        help="Remove a counting channe by specifying the channel name",
        usage="<channel>",
        aliases=[
            "countCr",
            "countRm",
            "countCRm",
            "countingRemove",
        ],
    )
    async def counting_channel_rm(self, ctx, channel: str = None):
        if channel == None:
            channel = str(ctx.channel.id)
        # sets the key "counting_channel"
        t = "".join(list(filter(str.isdigit, channel)))
        channel = t
        data = self.db.collection("servers").document(str(ctx.guild.id)).get().to_dict()

        if "counting_channels" not in data:
            return  # bruh

        if (
            str(ctx.guild.id) in data["counting_channels"]
            and str(channel) in data["counting_channels"][str(ctx.guild.id)]
        ):
            del data["counting_channels"][str(ctx.guild.id)][str(channel)]
            await ctx.reply(
                embed=discord.Embed(title="Channel is no longer a counting channel."),
                colour=self.client.primary_colour,
            )
        else:
            await ctx.reply(
                embed=discord.Embed(
                    title="Channel never was a counting channel or doesn't exist.",
                    colour=self.client.primary_colour,
                )
            )

        self.db.collection("servers").document(str(ctx.guild.id)).set(data)

        return

    @commands.command(
        name="countingServerLeaderboard",
        help="Show the leaderboard for users in this server and your position",
        usage="",
        aliases=["countslb", "slb", "serverLeaderboard", "countingSlb"],
    )
    async def counting_server_leaderboard(self, ctx):
        data = self.db.collection("servers").document(str(ctx.guild.id)).get().to_dict()
        dict1 = data["counting_channels"][str(ctx.guild.id)]["counterUR"].items()
        # sorts leaderboard
        dict1 = dict(sorted(dict1, key=lambda item: item[1], reverse=True))

        message = await ctx.send(
            embed=discord.Embed(
                title="Retrieving data...",
                description="hold on a second, we will get it done in a jiffy!",
            )
        )
        toSend = []
        for key in dict1:
            user = await ctx.guild.fetch_member(key)
            if user == None:
                continue
            toSend.append(f"**{user.display_name}#{user.discriminator}**: {dict1[key]}")

        # add and format the data to a page
        pages = []
        page = discord.Embed(
            title="Counting server leaderboard!",
            description="View your ranking amongst the other people in your server, and the server leaderboard!",
            colour=self.client.primary_colour,
        )
        count = 0
        for i, v in enumerate(toSend):
            page.add_field(name=f"**#{i+1}**", value=v, inline=False)
            count += 1
            if count == 21:
                count = 0
                pages.append(page)
                page = discord.Embed(
                    title="Counting server leaderboard!",
                    description="View your ranking amongst the other people in your server, and the server leaderboard!",
                    colour=self.client.primary_colour,
                )

        if page != discord.Embed(
            title="Counting server leaderboard!",
            description="View your ranking amongst the other people in your server, and the server leaderboard!",
            colour=self.client.primary_colour,
        ):
            pages.append(page)
        page_num = 0
        await message.edit(
            embed=pages[page_num],
        )
        page = Paginator(self.client, ctx, message, pages, timeout=120)
        await page.start()
        return

    @commands.Cog.listener()
    async def on_message(self, msg):
        if msg.guild == None or msg.author.bot:
            return
        data = self.db.collection("servers").document(str(msg.guild.id)).get().to_dict()
        if data == None:
            return

        if "counting_channels" not in data:
            return

        # check if the specific channel exists
        if str(msg.guild.id) not in data["counting_channels"]:
            return

        # check if things exists; initialise where it makes sense
        if "counterUR" not in data["counting_channels"][str(msg.guild.id)]:
            data["counting_channels"][str(msg.guild.id)]["counterUR"] = {}

        try:
            data["counting_channels"][str(msg.guild.id)][str(msg.channel.id)]
        except KeyError:
            return  # no counting channels set up for this server

        numinter = ""
        for x in msg.content:
            if str.isdigit(x):
                numinter += x
            else:
                break
        if numinter == "":
            return  # no number
        num = int(numinter)

        ccount = data["counting_channels"][str(msg.guild.id)][str(msg.channel.id)][
            "count"
        ]
        if (
            num == ccount + 1
            and data["counting_channels"][str(msg.guild.id)][str(msg.channel.id)][
                "previous_author"
            ]
            != msg.author.id
        ):
            await msg.add_reaction("✅")
            data["counting_channels"][str(msg.guild.id)][str(msg.channel.id)][
                "count"
            ] = num
            data["counting_channels"][str(msg.guild.id)][str(msg.channel.id)][
                "previous_author"
            ] = msg.author.id
            try:
                # update user's counter userrank
                data["counting_channels"][str(msg.guild.id)]["counterUR"][
                    str(msg.author.id)
                ] += 1
            except KeyError:
                # initialise user's counter userrank
                data["counting_channels"][str(msg.guild.id)]["counterUR"][
                    str(msg.author.id)
                ] = 1
        else:
            await msg.add_reaction("❌")
            if num != ccount + 1:
                await msg.reply(
                    embed=discord.Embed(
                        title="Wrong count",
                        description=f"{msg.author.mention} messed up the count at {ccount}. The next count for this server is 1.",
                        colour=self.client.primary_colour,
                    )
                )
            else:
                await msg.reply(
                    embed=discord.Embed(
                        title="You cannot count twice in a row",
                        description=f"{msg.author.mention} messed up the count at {ccount}. The next count for this server is 1.",
                        colour=self.client.primary_colour,
                    )
                )

            try:
                # update user's counter userrank
                if (
                    data["counting_channels"][str(msg.guild.id)]["counterUR"][
                        str(msg.author.id)
                    ]
                    > 0
                ):
                    data["counting_channels"][str(msg.guild.id)]["counterUR"][
                        str(msg.author.id)
                    ] -= 1
            except KeyError:
                # initialise user's counter userrank
                data["counting_channels"][str(msg.guild.id)]["counterUR"][
                    str(msg.author.id)
                ] = 0

            data["counting_channels"][str(msg.guild.id)][str(msg.channel.id)][
                "count"
            ] = 0
            data["counting_channels"][str(msg.guild.id)][str(msg.channel.id)][
                "previous_author"
            ] = None

        self.db.collection("servers").document(str(msg.guild.id)).set(data)
        return


def setup(client):
    client.add_cog(Counting(client))
