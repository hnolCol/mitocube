
import json
import pandas as pd
from lib.data.PostgreSQLConnection import PostgreSQLConnection

json_attributes = {}

db_conn = PostgreSQLConnection().getConnection()
db_cur = db_conn.cursor()

db_cur.execute("SELECT id, parent_id, tag, name, priority, "
               "       allow_as_filter, allow_for_dataset, allow_for_measurement, allow_for_users, allow_for_qc "
               "    FROM public.attributes;")
attributes = pd.DataFrame(db_cur.fetchall(), columns=["id", "parent_id", "tag", "name",
                                               "priority", "allow_as_filter", "allow_for_dataset",
                                               "allow_for_measurement", "allow_for_users", "allow_for_qc"])

attributes = attributes.to_json(orient='records')
attributes = json.loads(attributes)
json_attributes["attributes"] = attributes

db_cur.execute("SELECT id, attribute_id, tag, name, details FROM public.attribute_values;")
attribute_values = pd.DataFrame(db_cur.fetchall(), columns=["id", "attribute_id", "tag", "name", "details"])

db_cur.close()

attribute_values = attribute_values.to_json(orient='records')
attribute_values = json.loads(attribute_values)
json_attributes["attribute_values"] = attribute_values

with open("/home/andreaslindner/attributes_export.json", "w") as out:
    json.dump(json_attributes, out)
