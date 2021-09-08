import discord
from discord_components import Button, ButtonStyle
from utils.paginator import Paginator


async def leaderboard_generate(self, ctx, leaderboard_type):
    #! Firebase Initalisation
    self.init = self.client.get_cog("Init")
    await self.init.checkserver(ctx)
    doc_ref = self.db.collection("users")
    collection = doc_ref.stream()

    userWinData = []
    for doc in collection:
        dictionary = doc.to_dict()
        if leaderboard_type in dictionary:
            userWinData.append(
                {
                    "wins": dictionary["leaderboard_type"],
                    "name": await self.client.fetch_user(doc.id),
                }
            )

    userWinData = sorted(userWinData, key=lambda k: k["wins"], reverse=True)
    #! PAGES
    pages = []
    page = discord.Embed(
        title="Leaderboard!",
        description=f"{leaderboard_type.capitalize()} leaderboard",
        colour=self.client.primary_colour,
    )
    page.set_author(name=self.client.user.name, icon_url=self.client.user.avatar_url)
    page.set_footer(text="Press Next to see the leaderboard :D")
    pages.append(page)

    length = len(userWinData)
    total_pages = length // 20 + 1
    count = 0
    count1 = 0
    for i in range(0, total_pages):
        count1 += 1
        string = ""
        for j in range(0, 20):
            count += 1
            if i * 20 + j >= length:
                break
            curList = userWinData[i * 20 + j]
            name = curList["name"].name
            disc = curList["name"].discriminator
            wins = curList["wins"]
            string += f"#{count}. `{name}#{disc}`-`{wins}`\n"

        page = discord.Embed(
            title=f"Page: {count1}",
            description=string,
            colour=self.client.primary_colour,
        )
        page.set_author(
            name=self.client.user.name, icon_url=self.client.user.avatar_url
        )
        pages.append(page)

    page_num = 0
    msg = await ctx.send(
        embed=pages[page_num],
    )
    buttons = [
        [
            Button(
                style=ButtonStyle.URL,
                label="Invite the bot!",
                url="https://discord.com/api/oauth2/authorize?client_id=863419048041381920&permissions=8&scope=bot%20applications.commands",
            )
        ]
    ]
    page = Paginator(self.client, ctx, msg, pages, buttons=buttons, timeout=120)
    await page.start()
