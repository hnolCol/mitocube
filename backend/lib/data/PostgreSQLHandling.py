from __future__ import annotations

from abc import ABC
from decouple import config
from datetime import datetime
import numpy as np
import pandas as pd
import psycopg2
import typing

from backend.lib.data.DataHandling import MCDataset, MCDatabase, SQLConnection


class PostgreSQLConnection(SQLConnection):  # (metaclass=SingletonMeta):
    """Singleton class that opens, shares and closes a shared psycopg2.connection to the configured database."""

    #: Holds the shared connection object.
    # conn = None  # Todo: Figure out type, e.g. psycopg2.connection like does not work

    # __db_ip: str = None
    # __db_name: str = None
    # __db_user: str = None
    # __db_pw: str = None

    def __init__(self):
        """
        The Constructor of DBConnection creates a new psycopg2.connection to the PostgreSQL database that can be shared.

        :raise Errors.
        """
        self.__db_ip = config("db-ip")
        self.__db_name = config("db-name")
        self.__db_user = config("db-user")
        self.__db_pw = config("db-pw")
        super().__init__()

    def getDatabaseName(self):
        """"""
        # ToDo: Write documentation
        return self.__db_name

    def openNewConnection(self):
        """
        The method will open and return a new shared psycopg2.connection to the configured database and will close the
        previous shared connection.

        :raise Errors defined at <https://www.psycopg.org/docs/errors.html>.
        :return: connection object
        :rtype: psycopg2.connection
        """
        if self.conn is not None:
            self.conn.close()

        self.conn = self.getIndependentConnection()

        return self.conn

    def closeConnection(self):
        """
        Closes the shared connection.

        :raise Errors defined at <https://www.psycopg.org/docs/errors.html>
        """
        if self.conn is not None:
            self.conn.close()
            self.conn = None

    def getConnection(self):
        """
        Returns the currently shared psycopg2.connection object.

        :raise Errors defined at <https://www.psycopg.org/docs/errors.html>
        :return: connection object
        :rtype: psycopg2.connection
        """
        if self.conn is None:
            self.openNewConnection()

        return self.conn

    def getIndependentConnection(self):  # Todo: Turn to static?
        """
        The method will open and return a new psycopg2.connection to the configured database without closing the
        existing connection. The returned connections is not shared and has to be closed manually.

        :raise Errors defined at <https://www.psycopg.org/docs/errors.html>
        :return: connection object
        :rtype: psycopg2.connection
        """
        return psycopg2.connect(host=self.__db_ip, database=self.__db_name,
                                user=self.__db_user, password=self.__db_pw)


