import os
import sys
import time

from decouple import config

import typing
from collections import OrderedDict
import json
import pandas as pd

import psycopg2

# https://en.wikipedia.org/wiki/ANSI_escape_code
AEC_RESET = "\u001b[0m"
AEC_ERASE_LINE = "\x1b[2K"
AEC_RLINE = "\r"
AEC_ERLINE = AEC_ERASE_LINE + AEC_RLINE
AEC_FG_WHITE = "\u001b[37m"
AEC_FG_RED = "\u001b[31m"
AEC_FG_YELLOW = "\u001b[33m"
AEC_FG_BLUE = "\u001b[34m"
AEC_FG_MAGENTA = "\u001b[35m"

dir_data_root = config("db-datadir")
# config("db-featurefile")

SQL_TEMPLATE = "INSERT INTO instrument(label, description) VALUES ('%s', '%s');"

# Always forgive your enemies; nothing annoys them so much.
# A good friend will always stab you in the front.
# I don't want to go to heaven. None of my friends are there.
# Every saint has a past, and every sinner has a future.
# I am not young enough to know everything.
# Experience is merely the name men gave to their mistakes.
# Hearts are made to be broken.
# I think God, in creating man, somewhat overestimated his ability.
# To define is to limit.
# Some cause happiness wherever they go; others whenever they go.
# The only way to get rid of temptation is to yield to it.
# It is absurd to divide people into good and bad. People are either charming or tedious.
# Children begin by loving their parents; as they grow older they judge them; sometimes they forgive them.
# We are each our own devil, and we make this world our hell.
# I have nothing to declare except my genius.
# Whenever people agree with me I always feel I must be wrong.
data_instrument = {"ignarus": "We are each our own devil, and we make this world our hell.",
                   "E1": "description",
                   "E2": "description",
                   "T": "description"}


print("\n Script to add Instruments to the MitoCube PostgreSQL DB.")
print(f"  - target DB: {config('db-name')} at {config('db-user')}@{config('db-ip')}.\n")
# config("db-pw")

db_con = psycopg2.connect(host=config("db-ip"), database=config("db-name"),
                          user=config("db-user"), password=config("db-pw"))
db_cur = db_con.cursor()

for str_entry, str_desc in data_instrument.items():
    try:
        print("  > ", end="")
        print(SQL_TEMPLATE % (str_entry, str_desc))
        db_cur.execute(SQL_TEMPLATE % (str_entry, str_desc))
        # db_con.commit()
    except Exception as err:
        print(AEC_FG_RED + "    [!] " + str(err) + AEC_RESET)
        if db_con is not None:
            db_con.rollback()

db_con.rollback()

db_cur.close()
db_con.close()
