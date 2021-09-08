from gc import DEBUG_SAVEALL
import discord
from discord.ext import commands
from discord_components import ButtonStyle, Button, InteractionType, message
from utils import check
import firebase_admin
from firebase_admin import firestore


class Ticket(commands.Cog):
    def __init__(self, client):
        self.client = client
        self.hidden = False
        self.db = firestore.client()
        doc_ref = self.db.collection("tickets").document("ticket-ref")
        doc = doc_ref.get()
        if doc.exists:
            self.messages = doc.to_dict()["messages"]
            self.count = doc.to_dict()["count"]
            self.active_tickets = doc.to_dict()["active_tickets"]
        else:
            self.messages = {}
            self.count = {}
            self.active_tickets = {}

    @commands.command(
        name="newTicket",
        help="Creates a new message that reacts so one can make a ticket",
        usage="",
        alias=["nt", "ticket"],
    )
    async def newticket(self, ctx):
        embed = discord.Embed(
            title="Get tickets here :D",
            description="To create a ticket react with 🎫 :D",
            colour=self.client.primary_colour,
        )
        embed.set_footer(
            text="MaxiGames - The Best Minigame Bot",
            icon_url=self.client.user.avatar_url,
        )
        msg = await ctx.send(embed=embed)
        await msg.add_reaction("🎫")
        if str(ctx.guild.id) not in self.messages:
            self.messages[str(ctx.guild.id)] = [str(msg.id)]
            self.count[str(ctx.guild.id)] = 0
            self.active_tickets[str(ctx.guild.id)] = {}
        else:
            self.messages[str(ctx.guild.id)].append(str(msg.id))
        doc_ref = self.db.collection("tickets").document("ticket-ref")
        doc = doc_ref.get()
        if doc.exists:
            data = doc.to_dict()
            data["messages"] = self.messages
            data["count"] = self.count
            data["active_tickets"] = self.active_tickets
        else:
            data = {
                "active_tickets": self.active_tickets,
                "messages": self.messages,
                "count": self.count,
            }
        doc_ref.set(data)
        await ctx.message.delete()

    @commands.Cog.listener()
    async def on_raw_reaction_add(self, payload):
        if payload.user_id == self.client.user.id:  # if I added the reaction myself
            return

        react_guild = self.client.get_guild(payload.guild_id)
        react_channel = self.client.get_channel(payload.channel_id)
        react_msg = await react_channel.fetch_message(payload.message_id)

        if (
            str(payload.guild_id) in self.messages
            and str(payload.message_id) in self.messages[str(payload.guild_id)]
            and payload.emoji.name == "🎫"
        ):
            # does ticket exist?
            if str(payload.user_id) in self.active_tickets[str(payload.guild_id)]:
                embed = discord.Embed(
                    title="Ticket Present",
                    description="You can only have 1 ticket open per server. Please close the other ticket before starting a new one :D",
                    colour=self.client.primary_colour,
                )
                embed.set_footer(
                    text="MaxiGames - The Best Minigame Bot",
                    icon_url=self.client.user.avatar_url,
                )
                await react_channel.send(embed=embed)
                return

            found = False
            for category in react_guild.categories:
                if category.name == "open-tickets":
                    found = True
                    break

            if not found:
                category = await react_guild.create_category(
                    f"open-tickets", position=0
                )
            overwrites = {
                react_guild.default_role: discord.PermissionOverwrite(
                    view_channel=False
                ),
                payload.member: discord.PermissionOverwrite(
                    read_messages=True, add_reactions=True, send_messages=True
                ),
            }
            self.count[str(payload.guild_id)] += 1
            self.active_tickets[str(payload.guild_id)][
                str(payload.user_id)
            ] = self.count[str(payload.guild_id)]
            channel = await react_guild.create_text_channel(
                f"ticket-{self.count[str(payload.guild_id)]}",
                overwrites=overwrites,
                category=category,
            )

            embed = discord.Embed(
                title="New Ticket",
                description=f"Welcome {payload.member.mention} to your new ticket.",
                colour=self.client.primary_colour,
            )
            embed.set_footer(
                text="MaxiGames - The Best Minigame Bot",
                icon_url=self.client.user.avatar_url,
            )
            startmsg = await channel.send(
                embed=embed,
                components=[[Button(style=ButtonStyle.grey, label="🔒 Close")]],
                allowed_mentions=discord.AllowedMentions.all(),
            )
            await react_msg.remove_reaction("🎫", payload.member)

            doc_ref = self.db.collection("tickets").document("ticket-ref")
            data = {
                "active_tickets": self.active_tickets,
                "messages": self.messages,
                "count": self.count,
            }
            doc_ref.set(data)

            while True:

                res = await self.client.wait_for(
                    "button_click",
                    check=lambda inter: (
                        inter.user == payload.member
                        and inter.message.channel == channel
                        and inter.component.label == "🔒 Close"
                    ),
                )

                await res.respond(
                    type=InteractionType.DeferredUpdateMessage  # , content=f"{res.component.label} pressed"
                )

                confirmation = discord.Embed(
                    title="Confirm closing of ticket",
                    description=f"Please confirm that you want to delete this ticket. This is not reversible.",
                    colour=self.client.primary_colour,
                )
                embed.set_footer(
                    text="MaxiGames - The Best Minigame Bot",
                    icon_url=self.client.user.avatar_url,
                )
                confirm = await channel.send(
                    embed=confirmation,
                    components=[
                        [
                            Button(style=ButtonStyle.red, label="Close"),
                            Button(style=ButtonStyle.grey, label="Cancel"),
                        ]
                    ],
                )

                res = await self.client.wait_for(
                    "button_click",
                    check=lambda inter: inter.user == payload.member
                    and inter.message.channel == channel,
                )

                await res.respond(
                    type=InteractionType.DeferredUpdateMessage  # , content=f"{res.component.label} pressed"
                )
                if res.component.label == "Close":
                    await channel.delete()
                    # self.messages[str(reaction.message.guild.id)].remove(str(reaction.message.id))
                    self.active_tickets[str(payload.guild_id)].pop(str(payload.user_id))
                    doc_ref = self.db.collection("tickets").document("ticket-ref")
                    data = {
                        "active_tickets": self.active_tickets,
                        "messages": self.messages,
                        "count": self.count,
                    }
                    doc_ref.set(data)
                    break
                else:
                    await confirm.delete()


def setup(client):
    client.add_cog(Ticket(client))