class PostgreSQLDataset(MCDataset):
    """Replacement for the Data.Dataset"""
    # Todo: Write documentation

    def __init__(self,
                 dataset_id: int = -1,
                 label: str = None,
                 state: str = None,
                 title: str = None,
                 experimentator: str = None,
                 name_group: str = None,
                 contact_email: str = None,  # ToDo: Countercheck default values
                 created_on: str = None,  # ToDo: Check DataType Date
                 uploaded_on: str = None,
                 data_table: pd.DataFrame = None,
                 metatexts: typing.Dict = None,
                 urls: typing.List = None,
                 replicates: typing.Dict = None,
                 attributes_dataset: typing.Dict = None,
                 attributes_samples: typing.Dict = None,
                 instrument: typing.Dict = None,
                 loadFromDatabase: bool = False):  # ToDo: Check DataType Date
        """Constructor"""
        # Todo: Write documentation
        super().__init__(dataset_id, label, state,
                         title, experimentator, name_group, contact_email,
                         created_on, uploaded_on,
                         data_table, metatexts, urls, replicates, attributes_dataset, attributes_samples,
                         instrument, loadFromDatabase)

    def _readFromDatabase(self):
        """"""
        # Todo: Write documentation

        if self._label:
            str_select = "SELECT id, label, instrument_id, " \
                         "       TO_CHAR(created_on, 'YYYY-MM-DD HH23:MI:SS') AS created_on, " \
                         "       TO_CHAR(uploaded_on, 'YYYY-MM-DD HH23:MI:SS') AS uploaded_on, " \
                         "       state, experimentator, contact_email, name_group, title " \
                         f"  FROM datasets WHERE label = '{self._label}';"
        elif self._id > 0:
            str_select = "SELECT id, label, instrument_id, created_on, uploaded_on, state, " \
                         "       experimentator, contact_email, name_group, title " \
                         f"  FROM datasets WHERE id = {self._id};"
        else:
            raise Exception("Either a database id or a label is required to load a dataset from the database.")

        db_conn = PostgreSQLConnection().getConnection()
        db_cur = db_conn.cursor()

        db_cur.execute(str_select)

        db_set = pd.DataFrame(db_cur.fetchall(), columns=["id", "label", "instrument_id", "created_on",
                                                          "uploaded_on", "state", "experimentator",
                                                          "contact_email", "name_group", "title"])

        if db_set.shape[0] == 0:
            raise Exception(f"Id ({self._id}) or label ('{self._label}') do not match to a dataset in the database.")
        elif db_set.shape[0] > 1:
            raise Exception(f"No unique dataset with the id ({self._id}) or label ('{self._label}') in the database.")

        self._id = db_set["id"].iloc[0]
        self._label = db_set["label"].iloc[0]
        self._state = db_set["state"].iloc[0]
        self._title = db_set["title"].iloc[0]
        self._experimentator = db_set["experimentator"].iloc[0]
        self._name_group = db_set["name_group"].iloc[0]
        self._contact_email = db_set["contact_email"].iloc[0]
        self._created_on = db_set["created_on"].iloc[0]
        self._uploaded_on = db_set["uploaded_on"].iloc[0]

        db_cur.execute("SELECT id, label, name, description "
                       "    FROM instruments "
                       f"    WHERE id = {db_set['instrument_id'].iloc[0]};")
        db_instrument = pd.DataFrame(db_cur.fetchall(), columns=["id", "label", "name", "description"])

        self._instrument = MCDataset.buildInstrumentJson(db_id=db_instrument["id"].iloc[0],
                                                         label=db_instrument["label"].iloc[0],
                                                         name=db_instrument["name"].iloc[0],
                                                         description=db_instrument["description"].iloc[0])

        self._metatexts = {}
        db_cur.execute(f"SELECT id, tag, title, text FROM metatexts WHERE dataset_id = {self._id};")
        db_metatexts = pd.DataFrame(db_cur.fetchall(), columns=["id", "tag", "title", "text"])

        for ix, row in db_metatexts.iterrows():
            self._metatexts[row["tag"]] = {"id": row["id"], "tag": row["tag"],
                                           "title": row["title"], "text": row["text"]}

        db_cur.execute(f"SELECT url FROM urls WHERE dataset_id = {self._id};")
        db_urls = pd.DataFrame(db_cur.fetchall(), columns=["url"])
        self._urls = db_urls["url"].tolist()

        db_cur.execute("SELECT r.id, r.label AS replicate, r.measurement_id, m.label AS sample "
                       "    FROM replicates AS r LEFT JOIN measurements AS m ON m.id = r.measurement_id "
                       f"   WHERE m.dataset_id = {self._id};")
        db_replicates = pd.DataFrame(db_cur.fetchall(), columns=["id", "label", "name", "description"])

        self._replicates = {}
        for ix, row in db_replicates.iterrows():
            if row["replicate"] not in self._replicates:
                self._replicates[row["replicate"]] = []
            self._replicates[row["replicate"]].append(row["sample"])

        self._attributes_dataset = {}
        db_cur.execute("SELECT a.id AS attribute_id, a.parent_id AS attribute_parent_id, a.tag AS attribute_tag, "
                       "       a.name AS attribute, a.priority, "
                       "       a.allow_as_filter, a.allow_for_dataset, a.allow_for_measurement, "
                       "       a.allow_for_users, a.allow_for_qc, "
                       "       av.id AS value_id, av.tag AS value_tag, av.name AS value, av.details "
                       "   FROM attributes AS a "
                       "        LEFT JOIN attribute_values AS av ON a.id = av.attribute_id "
                       "        LEFT JOIN nm_dataset_attribute_value AS nm ON nm.attribute_value_id = av.id "
                       f"WHERE nm.dataset_id = {self._id} AND a.allow_for_dataset;"
                       )

        db_attributes = pd.DataFrame(db_cur.fetchall(), columns=["attribute_id", "attribute_parent_id", "attribute_tag",
                                                                 "attribute", "priority", "allow_as_filter",
                                                                 "allow_for_dataset", "allow_for_measurement",
                                                                 "allow_for_users", "allow_for_qc", "value_id",
                                                                 "value_tag", "value", "details"])

        # Dictionary that uses the tag as keys
        for ix, row in db_attributes.iterrows():
            self._attributes_dataset[row["attribute_tag"]] = {
                "attribute_id": row["attribute_id"],
                "attribute_parent_id": row["attribute_parent_id"],
                "attribute_tag": row["attribute_tag"],
                "attribute": row["attribute"],
                "priority": row["priority"],
                "allow_as_filter": row["allow_as_filter"],
                "id": row["value_id"],
                "tag": row["value_tag"],
                "value": row["value"],
                "details": row["details"]
            }

        self._attributes_samples = {}
        db_cur.execute("SELECT a.id AS attribute_id, a.parent_id AS attribute_parent_id, a.tag AS attribute_tag, "
                       "       a.name AS attribute, a.priority, "
                       "       a.allow_as_filter, a.allow_for_dataset, a.allow_for_measurement, "
                       "       a.allow_for_users, a.allow_for_qc, "
                       "       av.id AS value_id, av.tag AS value_tag, av.name AS value, av.details, "
                       "       m.id AS sample_id, m.dataset_id, m.label AS sample"
                       "   FROM attributes AS a "
                       "        LEFT JOIN attribute_values AS av ON a.id = av.attribute_id "
                       "        LEFT JOIN nm_measurement_attribute_value AS nm ON nm.attribute_value_id = av.id "
                       "        LEFT JOIN measurements AS m ON m.id = nm.measurement_id "
                       f"WHERE m.dataset_id = {self._id} AND allow_for_measurement;")

        db_attributes_samples = pd.DataFrame(db_cur.fetchall(), columns=["attribute_id", "attribute_parent_id",
                                                                         "attribute_tag", "attribute", "priority",
                                                                         "allow_as_filter", "allow_for_dataset",
                                                                         "allow_for_measurement", "allow_for_users",
                                                                         "allow_for_qc", "value_id", "value_tag",
                                                                         "value", "details", "sample_id", "dataset_id",
                                                                         "sample"])

        # Dictionary that uses the tag as keys as first level, and the value-tag as second level within "values"
        # Assigned samples are saved in "samples
        # example["att_substance"]["values"]["att_substance:none"]["samples] = {"A", "B", "C", "D"}
        # example["att_substance"]["values"]["att_substance:5fu"]["samples] = {"E", "F", "G", "H"}
        for ix, attribute in db_attributes_samples.iterrows():
            if attribute["attribute_tag"] not in self._attributes_samples:
                self._attributes_samples[attribute["attribute_tag"]] = {
                    "attribute_id": attribute["attribute_id"],
                    "attribute_parent_id": attribute["attribute_parent_id"],
                    "attribute": attribute["attribute"],
                    "priority": attribute["priority"],
                    "allow_as_filter": attribute["allow_as_filter"],
                    "values": {}
                }

            if attribute["value_tag"] not in self._attributes_samples[attribute["attribute_tag"]]["values"]:
                self._attributes_samples[attribute["attribute_tag"]]["values"][attribute["value_tag"]] = {
                    "id": attribute["value_id"],
                    "tag": attribute["value_tag"],
                    "value": attribute["value"],
                    "details": attribute["details"],
                    "samples": []
                }
            self._attributes_samples[attribute["attribute_tag"]]["values"][attribute["value_tag"]]["samples"].append(attribute["sample"])

        db_cur.execute("SELECT m.id AS id, m.label AS measurement, oi.label AS oi, mv.value AS value"
                       "    FROM datasets AS ds "
                       "        LEFT JOIN measurements AS m ON ds.id = m.dataset_id "
                       "        LEFT JOIN measurement_values AS mv ON m.id = mv.measurement_id "
                       "        LEFT JOIN oi AS oi ON mv.oi_id = oi.id "
                       f"   WHERE ds.id = {self._id} "
                       "    ORDER BY m.id, oi.label ASC;")
        self._cached_data_table = db_cur.fetchall()

        self._cached_data_table = pd.DataFrame(self._cached_data_table,
                                               columns=["id", "measurement", "oi", "value"])

        self._cached_data_table = self._cached_data_table.pivot_table(values="value",
                                                                      index="oi",
                                                                      columns="measurement",
                                                                      aggfunc='mean',
                                                                      fill_value=None,
                                                                      dropna=True)  # ToDo: Drop NAs? ^

        self._cached_data_table.index.rename("Key", inplace=True)

        db_cur.close()

    def write(self):
        """"""
        # Todo: Write documentation

        db_conn = PostgreSQLConnection().getConnection()
        db_cur = db_conn.cursor()

        db_cur.execute(f"SELECT COUNT(*) FROM datasets WHERE label = '{self._label}';")
        db_row = db_cur.fetchone()
        db_cur.close()
        db_cur = None

        if db_row[0] < 1:
            try:
                db_cur = db_conn.cursor()

                db_cur.execute("BEGIN;\n")

                # 1) Receive OI table to look to identify and insert missing elements.
                db_cur.execute("SELECT id, label FROM oi;")
                db_ois = pd.DataFrame(db_cur.fetchall(), columns=["id", "label"])

                db_ois_missing = [oi not in db_ois["label"].tolist() for oi in self._cached_data_table.index]
                to_execute_oiInsert = "\n".join(["INSERT INTO oi(label, type) VALUES ('%s', 'protein');" % x for x in
                                                 self._cached_data_table.index[np.where(db_ois_missing)].tolist()])
                db_cur.execute(to_execute_oiInsert)

                # 2) Receive updated OI table.
                db_cur.execute("SELECT id, label FROM oi;")
                db_ois = pd.DataFrame(db_cur.fetchall(), columns=["id", "label"])

                # 3) Insert dataset entry into DB.
                db_cur.execute("INSERT INTO datasets(label, instrument_id, created_on, uploaded_on, state, "
                               "                     experimentator, contact_email, name_group, title) "
                               "       VALUES ('%s', %d, '%s', '%s', '%s', '%s', '%s', '%s', '%s')"
                               "       RETURNING id;" % (self._label,
                                                         self._instrument["id"],
                                                         self._created_on,
                                                         datetime.now().strftime("%Y-%m-%d %H:%M:%S"),  # uploaded_on  # ToDo: replace with self._uploaded_on?
                                                         self._state,
                                                         self._experimentator,
                                                         self._contact_email,
                                                         self._name_group,
                                                         self._title))
                self._id = db_cur.fetchone()[0]

                # 4) Insert metatext entries into DB.
                strs_sql = []
                for key, metatext in self._metatexts.items():
                    strs_sql.append("(%d, '%s', '%s', '%s')" % (self._id,
                                                                metatext["tag"],
                                                                metatext["title"],
                                                                metatext["text"]))

                db_cur.execute("INSERT INTO metatexts(dataset_id, tag, title, text) "
                               "VALUES %s;" % (", ".join(strs_sql)))

                # 5) Insert urls entries into DB.
                strs_sql = []
                for url in self._urls:
                    strs_sql.append("(%d, '%s')" % (self._id, url))
                db_cur.execute("INSERT INTO urls(dataset_id, url) VALUES %s;" % (", ".join(strs_sql)))

                # 6) Insert replicate entries into DB.
                strs_sql = []
                for key, replicates in self._replicates.items():
                    # strs_sql.append("(%d, %d, '%s')" % (self._id, ???, key))
                    # self._replicates[key] = ["xxx", "xxx"]
                    str_del = "' ,'"
                    strs_sql = f"(SELECT {self._id} AS dataset_id, id AS measurement_id, '{key}' AS label " \
                               "    FROM measurements " \
                               f"    WHERE dataset_id = {self._id} AND " \
                               f"        label IN ('{str_del.join(replicates)}'))"
                    db_cur.execute(f"INSERT INTO replicates(dataset_id, measurement_id, label) {strs_sql};")

                # 7) Insert measurements entries into DB.
                strs_sql = []
                for str_sample in self._cached_data_table.columns.tolist():
                    strs_sql.append("(%d, '%s')" % (self._id, str_sample))

                db_cur.execute("INSERT INTO measurements(dataset_id, label) "
                               "VALUES %s RETURNING id, dataset_id, label;" % (", ".join(strs_sql)))

                db_samples = pd.DataFrame(db_cur.fetchall(), columns=["id", "dataset_id", "label"])

                # 8) Insert data cells / rows as data values.
                data_long = pd.melt(frame=self._cached_data_table.reset_index(), id_vars=["Key"], var_name="sample")
                data_long = data_long.merge(right=db_samples, left_on="sample", right_on="label",
                                                            suffixes=("_x", "_y"))
                data_long = data_long.merge(right=db_ois, left_on="Key", right_on="label",
                                                            suffixes=("_sample", "_oi"))
                # Keep Columns: Key (oi), sample, value, id_sample, dataset_id, id_po
                data_long = data_long.drop(columns=["label_oi", "label_sample"])

                strs_sql = []
                for index, row in data_long.iterrows():
                    strs_sql.append("(%d, %d, %d, %f)" % (row["dataset_id"],
                                                          row["id_sample"],
                                                          row["id_oi"],
                                                          row["value"]))

                db_cur.execute("INSERT INTO measurement_values(dataset_id, measurement_id, oi_id, value) "
                               "VALUES %s;" % (", ".join(strs_sql)))

                # 9) Insert dataset attributes
                for key, item in self._attributes_dataset.items():
                    db_cur.execute("INSERT INTO nm_dataset_attribute_value(attribute_value_id, dataset_id) "
                                   f"VALUES ({item['id']}, {self._id});")
                    # db_cur.execute("INSERT INTO nm_dataset_attribute_value(attribute_value_id, dataset_id) "
                    #                f"(SELECT id, {self._id} FROM attribute_values "
                    #                f"WHERE tag = '{item['tag']}');")

                # 10) Insert sample attributes
                for attribute_tag, attribute in self._attributes_samples.items():
                    for attribute_item_tag, attribute_item in self._attributes_samples[attribute_tag]["values"].items():
                        str_del = "' ,'"
                        strs_sql = f"(SELECT {attribute_item['id']} AS attribute_value_id, id AS measurement_id " \
                                   "    FROM measurements " \
                                   f"    WHERE dataset_id = {self._id} AND " \
                                   f"        label IN ('{str_del.join(attribute_item['samples'])}'))"

                db_cur.execute("INSERT INTO nm_measurement_attribute_value"
                               "(attribute_value_id, measurement_id) "
                               f"({strs_sql});")

                db_conn.commit()

                if db_cur is not None:
                    db_cur.close()
            except Exception as err:
                if db_conn is not None:
                    db_conn.rollback()
                if db_cur is not None:
                    db_cur.close()
                raise err
        else:
            raise Exception(f"A dataset '{self._label}' (id {self._id}) already exists.")




