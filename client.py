import discord
from discord.ext import commands
import datetime
import json
import config


class Client(commands.Bot):
    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        self.help_command = None
        self.start_time = datetime.datetime.utcnow()

    @property
    def uptime(self):
        return datetime.datetime.utcnow() - self.start_time

    @property
    def config(self):
        return config

    @property
    def primary_colour(self):
        return self.config.primary_colour

    @property
    def error_colour(self):
        return self.config.error_colour

    @property
    def icon_url(self):
        return self.config.icon_url

    @property
    def primary_prefix(self):
        return self.config.prefix
