import discord
from discord.ext import commands
from firebase_admin import firestore
import threading
import json
from utils import check
from discord.ext.commands import cooldown, BucketType


class Autoresponse(commands.Cog):
    def __init__(self, client):
        self.client = client
        self.hidden = False
        self.autoresponse = {}
        self.db = firestore.client()
        self.init = self.client.get_cog("Init")
        docs = self.db.collection("servers").stream()
        for doc in docs:
            data = doc.to_dict()["autoresponses"]
            self.autoresponse[str(doc.id)] = data

        callback_done = threading.Event()

        # Create a callback on_snapshot function to capture changes
        def on_snapshot(col_snapshot, changes, read_time):
            for change in changes:
                self.autoresponse[str(change.document.id)] = change.document.to_dict()[
                    "autoresponses"
                ]
            callback_done.set()

        col_query = self.db.collection("servers")
        query_watch = col_query.on_snapshot(on_snapshot)

    @commands.Cog.listener()
    async def on_message(self, msg):
        if msg.author.bot:
            return
        if msg.guild == None:
            return
        if msg.author == self.client.user:
            return
        content = ""
        if str(msg.guild.id) in self.autoresponse:
            for trigger in self.autoresponse[str(msg.guild.id)]:
                if trigger.lower() in msg.content.lower():
                    toAdd = self.autoresponse[str(msg.guild.id)][trigger] + "\n"
                    if len(toAdd) + len(content) > 2000:
                        await msg.channel.send(content)
                        return
                    content += toAdd
            if content != "":
                await msg.channel.send(content)

    @check.is_admin()
    @commands.group(name="autoresponse", invoke_without_command=True, aliases=["ar"])
    async def auto_response(self, ctx):
        responses = self.autoresponse[str(ctx.guild.id)]
        description = ""
        if len(responses) == 0:
            description = "This server has no autoresponses."
        else:
            count = 0
            for i in responses:
                description += f"{count+1}. `{i}`. Response: \n{responses[i]}\n"
                count += 1
        embed = discord.Embed(
            title="Autoresponses",
            description=description,
            colour=self.client.primary_colour,
        )

        await ctx.send(embed=embed)

    @check.is_admin()
    @auto_response.command(name="add", aliases=["edit"])
    async def add_subcommand(self, ctx, trigger: str, *, response: str):
        self.init = self.client.get_cog("Init")
        await self.init.checkserver(ctx)
        doc_ref = self.db.collection("servers").document(str(ctx.guild.id))
        data = doc_ref.get().to_dict()
        if len(trigger) < 2:
            await ctx.send(
                "Trigger must be at least 2 characters, this is to avoid spam."
            )
            return
        if len(response) > 1000:
            await ctx.send(
                "Response must be less than 1000 characters, this is to avoid spam."
            )
            return

        data["autoresponses"][trigger] = response
        doc_ref.update(data)

        await ctx.send(f"{trigger} added.")

    @check.is_admin()
    @auto_response.command(name="remove")
    async def remove_subcommand(self, ctx, trigger: str):
        self.init = self.client.get_cog("Init")
        await self.init.checkserver(ctx)
        doc_ref = self.db.collection("servers").document(str(ctx.guild.id))
        data = doc_ref.get().to_dict()

        if trigger not in data["autoresponses"]:
            await ctx.send("That trigger does not exist.")
            return
        else:
            data["autoresponses"].pop(trigger)

        doc_ref.update(data)
        await ctx.send(f"{trigger} removed.")


def setup(client):
    client.add_cog(Autoresponse(client))