class PostgreSQLDatabase(MCDatabase):
    """"""
    # Todo: Write documentation

    def contains(self, datasetIds: typing.List) -> int:
        """"""
        # Todo: Write documentation
        db_conn = None
        db_cur = None
        try:
            db_in = PostgreSQLConnection()
            db_conn = db_in.getConnection()
            db_cur = db_conn.cursor()

            str_test = "' ,'".join(datasetIds)
            db_cur.execute(f"SELECT COUNT(*) FROM datasets WHERE label IN ('{str_test}');")
            db_row = db_cur.fetchone()
            db_cur.close()

            return db_row[0]
        except Exception as err:
            if db_cur is not None:
                db_cur.close()
            raise err

    def getAttributeTable(self) -> pd.DataFrame:
        """"""
        # Todo: Write documentation
        db_conn = None
        db_cur = None
        try:
            db_in = PostgreSQLConnection()
            db_conn = db_in.getConnection()
            db_cur = db_conn.cursor()

            db_cur.execute("SELECT a.id AS attribute_id, a.parent_id AS attribute_parent_id, a.tag AS attribute_tag, "
                           "       a.name AS attribute, a.priority, a.allow_as_filter, a.allow_for_dataset, "
                           "       a.allow_for_measurement, a.allow_for_users, a.allow_for_qc, av.id AS value_id, "
                           "       av.tag AS value_tag, av.name AS value, av.details "
                           "   FROM attributes AS a "
                           "       LEFT JOIN attribute_values AS av ON a.id = av.attribute_id "
                           "LEFT JOIN nm_dataset_attribute_value AS nm ON nm.attribute_value_id = av.id;")

            db_rows = pd.DataFrame(db_cur.fetchall(), columns=["attribute_id", "attribute_parent_id", "attribute_tag",
                                                               "attribute", "priority", "allow_as_filter",
                                                               "allow_for_dataset", "allow_for_measurement",
                                                               "allow_for_users", "allow_for_qc", "value_id",
                                                               "value_tag", "value", "details"])

            db_cur.close()
            return db_rows
        except Exception as err:
            if db_cur is not None:
                db_cur.close()
            raise err

    def getDatasetAttributeJSON(self, tag: str = "") -> typing.Dict:
        """"""
        # Todo: Write documentation
        db_conn = None
        db_cur = None
        try:
            db_in = PostgreSQLConnection()
            db_conn = db_in.getConnection()
            db_cur = db_conn.cursor()

            db_cur.execute("SELECT DISTINCT a.id AS attribute_id, a.parent_id AS attribute_parent_id, a.tag AS attribute_tag, "
                           "       a.name AS attribute, a.priority, a.allow_as_filter, a.allow_for_dataset, "
                           "       a.allow_for_measurement, a.allow_for_users, a.allow_for_qc, av.id AS value_id, "
                           "       av.tag AS value_tag, av.name AS value, av.details "
                           "   FROM attributes AS a "
                           "       LEFT JOIN attribute_values AS av ON a.id = av.attribute_id "
                           "LEFT JOIN nm_dataset_attribute_value AS nm ON nm.attribute_value_id = av.id "
                           f"WHERE av.tag = '{tag}' AND a.allow_for_dataset;")

            db_rows = pd.DataFrame(db_cur.fetchall(), columns=["attribute_id", "attribute_parent_id", "attribute_tag",
                                                               "attribute", "priority", "allow_as_filter",
                                                               "allow_for_dataset", "allow_for_measurement",
                                                               "allow_for_users", "allow_for_qc", "value_id",
                                                               "value_tag", "value", "details"])

            db_cur.close()

            if db_rows.shape[0] == 0:
                raise Exception(f"No match for the attribute_value with the tag '{tag}'.")
            elif db_rows.shape[0] > 1:
                raise Exception(f"No unique for the attribute_value with the tag '{tag}'.")

            return MCDataset.buildAttributesJsonItem(db_id=db_rows["attribute_id"].iloc[0],
                                                     attribute_parent_id=db_rows["attribute_parent_id"].iloc[0],
                                                     attribute_tag=tag,
                                                     attribute=db_rows["attribute"].iloc[0],
                                                     priority=db_rows["priority"].iloc[0],
                                                     allow_as_filter=db_rows["allow_as_filter"].iloc[0],
                                                     value_id=db_rows["value_id"].iloc[0],
                                                     tag=db_rows["value_tag"].iloc[0],
                                                     value=db_rows["value"].iloc[0],
                                                     details=db_rows["details"].iloc[0])
        except Exception as err:
            if db_cur is not None:
                db_cur.close()
            raise err

    def getSampleAttributeJSON(self, grouping_json: typing.Dict = {}) -> typing.Dict:
        """"""
        # Todo: Write documentation
        db_conn = None
        db_cur = None
        try:
            db_in = PostgreSQLConnection()
            db_conn = db_in.getConnection()
            db_cur = db_conn.cursor()

            str_del = "' ,'"
            str_attributes = str_del.join(grouping_json.keys())


            db_cur.execute("SELECT a.id AS attribute_id, a.parent_id AS attribute_parent_id, a.tag AS attribute_tag, "
                           "       a.name AS attribute, a.priority, a.allow_as_filter, a.allow_for_dataset, "
                           "       a.allow_for_measurement, a.allow_for_users, a.allow_for_qc, av.id AS value_id, "
                           "       av.tag AS value_tag, av.name AS value, av.details "
                           "               FROM attributes AS a "
                           "                   LEFT JOIN attribute_values AS av ON a.id = av.attribute_id "
                           "            LEFT JOIN nm_dataset_attribute_value AS nm ON nm.attribute_value_id = av.id "
                           f"            WHERE av.tag IN ('{str_attributes}') AND a.allow_for_measurement;")

            db_rows = pd.DataFrame(db_cur.fetchall(), columns=["attribute_id", "attribute_parent_id", "attribute_tag",
                                                               "attribute", "priority", "allow_as_filter",
                                                               "allow_for_dataset", "allow_for_measurement",
                                                               "allow_for_users", "allow_for_qc", "value_id",
                                                               "value_tag", "value", "details"])

            if(len(db_rows["attribute_tag"].unique()) != 1):
                raise Exception("Attribute tags are not unique! Check group definition.")

            json_groups = {}
            for ix, attribute in db_rows.iterrows():
                json_groups[attribute["value_tag"]] = MCDataset.buildSampleAttributesJsonGroup(db_id=attribute["value_id"],
                                                                                               tag=attribute["value_tag"],
                                                                                               value=attribute["value"],
                                                                                               details=attribute["details"],
                                                                                               samples=grouping_json[attribute["value_tag"]])

            return MCDataset.buildSampleAttributesJsonItem(db_id=db_rows["attribute_id"].iloc[0],
                                                           attribute_parent_id=db_rows["attribute_parent_id"].iloc[0],
                                                           attribute=db_rows["attribute"].iloc[0],
                                                           priority=db_rows["priority"].iloc[0],
                                                           allow_as_filter=db_rows["allow_as_filter"].iloc[0],
                                                           grouping_json=json_groups)
        except Exception as err:
            if db_cur is not None:
                db_cur.close()
            raise err

    def getAllDataIDs(self, sort_createdOn_desc: bool = False) -> typing.List[str]:
        """"""
        # Todo: Write documentation
        db_conn = None
        db_cur = None
        try:
            db_in = PostgreSQLConnection()
            db_conn = db_in.getConnection()
            db_cur = db_conn.cursor()

            str_sort_direction = "DESC" if sort_createdOn_desc else "ASC"

            db_cur.execute(f"SELECT label FROM datasets AS ds ORDER BY created_on {str_sort_direction};")
            db_rows = [value[0] for value in db_cur.fetchall()]

            db_cur.close()
            return db_rows  # ToDo: returns List[Tuple[Any, ...]] instead of List[]
        except Exception as err:
            if db_cur is not None:
                db_cur.close()
            raise err

    def getDataIDs(self, n_limit: int = 42, n_offset: int = 0, sort_createdOn_desc: bool = False) -> typing.List[str]:
        """"""
        # Todo: Write documentation
        db_conn = None
        db_cur = None
        try:
            db_in = PostgreSQLConnection()
            db_conn = db_in.getConnection()
            db_cur = db_conn.cursor()

            str_sort_direction = "DESC" if sort_createdOn_desc else "ASC"

            db_cur.execute("SELECT label FROM datasets AS ds "
                           f"   ORDER BY created_on {str_sort_direction} "
                           f"   LIMIT {n_limit} OFFSET {n_offset};")
            db_rows = [value[0] for value in db_cur.fetchall()]
            db_cur.close()

            return db_rows
        except Exception as err:
            if db_cur is not None:
                db_cur.close()
            raise err

    def getJSONDatasets(self, labels: typing.List[str] = []) -> typing.Dict[str, typing.Any]:
        """"""
        # Todo: Write documentation
        datasets = {}
        labels_toQuery = []
        if len(labels) < 1:
            labels = self.getAllDataIDs()

        for label in labels:
            if label in self._cached_datasets.keys():
                datasets[label] = {"id": self._cached_datasets[label]._id,
                                   "label": self._cached_datasets[label]._label,
                                   "email": self._cached_datasets[label]._contact_email,
                                   "state": self._cached_datasets[label]._state,
                                   "instrument": self._cached_datasets[label]._instrument,
                                   "title": self._cached_datasets[label]._title,
                                   "experimentator": self._cached_datasets[label]._experimentator,
                                   "group_name": self._cached_datasets[label]._name_group,
                                   "date_created_on": self._cached_datasets[label]._created_on,
                                   "date_uploaded_on": self._cached_datasets[label]._uploaded_on}
            else:
                labels_toQuery.append(label)

        if len(labels_toQuery) > 0:
            db_conn = None
            db_cur = None

            try:
                db_in = PostgreSQLConnection()
                db_conn = db_in.getConnection()
                db_cur = db_conn.cursor()

                str_labels_toQuery = "', '".join(labels_toQuery)
                db_cur.execute("SELECT d.id, d.label, d.contact_email, d.state, "
                               "       d.instrument_id, i.label, i.name, i.description, "
                               "       d.title, d.experimentator, d.name_group, d.created_on, d.uploaded_on "
                               "    FROM datasets AS d "
                               "        LEFT JOIN instruments AS i ON d.instrument_id = i.id "
                               f"    WHERE d.label IN ('{str_labels_toQuery}');")
                for db_row in db_cur:
                    datasets[db_row[1]] = {"id": db_row[0],
                                           "label": db_row[1],
                                           "email": db_row[2],
                                           "state": db_row[3],
                                           "instrument": MCDataset.buildInstrumentJson(db_id=db_row[4],
                                                                                       label=db_row[5],
                                                                                       name=db_row[6],
                                                                                       description=db_row[7]),
                                           "title": db_row[8],
                                           "experimentator": db_row[9],
                                           "group_name": db_row[10],
                                           "date_created_on": db_row[11],
                                           "date_uploaded_on": db_row[12]}

                db_cur.close()
            except Exception as err:
                if db_cur is not None:
                    db_cur.close()
                raise err

        return datasets

    def getNumberOfDatasets(self) -> int:
        """"""
        # Todo: Write documentation
        db_conn = None
        db_cur = None

        try:
            db_in = PostgreSQLConnection()
            db_conn = db_in.getConnection()
            db_cur = db_conn.cursor()

            db_cur.execute("SELECT COUNT(*) FROM datasets;")
            db_row = db_cur.fetchone()
            db_cur.close()

            return db_row[0]
        except Exception as err:
            if db_cur is not None:
                db_cur.close()
            raise err

    def getSize(self) -> int:
        """"""
        # Todo: Write documentation
        db_conn = None
        db_cur = None
        try:
            db_in = PostgreSQLConnection()
            db_conn = db_in.getConnection()
            db_cur = db_conn.cursor()

            db_cur.execute(f"SELECT pg_database_size('{db_in.getDatabaseName()}') - "
                           "pg_total_relation_size('sec_tokens') - "
                           "pg_total_relation_size('sec_users') - "
                           "pg_total_relation_size('nm_users_attribute_value');")
            db_row = db_cur.fetchone()
            db_cur.close()

            return db_row[0]
        except Exception as err:
            if db_cur is not None:
                db_cur.close()
            raise err

