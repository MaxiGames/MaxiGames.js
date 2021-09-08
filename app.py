#! /usr/bin/env python

import json
import os
import sys

import discord
from client import Client
import firebase_admin
from firebase_admin import firestore
from firebase_admin import credentials
from discord_components import DiscordComponents
from discord_slash import SlashCommand

# simple arguments -- for now just Beta or Release
beta = True
if len(sys.argv) > 1 and sys.argv[1] == "r":
    print("Running Release version of bot.")
    beta = False
else:
    print("Running Beta version of bot.")


def get_prefix(client, message):
    if message.guild == None:
        return ""
    return client.prefixes[str(message.guild.id)]


with open("config.json", "r") as file:
    data = json.load(file)
    intents = discord.Intents.default()
    intents.members = True
    intents.guilds = True
    client = Client(command_prefix=(get_prefix), intents=intents, case_insensitive=True)
    client.prefixes = {}

cred = (
    credentials.Certificate("serviceAccountKey2.json")
    if beta
    else credentials.Certificate("serviceAccountKey.json")
)
firebase_admin.initialize_app(cred)

db = firestore.client()

DiscordComponents(client)
slash = SlashCommand(
    client, sync_commands=True, sync_on_cog_reload=True, override_type=True
)

for filename in os.listdir("./cogs"):
    if filename.endswith(".py"):
        client.load_extension(f"cogs.{filename[:-3]}")


@client.event
async def on_ready():
    await client.change_presence(
        status=discord.Status.online,
        activity=discord.Game(
            name="m!help on " + str(len(client.guilds)) + " servers", type=0
        ),
    )
    print("We have logged in as {0.user}".format(client))


with open("config.json", "r") as file:
    data = json.load(file)
    if beta:
        client.run(data["tokenIdBeta"])
    else:
        client.run(data["tokenId"])
