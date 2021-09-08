import discord
from discord.ext import commands
from firebase_admin import firestore
from utils import check
from discord.ext.commands import cooldown, BucketType


class Inventory(commands.Cog):
    def __init__(self, client):
        self.client = client
        self.db = firestore.client()
        self.utility = self.client.get_cog("Utility")
        self.init = self.client.get_cog("Initiation")
        self.hidden = False

    @check.is_admin()
    @cooldown(1, 15, BucketType.user)
    @commands.command(
        name="addShop",
        help="Add an item to shop. Only admins can use this command.",
        usage="<item-name>",
        aliases=["addToShop", "addItem", "newItem"],
    )
    async def _add_to_shop(self, ctx, price: int, *name):
        self.item = " ".join(name[:])
        self.doc_ref = self.db.collection("servers").document(
            "{}".format(str(ctx.guild.id))
        )
        self.doc = self.doc_ref.get()
        if self.doc.exists:
            if price < 0:
                await ctx.reply("Stop trying to exploit the system...")
                return

            dict1 = self.doc.to_dict()
            dict1["all"][self.item] = price
            self.doc_ref.set(dict1)

            embed = discord.Embed(
                title="Item Added",
                description=f"**{self.item}** with price of **{price}** points added to shop",
                colour=self.client.primary_colour,
            )
            embed.set_author(
                name=self.client.user.name, icon_url=self.client.user.avatar_url
            )
            await ctx.send(embed=embed, allowed_mentions=discord.AllowedMentions.none())
            # await ctx.reply(embed=embed)
        else:
            await self.init.serverinitiate(ctx)

    @check.is_admin()
    @cooldown(1, 15, BucketType.user)
    @commands.command(
        name="removeShop",
        aliases=["rs", "rShop", "removeItem", "rItem", "deleteItem", "dItem", "di"],
        usage="<item>",
        help="removes an item fromm the shop",
    )
    async def removeshop(self, ctx, *msg):
        item = " ".join(msg[:])
        self.doc_ref = self.db.collection("servers").document(
            "{}".format(str(ctx.guild.id))
        )
        self.doc = self.doc_ref.get()
        if self.doc.exists:

            dict1 = self.doc.to_dict()
            if item in dict1["all"]:
                dict1["all"].pop(item)
            else:
                embed = discord.Embed(
                    title="Item not in shop",
                    description="The item you specified is not in the server's shop. Please check using `n!shop` and make sure everything is correctly spelled :)",
                    colour=self.client.primary_colour,
                )
                await ctx.send(embed=embed)
                return
            self.doc_ref.set(dict1)

            embed = discord.Embed(
                title="Item Added",
                description=f"**{self.item}** with has been removed from shop",
                colour=self.client.primary_colour,
            )
            embed.set_author(
                name=self.client.user.name, icon_url=self.client.user.avatar_url
            )
            await ctx.send(embed=embed, allowed_mentions=discord.AllowedMentions.none())
            # await ctx.reply(embed=embed)
        else:
            await self.init.serverinitiate(ctx)

    @commands.command(
        name="shop",
        aliases=["shopList", "s"],
        help="lists the items in the shop",
        usage="",
    )
    @cooldown(1, 15, BucketType.user)
    async def _shop(self, ctx):
        self.doc_ref = self.db.collection("servers").document(
            "{}".format(str(ctx.guild.id))
        )
        self.doc = self.doc_ref.get()
        self.dict2 = self.doc.to_dict()
        self.objects = self.dict2["all"]
        self.description = ""
        for i in sorted(self.objects.items(), key=lambda kv: (kv[1]), reverse=True):
            self.description += f"{i[0]} ({i[1]} points)\n"

        self.embed = discord.Embed(
            title="Shop",
            description=self.description,
            colour=self.client.primary_colour,
        )
        self.embed.set_author(
            name=self.client.user.name, icon_url=self.client.user.avatar_url
        )
        await ctx.send(
            embed=self.embed, allowed_mentions=discord.AllowedMentions.none()
        )

    @commands.command(
        name="inventory",
        help="shows the user's inventory",
        usage="[user]",
        aliases=["bp", "inv", "backpack", "bag"],
    )
    @cooldown(1, 15, BucketType.user)
    async def _inv(self, ctx, user: discord.Member = None):
        if user is None:
            user = ctx.author
        doc_ref = self.db.collection("servers").document("{}".format(str(ctx.guild.id)))
        doc = doc_ref.get()
        dict2 = doc.to_dict()["users"]
        items = []
        if str(user.id) not in dict2:
            embed = discord.Embed(
                title="User not in server",
                description="The user you specified is not found in this server. Please make sure you are mentioning the right person.",
                colour=self.client.primary_colour,
            )
            await ctx.reply(embed=embed)
            return

        for i in dict2[str(user.id)]:
            items.append(i)
        items.sort()
        description = "\n".join(items)
        embed = discord.Embed(
            title=f"Inventory of {user.display_name}",
            description=description,
            colour=self.client.primary_colour,
        )

        embed.set_author(name=user.display_name, icon_url=user.avatar_url)
        await ctx.reply(embed=embed, allowed_mentions=discord.AllowedMentions.none())

    @commands.command(
        name="buy",
        help="buy an item from the guild's shop",
        usage="<item>",
        aliases=["purchase", "p", "buyItem", "pItem", "pi", "purchaseItem"],
    )
    @cooldown(1, 15, BucketType.user)
    async def buy(self, ctx, *hi):
        item = " ".join(hi[:])
        uid = str(ctx.author.id)
        doc_ref = self.db.collection("servers").document("{}".format(str(ctx.guild.id)))
        doc = doc_ref.get()
        dict2 = doc.to_dict()
        items = dict2["all"]
        if item not in items:
            embed = discord.Embed(
                title="Incorrect Item",
                description="This item cannot be found in the shop in this server. Please check that you have spelled everything correctly.",
                colour=self.client.primary_colour,
            )
            embed.set_author(
                name=ctx.author.display_name, icon_url=ctx.author.avatar_url
            )
            await ctx.reply(embed=embed)
            return

        self.client.get_cog("Initiation").checkserver(ctx)
        user_ref = self.db.collection("users").document("{}".format(uid))
        user = user_ref.get()
        user_dict = user.to_dict()
        if user.exists:
            amount = user_dict["money"]
            if amount < items[item]:
                embed = discord.Embed(
                    title="Unable to afford",
                    description="You are not able to afford this item due to insufficient funds.",
                    colour=self.client.primary_colour,
                )
                embed.set_author(
                    name=ctx.author.display_name, icon_url=ctx.author.avatar_url
                )
                await ctx.reply(embed=embed)
                return
            user_dict["money"] -= items[item]
            user_ref.set(user_dict)
            if item in dict2["users"][uid]:
                dict2["users"][uid][item] += 1
            else:
                dict2["users"][uid][item] = 1

            doc_ref.set(dict2)
            embed = discord.Embed(
                title="Item Bought",
                description=f"You bought **{item}** for **{items[item]}**    points :D",
                colour=self.client.primary_colour,
            )
            embed.add_field(
                name="Amount left", value=str(user_dict["money"]), inline=False
            )
            embed.set_author(
                name=ctx.author.display_name, icon_url=ctx.author.avatar_url
            )
            await ctx.reply(
                embed=embed, allowed_mentions=discord.AllowedMentions.none()
            )

        else:
            await self.init.initiate(ctx)


def setup(client):
    client.add_cog(Inventory(client))
