import discord
from discord.ext import commands
import typing
import asyncio
from utils import check


class Clear(commands.Cog):
    def __init__(self, client):
        self.client = client
        self.channels = []
        self.hidden = False

    @check.is_admin()
    @commands.group(
        invoke_without_subcommands=False,
        name="clear",
        description="A perfect set of commands for easily deleting messages!",
        usage="[member] <search>",
        help="Deletes messages in the search range (optionally from specific member). Ignores pinned messages :D",
    )
    async def clear(
        self,
        ctx,
        member: typing.Optional[discord.Member] = None,
        number: typing.Optional[int] = None,
    ):
        if ctx.invoked_subcommand is None:
            if member is None and number is not None:

                if str(ctx.channel.id) in self.channels:
                    await ctx.send("A clear is in progress. Try again later :D")
                    return
                    # clear in progress
                await ctx.message.delete()

                def check(m):
                    return not m.pinned

                self.channels.append(str(ctx.channel.id))
                messages = await ctx.channel.purge(limit=number, check=check)

                self.channels.remove(str(ctx.channel.id))
                embed = discord.Embed(
                    title=f"Messages deleted :D",
                    description=f"{len(messages)} messages has been deleted from {ctx.channel.mention}.",
                    colour=self.client.primary_colour,
                )
                msg = await ctx.send(embed=embed)
                await asyncio.sleep(3)
                await msg.delete()
            elif member is not None and number is not None:

                if str(ctx.channel.id) in self.channels:
                    await ctx.send("A clear is in progress. Try again later :D")
                    return
                    # clear in progress
                await ctx.message.delete()

                def check(m):
                    return (
                        m.author == member and m.channel == ctx.channel and not m.pinned
                    )

                self.channels.append(str(ctx.channel.id))
                counter = 0
                async for message in ctx.channel.history():
                    if counter >= number:
                        break
                    if message.author == member:
                        counter += 1
                        await message.delete()

                self.channels.remove(str(ctx.channel.id))
                embed = discord.Embed(
                    title=f"{counter} messages deleted :D",
                    description=f"{counter} messages by {member.mention} has been deleted from {ctx.channel.mention}.",
                    colour=self.client.primary_colour,
                )
                msg = await ctx.send(embed=embed)
                await asyncio.sleep(3)
                await msg.delete()
            else:
                await ctx.send_help(self.clear)

    @check.is_staff()
    @clear.command(
        usage="[search=100]",
        help="Removes all messages (max. 100 unless specified otherwise).",
    )
    async def all(self, ctx, search: int = 100):
        if str(ctx.channel.id) in self.channels:
            await ctx.send("A clear is in progress. Try again later :D")
            return
            # clear in progress
        self.channels.append(str(ctx.channel.id))

        def check(m):
            return not m.pinned

        messages = await ctx.channel.purge(limit=search, check=check)

        self.channels.remove(str(ctx.channel.id))
        embed = discord.Embed(
            title=f"Messages deleted :D",
            description=f"{len(messages)} messages has been deleted from {ctx.channel.mention}.",
            colour=self.client.primary_colour,
        )
        msg = await ctx.send(embed=embed)
        await asyncio.sleep(3)
        await msg.delete()

    @clear.command(
        usage="[search=100]",
        help="Removes all messages from bot accounts, up to 100 unless otherwise specified.",
    )
    async def bot(self, ctx, search: int = 100):
        if str(ctx.channel.id) in self.channels:
            await ctx.send("A clear is in progress. Try again later :D")
            return
            # clear in progress

        def check(m):
            return m.author.bot and not m.pinned

        self.channels.append(str(ctx.channel.id))
        messages = await ctx.channel.purge(limit=search, check=check)

        self.channels.remove(str(ctx.channel.id))
        embed = discord.Embed(
            title=f"Messages deleted :D",
            description=f"{len(messages)} messages has been deleted from {ctx.channel.mention}.",
            colour=self.client.primary_colour,
        )
        msg = await ctx.send(embed=embed)
        await asyncio.sleep(3)
        await msg.delete()

    @clear.command(
        usage="[search=100]",
        help="Removes all messages from non-bot accounts, up to 100 unless otherwise specified.",
    )
    async def human(self, ctx, search: int = 100):
        if str(ctx.channel.id) in self.channels:
            await ctx.send("A clear is in progress. Try again later :D")
            return
            # clear in progress

        def check(m):
            return not (m.author.bot) and not m.pinned

        self.channels.append(str(ctx.channel.id))
        messages = await ctx.channel.purge(limit=search, check=check)

        self.channels.remove(str(ctx.channel.id))
        embed = discord.Embed(
            title=f"Messages deleted :D",
            description=f"{len(messages)} messages has been deleted from {ctx.channel.mention}.",
            colour=self.client.primary_colour,
        )
        msg = await ctx.send(embed=embed)
        await asyncio.sleep(3)
        await msg.delete()

    @check.is_admin()
    @clear.command(
        usage="[search=100] <substr>",
        help="Removes all messages containing a specified substring. Up to 100 messages unless otherwise specified.",
    )
    async def contains(self, ctx, number: typing.Optional[int] = 100, *, substr: str):
        if str(ctx.channel.id) in self.channels:
            await ctx.send("A clear is in progress. Try again later :D")
            return
            # clear in progress
        await ctx.message.delete()
        self.channels.append(str(ctx.channel.id))

        def check(m):
            return substr in m.content and not m.pinned

        messages = await ctx.channel.purge(limit=number, check=check)
        counter = len(messages)

        self.channels.remove(str(ctx.channel.id))
        embed = discord.Embed(
            title=f"Messages deleted :D",
            description=f"{counter} messages that includes {substr} has been deleted from {ctx.channel.mention}.",
            colour=self.client.primary_colour,
        )
        msg = await ctx.send(embed=embed)
        await asyncio.sleep(3)
        await msg.delete()


def setup(client):
    client.add_cog(Clear(client))
