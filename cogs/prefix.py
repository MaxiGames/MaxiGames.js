import discord
from discord.ext import commands
from firebase_admin import firestore
import threading
from utils import check
from discord.ext.commands import cooldown, BucketType


class Prefix(commands.Cog):
    def __init__(self, client):
        self.client = client
        self.db = firestore.client()
        self.init = self.client.get_cog("Init")
        self.hidden = False

        # Create an Event for notifying main thread.
        callback_done = threading.Event()

        # Create a callback on_snapshot function to capture changes
        def on_snapshot(col_snapshot, changes, read_time):
            for change in changes:
                self.client.prefixes[
                    str(change.document.id)
                ] = change.document.to_dict()["prefix"]
            callback_done.set()

        col_query = self.db.collection("servers")

        # Watch the collection query
        query_watch = col_query.on_snapshot(on_snapshot)

    @commands.Cog.listener()
    async def on_guild_join(self, guild):
        self.client.prefixes[str(guild.id)] = [self.client.primary_prefix]

    @commands.group(invoke_without_command=True)
    async def prefix(self, ctx):
        """Prefix commands"""
        description = "```"
        for i in range(len(self.client.prefixes)):
            description += f"{i+1}. {self.client.prefixes[i]}\n"
        description += "```"

        embed = discord.Embed(
            title=f"Prefixes in server `{ctx.guild.name}`",
            description=description,
            colour=self.client.primary_colour,
        )
        if len(self.client.prefixes) > 1:
            embed.set_footer(text=f"{len(self.client.prefixes)} prefixes")
        else:
            embed.set_footer(text="1 prefix")
        await ctx.reply(embed=embed)

    @check.is_admin()
    @prefix.command()
    @cooldown(1, 15, BucketType.user)
    async def add(self, ctx, prefix: str):
        self.init = self.client.get_cog("Init")
        await self.init.checkserver(ctx)
        data = self.db.collection("servers").document(str(ctx.guild.id)).get().to_dict()
        data["prefix"].append(prefix)
        self.db.collection("servers").document(str(ctx.guild.id)).update(data)
        await ctx.reply(
            embed=discord.Embed(
                title="New prefix added",
                description=f"{prefix} is now a MaxiGames prefix.",
                colour=self.client.primary_colour,
            )
        )

    @check.is_admin()
    @prefix.command()
    @cooldown(1, 15, BucketType.user)
    async def remove(self, ctx, prefix: str):
        self.init = self.client.get_cog("Init")
        await self.init.checkserver(ctx)
        data = self.db.collection("servers").document(str(ctx.guild.id)).get().to_dict()
        if prefix not in data["prefix"]:
            await ctx.reply(
                embed=discord.Embed(
                    title="Prefix not found",
                    description=f"Please make sure that the prefix to be removed is to be correct. Check valid prefixes using {ctx.prefix}prefix",
                    colour=self.client.primary_colour,
                )
            )
            return

        if len(data["prefix"]) == 1:
            await ctx.reply(
                "Are you sure that you want to remove the last and only prefix?"
            )
        data["prefix"].remove(prefix)
        self.db.collection("servers").document(str(ctx.guild.id)).update(data)
        await ctx.reply(f"Prefix {prefix} removed :D")

    @check.is_admin()
    @prefix.command()
    @cooldown(1, 15, BucketType.user)
    async def reset(self, ctx):
        self.init = self.client.get_cog("Init")
        await self.init.checkserver(ctx)
        data = self.db.collection("servers").document(str(ctx.guild.id)).get().to_dict()
        data["prefix"] = [self.client.primary_prefix]
        self.db.collection("servers").document(str(ctx.guild.id)).update(data)
        await ctx.reply(
            embed=discord.Embed(
                title="Prefixes reset.",
                description="The bot prefix for this server has been reset.",
                colour=self.client.primary_colour,
            )
        )

    @check.is_admin()
    @prefix.command()
    @cooldown(1, 15, BucketType.user)
    async def set(self, ctx, *prefixes):
        self.init = self.client.get_cog("Init")
        await self.init.checkserver(ctx)
        data = self.db.collection("servers").document(str(ctx.guild.id)).get().to_dict()
        data["prefix"] = list(prefixes)
        self.db.collection("servers").document(str(ctx.guild.id)).update(data)
        await ctx.reply(
            embed=discord.Embed(
                title="Prefixes set :D",
                description=f"Prefixes set to {', '.join(prefixes)}",
                colour=self.client.primary_colour,
            )
        )


def setup(client):
    client.add_cog(Prefix(client))
