import asyncio
import discord
from discord.ext import commands
from copy import deepcopy

from utils import check
from utils.altclass import gendispatch
import random

""" # Game logic
# Data... and code
def Pos(x, y):
    return gendispatch(Pos, locals())


SHPOHOR = 0
SHPOVER = 1


def Ship(id, length, pos, orient):  # creates a ship
    # id should be unique; will not be checked; make sure it is indeed unique!
    return gendispatch(Ship, locals())


def Grid(xsz, ysz, data):  # creates a grid
    # gfill's dimensions will not be checked; make sure they are correct!

    def putship(shplen, shppos, orient):
        # empty cells must be set to None
        # does nothing if there's overlap
        d = deepcopy(data)
        if orient == SHPOHOR:
            for i in range(shppos("_x")(), shppos("_x")() + shplen):
                if d[shppos("_y")()][i] != None:
                    return Grid(xsz, ysz, d)
            for i in range(shppos("_x")(), shppos("_x")() + shplen):
                # This loop must be seperate!
                d[shppos("_y")()][i] = Ship(
                    2 ** shppos("_x")()
                    * 3 ** shppos("_y")(),  # reverse prime factoring :)
                    shplen,
                    shppos,
                    orient,
                )
        else:
            for i in range(shppos("_y")(), shppos("_y")() + shplen):
                if d[i][shppos("_x")()] != None:
                    return Grid(xsz, ysz, d)
            for i in range(shppos("_y")(), shppos("_y")() + shplen):
                # This loop must be seperate!
                d[i][shppos("_x")()] = Ship(
                    2 ** shppos("_x")()
                    * 3 ** shppos("_y")(),  # reverse prime factoring :)
                    shplen,
                    shppos,
                    orient,
                )

        return Grid(xsz, ysz, d)

    def killcell(cellpos):
        d = deepcopy(data)
        d[cellpos("_y")()][cellpos("_x")()] = None
        return Grid(xsz, ysz, d)

    return gendispatch(Grid, locals()) """


class Pair:
    first: int
    second: int
    def __init__(self, first, second):
        self.first = first
        self.second = second

class Coordinate:
    def __init__(self, x: int, y:int):
        self.coordinate = Pair(x, y)
    destroyed = False

class Ship:
    def __init__(self, start:Pair, end:Pair):
        # assume the start and end pos are write
        self.start = start
        self.end = end
        self.coords = []
        if self.start.first == self.end.first:
            self.horizontal = True
            self.length = self.end.second - self.start.second
            for i in range(self.length):
                self.coords.append(Coordinate(self.start.second + i, self.end.second))
        else:
            self.horizontal = False
            self.length = self.end.first - self.start.first
            for i in range(self.length):
                self.coords.append(Coordinate(self.start.first + i, self.end.first))

