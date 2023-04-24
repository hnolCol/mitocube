import typing
from decouple import config
from collections import OrderedDict
import pandas as pd
import psycopg2

from backend.lib.data.DataHandling import MitoCubeAbundanceTable, MitoCubeMetaInformation, SQLConnection, \
    MitoCubeDataset, MitoCubeDataCollection, MitoCubeDatabase


class PostgreSQLConnection(SQLConnection):  # (metaclass=SingletonMeta):
    """Singleton class that opens, shares and closes a shared psycopg2.connection to the configured database."""

    #: Holds the shared connection object.
    # conn = None  # Todo: Figure out type, e.g. psycopg2.connection like does not work

    # __db_ip: str = None
    # __db_name: str = None
    # __db_user: str = None
    # __db_pw: str = None

    def __init__(self) -> None:
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

    def closeConnection(self) -> None:
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


class PostgreSQLAbundanceTable(MitoCubeAbundanceTable):
    """"""
    # Todo: Write documentation

    def __init__(self, dataset_id: str, preloadData: bool = False) -> None:
        """Constructor"""
        # Todo: Write documentation
        super().__init__(dataset_id, None)

        if preloadData:
            self._refresh()

    def _isLoaded(self) -> bool:
        """"""
        # Todo: Write documentation
        return self._cached_data is not None

    def _refresh(self) -> None:
        """"""
        # Todo: Write documentation

        db_conn = PostgreSQLConnection().getConnection()

        db_cur = db_conn.cursor()

        db_cur.execute("SELECT m.id AS id, m.label AS label, oi.label AS oi, mv.value AS value"
                       "    FROM dataset AS ds "
                       "        LEFT JOIN measurement AS m ON ds.id = m.dataset_id "
                       "        LEFT JOIN measurementvalue AS mv ON m.id = mv.measurement_id "
                       "        LEFT JOIN oi AS oi ON mv.oi_id = oi.id "
                       f"   WHERE ds.label = '{self._id}' "
                       "    ORDER BY m.id, oi.label ASC;")
        db_rows = db_cur.fetchall()

        db_rows = pd.DataFrame(db_rows, columns=["id", "label", "oi", "value"])

        db_rows["label"] = db_rows["label"].apply(lambda x: x.rstrip())  # Todo: fix white space in DB
        db_rows["oi"] = db_rows["oi"].apply(lambda x: x.rstrip())

        db_rows = db_rows.pivot_table(values="value", index="oi", columns="label",
                                      aggfunc='mean', fill_value=None, dropna=True)
        db_rows.index.rename("Key", inplace=True)

        self._cached_data = db_rows

        db_cur.close()

    def getDataTable(self) -> pd.DataFrame:
        """"""
        # Todo: Write documentation
        if not self._isLoaded():
            self._refresh()

        return self._cached_data


