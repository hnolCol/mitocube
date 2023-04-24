from __future__ import annotations
from abc import abstractmethod

from decouple import config
from typing import List, Dict, OrderedDict

import numpy as np
import pandas as pd

from backend.lib.DesignPatterns import SingletonABCMeta, JsonSerializable


# @dataclass Todo: check if that has any benefit
class MitoCubeAbundanceTable(JsonSerializable):
    """"""
    # Todo: Write documentation

    def __init__(self, dataset_id: str, datatable: pd.DataFrame = None) -> None:
        """Constructor"""
        # Todo: Write documentation
        self._id = dataset_id
        self._cached_data = datatable

    def getID(self) -> str:
        """"""
        # Todo: Write documentation
        return self._id

    def getDataTable(self) -> pd.DataFrame:
        """"""
        # Todo: Write documentation
        return self._cached_data

    def toJson(self) -> Dict:
        """"""
        # Todo: Write documentation
        return {}


class MitoCubeMetaInformation(JsonSerializable):
    """"""
    # Todo: Write documentation

    def __init__(self, dataset_id: str, metadict: Dict[str, ] = None) -> None:
        """Constructor"""
        # Todo: Write documentation
        self._id = dataset_id
        self._cached_meta = metadict

    def getID(self) -> str:
        return self._id

    def getDictionary(self) -> Dict:
        """"""
        # Todo: Write documentation
        return self._cached_meta

    def toJson(self) -> Dict:
        """"""
        # Todo: Write documentation
        return self.getDictionary()


class MitoCubeDataset:
    """Replacement for the Data.Dataset"""
    # Todo: Write documentation

    def __init__(self, dataset_id: str,
                 data: MitoCubeAbundanceTable = None,
                 meta: MitoCubeMetaInformation = None) -> None:
        """Constructor"""
        # Todo: Write documentation
        self._id = dataset_id
        self._data = data
        self._meta = meta

    def getID(self) -> str:
        return self._id

    def getDataObj(self) -> MitoCubeAbundanceTable:
        """"""
        # Todo: Write documentation
        return self._data

    def getMetaObj(self) -> MitoCubeMetaInformation:
        """"""
        # Todo: Write documentation
        return self._meta


class MitoCubeDataCollection:
    """Replacement for the Data.DataCollection"""
    # Todo: Write documentation

    def __init__(self, data: Dict[str, MitoCubeDataset] = {}) -> None:
        """Constructor"""
        # Todo: Write documentation
        self._cached_data = data

    def get(self, datasetIds: List[str] = None) -> List[MitoCubeDataset]:
        """"""
        # Todo: Write documentation
        if datasetIds is None:
            return []

        # validatedIds = datasetIds[datasetIds in self._cached_data.keys()]  # ToDo: NoSuchItemException raised?
        return self._cached_data[datasetIds]

    def getAll(self) -> Dict[str, MitoCubeDataset]:
        """"""
        # Todo: Write documentation
        return self._cached_data


    def getItem(self, datasetId: str = None) -> MitoCubeDataset:
        """"""
        # Todo: Write documentation
        if datasetId is None:
            return None
        elif datasetId in self._cached_data.keys():
            return self._cached_data[datasetId]   # ToDo: NoSuchItemException raised?
        else:
            return None


