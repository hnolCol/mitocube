from importlib.resources import path
from tokenize import group
from typing import OrderedDict
import pandas as pd 
import numpy as np 
import os
import ast
from datetime import date
import time
from .Misc import getRandomString, getCurrentDate
from typing import Tuple, List

INTERNAL_PERFORMANCE_COLUMNS = [("General","ID"),("General","DateAdded"),("General","Timestamp")]
QUANTILE_COLUMNS = {"0.0":"min","0.25":"q25","0.5":"m","0.75":"q75","1.0":"max"}

class Performance(object):
    def __init__(self,pathToData, performanceConfig, propertyOptions, mainGroup, *args,**kwargs):
        ""
        self.pathToData = pathToData
        self.performanceConfig = performanceConfig
        self.propertyOptions = propertyOptions
        self.mainGroup = mainGroup
        self.pathToPerfromanceFile = os.path.join(pathToData,"performance.json")
        self.__setupPerformanceDetails()
        self.__checkPath() 
        self.__createFile()
       
       # self.getPerformanceData()

    def __checkPath(self):
        ""
        if not os.path.exists(self.pathToData):
            os.mkdir(self.pathToData)

    def __createFile(self):
        ""
        if not os.path.exists(self.pathToPerfromanceFile):
            #columnTuples = [("General","Date"),("General","Researcher"),("Instrument","ID"), ("Metrices","Identified Peptides")]
            self.df = pd.DataFrame(columns=self.getColumnsForPerformanceData())
            self.__saveFile()
        else:
            self.df = pd.read_json(self.pathToPerfromanceFile)
            #make hierarchichy column index
            columnTuples = [ast.literal_eval(x) for x in self.df.columns]
            self.df.columns = pd.MultiIndex.from_tuples(columnTuples)
       
    
    def __saveFile(self) -> None:
        ""
        if hasattr(self,"df"):
            self.df.to_json(self.pathToPerfromanceFile)


    def __setupPerformanceDetails(self) -> None:
        ""
        if hasattr(self,"performanceConfig"):
            mainHeaders = list(self.performanceConfig.keys())
            self.performanceColumns = INTERNAL_PERFORMANCE_COLUMNS + [(mH,columName) for mH in mainHeaders for columName in self.performanceConfig[mH] if isinstance(self.performanceConfig[mH],list)]
            
            dictBasedHeaders = [mH for mH in mainHeaders if isinstance(self.performanceConfig[mH],dict) and all(k in self.performanceConfig[mH] for k in ["name","metrices"])]
            for dictBasedColumnCreater in dictBasedHeaders:
                vs = self.performanceConfig[dictBasedColumnCreater]
                self.performanceColumns.extend([(dictBasedColumnCreater,f"{n}_{m}") for m in vs["name"] for n in vs["metrices"]])
            
    def addPerformanceData(self,
                    generalInfo : dict, 
                    metrices : dict, 
                    properties : dict,
                    distributions : dict,
                    qcPeptides : dict,
                    misc : dict) -> Tuple[bool,str]:
        """
        Handle performance run addition by just adding the information provided to
        the API to a file. This function does not check if the data make sense. 
        """

        try:
            mitoCubeSalt = OrderedDict([(("General",k),v) for k,v in [("ID",getRandomString(5)),("DateAdded",getCurrentDate()),("Timestamp",time.time())]])
            vv = OrderedDict([(k,v) for d in [mitoCubeSalt,generalInfo,metrices,properties,distributions,qcPeptides,misc] for k,v in d.items()])
            dfToAppend = pd.DataFrame(vv,index=["fakeIndex"]) #index required to create dataframe with scalars 
            self.df = self.df.append(dfToAppend,ignore_index=True)     
            self.__saveFile()
            return True, "Performance run successfully added."
        except Exception as e:
            return False, "There was an error: " + str(e)


    def getColumnsForPerformanceData(self):
        ""  
        if not hasattr(self,"performanceColumns"):
            self.__setupPerformanceDetails()
        return self.performanceColumns

    def getRequiredInfo(self) -> List[str]:
        """Returns the information that are required to be entered by user. ID and Date will be handled automatically."""
        return [x for x in self.getColumnsForPerformanceData() if x not in INTERNAL_PERFORMANCE_COLUMNS]

    def getUniquePropertyOptions(self):
        """Returns properties (e.g. choosable props) defined in the config file"""
        return self.propertyOptions 

    def getPerformanceData(self):
        "Returns a grouped form of the performance data"

        self.__createFile()
        propertryData = self.df.iloc[:,self.df.columns.get_level_values(0)=="Properties"]
        sortedColumns = [("Properties",propName) for propName in self.performanceConfig["Properties"] if ("Properties",propName) in propertryData.columns] #tuple of columns    
        groupbyProps = self.df.sort_values(by=("General","Date"),kind="stable").groupby(by=sortedColumns, sort=False)
        matchingGroupNames = OrderedDict([(n,list(k)) for n,k in enumerate(groupbyProps.groups.keys())])
        
        groupedData = OrderedDict() 
        
        for n, (_, groupData) in enumerate(groupbyProps):
            groupData.columns = groupData.columns.get_level_values(1) #remove hierarchicacy of column names
            groupedData[n] =  groupData.dropna(axis=1,how="all").fillna(value="None").to_dict(orient="records")#dropna(how="all",axis=1)
            
        return groupedData,groupbyProps, matchingGroupNames, self.performanceConfig, self.mainGroup


    # def getLastRunDistance(self, groupPerformance : dict) -> dict:
    #     ""
    #     metricColumns = [("Metrices",colName) for colName in self.performanceConfig["Metrices"]] #for metrices, a distance is to the median is evaluated
    #     distance = OrderedDict() 
    #     distribution = OrderedDict()
    #     for n, (_, groupData) in enumerate(groupPerformance):
    #         medianMetricesValues = groupData[metricColumns].median().values
    #         minMetricesValues = groupData[metricColumns].min().values
    #         maxMetricesValues = groupData[metricColumns].max().values
    #         values = groupData.iloc[-1][metricColumns].values
           
    #         scaledData = [(x - minMetricesValues[n]) / (maxMetricesValues[n] - minMetricesValues[n]) for n,x in enumerate(values)]
    #         distance[n] =  [x if not np.isnan(x) else 0.5 for x in scaledData]
    #         distribution[n] = {
    #             "m" : medianMetricesValues.tolist(), 
    #             "min":minMetricesValues.tolist(), 
    #             "max": maxMetricesValues.tolist()}

    #     return distance, distribution


    def getUniqueMainGroup(self,columnName = None) -> pd.DataFrame:
        ""
        if columnName is None: 
            columnName = self.mainGroup

        return self.propertyOptions[columnName]


            
