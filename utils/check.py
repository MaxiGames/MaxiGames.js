import firebase_admin
from firebase_admin import firestore

import discord
from discord.ext import commands

# from cogs.init import Init

import threading

db = firestore.client()
callback_done = threading.Event()
authorised = {}
banned = {}
# Create a callback on_snapshot function to capture changes
def on_snapshot(col_snapshot, changes, read_time):
    global authorised
    global banned
    for change in changes:
        if change.document.id == "authorised":
            authorised = change.document.to_dict()
        elif change.document.id == "banned":
            banned = change.document.to_dict()
    callback_done.set()


col_query = db.collection(u"admin")

# Watch the collection query
query_watch = col_query.on_snapshot(on_snapshot)


def is_staff():
    async def predicate(ctx):
        allowed = authorised["owner"] + authorised["staff"]
        if str(ctx.author.id) not in allowed:
            raise commands.NotOwner()
        else:
            return True

    return commands.check(predicate)


def is_owner():
    async def predicate(ctx):
        allowed = authorised["owner"]
        if str(ctx.author.id) not in allowed:
            raise commands.NotOwner()
        else:
            return True

    return commands.check(predicate)


def is_banned():
    async def predicate(ctx):
        if str(ctx.author.id) in banned:
            raise commands.MissingPermissions([])
        else:
            return True

    return commands.check(predicate)


def is_admin():
    async def predicate(ctx):
        allowed = authorised["owner"] + authorised["staff"]
        if (
            str(ctx.author.id) not in allowed
            and not ctx.message.author.guild_permissions.administrator
        ):
            raise commands.MissingPermissions([])
        else:
            return True

    return commands.check(predicate)
