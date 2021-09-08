import discord
from discord.ext import commands
import firebase_admin
from firebase_admin import firestore
from utils import check
from discord.ext.commands import cooldown, BucketType


class Todo(commands.Cog):
    def __init__(self, client):
        self.client = client
        self.db = firestore.client()
        self.init = self.client.get_cog("Init")
        self.hidden = True

    @check.is_staff()
    @commands.command(
        name="todoAdd",
        help="Add an item to the todo list!",
        alias=["tAdd", "todoNew"],
        usage="todoAdd <task>",
    )
    @cooldown(1, 3, BucketType.user)
    async def todoAdd(self, ctx, *msg):
        task = " ".join(msg)
        self.init = self.client.get_cog("Init")
        await self.init.checkserver(ctx)
        doc_ref = self.db.collection("servers").document(str(ctx.guild.id))
        doc = doc_ref.get()
        data = doc.to_dict()
        try:
            data["todo"].append(task)
        except KeyError:
            data["todo"] = [task]
        doc_ref.set(data)
        await ctx.send("Added")

    @check.is_staff()
    @commands.command(
        name="todoList",
        help="Show your current todo list!",
        alias=["todo", "listTodo"],
        usage="todoList",
    )
    @cooldown(1, 3, BucketType.user)
    async def todo(self, ctx):
        self.init = self.client.get_cog("Init")
        await self.init.checkserver(ctx)
        doc_ref = self.db.collection("servers").document(str(ctx.guild.id))
        doc = doc_ref.get()
        data = doc.to_dict()
        count = 0
        description = ""
        for i in data["todo"]:
            count += 1
            description += f"({count}) {i} \n"
        embed = discord.Embed(
            title="TODO LIST",
            description=description,
            colour=self.client.primary_colour,
        )
        await ctx.send(embed=embed)

    @check.is_staff()
    @commands.command(
        name="todoRemove",
        help="Remove an item to the todo list!",
        alias=["todoRem", "todoR", "tRem"],
        usage="<task>",
    )
    @cooldown(1, 3, BucketType.user)
    async def todoRem(self, ctx, number):
        self.init = self.client.get_cog("Init")
        await self.init.checkserver(ctx)
        doc_ref = self.db.collection("servers").document(str(ctx.guild.id))
        doc = doc_ref.get()
        data = doc.to_dict()
        try:
            data["todo"].pop(int(number) - 1)
        except:
            await ctx.send(
                "Item does not exist. Do note that you are supposed to state the number of the element you want to remove"
            )
            return
        doc_ref.set(data)
        await ctx.send("Successfully removed, run `todo` to check the list")


def setup(client):
    client.add_cog(Todo(client))