class MitoCubeFeatures(metaclass=SingletonABCMeta):
    """"""
    # Todo: Write documentation

    @abstractmethod
    def __init__(self):
        """"""
        # ToDo: Write Documentation
        # ToDo: Implement?

    @abstractmethod
    def _findMatchingColumns(self, columnNames) -> None:
        """"""
        # ToDo: Write Documentation
        # ToDo: Implement?
        pass

    @abstractmethod
    def _getColumnNames(self) -> pd.Series:
        """"""
        # ToDo: Write Documentation
        # ToDo: Implement?
        pass

    def _findMatchingColumns(self, columnNames):
        """"""
        # ToDo: Write Documentation
        # ToDo: Implement?
        return [colName for colName in columnNames if colName in self.DBs.columns]

    def _getColumnNames(self) -> pd.Series:
        """"""
        # ToDo: Write Documentation
        # ToDo: Implement?
        return self.DBs.columns

    def _update(self) -> None:
        """"""
        # ToDo: Write Documentation
        # ToDo: Implement?
        self.__readData()

    def getDBFeatures(self, requiredColNames=["Entry", "Gene names (primary)", "Protein names", "Organism"]):
        """"""
        # ToDo: Write Documentation
        # ToDo: Implement?
        if self.DBs.index.size > 0:
            matchedColNames = self._findMatchingColumns(requiredColNames)

            if len(matchedColNames) == 0:
                return self.DBs.index
            else:
                return self.Dbs[matchedColNames]

    def getDBInfoForFeatureList(self,
                                featureIDs: List[str],
                                requiredColNames: List[str],
                                plainExport: bool = True,
                                entryInfoDictAsOutput: bool = False) -> Dict:
        """"""
        # ToDo: Write Documentation
        # ToDo: Implement?
        idxIntersection = self.DBs.index.intersection(featureIDs)
        matchedColNames = self._findMatchingColumns(requiredColNames)
        if len(matchedColNames) > 0:
            if entryInfoDictAsOutput:
                DB = self.DBs.loc[idxIntersection, matchedColNames].fillna("-")
                return DB.to_dict(orient="index")
            else:
                DB = self.DBs.loc[idxIntersection, matchedColNames].reset_index().dropna(how="all", axis=1).fillna("-")
                if plainExport:  # for export from api
                    # dict works best
                    return DB.to_dict(orient="records")
                else:
                    DBInfo = OrderedDict()
                    for entry in DB.index:
                        databaseInfo = []
                        for colName in DB.columns:
                            eDetails = DB.loc[entry, colName]

                            if isinstance(eDetails, pd.Series):
                                eDetails = eDetails.values[0]
                            elif isinstance(eDetails, str):
                                pass
                            elif isinstance(eDetails, np.bool_):
                                eDetails = bool(eDetails)
                            else:
                                if np.isnan(eDetails):
                                    continue
                                eDetails = str(eDetails)

                            databaseInfo.append({"title": colName, "details": eDetails})
                        DBInfo[DB.loc[entry, "Entry"]] = databaseInfo
                    return DBInfo

    def getDBInfoForFeatureListByColumnName(self,
                                            featureIDs,
                                            columnName="Gene names (primary)",  # ToDo Fix column names everywhere
                                            checkShape=True):
        """"""
        # ToDo: Write Documentation
        # ToDo: Implement?
        if columnName in self.DBs.columns:  # Issue 'Gene names  (primary )' versus 'Gene names (primary)'
            idxIntersection = self.DBs.index.intersection(featureIDs)
            if idxIntersection.size == len(featureIDs):
                return self.DBs.loc[featureIDs, columnName]
            elif not checkShape:
                return self.DBs.loc[idxIntersection, columnName]
            else:
                return pd.Series(
                    [self.DBs.loc[idx, columnName] if idx in idxIntersection else "-" for idx in featureIDs],
                    index=featureIDs)
        else:  # Todo: main issue, else cases often not caught and handled!
            return None

    def getPlainDBInfoForFeatureList(self, featureIDs, columnNames=["Gene names (primary)"]):  # double space in name?
        """"""
        # ToDo: Write Documentation
        # ToDo: Implement?
        if len(columnNames) == 0:
            matchingColumnNames = self._getColumnNames()
        else:
            matchingColumnNames = self._findMatchingColumns(columnNames)
        idxIntersection = self.DBs.index.intersection(featureIDs)
        return self.DBs.loc[idxIntersection, matchingColumnNames]


