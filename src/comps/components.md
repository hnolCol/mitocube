@startuml
skinparam page Margin 10
skinparam pageExternalColor gray
skinparam pageBorderColor black
skinparam GroupInheritance 4
left to right direction

package lib.DesignPatterns {
    class SingletonABCMeta extends ABCMeta {
        # {} _instances
        # Lock _lock
        + SingletonABCMeta __call__(*args, **kwargs)
    }
    
    class SingletonMeta extends type {
        # {} _instances
        # Lock _lock
        + SingletonMeta __call__(*args, **kwargs)
    }
    
    class JsonSerializable extends ABC {
        + Dict toJson()
    }
}

package lib.data.DataHandling {

    abstract class MitoCubeAbundanceTable implements JsonSerializable {
        # str _id
        # Dict _cached_meta
        __
        + void __init__(dataset_id: str, datatable: pd.DataFrame = None)
        ..
        + str getID()
        + pandas.DataFrame getDataObj()
    }
    
    abstract class MitoCubeMetaInformation implements JsonSerializable {
        # str _id
        # Dict _cached_meta
        __
        + void __init__(dataset_id: str, metadict: Dict[str, ] = None)
        ..
        + str getID()
        + Dict getDictionary()
    }

    abstract class MitoCubeDataset {
        # str _id
        # MitoCubeAbundanceTable _data
        # MitoCubeMetaInformation _meta
        __
        + void __init__(dataset_id: str, data: MitoCubeAbundanceTable = None, meta: MitoCubeMetaInformation = None)
        ..
        + str getId()
        + {abstract} MitoCubeAbundanceTable getDataObj()
        + {abstract} MitoCubeMetaInformation getMetaObj()
    }
    
    abstract class MitoCubeDataCollection {
        # Dict[str, MitoCubeDataset] _cached_data
        __
        + void __init__(data: Dict[str, MitoCubeDataset] = {})
        ..
        + List[MitoCubeDataset] get(datasetIds: List[str] = None)
        + Dict[str, MitoCubeDataset] getAll()
        + MitoCubeDataset getItem(datasetId: str = None)
    }
    
    abstract class MitoCubeFeatures << (S,#FF7700) Singleton >> implements SingletonABCMeta {
        # ???
        __
        + {abstract} void __init__()
        ..
        # {abstract} _findMatchingColumns(self, columnNames)
        # {abstract} pd.Series _getColumnNames()
        # ? _findMatchingColumns(columnNames)
        # pd.Series _getColumnNames()
        # _update()
        + ? getDBFeatures(requiredColNames=["Entry", "Gene names (primary)", "Protein names", "Organism"])
        + Dict getDBInfoForFeatureList(featureIDs: List[str], requiredColNames: List[str], plainExport: bool = True, entryInfoDictAsOutput: bool = False)
        + ? getDBInfoForFeatureListByColumnName(featureIDs, columnName="Gene names (primary)", heckShape=True)
        + ? getPlainDBInfoForFeatureList(featureIDs, columnNames=["Gene names (primary)"])
       }
    
    abstract class MitoCubeDatabase << Singleton >> implements SingletonABCMeta {
        .. factory ..
        + {static} MitoCubeDatabase getDatabase()
        .. information ..
        + {abstract} bool contains(datasetIds: List)
        + {abstract} int getDatasetNumbers()
        + {abstract} int getSize()
        .. data ..
        + {abstract} MitoCubeDataset getDataset(datasetId: str)
        + {abstract} List[str] getSimpleDatasetList(n_limit: int = 42, n_offset: int = 0, sort_createdOn_desc: bool = True)
        + {abstract} MitoCubeDataset getDataCollection(ids: List[str] = None)
        + {abstract} List[float] getOIAbundance(poi_id: int = None, poi_label: str = None)
        .. control ..
        + {abstract} _update()
    }
    
    abstract class SQLConnection << (S,#FF7700) Singleton >> implements SingletonABCMeta {
        # Connection conn
        __
        + __init__()
        + __del__()
        + __exit__()
        ..
        + {abstract} void openNewConnection()
        + {abstract} void closeConnection()
        + {abstract} Connection getConnection()
        + {abstract} {static} Connection getIndependentConnection()
    }
    
    MitoCubeMetaInformation *-- MitoCubeDataset : has <
    MitoCubeAbundanceTable *-- MitoCubeDataset : has <    
    MitoCubeDataset ..- MitoCubeDataCollection : is collection of <  
}

package lib.data.PostgreSQLHandling {
    abstract class PostgreSQLAbundanceTable extends MitoCubeAbundanceTable {
        + void __init__(dataset_id: str, preloadData: bool = False)
        ..
        # bool _isLoaded()
        # void _refresh()
    }
    
    abstract class PostgreSQLMetaInformation extends MitoCubeMetaInformation {
        + void __init__(dataset_id: str, preloadData: bool = False)
        ..
        # bool _isLoaded()
        # void _refresh()
    }
    
    class PostgreSQLDataset extends MitoCubeDataset{
        + void __init__(dataset_id: str, preloadData: bool = False)
     }
    
    class PostgreSQLDataCollection extends MitoCubeCollection { 
        + void __init__(ids: typing.List[str], preloadData: bool = False)
        ..
        # void _queryDatasets()
     }
    
    class PostgreSQLDatabase << (S,#FF7700) Singleton >> extends MitoCubeDatabase { }
    
    class PostgreSQLFeatures << (S,#FF7700) Singleton >> extends MitoCubeFeatures { }
    
    class PostgreSQLConnection << (S,#FF7700) Singleton >> extends SQLConnection { }
    
    PostgreSQLAbundanceTable *-- PostgreSQLDataset : has <
    PostgreSQLMetaInformation *-- PostgreSQLDataset : has <    
    PostgreSQLDataset ..- PostgreSQLDataCollection : is collection of <  
}
        
package lib.data.PandaFileHandling { 
    abstract class PandaFileAbundanceTable extends MitoCubeAbundanceTable {
        + void __init__(dataset_id: str, preloadData: bool = False)
        ..
        # bool _isLoaded()
        # void _refresh()
    }
    
    abstract class PandaFileMetaInformation extends MitoCubeMetaInformation {
        + void __init__(dataset_id: str, preloadData: bool = False)
        ..
        # bool _isLoaded()
        # void _refresh()
    }
    
    class PandaFileDataset extends MitoCubeDataset{
        + void __init__(dataset_id: str, preloadData: bool = False)
     }
    
    class PandaFileDataCollection extends MitoCubeCollection { 
        + void __init__(ids: typing.List[str], preloadData: bool = False)
        ..
        # void _queryDatasets()
     }
    
    class PandaFileDatabase << (S,#FF7700) Singleton >> extends MitoCubeDatabase { }
    
    class PandaFileFeatures << (S,#FF7700) Singleton >> extends MitoCubeFeatures { }
    
    PandaFileAbundanceTable *-- PandaFileDataset : has <
    PandaFileMetaInformation *-- PandaFileDataset : has <    
    PandaFileDataset ..- PandaFileDataCollection : is collection of <  
}

@enduml