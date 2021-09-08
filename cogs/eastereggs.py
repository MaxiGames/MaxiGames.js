import discord
from discord.ext import commands
from discord.ext.commands.core import has_guild_permissions


class EasterEggs(commands.Cog):
    def __init__(self, client):
        self.client = client
        self.hidden = True

    @commands.command(hidden=True, aliases=["whoareu"], help="Easter eggs?")
    async def whoru(self, ctx):
        embed = discord.Embed(
            title="Hey! Looks like you found this easter egg!",
            description="Nice.",
            color=self.client.primary_colour,
        )
        embed.add_field(
            name="Whoami?",
            value="I am Maxigames! The creation of amateur bot devs <@!712942935129456671>, <@!676748194956181505>, <@!782247763542016010> and <@!682592012163481616>!",
            inline=False,
        )
        embed.add_field(
            name="Are there more easter eggs?", value="Yes of course ^_^.", inline=False
        )
        await ctx.author.send(embed=embed)

    @commands.command(hidden=True, aliases=["gamblingisbad"], help="Easter eggs?")
    async def gamblingbad(self, ctx):
        embed = discord.Embed(
            title="Gambling is bad :D",
            description="You will lose money if you play MaxiGames gambling games :D",
            color=self.client.primary_colour,
        )
        embed.add_field(
            name="Gamble/roll information:",
            value="Chance to win: 40.83%\nChance to lose: 50.83%\nChance to draw: 8.33%\nOverall expected gain compared to bet: -14.16%",
            inline=True,
        )
        embed.add_field(
            name="Snake eyes information:",
            value="Chance to win 10x: 2.78%\nChance to win 1.8x: 27.78%\nChance to lose: **69**.44%\nOverall expected gain compared to bet: -22.22%",
            inline=True,
        )
        embed.add_field(
            name="So what have you learnt about gambling??",
            value="That it is bad!",
            inline=True,
        )
        await ctx.author.send(embed=embed)


def setup(client):
    client.add_cog(EasterEggs(client))
