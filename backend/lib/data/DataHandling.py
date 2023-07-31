from __future__ import annotations

from abc import abstractmethod
import collections
from decouple import config
from deprecated import deprecated
import random
import typing
import pandas as pd

from backend.lib.DesignPatterns import JsonSerializable
from backend.lib.DesignPatterns import SingletonABCMeta


class MCDataset(JsonSerializable):
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
        self._id = dataset_id
        self._label = label

        if loadFromDatabase:
            self._refresh()
        else:
            self._loadedFromDatabase = False

            self._contact_email = contact_email
            self._state = state

            self._cached_data_table = data_table

            self._metatexts = metatexts
            self._urls = urls
            self._replicates = replicates
            self._attributes_dataset = attributes_dataset
            self._attributes_samples = attributes_samples

            self._instrument = instrument

            self._title = title
            self._experimentator = experimentator
            self._name_group = name_group

            self._created_on = created_on
            self._uploaded_on = uploaded_on

        # ToDo: Add Self stated updated / read date?

    def _isLoaded(self) -> bool:
        """"""
        # Todo: Write documentation
        return self._cached_data_table is not None and \
            self._attributes_dataset is not None and \
            self._attributes_samples is not None

    def _refresh(self):
        """"""
        # Todo: Write documentation
        self._readFromDatabase()
        self._loadedFromDatabase = True

    @abstractmethod
    def _readFromDatabase(self):
        """"""
        # Todo: Write documentation
        pass

    @staticmethod
    def buildInstrumentJson(db_id: int,
                            label: str,
                            name: str,
                            description: str) -> typing.Dict[str, typing.Any]:
        """"""
        # Todo: Write documentation
        return {"id": db_id,
                "label": label,
                "name": name,
                "description": description}

    @staticmethod
    def buildMetatextJsonItem(db_id: int, tag: str, title: str, text: str) -> typing.Dict[str, typing.Any]:
        """"""
        # Todo: Write documentation
        return {"id": db_id,
                "tag": tag,
                "title": title,
                "text": text}

    @staticmethod
    def buildAttributesJsonItem(db_id: int, attribute_parent_id: int,
                                attribute_tag: str, attribute: str, priority: int,
                                allow_as_filter: bool,
                                value_id: int, tag: str, value: str, details: str) -> typing.Dict[str, typing.Any]:
        """"""
        # Todo: Write documentation
        return {"attribute_id": db_id,
                "attribute_parent_id": attribute_parent_id,
                "attribute_tag": attribute_tag,
                "attribute": attribute,
                "priority": priority,
                "allow_as_filter": allow_as_filter,
                "id": value_id,
                "tag": tag,
                "value": value,
                "details": details}

    @staticmethod
    def buildSampleAttributesJsonItem(db_id: int,
                                      attribute_parent_id: int,
                                      attribute: str,
                                      priority: int,
                                      allow_as_filter: bool,
                                      grouping_json: typing.Dict) -> typing.Dict[str, typing.Any]:
        """"""
        # Todo: Write documentation
        # { 'att_substance': { } }
        return {'attribute_id': db_id,
                'attribute_parent_id': attribute_parent_id,
                'attribute': attribute,
                'priority': priority,
                'allow_as_filter': allow_as_filter,
                'values': grouping_json}

    @staticmethod
    def buildSampleAttributesJsonGroup(db_id: int, tag: str, value: str, details: str,
                                       samples: typing.List) -> typing.Dict[str, typing.Any]:
        """"""
        # Todo: Write documentation
        # { 'att_substance:none': xxx }
        return {'id': db_id,
                'tag': tag,
                'value': value,
                'details': details,
                'samples': samples}

    def getID(self) -> int:
        """Constructor"""
        # Todo: Write documentation
        return self._id

    def getDataTable(self) -> pd.DataFrame:
        """"""
        # Todo: Write documentation
        if not self._isLoaded():
            self._refresh()

        return self._cached_data_table

    def getLabel(self) -> str:
        """Constructor"""
        # Todo: Write documentation
        return self._label

    def getMetaJson(self) -> typing.Dict[str, typing.Any]:
        """"""
        # Todo: Write documentation
        if not self._isLoaded():
            self._refresh()

        return {"id": self._id,
                "label": self._label,
                "state": self._state,
                "title": self._title,
                "experimentator": self._experimentator,
                "group_name": self._name_group,
                "email": self._contact_email,
                "date_created_on": self._created_on,
                "date_uploaded_on": self._uploaded_on,
                "instrument": self._instrument,
                "n_rows": self._cached_data_table.shape[0],
                "n_samples": self._cached_data_table.shape[1],
                "metatexts": self._metatexts,
                "urls": self._urls,
                "replicates": self._replicates,
                "attributes": self._attributes_dataset,
                "n_attributes": len(self._attributes_dataset),
                "group_attributes": self._attributes_samples,
                "n_group_attributes": len(self._attributes_samples)}

    @deprecated(version='1.1', reason="Adds random groups if no sufficient grouping is defined. This will be removed!")
    def getMockGrouping(self):
        pass

    @deprecated(version='1.1', reason="Change of the data format: Please use the toJson(...) method.")
    def getLegacyMetaJson(self) -> typing.Dict[str, typing.Any]:
        """"""
        # Todo: Write documentation
        # Todo: Change to desired form
        if not self._isLoaded():
            self._refresh()

        metatexts = self._metatexts
        metatexts.pop("research_question", None)
        metatexts.pop("protein_of_interest", None)
        metatexts.pop("linked_data", None)

        json_experimental_info = []
        for key, item in metatexts.items():
            json_experimental_info.append({"title": item["title"],
                                           "details": item["text"]})

        json_groupings = {}
        for group_tag, group in self._attributes_samples.items():
            json_groupings[group["attribute"]] = {}
            for subgroup_tag, subgroup in group["values"].items():
                json_groupings[group["attribute"]][subgroup["value"]] = subgroup["samples"]

        json_grouping_names = list(json_groupings.keys())

        # ToDo: Remove creation of mock groups
        if len(json_grouping_names) != 2:
            samples_for_grouping = self._cached_data_table.columns.values.copy()
            random.shuffle(samples_for_grouping)
            json_grouping_names = ["MockRandomGroupingA", "MockRandomGroupingB"]
            json_groupings = {"MockRandomGroupingA": {"Accidential": [],
                                                        "Arbitrary": []},
                              "MockRandomGroupingB": {"Incidental": [],
                                                        "Indiscriminate": []}}

            for ix, item in enumerate(samples_for_grouping):
                if (ix % 2) == 0:
                    if(ix % 4) < 2:
                        json_groupings["MockRandomGroupingA"]["Accidential"].append(item)
                        json_groupings["MockRandomGroupingB"]["Incidental"].append(item)
                    else:
                        json_groupings["MockRandomGroupingA"]["Arbitrary"].append(item)
                        json_groupings["MockRandomGroupingB"]["Incidental"].append(item)
                else:
                    if(ix % 4) < 2:
                        json_groupings["MockRandomGroupingA"]["Accidential"].append(item)
                        json_groupings["MockRandomGroupingB"]["Indiscriminate"].append(item)
                    else:
                        json_groupings["MockRandomGroupingA"]["Arbitrary"].append(item)
                        json_groupings["MockRandomGroupingB"]["Indiscriminate"].append(item)

        cmap = ['Pastel1', 'Pastel2', 'Paired', 'Accent', 'Dark2', 'Set6', 'Set7', 'tab10', 'tab20', 'tab20b', 'tab20c']
        json_grouping_cmap = {}
        for item in json_grouping_names:
            json_grouping_cmap[item] = cmap.pop(random.randint(0, len(cmap)-1))

        return {"dataID": self._state,
                "Creation Date": self._created_on,
                "State": self._state,
                "Experimentator": self._experimentator,
                "Email": self._contact_email,
                "GroupName":  self._name_group,
                "Title": self._title,
                "Research Question": self._metatexts["research_question"] if "research_question" in self._metatexts else "Missing",
                "Protein of Interest": self._metatexts["protein_of_interest"] if "protein_of_interest" in self._metatexts else "Missing",
                "Linked data": self._metatexts["linked_data"] if "linked_data" in self._metatexts else "Missing",
                "Organism": self._attributes_dataset["att_organism"]["value"] if "att_organism" in self._attributes_dataset else "NA",
                "Type": self._attributes_dataset["att_experiment"]["value"] if "att_experiment" in self._attributes_dataset else "NA",
                "Instrument": self._instrument["id"],
                "Material": self._attributes_dataset["att_dataset"]["value"] if "att_dataset" in self._attributes_dataset else "NA",
                "Number Samples": self._cached_data_table.shape[1],
                "Number Replicates": len(self._replicates),
                "Number Groupings": len(json_grouping_names),
                "Experimental Info": json_experimental_info,
                "replicates": self._replicates,
                "groupingNames": json_grouping_names,
                "groupingCmap": json_grouping_cmap,
                "groupings": json_groupings
                }

    def isLoadedFromDatabase(self) -> bool:
        """"""
        # Todo: Write documentation
        return self._loadedFromDatabase

    def toJson(self) -> typing.Dict[str, typing.Any]:
        """"""
        # Todo: Write documentation
        json = self.getMetaJson()
        json["data"] = self._cached_data_table

        return json

    @abstractmethod
    def write(self):
        """"""
        # Todo: Write documentation
        pass


