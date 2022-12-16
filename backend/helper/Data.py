


from ast import Or

import matplotlib
import pandas as pd 
import numpy as np 
import os 
import json
from scipy.stats import zscore
import seaborn as sns 
from pingouin import anova
from sklearn import cluster
from decouple import config
import matplotlib.cm as cm
from matplotlib.colors import ListedColormap, to_hex
import scipy.cluster.hierarchy as sch
from scipy.stats import f_oneway,ttest_ind
import fastcluster
import itertools
from statsmodels.stats.multitest import multipletests
from .stats import TwoWAyANOVA
from .Misc import buildRegex
from collections import OrderedDict
from typing import List, Tuple, Dict, Any, Iterable, Callable
from dataclasses import dataclass

Set6 = ["#444444", "#a6cee3", "#1f78b4", "#b2df8a", "#33a02c", "#fb9a99",
            "#e31a1c", "#fdbf6f", "#ff7f00", "#cab2d6", "#6a3d9a"]
Set7 = ["#f0f0f1","#99999c","#3b9673","#f0ab04","#11395d","#bc3618"]
customColors = dict(
    [("Set6",Set6),
     ("Set7",Set7)]
)
for paletteName, colorList in customColors.items():
    sns.palettes.SEABORN_PALETTES[paletteName] = colorList


pingouinColumn = {"SS":"Sum of squares", "F":"F-values","MS" : "Mean squares","DF":"Degree of freedom","p-unc":"p-value (uncorrected)"}

DB_ENTRY_COLUMN = "Entry"

def getChartMarginFromMinMaxValues(minValue, maxValue, marginFraction = 0.05):
    ""
    return np.sqrt(maxValue ** 2 - minValue **2) * marginFraction


class DBFeatures:
    ""
    def __init__(self,pathToDB,*args,**kwargs):
        ""
        self.pathToDB = pathToDB
        self.__readData()

    def __readData(self):
        ""
        #print(self.__getFiles())
        Xs = [pd.read_csv(f, sep="\t") for f in self.__getFiles()]
        if len(Xs) > 1:
            self.DBs = pd.concat(Xs,axis=1,ignore_index=True)
        elif len(Xs) == 1:
            self.DBs = Xs[0]
        else:
            self.DBs  = pd.DataFrame()  
        if self.DBs.index.size > 0 and DB_ENTRY_COLUMN in self.DBs.columns: 
            self.DBs = self.DBs.set_index("Entry")

    def __getFiles(self):
        ""
        return [os.path.join(self.pathToDB,x) for x in os.listdir(self.pathToDB) if x.endswith(".txt")]

    def _findMatchingColumns(self,columnNames):
        ""
        return [colName for colName in columnNames if colName in self.DBs.columns]

    def update(self) -> None:
        ""
        self.__readData()
    
    def getDBFeatures(self,requiredColNames=["Entry","Gene names  (primary )","Protein names","Organism"]):
        ""
        if self.DBs.index.size > 0 :
            matchedColNames = self._findMatchingColumns(requiredColNames)

            if len(matchedColNames) == 0:
                return self.DBs.index
            else:
                return self.Dbs[matchedColNames]

    def getDBInfoForFeatureList(self,featureIDs, requiredColNames, plainExport = True, entryInfoDictAsOutput = False):
        ""
    
        idxIntersection = self.DBs.index.intersection(featureIDs)
        matchedColNames = self._findMatchingColumns(requiredColNames)
        if len(matchedColNames) > 0:
            if entryInfoDictAsOutput:
                DB = self.DBs.loc[idxIntersection,matchedColNames].replace({np.nan: None})

                return DB.to_dict(orient="index")
            else:
                DB = self.DBs.loc[idxIntersection,matchedColNames].replace({np.nan: None}).reset_index()
                if  plainExport:
                    return DB.to_json(orient="records")
                else:
                    DBInfo = OrderedDict() 
                    for entry in DB.index:
                        databaseInfo = []
                        for colName in DB.columns:
                            eDetails = DB.loc[entry,colName]
                            if isinstance(eDetails,pd.Series):
                                eDetails = eDetails.values[0]
                            elif isinstance(eDetails,str):
                                pass
                            elif isinstance(eDetails,np.bool_):
                                eDetails = bool(eDetails)
                            else:
                                eDetails = str(eDetails)

                            databaseInfo.append({"title":colName,"details":eDetails})
                        DBInfo[DB.loc[entry,"Entry"]] = databaseInfo
                    return True, DBInfo

    def getDBInfoForFeatureListByColumnName(self,featureIDs,columnName = "Gene names  (primary )",checkShape=True):
        ""
        
        if columnName in self.DBs.columns:
            idxIntersection = self.DBs.index.intersection(featureIDs)

            if idxIntersection.size == len(featureIDs):
                return self.DBs.loc[featureIDs,columnName]
            elif not checkShape:
                
                return self.DBs.loc[idxIntersection,columnName]
            else:
                return pd.Series([self.DBs.loc[idx,columnName] if idx in idxIntersection else "-" for idx in featureIDs], index=featureIDs)