class PostgreSQLMetaInformation(MitoCubeMetaInformation):
    """"""
    # Todo: Write documentation

    def __init__(self, dataset_id: str, preloadData: bool = False) -> None:
        """Constructor"""
        # Todo: Write documentation
        super().__init__(dataset_id, None)

        if preloadData:
            self._refresh()

    def _isLoaded(self) -> bool:
        """"""
        # Todo: Write documentation
        return self._cached_meta is not None

    def _refresh(self) -> None:
        """"""
        # Todo: Write documentation
        db_conn = PostgreSQLConnection().getConnection()
        db_cur = db_conn.cursor()

        db_cur.execute("WITH cte AS (SELECT ds.id, to_char(ds.created_on, 'YYYY-MM-DD HH24:MI'), "
                       "                    ds.state, ds.experimentator, ds.contact_email, ds.name_group, "
                       "			 		ds.title, ds.research_question, ds.protein_of_interest, "
                       "			 		ds.organism, ds.type, i.label, ds.material, ds.research_aim, "
                       "                    ds.research_sample_preparation, ds.research_information "
                       "			 	FROM dataset AS ds "
                       "			 		LEFT JOIN instrument AS i ON ds.instrument_id = i.id "
                       f"			 	WHERE ds.label = '{self._id}') "
                       " "
                       "SELECT cte.*, n_samples, 0 AS n_replicates, 0 AS n_groups "
                       "	FROM cte "
                       "		LEFT JOIN (SELECT dataset_id, COUNT(*) AS n_samples "
                       "				   	 FROM measurement "
                       "					 WHERE measurement.dataset_id = (SELECT id FROM cte) "
                       "					 GROUP BY dataset_id) AS tbl_n_m "
                       "			ON tbl_n_m.dataset_id = cte.id;")

        db_row = db_cur.fetchall()
        db_row = db_row[0]
        dataID_db_id = db_row[0]

        params = {'Creation Date': db_row[1], 'State': db_row[2], 'dataID': self._id,
                  'Experimentator': db_row[3].rstrip(), 'Email': db_row[4].rstrip(),
                  'GroupName': db_row[5].rstrip(),
                  'Title': db_row[6].rstrip(), 'Research Question': db_row[7].rstrip(),
                  'Protein of Interest': db_row[8].rstrip(), 'Organism': db_row[9].rstrip(),
                  'Type': db_row[10].rstrip(), 'Instrument': db_row[11].rstrip(), 'Material': db_row[12].rstrip(),
                  'Experimental Info': [{'title': 'Research Aim', 'details': db_row[13].rstrip()},
                                        {'title': 'Sample Preparation', 'details': db_row[14].rstrip()},
                                        {'title': 'Additional Information', 'details': db_row[15].rstrip()}],
                  'Number Samples': db_row[16],
                  'Number Replicates': db_row[17],
                  'Number Groupings': db_row[18],
                  'replicates': {},
                  'groupingNames': [],
                  'groupings': {},
                  'groupingCmap': OrderedDict([]),
                  'PTM': False}

        db_cur.execute("SELECT m.dataset_id AS dataset_id, "
                       "       g.id AS group_id, g.label AS group_label, g.priority AS group_priority, "
                       "       gi.id AS grouping_id, gi.label AS grouping_label, "
                       "       m.id AS measurement_id, m.label AS measurement_label "
                       "   FROM measurement AS m "
                       "       LEFT JOIN nm_measurement_groupingitem AS nm "
                       "            ON m.id = nm.measurement_id "
                       "       LEFT JOIN groupingitem AS gi "
                       "            ON nm.groupingitem_id = gi.id "
                       "       LEFT JOIN grouping as g "
                       "            ON gi.grouping_id = g.id "
                       f"   WHERE m.dataset_id = {dataID_db_id} "
                       "   ORDER BY group_id, grouping_id ASC;")

        db_rows = db_cur.fetchall()
        db_rows = pd.DataFrame(db_rows,
                               columns=["dataset_id", "group_id", "group_label", "group_priority",
                                        "grouping_id", "grouping_label", "measurement_id", "measurement_label"])

        db_rows["group_label"] = db_rows["group_label"].apply(lambda x: x.rstrip())  # Todo: fix white space in DB
        db_rows["grouping_label"] = db_rows["grouping_label"].apply(lambda x: x.rstrip())
        db_rows["measurement_label"] = db_rows["measurement_label"].apply(lambda x: x.rstrip())

        # db_rows["group_label"].unique() or pd.unique(db_rows.loc[:, "group_label"])
        params["groupingNames"] = db_rows["group_label"].unique().tolist()
        params["Number Groupings"] = len(params["groupingNames"])

        it = 0
        cmapDefaults = ['Blues', 'Set7', 'Spectral', 'Greys']  # Todo: get that from somewhere else

        for grp_dim1 in db_rows["group_label"].unique():
            params["groupings"][grp_dim1] = dict()
            params["groupingCmap"][grp_dim1] = cmapDefaults[it]

            for grp_dim2 in db_rows[db_rows["group_label"] == grp_dim1]["grouping_label"].unique():

                params["groupings"][grp_dim1][grp_dim2] = \
                    db_rows[(db_rows["group_label"] == grp_dim1) &
                            (db_rows["grouping_label"] == grp_dim2)].loc[:, "measurement_label"].tolist()
            it += 1

        # --- JSON --- # ToDo: Introduce replicates?
        # 'replicates': {'1': '20230125_E1_EasyLC1_CollID_Bonn037_50cm_SK_MS-0014_21.mzML',
        #   '2': '20230125_E1_EasyLC1_CollID_Bonn037_50cm_SK_MS-0014_22.mzML',
        #   '3': '20230125_E1_EasyLC1_CollID_Bonn037_50cm_SK_MS-0014_23.mzML',
        #   '4': '20230125_E1_EasyLC1_CollID_Bonn037_50cm_SK_MS-0014_24.mzML'},

        db_cur.close()

        self._cached_meta = params

    def getDictionary(self) -> typing.Dict:
        """"""
        # Todo: Write documentation
        if not self._isLoaded():
            self._refresh()

        return self._cached_meta


