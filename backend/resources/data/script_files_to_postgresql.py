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

SQL_TEMPLATE_OI_ALL = "SELECT label FROM oi;"
SQL_TEMPLATE_OI = "INSERT INTO oi(label, type) VALUES ('%s', '%s');"
SQL_TEMPLATE_DS = "INSERT INTO public.dataset(project_id, label, instument_id, created_on, uploaded_on, state, " \
                  "             experimentator, contact_email, name_group, title, research_question, " \
                  "             protein_of_interest,  organism, type, material, research_aim, " \
                  "             research_sample_preparation, research_information) " \
                  "     VALUES (%s, '%s', %d, %s, %s, '%s', '%s', '%s', '%s', '%s', '%s', '%s', '%s', '%s', '%s', " \
                  "         '%s', '%s', '%s') RETURNING id;"
SQL_TEMPLATE_COL = "INSERT INTO public.measurement(dataset_id, label) VALUES (%d, '%s') RETURNING id;"
SQL_TEMPLATE_VALUE = "INSERT INTO public.measurementvalue(measurement_id, oi_id, transformation, value) " \
                     "  VALUES (%d, %d, '%s', %f);"
SQL_TEMPLATE_GROUPING_L1 = "INSERT INTO grouping(label) VALUES ('%s') RETURNING id;"
SQL_TEMPLATE_GROUPING_L2 = "INSERT INTO public.groupingitem(grouping_id, label) VALUES (%d, '%s') RETURNING id;"
SQL_TEMPLATE_GROUPING_NM = "INSERT INTO public.nm_measurement_groupingitem(groupingitem_id, measurement_id) VALUES (%d, %d);"

dir_data_root = config("db-datadir")
# config("db-featurefile")

list_dataset_ids = []

print("\n Script to find and import MitoCube static database files into PostgreSQL.")
print(f"  - target DB: {config('db-name')} at {config('db-user')}@{config('db-ip')}.\n")
# config("db-pw")

print(f"  > Investigate folders at '{dir_data_root}'.")

if not os.path.exists(dir_data_root):
    raise Exception(f"  ! Invalid path {dir_data_root}.")

for entry in os.scandir(dir_data_root):
    if entry.is_dir():
        list_dataset_ids.append(entry.name)

print(f"     - Found {len(list_dataset_ids)} data folders.")

db_con = psycopg2.connect(host=config("db-ip"), database=config("db-name"),
                          user=config("db-user"), password=config("db-pw"))
db_cur = db_con.cursor()

ix = 0
n_imported = 0

# Todo: R) res.instruments <- dbReadTable(db.con, "instrument")

for item in list_dataset_ids:
    char_rot = "⠖" if ix % 4 == 1 else "⠲" if ix % 4 == 2 else "⠴" if ix % 4 == 3 else "⠦"
    print(AEC_ERLINE + f"    ({char_rot}) Read and import {item} ({ix+1}/{len(list_dataset_ids)}) ...", end="")

    path_dataset = dir_data_root + "/" + item
    path_file_data = path_dataset + "/" + "data.txt"
    path_meta_data = path_dataset + "/" + "params.json"

    in_data = pd.read_csv(path_file_data, sep="\t", index_col="Key")
    in_data = in_data.loc[in_data.index.dropna(), :]  # remove nan index  # ToDo: Should we really remove NAs?

    in_meta = json.load(open(path_meta_data))

    if "dataID" not in in_meta or in_meta["dataID"] != item:
        in_meta["dataID"] = item

    try:
        # ToDo: get list of missing OIs using SQL_TEMPLATE_OI_ALL
        # R) res.oi <- dbReadTable(db.con, "oi")
        # R) res.oi$label <- gsub("[[:space:]]", "", res.oi$label)
        # R) missing_oi_ixs <- which(!dSet$Key %in% res.oi$label)

        # ToDo: Insert missing OIs using SQL_TEMPLATE_OI
        # https://www.educba.com/sprintf-python/

        # R) res.oi < - dbReadTable(db.con, "oi")
        # R) res.oi$label < - gsub("[[:space:]]", "", res.oi$label)
        # dSet <- reshape2::melt(dSet, id.vars=c("Key"))
        # dSet <- merge(dSet, res.oi, by.x = "Key", by.y = "label", all.x = TRUE)
        # dSet$oi_id <- dSet$id

        # ToDo: Insert Dataset with SQL_TEMPLATE_DS and receive new
        # https://www.educba.com/sprintf-python/
        # R) VALUES( % s, '%s', % d, % s, % s, '%s', '%s', '%s', '%s', '%s', '%s', '%s', '%s', '%s', '%s', '%s', '%s', '%s') RETURNING
        # R) id;
        # R) ",
        # R) "NULL",  # %project_id
        # R) digest(paste(date(), it, sep=" - "), algo="md5"),  # label
        # R) res.instruments$id[ceiling(runif(1, min=0, max=3))],  # instrument_id
        # R) "NOW()",  # created_on
        # R) "NOW()",  # uploaded_on
        # R) "submitted",  # state,
        # R) "Dr. Mock Bogus",  # experimentator
        # R) "mock.bogus@bielefeld.de",  # contact_email
        # R) "AG Bogus",  # name_group
        # R) blindtext_short,  # json$Title, # title
        # R) blindtext_sentence,  # json$`Research Question`, # research_question,
        # R) json$`Protein
        # R) of
        # R) Interest
        # R) `,  # protein_of_interest,
        # R) json$Organism,  # organism,
        # R) json$Type,  # type,
        # R) json$Material,  # material,
        # R) blindtext_long,  # json$`Experimental Info`$details[1], # research_aim,
        # R) blindtext_long,  # json$`Experimental Info`$details[2], # research_sample_preparation,
        # R) blindtext_long)  # json$`Experimental Info`$details[3]) # research_information
        # ToDo: Insert Columns / Samples with SQL_TEMPLATE_COL and receive new IDs
        # https://www.educba.com/sprintf-python/

        # ToDo: Insert values with OI ids (!) using SQL_TEMPLATE_VALUE
        # https://www.educba.com/sprintf-python/

        # ToDo: Insert Grouping level 1 using SQL_TEMPLATE_GROUPING_L1
        # https://www.educba.com/sprintf-python/
        # ToDo: Insert Grouping level 2 using SQL_TEMPLATE_GROUPING_L2
        # https://www.educba.com/sprintf-python/
        # ToDo: Insert NM linkage between level 1 and 2 using SQL_TEMPLATE_GROUPING_NM
        # https://www.educba.com/sprintf-python/

        # db_cur.execute(SQL_TEMPLATE % (str_entry, str_desc))
        # db_con.commit()
        n_imported += 1
    except Exception as err:
        print(AEC_FG_RED + "    [!] " + str(err) + AEC_RESET)
        if db_con is not None:
            db_con.rollback()

    ix += 1

print(AEC_ERLINE + f"     - Imported {n_imported} datasets.")

db_cur.close()
db_con.close()
