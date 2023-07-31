import os
import sys
import time

from decouple import config

import typing
from collections import OrderedDict
import re
import json
import pandas as pd
import numpy as np
from datetime import datetime

from lib.data.PandaFileDatabase import PandaFileDatabase
from lib.data.PostgreSQLConnection import PostgreSQLConnection
from lib.data.PostgreSQLDatabase import PostgreSQLDatabase

import psycopg2


# Configuration (maybe read from config(...)) --------------------------------------------------------------------------
conf_db_ip = config('db-ip')
conf_db_name = config('db-name')
conf_db_user = config('db-user')
conf_db_pw = config("db-pw")

# Load definitions -----------------------------------------------------------------------------------------------------
# metatext_types
in_f = open("definitions_metatext_types_migration_static_to_postgresq.json", "r")
metatext_types = json.load(in_f)
in_f.close()

# metatext_details_types
in_f = open("definitions_metatext_details_types_migration_static_to_postgresq.json", "r")  # metatext_details_types
metatext_details_types = json.load(in_f)
in_f.close()

# metatext_dataset_attributes
in_f = open("definitions_metatext_dataset_attributes_migration_static_to_postgresq.json", "r")
metatext_dataset_attributes = json.load(in_f)
in_f.close()

# metatext_measurement_attributes
in_f = open("definitions_metatext_measurement_attributes_migration_static_to_postgresq.json", "r")
metatext_measurement_attributes = json.load(in_f)
in_f.close()


# SQL Templates --------------------------------------------------------------------------------------------------------


# Other Definitions ----------------------------------------------------------------------------------------------------
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

# Script ---------------------------------------------------------------------------------------------------------------

n_imported = 0
db_panda = PandaFileDatabase()
db_sql = PostgreSQLDatabase()

print("\n Script to find and import MitoCube static database files into PostgreSQL.")
print(f"  - target DB: {conf_db_name} at '{conf_db_user}@{conf_db_ip}'.")

# list_dataset_ids = db_panda.getAllDataIDs()
list_dataset_ids = []

if not os.path.exists(config("db-datadir")):
    raise Exception(f"Invalid database path {config('db-datadir')}")

for item in os.scandir(config("db-datadir")):
    if item.is_dir():
        list_dataset_ids.append(item.name)

print(f"  - Found {len(list_dataset_ids)} data folders.")

db_conn = psycopg2.connect(host=conf_db_ip, database=conf_db_name, user=conf_db_user, password=conf_db_pw)

