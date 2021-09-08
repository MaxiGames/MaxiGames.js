import discord
from discord.ext import commands
import json

primary_colour = discord.Colour.green()
error_colour = discord.Colour.teal()

with open("config.json", "r") as file:
    data = json.load(file)
    prefix = data["prefix"]
    file.close()

icon_url = "www.google.com"