class PostgreSQLDataset(MitoCubeDataset):
    """Replacement for the Data.Dataset"""
    # Todo: Write documentation

    def __init__(self, dataset_id: str, preloadData: bool = False) -> None:
        """Constructor"""
        # Todo: Write documentation
        super().__init__(dataset_id=dataset_id,
                         data=PostgreSQLAbundanceTable(dataset_id, preloadData=preloadData),
                         meta=PostgreSQLMetaInformation(dataset_id, preloadData=preloadData))


class PostgreSQLDataCollection(MitoCubeDataCollection):
    """Replacement for the Data.DataCollection"""
    # Todo: Write documentation

    def __init__(self, ids: typing.List[str], preloadData: bool = False) -> None:
        """Constructor"""
        # Todo: Write documentation
        self.ids = ids  # typing.List[str] = []

        super().__init__(data={})

        if preloadData:
            self._queryDatasets()

    def _queryDatasets(self):
        """"""
        # Todo: Write documentation
        validated_ids = self.ids

        if(len(validated_ids) < 1):
            return

        str_labels = ", ".join(["'%s'"] * len(validated_ids)) % tuple(validated_ids)

        cmapDefaults = ['Blues', 'Set7', 'Spectral', 'Greys']  # Todo: get cmapDefaults from somewhere else

        db_conn = PostgreSQLConnection().getConnection()
        db_cur = db_conn.cursor()
        db_cur.execute("SELECT ds.id AS ds_id, ds.label AS ds_label, m.id AS id, "
                       "       m.label AS label, oi.label AS oi, mv.value AS value "
                       "    FROM dataset AS ds "
                       "        LEFT JOIN measurement AS m ON ds.id = m.dataset_id "
                       "        LEFT JOIN measurementvalue AS mv ON m.id = mv.measurement_id "
                       "        LEFT JOIN oi AS oi ON mv.oi_id = oi.id "
                       f"   WHERE ds.label IN ({str_labels}) "
                       "    ORDER BY m.id, oi.label ASC;")

        db_data_rows = db_cur.fetchall()
        db_data_rows = pd.DataFrame(db_data_rows, columns=["ds_id", "ds_label", "id", "label", "oi", "value"])

        db_data_rows["ds_label"] = db_data_rows["ds_label"].apply(lambda x: x.rstrip())  # Todo: fix white space in DB
        db_data_rows["label"] = db_data_rows["label"].apply(lambda x: x.rstrip())
        db_data_rows["oi"] = db_data_rows["oi"].apply(lambda x: x.rstrip())

        str_ids = db_data_rows["ds_id"].unique()
        str_ids = ", ".join(["%d"] * len(str_ids)) % tuple(str_ids)  # get integers and prepare list

        # db_rows = db_rows.pivot(index="oi", columns="label", values="value")

        db_cur.execute("WITH cte AS (SELECT ds.id, to_char(ds.created_on, 'YYYY-MM-DD HH24:MI'), "
                       "                    ds.state, ds.experimentator, ds.contact_email, ds.name_group, "
                       "			 		ds.title, ds.research_question, ds.protein_of_interest, "
                       "			 		ds.organism, ds.type, i.label, ds.material, ds.research_aim, "
                       "                    ds.research_sample_preparation, ds.research_information "
                       "			 	FROM dataset AS ds "
                       "			 		LEFT JOIN instrument AS i ON ds.instrument_id = i.id "
                       f"			 	WHERE ds.id IN ({str_ids})) "
                       " "
                       "SELECT cte.*, n_samples, 0 AS n_replicates, 0 AS n_groups "
                       "	FROM cte "
                       "		LEFT JOIN (SELECT dataset_id, COUNT(*) AS n_samples "
                       "				   	 FROM measurement "
                       "					 WHERE measurement.dataset_id IN (SELECT id FROM cte) "
                       "					 GROUP BY dataset_id) AS tbl_n_m "
                       "			ON tbl_n_m.dataset_id = cte.id;")

        db_meta_rows = db_cur.fetchall()
        db_meta_rows = pd.DataFrame(db_meta_rows, columns=["ds_id", "ds_created_on", "ds_state", "ds_experimentator",
                                                           "ds_contact_email", "ds_name_group", "ds_title",
                                                           "ds_research_question", "ds_protein_of_interest",
                                                           "ds_organism", "ds_type", "i_label", "ds_material",
                                                           "ds_research_aim", "ds_research_sample_preparation",
                                                           "ds_research_information", "n_samples", "n_replicates",
                                                           "n_groups"])

        db_cur.execute("SELECT m.dataset_id AS dataset_id, "
                       "       g.id AS group_id, g.label AS group_label, g.priority AS group_priority, "
                       "       gi.id AS grouping_id, gi.label AS grouping_label, "
                       "       m.id AS measurement_id, m.label AS measurement_label "
                       "   FROM measurement AS m "
                       "       LEFT JOIN nm_measurement_groupingitem AS nm "
                       "	        ON m.id = nm.measurement_id "
                       "       LEFT JOIN groupingitem AS gi "
                       "	        ON nm.groupingitem_id = gi.id "
                       "       LEFT JOIN grouping as g "
                       "	        ON gi.grouping_id = g.id "
                       f"   WHERE m.dataset_id IN ({str_ids}) "  # get ids fom above !!!
                       "   ORDER BY group_id, grouping_id ASC;")

        db_grouping_rows = db_cur.fetchall()

        db_grouping_rows = pd.DataFrame(db_grouping_rows,
                                        columns=["dataset_id", "group_id", "group_label", "group_priority",
                                                 "grouping_id", "grouping_label", "measurement_id",
                                                 "measurement_label"])

        # Todo: fix white space in DB
        db_grouping_rows["group_label"] = db_grouping_rows["group_label"].apply(lambda x: x.rstrip())
        db_grouping_rows["grouping_label"] = db_grouping_rows["grouping_label"].apply(lambda x: x.rstrip())
        db_grouping_rows["measurement_label"] = db_grouping_rows["measurement_label"].apply(lambda x: x.rstrip())

        cachedData = dict()

        for item_label in db_data_rows["ds_label"].unique():
            # ds = PostgreSQLDataset(datasetId=item_label)  # Todo, decision if load immediately or if needed

            dataTable = db_data_rows[db_data_rows["ds_label"] == item_label]
            item_id = int(dataTable["ds_id"].values[0])  # Todo: check issue with int64?

            dataTable = dataTable.pivot_table(values="value", index="oi", columns="label", aggfunc='mean',
                                              fill_value=None, dropna=True)
            dataTable.index.rename("Key", inplace=True)

            metaRow = db_meta_rows[db_meta_rows["ds_id"] == item_id]

            metaData = {'Creation Date': metaRow["ds_created_on"].values[0], 'State': metaRow["ds_state"].values[0],
                        'dataID': item_id,
                        'Experimentator': metaRow["ds_experimentator"].values[0].rstrip(),
                        'Email': metaRow["ds_contact_email"].values[0].rstrip(),
                        'GroupName': metaRow["ds_name_group"].values[0].rstrip(),
                        'Title': metaRow["ds_title"].values[0].rstrip(),
                        'Research Question': metaRow["ds_research_question"].values[0].rstrip(),
                        'Protein of Interest': metaRow["ds_protein_of_interest"].values[0].rstrip(),
                        'Organism': metaRow["ds_organism"].values[0].rstrip(),
                        'Type': metaRow["ds_type"].values[0].rstrip(),
                        'Instrument': metaRow["i_label"].values[0].rstrip(),
                        'Material': metaRow["ds_material"].values[0].rstrip(),
                        'Experimental Info': [{'title': 'Research Aim',
                                               'details': metaRow["ds_research_aim"].values[0].rstrip()},
                                              {'title': 'Sample Preparation',
                                               'details': metaRow["ds_research_sample_preparation"].values[0].rstrip()},
                                              {'title': 'Additional Information',
                                               'details': metaRow["ds_research_information"].values[0].rstrip()}],
                        'Number Samples': int(metaRow["n_samples"].values[0]),  # Todo: check issue with int64?
                        'Number Replicates': int(metaRow["n_replicates"].values[0]),  # Todo: check issue with int64?
                        'Number Groupings': int(metaRow["n_groups"].values[0]),  # Todo: check issue with int64?
                        'replicates': {}, "groupingNames": db_grouping_rows["group_label"].unique().tolist(),
                        'groupings': {}, 'groupingCmap': OrderedDict([]),
                        'PTM': False}

            metaData["Number Groupings"] = len(metaData["groupingNames"])

            it = 0
            groupings = db_grouping_rows[db_grouping_rows["dataset_id"] == item_id]

            for grp_dim1 in groupings["group_label"].unique():
                metaData["groupings"][grp_dim1] = dict()
                metaData["groupingCmap"][grp_dim1] = cmapDefaults[it]
                subGroup = groupings[groupings["group_label"] == grp_dim1]

                for grp_dim2 in groupings[groupings["group_label"] == grp_dim1]["grouping_label"].unique():
                    metaData["groupings"][grp_dim1][grp_dim2] = \
                        subGroup[(subGroup["group_label"] == grp_dim1) &
                                         (subGroup["grouping_label"] == grp_dim2)].loc[:,
                        "measurement_label"].tolist()
                it += 1

            cachedData[item_label] = MitoCubeDataset(dataset_id=item_label,
                                                     data=MitoCubeAbundanceTable(dataset_id=item_label,
                                                                                 datatable=dataTable),
                                                     meta=MitoCubeMetaInformation(dataset_id=item_label,
                                                                                  metadict=metaData))

        db_cur.close()

        self.ids = cachedData.keys()
        self._cached_data = cachedData