for item in list_dataset_ids:
    if db_sql.contains(datasetIds=[item]) < 1:
        try:
            print(f"    >  Import {item}")
            # obj = db_panda.getDataset(item)

            # db_sql.insert(obj) ---------------------------------------------------------------------------------------
            # obj_data = obj.getDataObj().getDataTable()
            obj_data = pd.read_csv(config("db-datadir") + "/" + item + "/" + "data.txt", sep="\t", index_col="Key")
            obj_data = obj_data.loc[obj_data.index.dropna(), :]  # ToDo: Should we really remove NAs?

            # obj_meta = obj.getMetaObj().getDictionary()
            obj_meta = json.load(open(config("db-datadir") + "/" + item + "/" + "params.json"))
            if "dataID" not in obj_meta or obj_meta["dataID"] != item:  # double check dataID.
                obj_meta["dataID"] = item

            db_cur = db_conn.cursor()

            try:
                db_cur.execute("BEGIN;\n")

                # 1) Receive instrument table for the tags.
                db_cur.execute("SELECT id, label FROM instruments;")
                db_instruments = pd.DataFrame(db_cur.fetchall(), columns=["id", "label"])

                # 2) Receive OI table to look to identify and insert missing elements.
                db_cur.execute("SELECT id, label FROM oi;")
                db_ois = pd.DataFrame(db_cur.fetchall(), columns=["id", "label"])

                db_ois_missing = [oi not in db_ois["label"].tolist() for oi in obj_data.index]
                to_execute_oiInsert = "\n".join(
                    ["INSERT INTO oi(label, type) VALUES ('%s', 'protein');" % x for x in obj_data.index[
                        np.where(db_ois_missing)].tolist()])
                db_cur.execute(to_execute_oiInsert)

                # 3) Receive updated OI table.
                db_cur.execute("SELECT id, label FROM oi;")
                db_ois = pd.DataFrame(db_cur.fetchall(), columns=["id", "label"])

                # 4) Identify instrument_id from saved tag
                if "Instrument" in obj_meta.keys():
                    id_instrument = db_instruments.loc[db_instruments["label"] == obj_meta["Instrument"]]["id"]

                    if len(id_instrument) != 0:
                        id_instrument = db_instruments.loc[db_instruments["label"] == "ignarus"]["id"]
                else:
                    id_instrument = db_instruments.loc[db_instruments["label"] == "ignarus"]["id"]
                id_instrument = int(id_instrument.iloc[0])

                # 5) Insert dataset entry into DB.
                # ToDo: if not in obj_meta.keys() create with default values
                if "dataID" not in obj_meta.keys():
                    obj_meta["dataID"] = item

                if "Creation Date" not in obj_meta.keys():  # ToDo: Check what to do with missing Creation date
                    obj_meta["Creation Date"] = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

                if "Experimentator" not in obj_meta.keys():
                    obj_meta["Experimentator"] = "Bosco"

                if "Email" not in obj_meta.keys():
                    obj_meta["Email"] = "bosco@agmeissner.de"

                if "Title" not in obj_meta.keys():
                    obj_meta["Title"] = "Breathing oxygen linked to staying alive"

                db_cur.execute("INSERT INTO public.datasets(label, instrument_id, created_on, uploaded_on, state, "
                               "                            experimentator, contact_email, name_group, title) "
                               "       VALUES ('%s', %d, '%s', '%s', '%s', '%s', '%s', '%s', '%s')"
                               "       RETURNING id;" % (obj_meta["dataID"],  # label
                                                         id_instrument,  # instrument_id
                                                         obj_meta["Creation Date"],  # created_on
                                                         datetime.now().strftime("%Y-%m-%d %H:%M:%S"),  # uploaded_on
                                                         'submitted',  # state
                                                         obj_meta["Experimentator"],  # experimentator
                                                         obj_meta["Email"],  # contact_email
                                                         'AG Ignotus',  # name_group
                                                         obj_meta["Title"]))  # title
                dataset_id = db_cur.fetchone()[0]

                # 6) Prepare for detailed meta information
                meta_texts = []

                # 6.a) Elements that are saved as variable within the JSON
                for meta_item in metatext_types:
                    if meta_item["str"] in obj_meta.keys() and obj_meta[meta_item["str"]] not in meta_item["na_values"]:
                        meta_texts.append({"title": meta_item["str"],
                                           "tag": meta_item["tag"],
                                           "details": obj_meta[meta_item["str"]]})

                # 6.b) Elements that are saved as variable within the "Experimental Info" item within the JSON
                for meta_item in metatext_details_types:
                    for meta_content_item in obj_meta["Experimental Info"]:
                        if meta_content_item["title"] == meta_item["str"]:
                            meta_texts.append({"title": meta_item["str"],
                                               "tag": meta_item["tag"],
                                               "details": meta_content_item["details"]})

                # 6.c) Inserted prepare for detailed meta information.
                for meta_item in meta_texts:
                    db_cur.execute("INSERT INTO public.metatexts(dataset_id, tag, title, text) "
                                   "VALUES (%d, '%s', '%s', '%s');" %
                                   (dataset_id, meta_item["tag"], meta_item["title"], meta_item["details"]))

                # 7) Insert data columns as measurements
                str_sample_values = []
                for str_sample in obj_data.columns.tolist():
                    str_sample_values.append("(%d, '%s')" % (dataset_id, str_sample))

                db_cur.execute("INSERT INTO public.measurements(dataset_id, label) "
                               "VALUES %s RETURNING id, dataset_id, label;" % (", ".join(str_sample_values)))

                db_samples = pd.DataFrame(db_cur.fetchall(), columns=["id", "dataset_id", "label"])

                # 9) Insert data cells / rows as data values.
                file_content_long = pd.melt(frame=obj_data.reset_index(), id_vars=["Key"], var_name="sample")
                file_content_long = file_content_long.merge(right=db_samples, left_on="sample", right_on="label",
                                                            suffixes=("_x", "_y"))
                file_content_long = file_content_long.merge(right=db_ois, left_on="Key", right_on="label",
                                                            suffixes=("_sample", "_oi"))
                # Keep Columns: Key (oi), sample, value, id_sample, dataset_id, id_po
                file_content_long = file_content_long.drop(columns=["label_oi", "label_sample"])

                str_sample_values = []
                for index, row in file_content_long.iterrows():
                    # (dataset_id, measurement_id, oi_id, value)
                    str_sample_values.append("(%d, %d, %d, %f)" % (row["dataset_id"],
                                                                   row["id_sample"],
                                                                   row["id_oi"],
                                                                   row["value"]))

                db_cur.execute("INSERT INTO public.measurement_values(dataset_id, measurement_id, oi_id, value) "
                               "VALUES %s;" % (", ".join(str_sample_values)))

                # 10) Identify existing Attributes within the metadata for dataset (new Attributes)
                db_cur.execute("SELECT a.id AS attribute_id, a.parent_id AS attribute_parent_id, "
                               "       a.tag AS attribute_tag, a.name AS attribute, a.priority AS priority, "
                               "       av.id AS attribute_value_id, av.tag AS attribute_value_tag, "
                               "       av.name AS attribute_value "
                               "    FROM attributes AS a "
                               "LEFT JOIN attribute_values AS av ON a.id = av.attribute_id "
                               "WHERE a.allow_for_dataset;")
                db_attributes_dataset = pd.DataFrame(db_cur.fetchall(), columns=["attribute_id", "attribute_parent_id",
                                                                         "attribute_tag", "attribute", "priority",
                                                                         "attribute_value_id", "attribute_value_tag",
                                                                         "attribute_value"])

                # Go through the definition to check if the variable is there and has a certain value
                # if found, add the value
                # ToDo: Make the following more elegant without loop
                for attribute_item in metatext_dataset_attributes:
                    if attribute_item["str"] not in obj_meta.keys():
                        if attribute_item["addIfMissing"]:
                            db_cur.execute("INSERT INTO nm_dataset_attribute_value(attribute_value_id, dataset_id) "
                                           f"(SELECT id, {dataset_id} FROM attribute_values "
                                           f"WHERE tag = '{attribute_item['default']}');")
                        continue

                    fountAttribute = False
                    for attribute_property in attribute_item["items"]:
                        if obj_meta[attribute_item["str"]] == attribute_property["str"]:
                            db_cur.execute("INSERT INTO nm_dataset_attribute_value(attribute_value_id, dataset_id) "
                                           f"(SELECT id, {dataset_id} FROM attribute_values "
                                           f"WHERE tag = '{attribute_property['tag']}');")
                            break
                    if not fountAttribute and attribute_item["addIfMissing"]:
                        db_cur.execute("INSERT INTO nm_dataset_attribute_value(attribute_value_id, dataset_id) "
                                       f"(SELECT id, {dataset_id} FROM attribute_values "
                                       f"WHERE tag = '{attribute_item['default']}');")


                # 11) Identify existing Attributes for Measurements and prepare Groupings (new Attributes)

                # "Genotype" "WT" "TMBIM5KO"
                # "Knockdown" "CTRL" "CLPP" "LONP1" "OMA1" "PARL" "YME1L"
                # "Grouping 1" "Giant Cell" "WT"
                # "Grouping 2" "ScABER_2" "ScABER_1" # SCaBER is an epithelial-like cell
                # "Cell Line" "myeloid dendritic cell" "memory regulatory T-cell" "naive regulatory T-cell" "plasmacytoid dendritic cell" "CD45RA+ effector memory cell"
                #  "Stimulation" "LPS/R848" "unstimulated"

                for group_key, group_items in obj_meta["groupings"].items():
                    for attribute, attribute_item in group_items.items():
                        for attribute_reference in metatext_measurement_attributes:
                            if attribute.lower() == attribute_reference["str"].lower():
                                str_sql_attribute_id = "(SELECT id AS attribute_value_id " \
                                                       "FROM attribute_values " \
                                                       f"WHERE tag = '{attribute_reference['tag']}')"
                                str_in = "', '".join(attribute_item)
                                str_sql_select = f"SELECT {str_sql_attribute_id}, id AS attribute_value_id " \
                                                 f"FROM measurements " \
                                                 f"WHERE dataset_id = {dataset_id} AND label IN ('{str_in}')"

                                db_cur.execute("INSERT INTO nm_measurement_attribute_value"
                                               "(attribute_value_id, measurement_id) "
                                               f"({str_sql_select});")
                                break

                db_conn.commit()
                n_imported = n_imported + 1
            except Exception as err:
                if db_conn is not None:
                    db_conn.rollback()
                raise err

            db_cur.close()
        except Exception as err:
            print("       " + AEC_FG_RED + "[!] " + str(err) + AEC_RESET)
    else:
        print("    " + AEC_FG_YELLOW + f"[!] A dataset with the id {item} exists already!" +
              AEC_RESET + " Skipping dataset.")

print(AEC_ERLINE + f"  - Imported {n_imported} datasets.")

db_conn.close()
