import discord
from discord.ext import commands
import traceback


class Errors(commands.Cog):
    def __init__(self, client):
        self.client = client
        self.hidden = True

    @commands.Cog.listener()
    async def on_command_error(self, ctx, error, bypass=False):
        if isinstance(error, commands.CommandNotFound):
            pass
        elif isinstance(error, commands.NotOwner):
            embed = discord.Embed(
                title="Unauthorised Access",
                description="You are not authorised to use this command.",
                colour=self.client.error_colour,
            )
            embed.set_author(
                name=ctx.author.display_name, icon_url=ctx.author.avatar_url
            )
            await ctx.send(embed=embed)

        elif isinstance(error, commands.MissingPermissions):
            embed = discord.Embed(
                title="Missing Permissions",
                description="You do not have permission to run this command. It might be because it is a command only for admins, or because you have been banned.",
                colour=self.client.error_colour,
            )
            embed.set_author(
                name=ctx.author.display_name, icon_url=ctx.author.avatar_url
            )
            await ctx.send(embed=embed)

        elif isinstance(error, commands.CommandOnCooldown):
            seconds = round(error.retry_after)
            embed = discord.Embed(
                title="Command on Cooldown",
                description=f"This command is on cooldown. Try again in {error.retry_after:,.1f} seconds.",
                colour=self.client.primary_colour,
            )
            if seconds < 60:
                embed.description = (
                    f"This command is on cooldown. Try again in {seconds} seconds."
                )
            elif seconds >= 60:
                minutes = seconds // 60
                embed.description = (
                    f"This command is on cooldown. Try again in {minutes} minutes."
                )
            elif seconds >= 3600:
                hours = seconds // 3600
                embed.description = (
                    f"This command is on cooldown. Try again in {hours} hours."
                )

            embed.set_author(
                name=ctx.author.display_name, icon_url=ctx.author.avatar_url
            )
            await ctx.send(embed=embed)

        elif isinstance(error, commands.BadArgument):
            embed = discord.Embed(
                title="Incorrect Argument",
                description="There is an error with your command statement. Please check your command syntax through `m!help <command>`.",
                colour=self.client.primary_colour,
            )
            embed.set_author(
                name=ctx.author.display_name, icon_url=ctx.author.avatar_url
            )
            await ctx.channel.send(embed=embed)

        elif isinstance(error, commands.MissingRequiredArgument):
            embed = discord.Embed(
                title="Missing required argument",
                description="You are missing required arguments. Please check your command syntax through `m!help <command>`.",
                colour=self.client.error_colour,
            )

            embed.set_author(
                name=ctx.author.display_name, icon_url=ctx.author.avatar_url
            )
            await ctx.reply(embed=embed)

        else:
            raise error


def setup(client):
    client.add_cog(Errors(client))
    # pass