class PostgreSQLDatabase(MitoCubeDatabase):
    """"""
    # Todo: Write documentation

    def _update(self) -> None:
        """"""
        # Todo: Write documentation
        pass

    def contains(self, datasetIds: typing.List) -> int:
        """"""
        # Todo: Write documentation
        db_conn = PostgreSQLConnection().getConnection()
        db_cur = db_conn.cursor()

        str_test = "' ,'".join(datasetIds)
        db_cur.execute(f"SELECT COUNT(*) FROM dataset WHERE label IN ('{str_test}');")
        db_row = db_cur.fetchone()
        db_cur.close()

        return db_row[0]

    def getNumberOfDatasets(self) -> int:
        """"""
        # Todo: Write documentation
        db_conn = PostgreSQLConnection().getConnection()
        db_cur = db_conn.cursor()

        db_cur.execute("SELECT COUNT(*) FROM dataset;")
        db_row = db_cur.fetchone()
        db_cur.close()

        return db_row[0]

    def getSize(self) -> int:
        """"""
        # Todo: Write documentation
        db_in = PostgreSQLConnection()
        db_conn = db_in.getConnection()
        db_cur = db_conn.cursor()

        db_cur.execute(f"SELECT pg_database_size('{db_in.getDatabaseName()}');")
        db_row = db_cur.fetchone()
        db_cur.close()

        return db_row[0]

    def getDataset(self, datasetId: str) -> MitoCubeDataset:
        """"""
        # Todo: Write documentation
        return PostgreSQLDataset(dataset_id=datasetId, preloadData=True)

    def getDataCollection(self, ids: typing.List[str] = None) -> MitoCubeDataCollection:
        """"""
        # Todo: Write documentation
        return PostgreSQLDataCollection(ids=ids, preloadData=True)

    # ToDo: Figure out return structure
    # @abstractmethod
    # def getOIAbundance(self, poi_id: int = None, poi_label: str = None) -> typing.List[float]:
    #     pass

    def getDataIDs(self,
                   n_limit: int = 42,
                   n_offset: int = 0,
                   sort_createdOn_desc: bool = True) -> typing.List[str]:
        """"""
        db_in = PostgreSQLConnection()
        db_conn = db_in.getConnection()
        db_cur = db_conn.cursor()

        str_sort_direction = "DESC" if sort_createdOn_desc else "ASC"

        db_cur.execute("SELECT label FROM dataset AS ds "
                       f"   ORDER BY created_on {str_sort_direction} "
                       f"   LIMIT {n_limit} OFFSET {n_offset};")
        db_rows = db_cur.fetchall()

        db_rows = [strVal[0].rstrip() for strVal in db_rows]  # ToDo Fix column names everywhere

        db_cur.close()

        return db_rows

    def getDataIDsByFilter(self,
                           filters: dict,
                           n_limit: int = 42,
                           n_offset: int = 0,
                           sort_createdOn_desc: bool = True) -> typing.List[str]:
        """"""
        # Todo: Write documentation
        # ToDo: Implement getDataIDsByFilter(...)
        # return [dataID for dataID, dataset in self.items() if dataset.matchesFilter(filter)]
        return self.getDataIDs(n_limit, n_offset, sort_createdOn_desc)

    def getDataIDsThatContainFeature(self,
                                     featureIDs: str = None,
                                     filters: dict = None,
                                     n_limit: int = 42,
                                     n_offset: int = 0,
                                     sort_createdOn_desc: bool = True) -> typing.List[str]:
        """"""
        # Todo: Write documentation
        # ToDo: Implement getDataIDsThatContainFeature(...)
        # return [dataID for dataID, dataset in self.items() if dataset.matchesFilter(filter)]
        return self.getDataIDs(n_limit, n_offset, sort_createdOn_desc)

    def getUniqueFeatures(self) -> typing.List[str]:
        """"""
        # Todo: Write documentation
        # ToDo: Implement getDataIDsThatContainFeature(...)
        # return np.unique(np.concatenate([dataset.getFeatures() for dataset in self.values()]).astype(str))

        db_in = PostgreSQLConnection()
        db_conn = db_in.getConnection()
        db_cur = db_conn.cursor()

        db_cur.execute("SELECT DISTINCT oi.label AS label FROM oi ORDER BY oi.label ASC;")
        db_rows = db_cur.fetchall()

        db_rows = pd.DataFrame(db_rows, columns=["label"])

        # Todo: fix white space in DB
        db_rows["label"] = db_rows["label"].apply(lambda x: x.rstrip())

        db_cur.close()
        return db_rows["label"].tolist()