@dataclass() 
class Dataset:

    dataID : str
    data : pd.DataFrame
    params : dict
    dbManager : DBFeatures

    def getIsInMask(self,featureIDs) -> Tuple[np.ndarray,bool]:
        """Returns mask and if featureIDs were found in data.index"""

        boolIdx = self.data.index.isin(featureIDs)
        return boolIdx, np.any(boolIdx)


    def getCorrelatedFeatures(self, featureIDs : list, scale : bool = True, N : int = 20) -> Dict[str,Any]:
        """"""
        boolIdx, featureDetected = self.getIsInMask(featureIDs)
        if featureDetected:

            expColumns = self.getExpressionColumns()
            #remove columns with only NaN
            expColumnsWithNonNan = self.data.loc[boolIdx,expColumns].dropna(axis=1).columns.values
            if expColumnsWithNonNan.size > 4:
                featureDataTransposed = pd.Series(self.data.loc[boolIdx,expColumnsWithNonNan].values.T.flatten(),index=expColumnsWithNonNan)
                dataWhereFeatureIsNotNaN = self.data.dropna(subset=expColumnsWithNonNan, thresh=3)
                corrCoeff = dataWhereFeatureIsNotNaN.corrwith(featureDataTransposed,axis=1).dropna().sort_values(ascending=False)

                corrHead = corrCoeff.head(N)
                corrFeaturesIndex = corrHead.index.values
                correlatedFeaturesData = self.data.loc[corrFeaturesIndex,]
                values = correlatedFeaturesData.loc[:,expColumns].values  

                groupingMapper = self.getGroupingMapper()
                groupingColorMapper = self.getGroupingColorMapper()

                if scale:
                    #calcualte Z-scores
                    values = zscore(
                        correlatedFeaturesData.loc[:,expColumns].values,
                        axis=1,
                        nan_policy="omit")
                    maxValue = np.nanmax(np.abs(values.flatten()))
                    minValue = -maxValue
                    #replace nan with None for jsonify
                    values = pd.DataFrame(values).replace({np.nan: None}).values
                else:
                    values = correlatedFeaturesData.loc[:,expColumns].values
                    minValue, maxValue = np.nanmin(values), np.nanmax(values)

                colorValues = np.linspace(minValue,maxValue,num=5).flatten().tolist()
                colorPalette = sns.color_palette("RdBu_r",n_colors=5).as_hex()

                groupColorValues = []

                for groupingName, groupingMapper in groupingMapper.items():
                    hexColorValues = [groupingColorMapper[groupingName][groupingMapper[colName]] for colName in expColumns]
                    groupColorValues.append(hexColorValues)
                
                
                featureNamesFromDB = self.dbManager.getDBInfoForFeatureListByColumnName(corrFeaturesIndex).fillna("-")
                featureNames = featureNamesFromDB.values.flatten().tolist()
                corrCoeff = corrHead.values.flatten().tolist()
                corrDataForHeatmap = {
                
                        "values"          :   values.tolist(), 
                        "columnNames"     :   expColumns,
                        "colorPalette"    :   colorPalette,
                        "colorValues"     :   colorValues,
                        "corrCoeff"       :   corrCoeff,
                        "groupingColors"  :  groupColorValues,
                        "groupingLegend"  :  groupingColorMapper,
                        "featureNames"    :  featureNames,
                        "downloadData"    : [OrderedDict([(expColumns[n],v) for n,v in enumerate(vv)] + 
                                [("Feature Name",featureNames[m])] + 
                                [("FeatureID",corrFeaturesIndex[m])] + 
                                [("CorrCoeff to {}".format(featureIDs[0]),corrCoeff[m])] + [("raw-{}".format(expColumns[nRawIdx]),vraw) for nRawIdx,vraw in enumerate(values[m,:].flatten())]) for m,vv in enumerate(values)]
                        }

                
                return  corrDataForHeatmap
        

    def getExperimentalInformation(self, paramNames : list) -> Tuple[bool,List]:
        """
        Returns the experimental information defined in the params defined by a
        list of paramNames
        """
        if paramNames is not None:
            
            if isinstance(paramNames,str):
                paramNames = [paramNames]
            
            if not isinstance(paramNames, list):
                return False, ["paramNames should be a list"]

            if not any(paramName in self.params for paramName in paramNames):
                return False, [f"Param keywords not found in parameter file for {self.dataID}."]
            
            experimentalInfo = []

            for paramName in paramNames:
                if self.hasParam(paramName):
                    paramValue = self.getParam(paramName)
                    if isinstance(paramValue,str):
                        experimentalInfo.append({"title":paramName ,"details":paramValue})
                    elif isinstance(paramValue,list):
                        experimentalInfo.extend(paramValue)
                    else:
                        experimentalInfo.append(paramValue)
            return True, experimentalInfo 
        else:
            return False, ["Api-config misses param 'experiment-procedure-params"]

    def getExpressionColumns(self) -> List[str]:
        "Returns the list of columns defined in the groupings."
        
        groupingNames = self.getGroupingNames()
        sampleNames = self.getSamplesNamesByGroupingName(groupingName=groupingNames[0])

        if len(groupingNames) == 1:

            return  sampleNames
        
        elif len(groupingNames) > 1:

            groupMapper = self.getGroupingMapper()
            
            #create a pandas df to sort 
            sampleGrouping = pd.DataFrame(sampleNames,columns = ["SampleName"])
            for n,groupingName in enumerate(groupingNames):
                if n == 2: break #limited to groupings == 2 
                sampleGrouping.loc[:,f"Grouping{n}"] = self.mapGroupingsToSampleNames(groupMapper,groupingName,sampleNames)
                #factorize groupings to position in grouping  to allow sorting after occurance
                sortGrouping = dict([(groupName,n) for n,groupName in enumerate(self.getGroupsByGroupingName(groupingName))])
                sampleGrouping.loc[:,f"Grouping{n}-Factorized"] = sampleGrouping.loc[:,f"Grouping{n}"].map(sortGrouping)
            
            groupDataFrameSorted = sampleGrouping.sort_values(
                        by=["Grouping0-Factorized","Grouping1-Factorized"],
                        kind="stable"
                        )
            
            sampleNames = groupDataFrameSorted["SampleName"].values.tolist()
        return sampleNames

    def getFeatures(self) -> np.ndarray: 
        ""
        return self.data.index.unique().values 

    def getGroupingColorMapper(self) -> Dict[str,Dict[str,str]]:
        """
        Returns grouping colors by groupingName -> group -> color hierarchy.
        """

        groupings = self.getGroupings()
        groupingNames = self.getGroupingNames()
        groupingColormaps = self.getParam("groupingCmap")
        if isinstance(groupingColormaps,dict):
            #generate colors by cmap 
            colorsForGroupings = OrderedDict([
                            (groupingName,
                            sns.color_palette(
                                groupingColormaps[groupingName],
                                n_colors=self.getNumberOfGroups(groupings,groupingName),
                                desat=0.75).as_hex()) for groupingName in groupingNames if groupingName in groupingColormaps])
            #asign colors to groupNames          
            groupingColorMapper = OrderedDict([
                    (groupingName, OrderedDict([
                        (groupName,colorsForGroupings[groupingName][n]) for n,groupName in enumerate(groupings[groupingName].keys())])) for groupingName in groupingNames]
                        )    

        return groupingColorMapper
        


    def getGroupingMapper(self) -> Dict[str,dict]:
        """
        Returns a dict providing groupingNames and columnName, group mapper.

        Example: 
        groupings = {"Genotype" : {"WT": ["WT_01","WT_02"], "KO" : ["KO_01","KO_02"]}}
        -> 
        groupingMapper = {"Genotype" : {
                                        "WT_01":"WT",
                                        "WT_02":"WT",
                                        "KO_01":"KO",
                                        "KO_02":"KO
                                        }}
        """

        if hasattr(self,"groupingMapper") and all(k in self.groupingMapper for k in self.getGroupingNames()):
            return self.groupingMapper
    
        self.groupingMapper = OrderedDict() 
        groupings = self.getParam("groupings") 
        if isinstance(groupings,dict):
            for groupingName, grouping in groupings.items():
                self.groupingMapper[groupingName] = dict([(v,k) for k,vs in grouping.items() for v in vs])
            return self.groupingMapper 
        return {}

    def getGroupings(self) -> Dict[str,dict]:
        ""
        groupings = self.getParam("groupings")
        if groupings is not None and isinstance(groupings,dict):
            return groupings
        return {}

    def getGroupingNames(self) -> List[str]:
        "Returns the groupingNames"
        groupings = self.getGroupings()
        if groupings is None: return []

        return list(groupings.keys())

    def getGroupingsAndNames(self) -> Tuple[dict,List[str]]:
        """Returns groupings and the corresponding names, order preserved."""
        return self.getGroupings(), self.getGroupingNames()

    def getGroupsByGroupingName(self, groupingName : str) -> List[str]:
        "Retruns the groupNames for a specific grouping"
        groupings = self.getGroupings()
        if isinstance(groupings,dict) and groupingName in groupings:
            return list(groupings[groupingName].keys())
        return []

    def getNumberOfGroups(self,groupings : dict, groupingName : str) -> int:
        ""
        return len(groupings[groupingName])


    def getMeltedData(self,featureIDs : List[str], addGroupings : bool = True, zscore_transform : bool = False ) -> pd.DataFrame:
        """
        Return melted data frame with/without groupings. 
        Allows for z-score transformation (unit variance)
        """
        if not isinstance(featureIDs,list):
            raise TypeError("featureIDs must be a list")

        sampleNames = self.getExpressionColumns()
        boolIdx, featureDected = self.getIsInMask(featureIDs)
        if not featureDected:
            raise ValueError("No featureID was found in the dataset.")
        
        featureData = self.data.loc[boolIdx]
        #save index as idx
        featureData.loc[:,"idx"] = featureData.index
        if zscore_transform:

            featureData.loc[:,sampleNames] =  zscore(featureData.loc[:,sampleNames].values,
                                                        axis=1,
                                                        nan_policy="omit")

        meltedData = featureData.melt(value_vars=sampleNames, id_vars = ["idx"])
        
        if addGroupings:
            groupingMapper = self.getGroupingMapper()
            for groupingName, mapper in groupingMapper.items():

                meltedData[groupingName] = meltedData["variable"].map(mapper)
        
        return meltedData

    def getParams(self) -> dict:
        "Returns the parameter file"
        return self.params 

    def getParam(self,paramName) -> Any:
        ""
        return self.params.get(paramName)

    def getSamplesNamesByGroupingName(self, groupingName : str) -> np.ndarray:
        "Returns the sample names"
        groupings = self.getGroupings()
        if groupings is None: return np.array()
        if groupingName not in groupings: return np.array()
        return np.array([i for v in groupings[groupingName].values() for i in v ]).flatten().tolist()

    def hasParam(self,paramName) -> bool:
        ""
        return paramName in self.params

    def mapGroupingsToSampleNames(self, groupMapper : dict, groupingName : str, expressionColumnNames : List[str]) -> List[str]:
        ""
        return [groupMapper[groupingName][colName] for colName in expressionColumnNames]

    def isFeatureInDataset(self,featureID : str) -> bool:
        "Returns true if feature is in the dataset"
        return featureID in self.data.index

    def matchesFilter(self,filter : dict) -> bool:
        "Checks if parameters match the filter"
        if len(filter) == 0:
            return True
        filterForParamNamesThatExist = [(paramName,v) for paramName,v in filter.items() if self.hasParam(paramName)]
        #if not a single filter matches return False
        if len(filterForParamNamesThatExist) == 0:
            return False
        
        addFeaturesOfDataID = True
        
        if isinstance(filter,dict) and len(filter) > 0:
            for paramName,v in filterForParamNamesThatExist:
                if isinstance(v,list): 
                    if len(v) == 0 or self.getParam(paramName) not in v:
                        addFeaturesOfDataID = False
                elif isinstance(v,str):
                    if self.getParam(paramName) != v:
                        addFeaturesOfDataID = False
                
        return addFeaturesOfDataID 


