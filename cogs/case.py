import discord
from discord.ext import commands


class Case(commands.Cog):
    def __init__(self, client):
        self.client = client
        self.hidden = False

    @commands.command(
        name="camelcase",
        help="Converts a string to camelcase",
        aliases=["cc"],
        usage="<string>",
    )
    async def cc(self, ctx, *message):
        count = 0
        newMessage = []
        for i in message:
            if count == 0:
                count += 1
                newMessage.append(i.lower())
                continue

            newMessage.append(i.title())
            count += 1
        await ctx.reply(
            embed=discord.Embed(
                title="CamelCase", description=f"{''.join(newMessage)}", color=0x00FF00
            )
        )

    @commands.command(
        name="pascalcase",
        help="Converts a string to pascalcase",
        aliases=["pc"],
        usage="<string>",
    )
    async def pc(self, ctx, *message):
        count = 0
        newMessage = []
        for i in message:
            newMessage.append(i.title())
            count += 1
        await ctx.reply(
            embed=discord.Embed(
                title="PascalCase", description=f"{''.join(newMessage)}", color=0x00FF00
            )
        )

    @commands.command(
        name="snakecase",
        help="Converts a string to snakecase",
        aliases=["snake"],
        usage="<string>",
    )
    async def snake(self, ctx, *message):
        await ctx.reply(
            embed=discord.Embed(
                title="SnakeCase", description=f"{'_'.join(message)}", color=0x00FF00
            )
        )

    @commands.command(
        name="uppercase",
        help="Converts a string to uppercase",
        aliases=["upper"],
        usage="<string>",
    )
    async def upper(self, ctx, *message):
        count = 0
        newMessage = []
        for i in message:
            newMessage.append(i.upper())
            count += 1
        await ctx.reply(
            embed=discord.Embed(
                title="UpperCase", description=f"{' '.join(newMessage)}", color=0x00FF00
            )
        )

    @commands.command(
        name="lowercase",
        help="Converts a string to lowercase",
        aliases=["lower"],
        usage="<string>",
    )
    async def lower(self, ctx, *message):
        count = 0
        newMessage = []
        for i in message:
            newMessage.append(i.lower())
            count += 1
        await ctx.reply(
            embed=discord.Embed(
                title="LowerCase", description=f"{' '.join(newMessage)}", color=0x00FF00
            )
        )

    @commands.command(
        name="lispcase",
        help="Converts a string to lispcase",
        aliases=["lisp"],
        usage="<string>",
    )
    async def lisp(self, ctx, *message):
        await ctx.reply(
            embed=discord.Embed(
                title="LispCase", description=f"{'-'.join(message)}", color=0x00FF00
            )
        )


def setup(client):
    client.add_cog(Case(client))
