from __future__ import annotations

from decouple import config
import json
import os
import pandas as pd
import typing

from backend.lib.data.DataHandling import MCDataset, MCDatabase


class PandaFileDataset(MCDataset):
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
        path_dataset = config("db-datadir") + "/" + self._id

        data = pd.read_csv(path_dataset + "/" + "data.txt", sep="\t", index_col="Key")
        data = data.loc[data.index.dropna(), :]  # remove nan index  # ToDo: Should we really remove NAs?

        self._cached_data_table = data

        meta = json.load(open(path_dataset + "/" + "params.json"))

        self._id = meta["id"]
        self._label = meta["label"]
        self._state = meta["state"]
        self._title = meta["title"]
        self._experimentator = meta["experimentator"]
        self._name_group = meta["group_name"]
        self._contact_email = meta["email"]
        self._created_on = meta["date_created_on"]
        self._uploaded_on = meta["date_uploaded_on"]
        self._instrument = meta["instrument"]
        self._metatexts = meta["metatexts"]
        self._urls = meta["urls"]
        self._attributes_dataset = meta["attributes"]
        self._attributes_samples = meta["group_attributes"]

    def write(self):
        """"""
        # Todo: Write documentation
        str_dir = config("db-datadir") + "/" + self._id + "/"
        if not os.path.exists(str_dir):
            os.mkdir(str_dir)

            self._cached_data_table.to_csv(path_or_buf=str_dir+"data.txt",
                                           sep="\t", index_col="Key")

            with open(str_dir+"params.json", "w") as file_out:
                json.dump(self.getMetaJson(), file_out)
        else:
            raise Exception(f"A dataset with id {self._id} already exists.")


class PandaFileDatabase(MCDatabase):
    """"""
    # Todo: Write documentation

    def __init__(self):
        """Constructor"""
        # Todo: Write documentation
        super().__init__()


        self.attributes = None
        self.attribute_values = None
        self.attributes_merged = None  # cached merged version of self.attributes and self.attribute_values
        self._import_attributes()

    def contains(self, datasetIds: typing.List) -> int:
        """"""
        # Todo: Write documentation
        items = self.getDataIDs()

        return sum([item in datasetIds for item in items])

    def getAttributeTable(self) -> pd.DataFrame:
        """"""
        # Todo: Write documentation
        return self.attributes_merged

    def getSampleAttributeJSON(self, grouping_json: typing.Dict = {}) -> typing.Dict:
        """"""
        # Todo: Write documentation
        db_rows = self.attributes_merged[self.attributes_merged["value_tag"].isin(list(grouping_json.keys())) &
                                         self.attributes_merged["allow_for_measurement"]]

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

    def getDatasetAttributeJSON(self, tag: str = "") -> typing.Dict:
        """"""
        # db.getDatasetAttributeJSON(tag="att_organism:human")

        db_rows = self.attributes_merged[(self.attributes_merged["value_tag"] == tag) &
                                         self.attributes_merged["allow_for_dataset"]]

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

    def getAllDataIDs(self, sort_createdOn_desc: bool = False) -> typing.List[str]:
        """"""
        # Todo: Write documentation
        datasetFolders = []

        dir_root = config("db-datadir")

        if not os.path.exists(dir_root):
            raise Exception(f"Invalid database path {dir_root}")

        for item in os.scandir(dir_root):
            if item.is_dir():
                datasetFolders.append(item.name)

        # ToDo: Implement sort_createdOn_desc

        return datasetFolders

    def getDataIDs(self,
                   n_limit: int = 42,  # ToDo: Implement Limit
                   n_offset: int = 0,  # ToDo: Implement Offset
                   sort_createdOn_desc: bool = False) -> typing.List[str]:
        """"""
        datasetFolders = self.getAllDataIDs()

        ix_left = n_offset  # ToDo: Alternative ix_left = n_offset * (n_limit + 1)
        ix_right = ix_left + n_limit

        if ix_right > len(datasetFolders):
            ix_right = len(datasetFolders)  # ToDo: Different handling for out of index?

        if ix_left > len(datasetFolders):
            ix_left = len(datasetFolders)  # ToDo: Different handling for out of index?

        # ToDo: Implement sort_createdOn_desc

        return datasetFolders[ix_left:ix_right]

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
            # ToDo: read json
            pass

        return datasets

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

    def _import_attributes(self):
        """"""
        # Todo: Write documentation
        try:
            # ToDo: read attribute values from file
            print()
            in_json = open(config("db-attributefile"), "r")
            json_attributes = json.load(in_json)
            in_json.close()

            self.attributes = pd.DataFrame.from_dict(json_attributes["attributes"])
            self.attribute_values = pd.DataFrame.from_dict(json_attributes["attribute_values"])

            self.attributes_merged = pd.merge(self.attributes, self.attribute_values, left_on="id", right_on="attribute_id")

            self.attributes_merged = pd.merge(self.attributes, self.attribute_values, left_on="id", right_on="attribute_id")
            self.attributes_merged = self.attributes_merged.drop(columns=["attribute_id"])
            self.attributes_merged = self.attributes_merged.rename(columns={"id_x": "attribute_id",
                                                                            "parent_id": "attribute_parent_id",
                                                                            "tag_x": "attribute_tag",
                                                                            "name_x": "attribute",
                                                                            "id_y": "value_id",
                                                                            "tag_y": "value_tag",
                                                                            "name_y": "value"})
        except Exception as err:
            raise Exception("Unable to import attribute JSON file: " + str(err))