class DatasetCollection:

    def __init__(self,dbManager,*args,**kwargs):

        self.dbManager = dbManager
        self.collection= OrderedDict()

    def __contains__(self,dataID) -> bool:
        ""
        return dataID in self.collection

    def __getitem__(self,dataID) -> Dataset:
        ""
        return self.collection.get(dataID)

    def __len__(self) -> int:
        "Returns the number of datasets"
        return len(self.collection)

    def __str__(self) -> str:
        ""
        return f"Total number of datasets : {self.getNumberOfDatasets()} - hash : ${self.__hash__()}"

    def items(self) -> List[Tuple[str,Dataset]]:
        "Returns the items (dataID, Dataset)"
        return self.collection.items() 

    def addDataset(self, dataID : str, paramPath : str, dataPath: str) -> None:
        "Adds a dataframe."
        if os.path.exists(dataPath) and os.path.exists(paramPath):

            data = pd.read_csv(dataPath,sep="\t",index_col="Key")
            params = json.load(open(paramPath))
            self.collection[dataID] = Dataset(dataID, data, params, self.dbManager)

    def getDataIDs(self) -> List[str]:
        "Returns the dataIDs"
        return list(self.collection.keys())

    def getDataIDsByFilter(self, filter : dict) -> List[str]:
        "Returns dataIDs that match a filter."
        return [dataID for dataID,dataset in self.items() if dataset.matchesFilter(filter)]

    def getDataIDsThatContainFeature(self, featureID : str, filter : dict) -> List[str]:
        """"""
        return [dataID for dataID,dataset in self.items() if dataset.matchesFilter(filter) and dataset.isFeatureInDataset(featureID)]

    def getNumberOfDatasets(self) -> int:
        "Returns the number of datasets"
        return len(self.collection)

    def getUniqueFeatures(self) -> np.ndarray:
        "Returns unique features in all datasets. Order is not stable."
        return np.unique(np.concatenate([dataset.getFeatures() for dataset in self.values()]).astype(str))

    def keys(self) -> List[str]:
        "Returns a list of dataIDs"
        return list(self.collection.keys())

    def values(self) -> List[Dataset]:
        ""
        return list(self.collection.values())