class MCDatabase(metaclass=SingletonABCMeta):
    """"""
    # Todo: Write documentation

    def __init__(self):  # ToDo: Check DataType Date
        """Constructor"""
        # Todo: Write documentation
        self._cached_datasets = collections.OrderedDict()

    def clearCachedDatasets(self):
        """"""
        # Todo: Write documentation
        self._cached_datasets.clear()

    @abstractmethod
    def contains(self, datasetIds: typing.List) -> int:
        """"""
        # Todo: Write documentation
        pass

    def insert(obj: MCDataset):
        """"""
        # Todo: Write documentation
        obj.write()

    @abstractmethod
    def getAttributeTable(self) -> pd.DataFrame:
        """"""
        # Todo: Write documentation
        pass

    @abstractmethod
    def getSampleAttributeJSON(self, grouping_json: typing.Dict = {}) -> typing.Dict:
        """"""
        # Todo: Write documentation
        pass

    def getDataset(self, label: str) -> MCDataset:
        """"""
        # Todo: Write documentation
        dataset = None

        if label in self._cached_datasets.keys():
            dataset = self._cached_datasets[label]
            self._cached_datasets.move_to_end(label, last=True)
        else:
            if config("db-handler") == "postgresql":
                from backend.lib.data.PostgreSQLHandling import PostgreSQLDataset
                dataset = PostgreSQLDataset(label=label, loadFromDatabase=True)
            elif config("db-handler") == "pandafiles":
                from backend.lib.data.PandaFileHandling import PandaFileDataset
                dataset = PandaFileDataset(label=label, loadFromDatabase=True)
            else:
                raise Exception("Invalid MitoCubeDatabase configuration. Only 'postgresql' and 'pandafiles' are supported.")

            if len(self._cached_datasets) > int(config("db-n_max_dataset_cached")):
                self._cached_datasets.popitem(last=False)

            self._cached_datasets[label] = dataset

        return dataset

    @abstractmethod
    def getJSONDatasets(self, labels: typing.List[str] = []) -> typing.Dict[str, typing.Any]:
        """"""
        # Todo: Write documentation
        pass

    def getDatasets(self, labels: typing.List[str] = []) -> typing.Dict[str, MCDataset]:
        """"""
        # Todo: Write documentation
        datasets = {}

        if len(labels) < 1:
            labels = self.getAllDataIDs()

        for label in labels:
            if label in self._cached_datasets.keys():
                datasets[label] = self._cached_datasets[label]
            else:
                datasets[label] = self.getDataset(label)

        return datasets

    @abstractmethod
    def getDatasetAttributeJSON(self, tag: str = "") -> typing.Dict:
        """"""
        # Todo: Write documentation
        pass

    @abstractmethod
    def getAllDataIDs(self, sort_createdOn_desc: bool = False) -> typing.List[str]:
        """"""
        # Todo: Write documentation
        pass

    @abstractmethod
    def getDataIDs(self,
                   n_limit: int = 42,
                   n_offset: int = 0,
                   sort_createdOn_desc: bool = False) -> typing.List[str]:
        """"""
        # Todo: Write documentation
        pass

    @staticmethod
    def getDatabase() -> MCDatabase:
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


class SQLConnection(metaclass=SingletonABCMeta):  # ABC
    """Singleton class that opens, shares and closes a shared connection to the configured database."""

    #: Holds the shared connection object.
    # conn = None  # Todo: Figure out type, e.g. psycopg2.connection like does not work

    def __init__(self):
        """
        The Constructor of DBConnection creates a new psycopg2.connection to the PostgreSQL database that can be shared.

        :raise Errors.
        """
        self.conn = self.getIndependentConnection()

    def __del__(self):  # ToDo: Use __del__ or __exit__? Look it up
        """
        Destructor will close the shared psycopg2.connection.

        :raise Errors.
        """
        self.closeConnection()
        # if self.conn is not None:
        #     self.conn.close()
        #     self.conn = None

    def __exit__(self):  # ToDo: Use __del__ or __exit__? Look it up
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
    def openNewConnection(self):
        """
        The method will open and return a new shared connection to the configured database and will close the
        previous shared connection.

        :raise Errors.
        :return: connection object
        :rtype: connection
        """
        pass

    @abstractmethod
    def closeConnection(self):
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
