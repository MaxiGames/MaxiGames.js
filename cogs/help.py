import discord
from discord.ext.commands import Cog, HelpCommand
from utils.paginator import Paginator
from discord_components import ButtonStyle, Button


class CustomHelpCommand(HelpCommand):
    def __init__(self):
        super().__init__(
            command_attrs={"description": "Shows this help message.", "hidden": True}
        )

    async def send_bot_help(self, mapping):
        # for i in mapping:
        pages = []
        page = discord.Embed(
            title="Help",
            description="""Hallo! Thank you for using Maxigames, a fun, random, cheerful and gambling-addiction-curbing bot developed as part of an initiative to curb gambling addiction and fill everyones' lives with bad puns, minigames and happiness!!!

            Feel free to invite this bot to your own server from the link below, or even join our support server, if you have any questions or suggestions :D""",
            colour=self.cog.client.primary_colour,
        )
        page.set_author(
            name=self.cog.client.user.name, icon_url=self.cog.client.user.avatar_url
        )
        page.set_footer(text="Press Next to see the commands")
        pages.append(page)

        page = discord.Embed(
            title="Commands",
            description=f"See all commmands that MaxiGame has to offer! Do {self.clean_prefix}help <command> to get more information :D",
            colour=self.cog.client.primary_colour,
        )
        page.set_thumbnail(url=self.cog.client.user.avatar_url)

        totalCount = 0
        for cog in mapping:
            if cog is None:
                continue
            if cog.hidden:
                continue
            cog_commands = mapping[cog]
            if len(cog_commands) == 0:
                continue
            count = 0

            cmds = "```\n"
            for cmd in cog_commands:
                count += 1
                if cmd.hidden is False:
                    cmds += cmd.name + "\n"
            cmds += "```"
            if count > 20:
                #! if amount of commands on its own is too much to fit in one page, have its own page
                pages.append(page)
                # give it its on page
                page = discord.Embed(
                    title="Commands",
                    description="See all commands that MaxiGame has to offer",
                    colour=self.cog.client.primary_colour,
                )
                page.add_field(name=cog.qualified_name, value=cmds)
                page.set_thumbnail(url=self.cog.client.user.avatar_url)
                pages.append(page)

                # reset page
                page = discord.Embed(
                    title="Commands",
                    description="See all commands that MaxiGame has to offer",
                    colour=self.cog.client.primary_colour,
                )
                page.set_thumbnail(url=self.cog.client.user.avatar_url)
                totalCount = 0
            elif totalCount + count > 20:
                #! if amount of commands is too much to fit in one page, make a new page
                pages.append(page)
                totalCount = count
                page = discord.Embed(
                    title="Commands",
                    description="See all commands that MaxiGame has to offer",
                    colour=self.cog.client.primary_colour,
                )
                page.add_field(name=cog.qualified_name, value=cmds)
                page.set_thumbnail(url=self.cog.client.user.avatar_url)
            else:
                page.add_field(name=cog.qualified_name, value=cmds)
                totalCount += count

        page_num = 0
        msg = await self.context.send(
            embed=pages[page_num],
        )
        buttons = [
            [
                Button(
                    style=ButtonStyle.URL,
                    label="Invite the bot!",
                    url="https://discord.com/api/oauth2/authorize?client_id=863419048041381920&permissions=261188091120&scope=bot%20applications.commands",
                ),
                Button(
                    style=ButtonStyle.URL,
                    label="Join support server!",
                    url="https://discord.gg/BNm87Cvdx3",
                ),
                Button(
                    style=ButtonStyle.URL,
                    label="Vote for us!",
                    url="https://top.gg/bot/863419048041381920",
                ),
            ]
        ]
        page = Paginator(
            self.cog.client, self.context, msg, pages, buttons=buttons, timeout=60
        )
        await page.start()
        return await super().send_bot_help(mapping)

    async def send_command_help(self, command):
        if command.hidden or (command.cog is not None and command.cog.hidden):
            return
        embed = discord.Embed(
            title=f"Command `{command.name}`",
            description=command.help,
            colour=self.cog.client.primary_colour,
        )
        if command.usage is not None:
            usage = "\n".join(
                [
                    self.context.prefix + command.name + " " + x.strip()
                    for x in command.usage.split("\n")
                ]
            )
            embed.add_field(name="Usage", value=f"```{usage}```", inline=False)
        if len(command.aliases) > 1:
            embed.add_field(name="Aliases", value=f"`{'`, `'.join(command.aliases)}`")
        elif len(command.aliases) > 0:
            embed.add_field(name="Alias", value=f"`{command.aliases[0]}`")
        embed.set_author(
            name=self.cog.client.user.name, icon_url=self.cog.client.user.avatar_url
        )
        await self.context.send(embed=embed)
        return

    async def send_cog_help(self, cog):
        if cog.hidden:
            return
        return

    async def send_group_help(self, group):
        if group.hidden:
            return
        if group.cog.hidden:
            return
        commands = list(group.commands)
        if len(commands) == 0:
            self.send_command_help(group)
        # commands.insert(0, group)
        pages = []
        commands = [commands[i : i + 5] for i in range(0, len(commands), 5)]
        for command_s in commands:
            page = discord.Embed(
                title=f"{group.name} {group.usage} ({len(list(group.commands))} commands)",
                description=group.help,
                colour=self.cog.client.primary_colour,
            )
            page.set_author(
                name=self.cog.client.user.name, icon_url=self.cog.client.user.avatar_url
            )
            for command in command_s:
                if command.usage is None:
                    page.add_field(
                        name=f"{command.name}", value=command.help, inline=False
                    )
                else:
                    page.add_field(
                        name=f"{command.name} {command.usage}",
                        value=command.help,
                        inline=False,
                    )
            pages.append(page)
        msg = await self.context.send(
            embed=pages[0],
        )
        page = Paginator(self.cog.client, self.context, msg, pages, timeout=60)
        await page.start()

    async def send_error_message(self, error):
        embed = discord.Embed(
            title="Command not Found",
            description=f"{error} Please check that your spelling and capitalisation is correct :D",
            colour=self.cog.client.primary_colour,
        )
        embed.set_author(
            name=self.cog.client.user.name, icon_url=self.cog.client.user.avatar_url
        )
        await self.context.send(embed=embed)


class Help(Cog):
    def __init__(self, client):
        self.client = client
        self.old_help_command = client.help_command
        client.help_command = CustomHelpCommand()
        client.help_command.cog = self
        self.hidden = True


def setup(client):
    client.add_cog(Help(client))
