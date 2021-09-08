import asyncio
from typing import List, Optional, Union

import discord
from discord import embeds
from discord.ext import commands

from discord_components import Button, ButtonStyle, InteractionType

import copy

# creds https://github.com/khk4912/EZPaginator/blob/master/EZPaginator/EZPaginator.py
class Paginator:
    def __init__(
        self,
        client: Union[
            discord.Client,
            discord.AutoShardedClient,
            commands.Bot,
            commands.AutoShardedBot,
        ],
        ctx: commands.Context,
        message: discord.Message,
        pages: List[discord.Embed],
        buttons: List[List[Button]] = [],
        first_symbol: str = "«",
        previous_symbol: str = "‹",
        next_symbol: str = "›",
        last_symbol: str = "»",
        timeout: int = 60,
        start_page: int = 0,
    ):
        self.client = client
        self.ctx = ctx
        self.message = message
        self.pages = pages
        self.buttons: List[List[Button]] = buttons
        self.first_symbol = first_symbol
        self.previous_symbol = previous_symbol
        self.next_symbol = next_symbol
        self.last_symbol = last_symbol
        self.timeout = timeout
        self.page_num = start_page

        if not (
            isinstance(client, discord.Client)
            or isinstance(client, discord.AutoShardedClient)
            or isinstance(client, commands.Bot)
            or isinstance(client, commands.AutoShardedBot)
        ):
            raise TypeError("Paginator client must be a discord.Client or commands.Bot")

    async def start(self):
        if len(self.pages) <= 1:
            add_on_buttons = [
                Button(style=ButtonStyle.green, label=self.first_symbol, disabled=True),
                Button(
                    style=ButtonStyle.green, label=self.previous_symbol, disabled=True
                ),
                Button(
                    style=ButtonStyle.gray,
                    label=f"Page {self.page_num+1}/{len(self.pages)}",
                    disabled=True,
                ),
                Button(style=ButtonStyle.green, label=self.next_symbol, disabled=True),
                Button(
                    style=ButtonStyle.green,
                    label=self.last_symbol,
                    disabled=True,
                ),
            ]
            component = copy.copy(self.buttons)
            component.append(add_on_buttons)
            await self.message.edit(
                embed=self.pages[self.page_num], components=copy.copy(component)
            )
            return

        add_on_buttons: List[Button] = [
            Button(style=ButtonStyle.green, label=self.first_symbol, disabled=True),
            Button(style=ButtonStyle.green, label=self.previous_symbol, disabled=True),
            Button(
                style=ButtonStyle.gray,
                label=f"Page {self.page_num+1}/{len(self.pages)}",
                disabled=True,
            ),
            Button(style=ButtonStyle.green, label=self.next_symbol),
            Button(style=ButtonStyle.green, label=self.last_symbol),
        ]
        component = copy.copy(self.buttons)
        component.append(add_on_buttons)
        # component[0] = add_on_buttons + component[0]

        components = [add_on_buttons]
        await self.message.edit(
            embed=self.pages[self.page_num], components=copy.copy(component)
        )

        def check(interation):
            return (
                interation.message == self.message
                and self.ctx.author == interation.user
            )

        while True:
            try:
                res = await self.client.wait_for(
                    "button_click", timeout=self.timeout, check=check
                )
                await res.respond(
                    type=InteractionType.DeferredUpdateMessage  # , content=f"{res.component.label} pressed"
                )

                if res.component.label == self.first_symbol:
                    self.page_num = 0
                    add_on_buttons = [
                        Button(
                            style=ButtonStyle.green,
                            label=self.first_symbol,
                            disabled=True,
                        ),
                        Button(
                            style=ButtonStyle.green,
                            label=self.previous_symbol,
                            disabled=True,
                        ),
                        Button(
                            style=ButtonStyle.gray,
                            label=f"Page {self.page_num+1}/{len(self.pages)}",
                            disabled=True,
                        ),
                        Button(style=ButtonStyle.green, label=self.next_symbol),
                        Button(style=ButtonStyle.green, label=self.last_symbol),
                    ]

                    component = copy.copy(self.buttons)
                    component.append(add_on_buttons)
                    # component[0] = add_on_buttons + component[0]

                    components = [add_on_buttons]
                    await self.message.edit(
                        embed=self.pages[self.page_num],
                        components=copy.copy(component),
                    )
                elif res.component.label == self.previous_symbol:
                    self.page_num -= 1
                    if self.page_num <= 0:
                        self.page_num = 0
                        add_on_buttons = [
                            Button(
                                style=ButtonStyle.green,
                                label=self.first_symbol,
                                disabled=True,
                            ),
                            Button(
                                style=ButtonStyle.green,
                                label=self.previous_symbol,
                                disabled=True,
                            ),
                            Button(
                                style=ButtonStyle.gray,
                                label=f"Page {self.page_num+1}/{len(self.pages)}",
                                disabled=True,
                            ),
                            Button(style=ButtonStyle.green, label=self.next_symbol),
                            Button(style=ButtonStyle.green, label=self.last_symbol),
                        ]

                        component = copy.copy(self.buttons)
                        component.append(add_on_buttons)
                        # component[0] = add_on_buttons + component[0]

                        components = [add_on_buttons]
                        await self.message.edit(
                            embed=self.pages[self.page_num],
                            components=copy.copy(component),
                        )
                    else:
                        add_on_buttons = [
                            Button(style=ButtonStyle.green, label=self.first_symbol),
                            Button(style=ButtonStyle.green, label=self.previous_symbol),
                            Button(
                                style=ButtonStyle.gray,
                                label=f"Page {self.page_num+1}/{len(self.pages)}",
                                disabled=True,
                            ),
                            Button(style=ButtonStyle.green, label=self.next_symbol),
                            Button(style=ButtonStyle.green, label=self.last_symbol),
                        ]
                        component = copy.copy(self.buttons)
                        component.append(add_on_buttons)
                        # component[0] = add_on_buttons + component[0]

                        components = [add_on_buttons]
                        await self.message.edit(
                            embed=self.pages[self.page_num],
                            components=copy.copy(component),
                        )
                elif res.component.label == self.next_symbol:
                    self.page_num += 1
                    if self.page_num >= len(self.pages) - 1:
                        self.page_num = len(self.pages) - 1
                        add_on_buttons = [
                            Button(style=ButtonStyle.green, label=self.first_symbol),
                            Button(style=ButtonStyle.green, label=self.previous_symbol),
                            Button(
                                style=ButtonStyle.gray,
                                label=f"Page {self.page_num+1}/{len(self.pages)}",
                                disabled=True,
                            ),
                            Button(
                                style=ButtonStyle.green,
                                label=self.next_symbol,
                                disabled=True,
                            ),
                            Button(
                                style=ButtonStyle.green,
                                label=self.last_symbol,
                                disabled=True,
                            ),
                        ]
                        component = copy.copy(self.buttons)
                        component.append(add_on_buttons)
                        # component[0] = add_on_buttons + component[0]

                        components = [add_on_buttons]
                        await self.message.edit(
                            embed=self.pages[self.page_num],
                            components=copy.copy(component),
                        )
                    else:

                        add_on_buttons = [
                            Button(style=ButtonStyle.green, label=self.first_symbol),
                            Button(style=ButtonStyle.green, label=self.previous_symbol),
                            Button(
                                style=ButtonStyle.gray,
                                label=f"Page {self.page_num+1}/{len(self.pages)}",
                                disabled=True,
                            ),
                            Button(style=ButtonStyle.green, label=self.next_symbol),
                            Button(style=ButtonStyle.green, label=self.last_symbol),
                        ]
                        component = copy.copy(self.buttons)
                        component.append(add_on_buttons)
                        # component[0] = add_on_buttons + component[0]

                        components = [add_on_buttons]
                        await self.message.edit(
                            embed=self.pages[self.page_num],
                            components=copy.copy(component),
                        )
                elif res.component.label == self.last_symbol:
                    self.page_num = len(self.pages) - 1
                    add_on_buttons = [
                        Button(style=ButtonStyle.green, label=self.first_symbol),
                        Button(style=ButtonStyle.green, label=self.previous_symbol),
                        Button(
                            style=ButtonStyle.gray,
                            label=f"Page {self.page_num+1}/{len(self.pages)}",
                            disabled=True,
                        ),
                        Button(
                            style=ButtonStyle.green,
                            label=self.next_symbol,
                            disabled=True,
                        ),
                        Button(
                            style=ButtonStyle.green,
                            label=self.last_symbol,
                            disabled=True,
                        ),
                    ]
                    component = copy.copy(self.buttons)
                    component.append(add_on_buttons)
                    # component[0] = add_on_buttons + component[0]

                    components = [add_on_buttons]
                    await self.message.edit(
                        embed=self.pages[self.page_num],
                        components=copy.copy(component),
                    )

            except asyncio.TimeoutError:
                add_on_buttons = [
                    Button(
                        style=ButtonStyle.green, label=self.first_symbol, disabled=True
                    ),
                    Button(
                        style=ButtonStyle.green,
                        label=self.previous_symbol,
                        disabled=True,
                    ),
                    Button(
                        style=ButtonStyle.gray,
                        label=f"Page {self.page_num+1}/{len(self.pages)}",
                        disabled=True,
                    ),
                    Button(
                        style=ButtonStyle.green, label=self.next_symbol, disabled=True
                    ),
                    Button(
                        style=ButtonStyle.green,
                        label=self.last_symbol,
                        disabled=True,
                    ),
                ]
                component = copy.copy(self.buttons)
                component.append(add_on_buttons)
                await self.message.edit(
                    embed=self.pages[self.page_num], components=copy.copy(component)
                )
                return
