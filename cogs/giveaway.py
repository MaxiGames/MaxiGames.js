import discord
from discord.ext import commands
from firebase_admin import firestore
from interruptingcow import timeout
import asyncio
import typing
import time

class Giveaway(commands.Cog):
    def __init__(self, client):
        self.client = client
        self.db = firestore.client()
        self.hidden = True
    
    @commands.group(invoke_without_command=True)
    async def giveaway(self, ctx): 
        pass
        #print out all running giveaways
    
    @giveaway.command()
    async def start(self, ctx, days:int, hours:int, minutes:int, seconds:int, winners:typing.Optional[int] = 1, *msg):
        #start a giveaway
        reason = " ".join(msg)
        time = seconds
        time = time + (minutes * 60)
        time = time + (hours * 3600)
        time = time + (days * 86400)
        embed=discord.Embed(
            title="New Giveaway!!!",
            description="React with "
        )

        await asyncio.sleep(time)

        # try:
        #     with timeout(time, exception=RuntimeError):
        #         try:
        #             while True:
        #                 await ctx.send("One second")
        #                 await asyncio.sleep(1)
        #         except:
        #             await ctx.send("Giveaway timed out")
        # except RuntimeError:
        #     await ctx.send("Giveaway timed out")
        # pass
"""
from interruptingcow import timeout

try:
    with timeout(5, exception=RuntimeError):
        # perform a potentially very slow operation
        pass
except RuntimeError:
    print "didn't finish within 5 seconds"
"""
def setup(client):
    client.add_cog(Giveaway(client))