class Battleship(commands.Cog):
    def __init__(self, client):
        self.client = client
        self.hidden = True
    
    def validateMessage(self, msg, ship):
        if len(msg) != 5:
            return "Your move must be of the form [first coordinate]-[second coordinate]"
        elif not msg[0] in list("abcdefgh"):
            return "First letter must be from a to h, reprisenting the vertical axis of the first coordinate."
        elif not msg[1] in list("12345678"):
            return "Second letter must be from 1 to 8, representing the horizontal axis of the first coordinate."
        elif not msg[2] == '-':
            return "Third letter must be a dash, separating the first and second coordinates"
        elif not msg[3] in list("abcdefgh"):
            return "Fourth letter must be from a to h, reprisenting the vertical axis of the second coordinate."
        elif not msg[4] in list("12345678"):
            return "Fifth letter must be from 1 to 8, representing the horizontal axis of the second coordinate."
        elif not (msg[3] == msg[0] or msg[1] == msg[4]):
            return "The second coordinate must be in the same vertical or horizontal axis as the first coordinate."

        curShip = Ship(Pair(ord(msg[0])-96, msg[1]), Pair(ord(msg[3])-95, msg[4]))
        for i in curShip.coords:
            for j in ship:
                for k in j.coords:
                    if i.coordinate.first == k.coordinate.first and i.coordinate.second == k.coordinate.second:
                        return f"You already have a ship there, at [{chr(i.coordinate.first+96)}, {i.coordinate.second}]!"
                if abs(curShip.length) == abs(j.length):
                    return "Ship cannot have the same length as another ship!"

        return "True"

    @check.is_banned()
    @commands.command(
        name="battleship",
        help="Starts a new game of battleship, messages found in DMs",
        usage="",
        aliases=["battle", "bs", "battleships"],
    )
    async def battleship(self, ctx):
        message = await ctx.reply(
            "React on this message to start a battleship game, another person is needed for this game to start!"
        )
        await message.add_reaction("✅")

        user1 = ctx.author
        user2 = None

        def check(reaction, user):
            if (
                reaction.message == message
                and user.id != self.client.user.id
                and user.id != user1.id
            ):
                return True
            else:
                return False

        try:
            reaction, user2 = await self.client.wait_for(
                "reaction_add", timeout=45, check=check
            )
            await ctx.reply(
                embed=discord.Embed(
                    title=f"2 players have joined, battleship game starting",
                    description="This game will be carried out in your DMs to prevent cheating!",
                    color=self.client.primary_colour,
                )
                .add_field(name="Player 1", value=f"{user1.mention}", inline=False)
                .add_field(name="Player 2", value=f"{user2.mention}", inline=False)
                .add_field(name="Battleship sizes", value="1, 2, 3, 4, 5")
            )

            #! Players have joined, initalising board
            board = []
            for i in range(8):
                board.append([])
                for j in range(8):
                    board[i].append("O")

            battleshipSizes = [5,4,3,2,1]
            ships = []

            #! Generate ships
            for i in range(5):
                embed = discord.Embed(title="Choose a location for you to put your ships!", description=f"You have ships of size {battleshipSizes} left to put onto the board.")
                embed2 = discord.Embed(title="The other player is choosing their ship!!", description="Please hold on :)")
                await user1.send(embed = embed)
                await user2.send(embed = embed2)
                while True:
                    try:
                        msg = await self.client.wait_for(
                            "message",
                            timeout=30,
                            check=lambda m: (
                                m.author.id == user1.id
                                and m.channel == m.author.dm_channel
                            ),
                        )
                        result = self.validateMessage(msg.content, ships)
                        if result == "True":
                            msg = msg.content
                            ships.append(Ship(Pair(ord(msg[0])-96, msg[1]), Pair(ord(msg[3])-95, msg[4])))
                            await user1.send(embed = discord.Embed(title = "Ship added!"))
                            break
                        else:
                            await user1.send(embed = discord.Embed(title = "Invalid ship location!", description = result))

                    except asyncio.TimeoutError:
                        await user1.reply(embed=discord.Embed(title="Timed out!"))
                        await user2.reply(embed=discord.Embed(title="The other user timed out!"))

                #! Second user :)
                await user2.send(embed = embed)
                await user1.send(embed = embed2)
                while True:
                    try:
                        msg = await self.client.wait_for(
                            "message",
                            timeout=30,
                            check=lambda m: (
                                m.author.id == user2.id
                                and m.channel == m.author.dm_channel
                            ),
                        )
                        result = self.validateMessage(msg.content, ships)
                        if result == "True":
                            msg = msg.content
                            ships.append(Ship(Pair(ord(msg[0])-96, msg[1]), Pair(ord(msg[3])-95, msg[4])))
                            await user2.send(embed = discord.Embed(title = "Ship added!"))
                            break
                        else:
                            await user2.send(embed = discord.Embed(title = "Invalid ship location!", description=result))

                    except asyncio.TimeoutError:
                        await user2.reply(embed=discord.Embed(title="Timed out!"))
                        await user1.reply(embed=discord.Embed(title="The other user timed out!"))
            
            await ctx.send("Ready!")


        except asyncio.TimeoutError:
            await ctx.reply("No one else joined, please try again later!")
            return

        return ships
def setup(client):
    client.add_cog(Battleship(client))