class Data(object):

    def __init__(self,pathToData,pathToAPIConfig,dbManager,*args,**kwargs):
        ""
        self.pathToData = pathToData
        self.pathToAPIConfig = pathToAPIConfig 
        self.dbManager = dbManager
        self.dataCollection = DatasetCollection(dbManager)
        self.dfs = dict() 
        self.__readConfig()
        self.__readData()
        self.__readDataInfo()
        #self.update()

    def __checkData(self) -> bool:
        """
        Checks if all data are present in the data dict (dfs) that
        are in the static/dataset folder.
        Returns bool. 
        """
        return all(dataID in self.dfs for dataID in self.getDataIDs())

    def __readData(self):
        """Read data by scanning through the folder"""
        shortCutFilterValues = []
        param = self.getAPIParam("short-cut-filter-param")
        for dataID in self.getDataIDs():
            paths = self.__getPaths(dataID)
            if paths is not None and dataID not in self.dfs:
                X = pd.read_csv(paths[1],sep="\t",index_col="Key")
                #load data into dict - dataID is key
                self.dfs[dataID] = {
                    "params":json.load(open(paths[0])),
                    "data":X}

                self.dataCollection.addDataset(dataID,paths[0],paths[1])
            
            if dataID in self.dfs and param is not None and param in self.dfs[dataID]["params"]:
                filterParamName = self.dfs[dataID]["params"][param]
                if filterParamName not in shortCutFilterValues:
                    shortCutFilterValues.append(filterParamName)
        #print(self.dataCollection)

        availableColors = self.getAPIParam("short-cut-colors")
        if isinstance(availableColors,list) and len(availableColors) > 0:
            self.shortcutFilterColors = dict([(filterName,availableColors[n % len(availableColors)]) for n,filterName in enumerate(sorted(shortCutFilterValues))])
       

    def __readDataInfo(self):
        """"""
        columnNames = self.getAPIParam("data-presentation")
        sortByColumnNames = [colName for colName in self.getAPIParam("data-presentation-sort-by") if colName in columnNames]
        r = []
        
        for dataID, data in self.dfs.items():
            
           # print(data["params"])
            params = data["params"]
            v = dict([(k,params[k]) for k in columnNames if k in params])
            features = data["data"].index
            N = features.size 
            v["dataID"] = dataID
            v["#Features"] = N
            r.append(v)
            
        self.dataSummary = pd.DataFrame(r).sort_values(by=sortByColumnNames)

    def __readConfig(self):
        """Loads the config file."""
        pathToDocs = os.path.join(self.pathToAPIConfig,"api_docs_config.json")
        if os.path.exists(pathToDocs):
            self.config = json.load(open(pathToDocs))
            
            APIpassword = config("mitocube-pw")
            self.config["pw"] = APIpassword

    def __getPaths(self,dataID) -> Tuple[str,str]:
        ""
        paramFilePath = os.path.join(self.pathToData,dataID,"params.json")
        dataFilePath = os.path.join(self.pathToData,dataID,"data.txt")
        if all(os.path.exists(filePath) for filePath in [paramFilePath,dataFilePath]):
            return paramFilePath,dataFilePath
        return None, None

    def getDataSummary(self) -> pd.DataFrame:

        "Return da data frame containing a summary for data in the database"
        if hasattr(self,"dataSummary"):
            return self.dataSummary
        else:
            return pd.DataFrame(columns=self.getAPIParam("data-presentation"))

    def getDataset(self, dataID) -> Dataset:
        """Returns Dataset"""
        if dataID in self.dataCollection:
            return self.dataCollection[dataID]

    def getExpressionColumns(self,dataID) -> List[str]:
        "Returns sorted expression columns by dataID."
        if dataID in self.dataCollection:
            return self.dataCollection[dataID].getExpressionColumns()

    def getFilterColors(self):
        ""
        if hasattr(self,"shortcutFilterColors"):
            return self.shortcutFilterColors
        

    def getGroupingMapper(self,dataID) -> Dict[str,dict]:
        ""
        if dataID in self.dataCollection:
            return self.dataCollection[dataID].getGroupingMapper()
        

    def getGroupingColorMapper(self,dataID) -> Dict[str,dict]:
        if dataID in self.dataCollection:
            return self.dataCollection[dataID].getGroupingColorMapper() 
        

    def getDataIDs(self) -> List[str]:
        "Datasets are stored in separate folders. Function returns dataID (=folder name)"
        return [x for x in os.listdir(self.pathToData) if os.path.isdir(os.path.join(self.pathToData,x))]

    def getMedianExpression(self,featureIDs,dataID,returnDataQuantiles=False):
        ""
        if dataID in self.dfs:
            idxIntersection = self.dfs[dataID]["data"].index.intersection(featureIDs)
            expColumns = self.getExpressionColumns(dataID)
            if returnDataQuantiles:
                return (self.dfs[dataID]["data"].loc[idxIntersection,expColumns].median(axis=1), np.nanquantile(self.dfs[dataID]["data"].values.flatten(),q=[0,0.25,0.5,0.75,1]))
            else:
                return self.dfs[dataID]["data"].loc[idxIntersection,expColumns].median(axis=1)
            

    def getMedianExpressionByFeatureIDs(self,datasetsByFeatureID):
        ""
        distributionByFeatureID = OrderedDict()
        if len(datasetsByFeatureID) > 0 : 
            
            for featureID, dataIDs in datasetsByFeatureID.items():
                if len(dataIDs) > 0:
                    X = [self.getMedianExpression([featureID],dataID,True) for dataID in dataIDs]
                    Ms = [x[0] for x in X] #get medians
                    totalDistributionInDatasets = np.nanmedian(np.concatenate([x[1].reshape(1,-1) for x in X], axis=0),axis=0)
                    if len(Ms) == 1:
                        M = Ms[0].median()
                    else:
                       # print(pd.concat(Ms,axis=1).median(axis=1))
                        M = pd.DataFrame(pd.concat(Ms,axis=1).median(axis=1), columns=["m"]) #merge and get median
                    distributionByFeatureID[featureID] = {"m" : M, "dist":totalDistributionInDatasets}
            # featureIDs = list(datasetsByFeatureID.keys())
            # dataIDs = np.unique([dataID for dataIDs in datasetsByFeatureID.values() for dataID in dataIDs])
   
        return distributionByFeatureID

    def dataIDExists(self,dataID):
        ""
        return dataID in self.dataCollection

    def update(self) -> None:
        "Updates data and checks for new ones"
        return
        if not self.__checkData():
            self.__readData()
            self.__readDataInfo()

    def getParams(self,dataID):
        ""
        if dataID in self.dataCollection:
            return self.dataCollection[dataID].getParams()

    def getParam(self,dataID,paramName):
        ""
        if dataID in self.dataCollection:
            return self.dataCollection[dataID].getParam(paramName)

    def getConfigParam(self,k):
        ""
        if k in self.config:
            return self.config[k]
    
    def getAPIParam(self,k):
        if k in self.config["api"]:
            return self.config["api"][k]


    def getExperimentalInformation(self, dataID) -> Tuple[bool,list]:
        """Return experimental information which are defined in the API params"""
        if dataID in self.dataCollection:
            paramNames = self.getAPIParam("experiment-procedure-params")
            return self.dataCollection[dataID].getExperimentalInformation(paramNames)
        return False, ["DataID not found."]

    def getDataForFeatures(self,dataID,featureIDs,addGroupings=True, zscore_transform = False) -> pd.DataFrame:
        "Return melted data."
        if dataID in self.dataCollection:
            return self.dataCollection[dataID].getMeltedData(featureIDs, addGroupings=addGroupings, zscore_transform = zscore_transform)

        return pd.DataFrame()

    def getFeatureDBInfo(self,featureIDs,*args,**kwargs):
        ""
        dbInfoColumns = self.getAPIParam("db-summary-params")
        if dbInfoColumns  is not None:
           return self.dbManager.getDBInfoForFeatureList(featureIDs,dbInfoColumns,*args,**kwargs)

    def getCorrelatedFeatures(self, dataID :  str,featureIDs : list ,scale : bool =True, N : int = 20):
        ""
        if dataID in self.dataCollection:
            return self.dataCollection[dataID].getCorrelatedFeatures(featureIDs,scale,N)

    def getFiltersOptions(self):
        ""
        filterHeader = self.getAPIParam("filter-params")
        filterOptions = OrderedDict([(h,[]) for h in filterHeader])
        for h in filterHeader:
            availableOptions = []
            for _, X in self.dfs.items():
            
                if h in X["params"]:
                    availableOptions.append(X["params"][h])
            filterOptions[h] = pd.Series(availableOptions).unique().tolist() 
        return filterOptions

    def getGroupingDetails(self,dataID : str, expColumns : list):
        """"""
        groupings = self.getParam(dataID,"groupings") 

        groupingNames = list(groupings.keys())
        groupingMapper = self.getGroupingMapper(dataID)
        groupingColorMapper = self.getGroupingColorMapper(dataID)

        groupColorValues = OrderedDict()
        groupingItems = OrderedDict()
        for groupingName, groupingSpecMapper in groupingMapper.items():
            hexColorValues = [groupingColorMapper[groupingName][groupingSpecMapper[colName]] for colName in expColumns]
            groupColorValues[groupingName] = hexColorValues
            #print(groupingMapper)
            groupingItems[groupingName] = list(groupingColorMapper[groupingName].keys())

        return groupings, groupingNames, groupingMapper, groupingColorMapper, groupColorValues, groupingItems


    def getMitoMapData(self,dataID,anovaDetails={"pvalue":0.001}):
        ""
        if dataID in self.dfs:
            okay, msg = self._checkOneWayANOVADetails(anovaDetails)
            if not okay:
                return False, msg

            X = self.dfs[dataID]["data"]
            mitoColumns = ["Functional MitoCoP classification","MitoCarta3.0_MitoPathways"]
            mitoPaths = self.dbManager.getDBInfoForFeatureListByColumnName(X.index,mitoColumns[-1],checkShape=False).replace("0",np.nan).dropna()
            mitoGeneNames = self.dbManager.getDBInfoForFeatureListByColumnName(X.index,"Gene names  (primary )",checkShape=False).dropna()
            expColumns = self.getExpressionColumns(dataID)
            groupings, groupingNames, groupingMapper, groupingColorMapper, groupColorValues, groupingItems = self.getGroupingDetails(dataID,expColumns)

            X  = X.loc[mitoPaths.index]
          
            anovaType, anovaCutoff, grouping1 = self._getOneWayANOVASignificanceHits(anovaDetails)
            
            if grouping1 not in groupingNames:
                return False, "Grouping 1 not found in the dataset."

            X = self.dfs[dataID]["data"].dropna(subset=expColumns)

            if anovaType == "1-way ANOVA":
                boolIdx, selectionpvalues, pvalueNames = self._performOneWayANOVA(X,groupings,grouping1,anovaCutoff)
                
            elif anovaType == "2-way ANOVA":
                ok, ds = self._checkTwoWayANOVADetails(anovaDetails,groupingNames)
                if not okay:
                    return False, ds
                else:
                    grouping2 = ds
                
                boolIdx, selectionpvalues, pvalueNames = self._performTwoWayANOVA(X,expColumns,anovaDetails,groupings,grouping1,grouping2,anovaCutoff)
            if not np.any(boolIdx):
                return False, "No significant hits found."


            pathwayIDMatch = dict()
            pathwaySigs = []
            for idx, mPs in mitoPaths.items():
                ps = mPs.split(";")
                for p in ps:
                    if p in pathwayIDMatch:
                        pathwayIDMatch[p].append(idx)
                    else:
                        pathwayIDMatch[p] = [idx]
            
            for ps, idxs in pathwayIDMatch.items():

                sigIdx = boolIdx.intersection(idxs)
                N = len(idxs)
                N_sig = sigIdx.size

                if N_sig > 0:
                   
                    pathwaySigs.append( 
                            {
                            "name" : ps, 
                            "N" : N, 
                            "N_sig":N_sig,
                            "frac" : N_sig/N
                            #"boxplotData" : boxplotData
                            })

            pathwaySigs_o = sorted(pathwaySigs, key=lambda d: d['frac'], reverse=True)
            rr = {}
            secondLevelRR = {}
            for ps in pathwaySigs_o:
                topPath = ps["name"].split(" > ")[0]
                ps["name"] = ps["name"].replace(topPath+" > ","")

                if " > " not in ps["name"]:
                    if topPath not in rr:
                        rr[topPath] = [ps]
                    else:
                        rr[topPath].append(ps)
                else:
                    if topPath not in secondLevelRR:
                        secondLevelRR[topPath] = {}
                    pps = ps["name"].split(" > ")
                    if pps[0] not in secondLevelRR[topPath]:
                        secondLevelRR[topPath][pps[0]] = []
                    ps["name"] = pps[-1]
                    secondLevelRR[topPath][pps[0]].append(ps)

            pathwayIDMatches = OrderedDict() 
            pathwayIntensities = OrderedDict() 
            for pathwayName, idxs in pathwayIDMatch.items():
                geneNames = mitoGeneNames.loc[idxs]
                #print(self.getDataForCard(dataID,idxs[0],{})["chart"])
                boxplotData = self._getBoxplotDataForMultipleFeatures(dataID,idxs)
                pathwayIntensities[pathwayName] = boxplotData#self.getDataForCard(dataID,idxs[0],{})["chart"]
                #sort features by significance
                pathwayIDMatches[pathwayName] = sorted([{"name" : geneNames.iloc[n], "idx":idx, "sig" : idx in boolIdx.values} for n,idx in enumerate(idxs)], key=lambda d: d["sig"], reverse=True)           

            return True, {
                    "pathwayIDMatch":pathwayIDMatches,
                    "pathwaySignificantIDs":rr,
                    "secondPathwaySignificantIDs":secondLevelRR,
                    "pathwayIntensities" : pathwayIntensities,
                    "numberProteins":mitoPaths.index.size}

        return False, "DataID not found."

    
    def _getBoxplotDataForMultipleFeatures(self, dataID : str,featureIDs : list) -> dict:
        ""
        meltedData = self.getDataForFeatures(dataID,featureIDs,zscore_transform=True)
        
        groupingColorMapper = self.getGroupingColorMapper(dataID)
        #print(groupingColorMapper)
        groupings = self.getParam(dataID,"groupings") 
        
        if groupings is None: return {}
        groupingNames = list(groupings.keys())
       
        minValue, maxValue = meltedData["value"].quantile(q=[0,1]).values
        marginRange = getChartMarginFromMinMaxValues(minValue,maxValue) 
        
        groupedData = meltedData.groupby(by = groupingNames,sort=False) #level_X == quantile due to reset_index
        boxplotData = groupedData.quantile(q=[0,0.25,0.5,0.75,1]).reset_index() 
        quantileColumnName = "level_{}".format(len(groupingNames)) # get name for quantile
        boxplotData[quantileColumnName] = boxplotData[quantileColumnName].replace([0,0.25,0.5,0.75,1],["min","q25","m","q75","max"])

        v, legendTitle, legendData, tickLabel, legendItems = self._getDataForBoxplot(boxplotData,groupedData,groupings,groupingNames,groupingColorMapper,quantileColumnName)

        chartData = {"graphType":{"1":"boxplot"},
                        "graphData":{
                            "1":{
                                "minValue" : minValue - marginRange,
                                "maxValue" : maxValue + marginRange,
                                "values" : v,
                                "title" : "",
                                "featureNames" : tickLabel,
                                "legend" : legendData,
                                "legendTitle" : legendTitle,
                                "legendItems" : legendItems
                            }
                            }, 
                        
            }
        return chartData 


    def _checkOneWayANOVADetails(self, anovaDetails : dict) -> Tuple[bool,str]:
        ""
        for feature in ["pvalue","anovaType","grouping1"]:
            if feature not in anovaDetails:
                return False, f"No value for {feature} found"
       
        return True, ""

    def _checkTwoWayANOVADetails(self, anovaDetails : dict, groupingNames) -> Tuple[bool,str]:
        ""
        if "grouping2" not in anovaDetails:
            return False, "2nd Grouping for ANOVA not provided."
        grouping2 = anovaDetails["grouping2"]
        if grouping2 == anovaDetails["grouping1"]:
            return False, "Grouping1 equals Grouping2"
        if grouping2 not in groupingNames:
            return False, "Grouping 2 not found in the dataset."
        if "pvalueType" not in anovaDetails:
            return False, "Please select the p-value cutoff type (e.g. factor or interaction)"
        if "grouping2" not in anovaDetails:
            return False, "Grouping2 not defined. Please select."

        return True, grouping2

    def _getOneWayANOVASignificanceHits(self,anovaDetails : dict):
        ""
        anovaType = anovaDetails["anovaType"]
        anovaCutoff = anovaDetails["pvalue"]
        grouping1 = anovaDetails["grouping1"]
        
        return anovaType, anovaCutoff, grouping1

    def _performOneWayANOVA(self,X,groupings,grouping1,anovaCutoff : float):
        ""
        results = pd.DataFrame(index = X.index)
        testGroupData = [X[columnNames].values for columnNames in groupings[grouping1].values()]
        F,p = f_oneway(*testGroupData,axis=1)
        oneWayANOVAColumnName = "p-1WANOVA({})".format(grouping1)
        results[oneWayANOVAColumnName] = p
        boolIdx = results.index[results[oneWayANOVAColumnName] < anovaCutoff]
        selectionpvalues = [pd.Series(results.loc[X.index,oneWayANOVAColumnName].values, name=oneWayANOVAColumnName, index=X.index).loc[boolIdx].reset_index()]
        pvalueNames = [oneWayANOVAColumnName]

        return boolIdx, selectionpvalues, pvalueNames

    def _performTwoWayANOVA(self,X,expColumns,anovaDetails : dict,groupings : dict, grouping1 : str,grouping2 : str,anovaCutoff : float):
        ""
        cutoffPValueColumn = anovaDetails["pvalueType"]
        anovaGrouping = OrderedDict([(k,v) for k,v in groupings.items() if k in [grouping1,grouping2]])
        if len(anovaGrouping)!= 2:
            return False, "Groupings filtering resulted in less than two groupings. Name changed?"
        anovaCalc = TwoWAyANOVA(X,anovaGrouping,expColumns)
        p = anovaCalc.caulculate()
        boolIdx = p.index[p.loc[:,cutoffPValueColumn] < anovaCutoff]
        pvalueNames = p.columns.values.tolist()
        selectionpvalues = [p.loc[boolIdx].reset_index()]       

        return boolIdx,selectionpvalues,pvalueNames

    def getHeatmapData(self,dataID : str, anovaDetails={"pvalue":0.0001}):
        ""
        if dataID in self.dfs:

            okay, msg = self._checkOneWayANOVADetails(anovaDetails)
            if not okay:
                return False, msg

            expColumns = self.getExpressionColumns(dataID)
            annotationColumn = self.getAPIParam("annotation-colum")
            extraColumns = self.getAPIParam("extra-colums-in-dataset-heatmaps")
            groupings, groupingNames, groupingMapper, groupingColorMapper, groupColorValues, groupingItems = self.getGroupingDetails(dataID,expColumns)

            anovaType, anovaCutoff, grouping1 = self._getOneWayANOVASignificanceHits(anovaDetails)
            
            if grouping1 not in groupingNames:
                return False, "Grouping 1 not found in the dataset."

            X = self.dfs[dataID]["data"].dropna(subset=expColumns)

            if anovaType == "1-way ANOVA":
                boolIdx, selectionpvalues, pvalueNames = self._performOneWayANOVA(X,groupings,grouping1,anovaCutoff)
                
                
            elif anovaType == "2-way ANOVA":
                ok, ds = self._checkTwoWayANOVADetails(anovaDetails,groupingNames)
                if not ok:
                    return False, ds
                else:
                    grouping2 = ds
                
                boolIdx, selectionpvalues, pvalueNames = self._performTwoWayANOVA(X,expColumns,anovaDetails,groupings,grouping1,grouping2,anovaCutoff)
                   

            if not np.any(boolIdx):
                    return False, "Signficance cutoff resulted in an empty data frame (e.g. no signficiantly different proteins)."

            X = X.loc[boolIdx]
            values = X.loc[:,expColumns].values   
            values = zscore(values,axis=1,nan_policy="omit")
            maxValue = np.nanmax(np.abs(values.flatten()))
           # print(values)
            colorPalette = sns.color_palette("RdBu_r",n_colors=5).as_hex()
            colorValues = np.linspace(-maxValue,maxValue,num=5).flatten().tolist()
            rowLinkage = fastcluster.linkage(values, method = "complete", metric = "euclidean")   
            maxD = 0.75*max(rowLinkage[:,2])
            Z_row = sch.dendrogram(rowLinkage, orientation='left', color_threshold= maxD, 
                                    leaf_rotation=90, ax = None, no_plot=True)
            clusters = sch.fcluster(rowLinkage,16,'maxclust')
           
            vvs = pd.DataFrame(values,columns=expColumns)
           
            vvs = vvs.join([
                pd.Series(clusters,name="clusterIndex"),
                pd.Series(X.index,name="idx"),
                pd.Series(self.dbManager.getDBInfoForFeatureListByColumnName(X.index,annotationColumn).values.flatten(), 
                                name="annotationColumn").fillna("-"),
                                ]  + 
                                [
                pd.Series(self.dbManager.getDBInfoForFeatureListByColumnName(X.index,colName).values.flatten(),
                        name = colName).fillna("-") for colName in extraColumns] + selectionpvalues)
            
            columnNamesForExport = expColumns+["idx","clusterIndex","annotationColumn"]+extraColumns+pvalueNames
            
            vvs = vvs.iloc[Z_row['leaves']]
            values = vvs.loc[:,columnNamesForExport]
            
            columnsForClusterMedian = [colName for colName in columnNamesForExport if colName not in pvalueNames]

            nClusters = np.unique(clusters).size
           
            clusterMedians = vvs[columnsForClusterMedian].groupby("clusterIndex").agg("median")
            clusterSize = vvs[columnsForClusterMedian].groupby("clusterIndex").agg("size")
            clusterMediansT = clusterMedians.transpose()
           
            for groupingName in groupingNames:
                clusterMediansT[groupingName] = [groupingMapper[groupingName][x] for x in clusterMediansT.index]
            clustersMediansGrouped  = clusterMediansT.groupby(by=groupingNames, sort=False).agg("median").transpose()

            #save group names and colors 
            r = []
            for x in clustersMediansGrouped.columns:
                
                if isinstance(x,tuple):
                    x1,x2 = x 
                    cs = groupingColorMapper[groupingNames[0]][x1],groupingColorMapper[groupingNames[1]][x2]
                    r.append([x,cs])
                elif isinstance(x,str):
                    cs = groupingColorMapper[groupingNames[0]][x]
                    r.append([[x],[cs]])

            out = {
                "legend" : {
                        "groupingNames" : groupingNames,
                        "groupingColorMapper" : groupingColorMapper,
                        "groupingItems" : groupingItems,
                        "groupingMapper" : groupingMapper
                    },

                "heatmap" : {
                        "nColumns" : len(expColumns),
                        "values" : values.values.tolist(),
                        "groupColorValues" : groupColorValues,
                        "colorPalette" : colorPalette,
                        "colorValues" : colorValues,
                        "clusterIndex" : vvs["clusterIndex"].values.flatten().tolist(),
                        "columnNames" : columnNamesForExport,
                        "dataID" : dataID,
                        "nExtraColumns" : len(extraColumns)
                    },
                "clusterView" : {
                    "clusterIndexValues" : clusterSize.index.values.tolist(),
                    "values" : clustersMediansGrouped.values.tolist(),
                    "clusterColors" : dict([(int(clusterSize.index.values[n]),hex) for n,hex in enumerate(sns.color_palette("Blues",n_colors=nClusters).as_hex())]),
                    "nValuesInCluster" : clusterSize.values.tolist(),
                    "hoverColorAndGroups" : r

                }

            }
   
            return True, out
        return False, "Unknwon error."

    def getVolcanoData(self,dataID : str, grouping : dict):
        ""
       
        if dataID in self.dfs:

            #check grouping
            if "withinGrouping" not in grouping:
                grouping["withinGrouping"] = "None"

            expColumns = self.getExpressionColumns(dataID)
            
            annotationColumn = self.getAPIParam("annotation-colum")
            filterColumns = self.getAPIParam("filters-in-volcano-plots")
            highlightColumns = self.getAPIParam("highlight-in-volcano-plots")
            highlightColumnSepForMenu = self.getAPIParam("highlight-in-volcano-plots-sep-cat-by")
            #print(highlightColumnSepForMenu)
            groupings, groupingNames, groupingMapper, groupingColorMapper, groupColorValues, groupingItems = self.getGroupingDetails(dataID,expColumns)
            
            d = self.dfs[dataID]["data"]
            data = d.join([self.dbManager.getDBInfoForFeatureListByColumnName(d.index,colName,checkShape=False).fillna("-") for colName in filterColumns ]+ [self.dbManager.getDBInfoForFeatureListByColumnName(d.index,annotationColumn,checkShape=False).fillna("-")])
            
            data[filterColumns] = data[filterColumns].fillna("-")
            

            groupingName, group1, group2 = grouping["main"], grouping["group1"], grouping["group2"]
            if groupingName in groupings and group1 in groupings[groupingName] and group1 in groupings[groupingName]:
                columnNames1 = groupings[groupingName][group1]
                columnNames2 = groupings[groupingName][group2]
                if grouping["withinGrouping"] != "None" and grouping["withinGrouping"] in groupings and grouping["withinGroup"] in groupings[grouping["withinGrouping"]]:
                    withinGroupingColumnNames = groupings[grouping["withinGrouping"]][grouping["withinGroup"]]

                    columnNames1 = [colName for colName in columnNames1 if colName in withinGroupingColumnNames]
                    columnNames2 = [colName for colName in columnNames2 if colName in withinGroupingColumnNames]
               
            #get highlight column data 
            highlightFeatures = OrderedDict() 
            if len(highlightColumns) > 0:
                
                data = data.join([self.dbManager.getDBInfoForFeatureListByColumnName(d.index,colName,checkShape=False).fillna("-") for colName in highlightColumns])
                for highlightColumn in highlightColumns:
                    
                    splitData = data[highlightColumn].astype("str").str.split(";").values
                    #get unique values 
                    flatSplitDataList = list(set(itertools.chain.from_iterable(splitData)))
                    vs = dict([(cat if highlightColumn not in highlightColumnSepForMenu else cat.split(">")[-1],data.index[data[highlightColumn].str.contains(buildRegex([cat],splitString=";")).fillna(False)].values.tolist()) for cat in flatSplitDataList if cat not in ["-","0"]])
                    if 'nan' in vs:
                        del vs['nan']

                    highlightFeatures[highlightColumn] = vs 

            X = data.loc[:,columnNames1]
            Y  = data.loc[:,columnNames2]
            T,p = ttest_ind(X,Y,nan_policy="omit",axis=1)
            # print(p)
            boolIdx, p_adj, _, _ = multipletests(p,alpha=0.05,method="fdr_tsbky")
            # print(p_adj)
            diff = pd.DataFrame(pd.Series(d.loc[:,columnNames1].mean(axis=1) - d.loc[:,columnNames2].mean(axis=1), name="x"))
            diff["y"] = (-1)*np.log10(p)
            diff["s"] = boolIdx
            
            diff = pd.concat([diff,data[filterColumns + [annotationColumn]]],axis=1)
            
            diff = diff.reset_index()
            
            diff = diff.rename({"index":"Key"})

            # print(self.dbManager.getDBInfoForFeatureListByColumnName(X.index,annotationColumn,checkShape=False).values.flatten())
            #diff = diff.join(pd.Series(self.dbManager.getDBInfoForFeatureListByColumnName(X.index,annotationColumn,checkShape=False).values.flatten(), 
             #               name="l"))
            diff[annotationColumn] = diff[annotationColumn].fillna("-")
            diff = diff.dropna(subset=["x","y"])
            # print(diff[filterColumns[0]].unique())

            maxXValue, maxYValue = diff["x"].abs().max(), diff["y"].abs().max()
            #print(diff)
            xLabel = "log2FC {} vs {}".format(group1,group2) if grouping["withinGrouping"] == "None" else "log2FC {} vs {} - ({}:{})".format(group1,group2,grouping["withinGrouping"],grouping["withinGroup"])
            
            defaultColumns = ["x","y","s","Key",annotationColumn]
            out = {
                "points": diff[defaultColumns + filterColumns].values.tolist(),
                "xDomain" : [-maxXValue-maxXValue*0.1,maxXValue+maxXValue*0.1],
                "yDomain" : [maxYValue+maxYValue*0.1,-0.005*maxYValue],
                "xlabel"  : xLabel,
                "ylabel"  : "-log10 p-value",
                "filterColumns" : [(colName,len(defaultColumns)+n) for n,colName in enumerate(filterColumns)],
                "searchIndex" : [defaultColumns.index("Key"),defaultColumns.index(annotationColumn)],
                "pointColumnNames" : [xLabel,"-log10 p-value","Significant","Key","Label"]+ filterColumns,
                "highlightFeatures" : highlightFeatures,
                #"highlightMenuBuilder" : highlightMenuBuilder.copy()
            }
            return True, out
                

        return False, None


    def _getDataForBoxplot(self,boxplotData,groupedData,groupings,groupingNames,groupingColorMapper,quantileColumnName):
        ""
        v = []
        if len(groupingNames) == 1:
            tickLabel = [""]
            for groupName,groupData in boxplotData.groupby(groupingNames,sort=False):
                groupData.loc[:,"value"] = groupData["value"].replace({np.nan: None})
                N = groupedData.get_group(groupName).dropna(subset=["value"]).index.size
                vv = OrderedDict([(idx,value) for idx,value in groupData.loc[:,[quantileColumnName,"value"]].values])
                vv["fillColor"] = groupingColorMapper[groupingNames[0]][groupName]
                vv["n"] = N
                v.append(vv)
            legendTitle = groupingNames[0]
            v = [v]

        elif len(groupingNames) == 2:
            tickLabel = [group for group in groupings[groupingNames[0]].keys()]
            #calculate statistics

            groupedBoxData = boxplotData.groupby(groupingNames,sort=False)
            for groupName1 in groupings[groupingNames[0]].keys():
                vi = []
                for groupName2 in groupings[groupingNames[1]].keys():
                    
                    groupData = groupedBoxData.get_group((groupName1,groupName2))
                    N = groupedData.get_group((groupName1,groupName2)).dropna(subset=["value"]).index.size
                    groupData.loc[:,"value"] = groupData["value"].replace({np.nan: None})

                    vv = OrderedDict([(idx,value) for idx,value in groupData.loc[:,[quantileColumnName,"value"]].values])
                    vv["fillColor"] = groupingColorMapper[groupingNames[1]][groupName2]
                    vv["n"] = N  
                    vi.append(vv)
                v.append(vi)
            legendTitle = groupingNames[1]

        legendData = groupingColorMapper[legendTitle]
        legendItems = list(legendData.keys())

        return v, legendTitle, legendData, tickLabel, legendItems

    def getDataForCard(self, dataID : str,featureID : list, filterName : str) -> Dict[str,Any]:
        """Extracts data for boxplot visualization"""

        dataset = self.getDataset(dataID)
        if dataset is None : return {"success" : False}

        meltedData = dataset.getMeltedData([featureID])
        groupingColorMapper = dataset.getGroupingColorMapper()
        groupings, groupingNames = dataset.getGroupingsAndNames()
        
        minValue, maxValue = meltedData["value"].quantile(q=[0,1]).values
        marginRange = getChartMarginFromMinMaxValues(minValue,maxValue) 
        # group data on groupingNames meltedData function adds them
        groupedData = meltedData.groupby(by = groupingNames,sort=False) #level_X == quantile due to reset_index
        quantileData = groupedData.quantile(q=[0,0.25,0.5,0.75,1]).reset_index() 
        quantileColumnName = "level_{}".format(len(groupingNames)) # get name for quantile
        quantileData[quantileColumnName] = quantileData[quantileColumnName].replace([0,0.25,0.5,0.75,1],["min","q25","m","q75","max"])
        try:
            statsData = anova(meltedData,dv="value",between=groupingNames)
            statsData.columns = [pingouinColumn[colName] if colName in pingouinColumn else colName for colName in statsData.columns]
        except:
            statsData = pd.DataFrame(["ANOVA could not be calculated."], columns=["Error"])
        jsonStatsData = statsData.to_json(orient="records")
        v, legendTitle, legendData, tickLabel, legendItems = self._getDataForBoxplot(
                                                                    quantileData,
                                                                    groupedData,
                                                                    groupings,
                                                                    groupingNames,
                                                                    groupingColorMapper,
                                                                    quantileColumnName)
        
            
        chartData = {"graphType":{
                    "1":"boxplot"},
                        "graphData":{
                            "1":{
                                "minValue" : minValue - marginRange,
                                "maxValue" : maxValue + marginRange,
                                "values" : v,
                                "title" : "",
                                "featureNames" : tickLabel,
                                "legend" : legendData,
                                "legendTitle" : legendTitle,
                                "legendItems" : legendItems
                            }
                            }
                }

        return {
            "success":True,
            "download":meltedData.to_json(orient="records"),
            "chart":chartData,
            "statsData":jsonStatsData
            }




