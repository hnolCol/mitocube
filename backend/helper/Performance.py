from importlib.resources import path
from tokenize import group
from typing import OrderedDict
import pandas as pd 
import numpy as np 
import os
import ast
from datetime import date
from .Misc import getRandomString, getCurrentDate

class Performance(object):
    def __init__(self,pathToData, performanceConfig, propertyOptions, *args,**kwargs):
        ""
        self.pathToData = pathToData
        self.performanceConfig = performanceConfig
        self.propertyOptions = propertyOptions
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
        print(self.df.columns.values.tolist())
    def __saveFile(self):
        ""
        if hasattr(self,"df"):
            self.df.to_json(self.pathToPerfromanceFile)


    def __setupPerformanceDetails(self):
        ""
        if hasattr(self,"performanceConfig"):
            mainHeaders = list(self.performanceConfig.keys())
            self.performanceColumns = [("General","ID"),("General","DateAdded")] + [(mH,columName) for mH in mainHeaders for columName in self.performanceConfig[mH] if isinstance(self.performanceConfig[mH],list)]
            
            dictBasedHeaders = [mH for mH in mainHeaders if isinstance(self.performanceConfig[mH],dict) and all(k in self.performanceConfig[mH] for k in ["name","metrices"])]
            for dictBasedColumnCreater in dictBasedHeaders:
                vs = self.performanceConfig[dictBasedColumnCreater]
                self.performanceColumns.extend([(dictBasedColumnCreater,f"{n}_{m}") for m in vs["name"] for n in vs["metrices"]])
            
    def addPerformanceData(self,
                    generalInfo, 
                    metrices, 
                    properties,
                    distributions,
                    qcPeptides):
        ""

        try:
            mitoCubeSalt = OrderedDict([(("General",k),v) for k,v in [("ID",getRandomString(5)),("DateAdded",getCurrentDate())]])
            vv = OrderedDict([(k,v) for d in [mitoCubeSalt,generalInfo,metrices,properties,distributions,qcPeptides] for k,v in d.items()])
            dfToAppend = pd.DataFrame(vv,index=["fakeIndex"]) #index required to create dataframe with scalars 
            self.df = self.df.append(dfToAppend,ignore_index=True)     
            self.__saveFile()
            return True, "Performance run successfully added."
        except Exception as e:
            return False, "There was an error: " + str(e)


    def getColumnsForPerformanceData(self):
        ""  
        return self.performanceColumns

    def getUniquePropertyOptions(self):
        
        return self.propertyOptions 

    def getPerformanceData(self, groupOnLevel0 = "Properties"):
        "Returns a grouped form of the performance data"

        self.__createFile()
        propertryData = self.df.iloc[:,self.df.columns.get_level_values(0)==groupOnLevel0]
        
        #split data by properties
        groupedData = OrderedDict() 
        for groupName, groupData in self.df.groupby(by=propertryData.columns.values.tolist()):
            groupData.columns = groupData.columns.get_level_values(1)
            groupedData[groupName] = groupData.to_json(orient="records")

        return groupedData


            
