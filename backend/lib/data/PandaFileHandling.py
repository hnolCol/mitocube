import os
import typing
import json
from decouple import config
import pandas as pd

from backend.lib.data.DataHandling import MitoCubeAbundanceTable, MitoCubeMetaInformation, \
    MitoCubeDataset, MitoCubeDataCollection, MitoCubeDatabase


class PandaFileAbundanceTable(MitoCubeAbundanceTable):
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
        path_dataset = config("db-datadir") + "/" + self._id
        path_file_data = path_dataset + "/" + "data.txt"
        
        data = pd.read_csv(path_file_data, sep="\t", index_col="Key")
        data = data.loc[data.index.dropna(), :]  # remove nan index  # ToDo: Should we really remove NAs?

        self._cached_data = data

    def getDataTable(self) -> pd.DataFrame:
        """"""
        # Todo: Write documentation
        if not self._isLoaded():
            self._refresh()

        return self._cached_data


class PandaFileMetaInformation(MitoCubeMetaInformation):
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
        path_dataset = config("db-datadir") + "/" + self._id
        path_meta_data = path_dataset + "/" + "params.json"

        params = json.load(open(path_meta_data))

        # ToDo: move checking to new function.
        if "dataID" not in params or params["dataID"] != self._id:  # double check dataID.
            params["dataID"] = self._id

        # ToDo: Add PTM functionality (see master version)
        # ToDo: Add groupingCmap / grouping functionality (see master version)

        self._cached_meta = params

    def getDictionary(self) -> typing.Dict:
        """"""
        # Todo: Write documentation
        if not self._isLoaded():
            self._refresh()

        return self._cached_meta


class PandaFileDataset(MitoCubeDataset):
    """Replacement for the Data.Dataset"""
    # Todo: Write documentation

    def __init__(self, dataset_id: str, preloadData: bool = False) -> None:
        """Constructor"""
        # Todo: Write documentation
        super().__init__(dataset_id=dataset_id,
                         data=PandaFileAbundanceTable(dataset_id, preloadData=preloadData),
                         meta=PandaFileMetaInformation(dataset_id, preloadData=preloadData))


class PandaFileDataCollection(MitoCubeDataCollection):
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
        cachedData = dict()

        dbObj = MitoCubeDatabase.getDatabase()

        for item_label in self.ids:
            cachedData[item_label] = dbObj.getDataset(datasetId="wJlHt1dCPfN4")

        self.ids = cachedData.keys()
        self._cached_data = cachedData


class PandaFileDatabase(MitoCubeDatabase):
    """"""
    # Todo: Write documentation

    def _update(self) -> None:
        """"""
        # Todo: Write documentation
        pass

    def contains(self, datasetIds: typing.List) -> int:
        """"""
        # Todo: Write documentation
        items = self.getDataIDs()

        return sum([item in datasetIds for item in items])

    def getNumberOfDatasets(self) -> int:
        """"""
        # Todo: Write documentation
        n_datasetFolders = 0

        dir_root = config("db-datadir")

        if not os.path.exists(dir_root):
            raise Exception(f"Invalid database path {dir_root}")

        for item in os.scandir(dir_root):
            if item.is_dir():
                n_datasetFolders += 1

        return n_datasetFolders

    def getSize(self) -> int:
        """"""
        # Todo: Write documentation
        dir_root = config("db-datadir")

        if not os.path.exists(dir_root):
            raise Exception(f"Invalid database path {dir_root}")

        def get_dir_size(path: str):
            sum_size = 0
            with os.scandir(path) as it:
                for entry in it:
                    if entry.is_file():
                        sum_size += entry.stat().st_size
                    elif entry.is_dir():
                        sum_size += get_dir_size(entry.path)
            return sum_size

        return get_dir_size(dir_root)

    def getDataset(self, datasetId: str) -> MitoCubeDataset:
        """"""
        # Todo: Write documentation
        return PandaFileDataset(dataset_id=datasetId, preloadData=True)

    def getDataCollection(self, ids: typing.List[str] = None) -> MitoCubeDataCollection:
        """"""
        # Todo: Write documentation
        return PandaFileDataCollection(ids=ids, preloadData=True)

    # ToDo: Figure out return structure
    # @abstractmethod
    # def getOIAbundance(self, poi_id: int = None, poi_label: str = None) -> typing.List[float]:
    #     pass

    def getDataIDs(self,
                   n_limit: int = 42,  # ToDo: Implement Limit
                   n_offset: int = 0,  # ToDo: Implement Offset
                   sort_createdOn_desc: bool = True) -> typing.List[str]:
        """"""
        datasetFolders = []

        dir_root = config("db-datadir")

        if not os.path.exists(dir_root):
            raise Exception(f"Invalid database path {dir_root}")

        for item in os.scandir(dir_root):
            if item.is_dir():
                datasetFolders.append(item.name)

        return datasetFolders

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

        self.__getDataObj().index.unique().values


        return []
