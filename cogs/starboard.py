import discord
from discord.ext import commands
import firebase_admin
from firebase_admin import firestore
from utils import check
from discord.ext.commands import cooldown, BucketType


class Starboard(commands.Cog):
    def __init__(self, client):
        self.client = client
        self.hidden = True
        self.db = firestore.client()
        self.init = self.client.get_cog("Init")

    @check.is_admin()
    @commands.command(
        name="starboardThresh",
        help="Starts a starboard",
        usage="<number of stars required>",
        aliases=["starThresh", "starCount", "starboardCount", "starboardLimit"],
    )
    @cooldown(1, 15, BucketType.user)
    async def starboard_threshold(self, ctx, thresh: int = None):
        self.init = self.client.get_cog("Init")
        await self.init.checkserver(ctx)
        doc_ref = self.db.collection("servers").document(str(ctx.guild.id))
        doc = doc_ref.get()
        data = doc.to_dict()

        if thresh == None:
            data["starboard_threshold"] = 5
            await ctx.reply("Reset starboard threshold to 5.")
        elif type(thresh) != int or thresh < 1:
            await ctx.reply("Must set to a positive integer!")
        else:
            data["starboard_threshold"] = thresh
            await ctx.reply(f"Starboard threshold has been set to {thresh}!")

        doc_ref.set(data)

    @check.is_admin()
    @commands.command(
        name="starboard",
        help="Sets the starboard to the current channel or the specified one",
        usage="<channel>",
        alias=["star", "starboardSet"],
    )
    @cooldown(1, 15, BucketType.user)
    async def starboard(self, ctx, channel: discord.TextChannel = None):
        if channel == None:
            await ctx.reply("You need to specify a channel")
            return
        try:
            self.init = self.client.get_cog("Init")
            await self.init.checkserver(ctx)
            doc_ref = self.db.collection("servers").document(str(ctx.guild.id))
            doc = doc_ref.get()
            data = doc.to_dict()
            data["starboard"] = {"channel": channel.id}
            data["starboard_threshold"] = 5
            doc_ref.set(data)
            await ctx.reply(f"Starboard channel has been set to {channel}!")
        except:
            await ctx.reply("That channel does not exist")

    @commands.Cog.listener()
    async def on_reaction_add(self, reaction, user):
        self.init = self.client.get_cog("Init")
        doc_ref = self.db.collection("servers").document(str(reaction.message.guild.id))
        doc = doc_ref.get()
        data = doc.to_dict()

        if "starboard" not in data:
            return

        channel = self.client.get_channel(int(data["starboard"]["channel"]))
        await self.init.checkserver(reaction.message)

        if (
            channel is None
            or reaction.count < data["starboard_threshold"]
            or reaction.emoji != "⭐"
        ):
            return

        e = (
            discord.Embed(
                title=f"Starred {reaction.count} times!",
                description=f"[Click to jump to message]({reaction.message.jump_url})\n\n{reaction.message.content}",
                color=self.client.primary_colour,
            )
            .set_footer(text=f"React with {'⭐'} to star this message")
            .set_author(
                name=reaction.message.author.name,
                icon_url=reaction.message.author.avatar_url,
            )
        )
        if reaction.message.attachments != []:
            for c in reaction.message.attachments:
                e.set_image(url=c)

        if str(reaction.message.id) not in data["starboard"]:
            message = await channel.send(embed=e)
            data["starboard"][str(reaction.message.id)] = message.id
        else:
            msg = await channel.fetch_message(
                data["starboard"][str(reaction.message.id)]
            )
            await msg.edit(embed=e)

        doc_ref.set(data)

    @commands.Cog.listener()
    async def on_reaction_remove(self, reaction, user):
        self.init = self.client.get_cog("Init")
        doc_ref = self.db.collection("servers").document(str(reaction.message.guild.id))
        doc = doc_ref.get()
        data = doc.to_dict()

        if "starboard" not in data:
            return

        channel = self.client.get_channel(int(data["starboard"]["channel"]))
        await self.init.checkserver(reaction.message)

        if (
            channel is None
            or reaction.count + 1 < data["starboard_threshold"]
            or reaction.emoji != "⭐"
        ):
            return

        msg = await channel.fetch_message(data["starboard"][str(reaction.message.id)])

        if reaction.count < data["starboard_threshold"]:
            await msg.delete()  # just delete it; it is now below the threshold
            return

        e = (
            discord.Embed(
                title=f"Starred {reaction.count} times!",
                description=f"[Click to jump to message]({reaction.message.jump_url})\n\n{reaction.message.content}",
                color=0x00FF00,
            )
            .set_footer(text=f"React with {'⭐'} to star this message")
            .set_author(
                name=reaction.message.author.name,
                icon_url=reaction.message.author.avatar_url,
            )
        )
        if reaction.message.attachments != []:
            for c in reaction.message.attachments:
                e.set_image(url=c)

        await msg.edit(embed=e)

        doc_ref.set(data)
        return


def setup(client):
    client.add_cog(Starboard(client))