class SQLConnection(metaclass=SingletonABCMeta):  # ABC
    """Singleton class that opens, shares and closes a shared connection to the configured database."""

    #: Holds the shared connection object.
    # conn = None  # Todo: Figure out type, e.g. psycopg2.connection like does not work

    def __init__(self) -> None:
        """
        The Constructor of DBConnection creates a new psycopg2.connection to the PostgreSQL database that can be shared.

        :raise Errors.
        """
        self.conn = self.getIndependentConnection()

    def __del__(self) -> None:  # ToDo: Use __del__ or __exit__? Look it up
        """
        Destructor will close the shared psycopg2.connection.

        :raise Errors.
        """
        self.closeConnection()
        # if self.conn is not None:
        #     self.conn.close()
        #     self.conn = None

    def __exit__(self) -> None:  # ToDo: Use __del__ or __exit__? Look it up
        """
        Destructor will close the shared psycopg2.connection.

        :raise Errors
        """
        self.closeConnection()
        # if self.conn is not None:
        #     self.conn.close()
        #     self.conn = None

    @abstractmethod
    def getDatabaseName(self) -> str:
        """"""
        # ToDo: Write documentation
        pass
    @abstractmethod
    def openNewConnection(self) -> None:
        """
        The method will open and return a new shared connection to the configured database and will close the
        previous shared connection.

        :raise Errors.
        :return: connection object
        :rtype: connection
        """
        pass

    @abstractmethod
    def closeConnection(self) -> None:
        """
        Closes the shared connection.

        :raise Errors.
        """
        pass

    @abstractmethod
    def getConnection(self):
        """
        Returns the currently shared psycopg2.connection object.

        :raise Errors.
        :return: connection object
        :rtype: connection
        """
        pass

    @abstractmethod
    def getIndependentConnection(self):  # Todo: Turn to static?
        """
        The method will open and return a new connection to the configured database without closing the
        existing connection. The returned connections is not shared and has to be closed manually.

        :raise Errors.
        :return: connection object
        :rtype: connection
        """
        pass


class MitoCubeDatabase(metaclass=SingletonABCMeta):
    """"""
    # Todo: Write documentation

    @abstractmethod
    def _update(self) -> None:
        """"""
        # Todo: Write documentation
        pass

    @abstractmethod
    def contains(self, datasetIds: List) -> int:
        """"""
        # Todo: Write documentation
        pass

    @staticmethod
    def getDatabase() -> MitoCubeDatabase:
        """"""
        # Todo: Write documentation
        # https: // stackoverflow.com / questions / 33533148 / how - do - i - type - hint - a - method -
        # with-the - type - of - the - enclosing -class
        if config("db-handler") == "postgresql":
            from backend.lib.data.PostgreSQLHandling import PostgreSQLDatabase
            return PostgreSQLDatabase()
        elif config("db-handler") == "pandafiles":
            from backend.lib.data.PandaFileHandling import PandaFileDatabase
            return PandaFileDatabase()
        else:
            raise Exception("Invalid MitoCubeDatabase configuration. Only 'postgresql' and 'pandafiles' are supported.")

    @abstractmethod
    def getNumberOfDatasets(self) -> int:
        """"""
        # Todo: Write documentation
        pass

    @abstractmethod
    def getSize(self) -> int:
        """"""
        # Todo: Write documentation
        pass

    @abstractmethod
    def getDataset(self, datasetId: str) -> MitoCubeDataset:
        """"""
        # Todo: Write documentation
        pass

    @abstractmethod
    def getDataIDs(self,
                   n_limit: int = 42,
                   n_offset: int = 0,
                   sort_createdOn_desc: bool = True) -> List[str]:
        """"""
        # Todo: Write documentation
        pass

    @abstractmethod
    def getDataIDsByFilter(self,
                           filters: dict,
                           n_limit: int = 42,
                           n_offset: int = 0,
                           sort_createdOn_desc: bool = True) -> List[str]:
        """"""
        # Todo: Write documentation
        # return [dataID for dataID, dataset in self.items() if dataset.matchesFilter(filter)]
        pass

    def getDataIDsThatContainFeature(self,
                                     featureIDs: str = None,
                                     filters: dict = None,
                                     n_limit: int = 42,
                                     n_offset: int = 0,
                                     sort_createdOn_desc: bool = True) -> List[str]:
        """"""
        # Todo: Write documentation
        pass

    @abstractmethod
    def getDataCollection(self, ids: List[str] = None) -> MitoCubeDataCollection:
        """"""
        # Todo: Write documentation
        pass

    def getUniqueFeatures(self) -> List[str]:
        """"""
        # Todo: Write documentation
        # return np.unique(np.concatenate([dataset.getFeatures() for dataset in self.values()]).astype(str))
        pass
