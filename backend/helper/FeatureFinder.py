from ast import Or
from collections import OrderedDict
import pandas as pd
import numpy as np
from sklearn.pipeline import FeatureUnion 



class FeatureFinder(object):
    
    def __init__(self,*args,**kwargs):
        ""
        self.data = kwargs["data"]
        self.DB = kwargs["DB"]

    def __checkDataObject(self):
        "Updates data and checks if it has a attr dfs and if data are loaded to dfs."
        if hasattr(self.data,"update"):
            self.data.update( )

        if not hasattr(self.data,"dfs") or len(self.data.dfs) == 0:
            return False
        
        return True

    def __checkParamByFilterDict(self,paramFile,filter):
        ""
        addFeaturesOfDataID = True
        
        if filter is not None and isinstance(filter,dict) and len(filter) > 0:
            for k,v in filter.items():
                if k in paramFile:
                    if isinstance(v,list): 
                        if len(v) == 0:
                            addFeaturesOfDataID = False
                        if paramFile[k] not in v:
                            addFeaturesOfDataID = False
                    elif isinstance(v,str):
                        if paramFile[k] != v:
                            addFeaturesOfDataID = False
                if not addFeaturesOfDataID:
                    break

        return addFeaturesOfDataID 

    def getFeatures(self, filter = {}):
        ""

        if not self.__checkDataObject():
            return []

        r = []
        for dataID, X in self.data.dfs.items():
            if self.__checkParamByFilterDict(X["params"],filter):
                r.append(pd.Series(X["data"].index.values))

        if len(r) > 0:
            
            return pd.concat(r,ignore_index=True).unique().tolist()

        return [] 


    def getFeatureInfoFromDB(self,featureIDs=[],filter={}):
        ""
        if hasattr(self,"DB"):
            if len(featureIDs) == 0:
                featureIDs = self.getFeatures(filter)
            
            return self.DB.getDBInfoForFeatureList(featureIDs,requiredColNames=["Entry","","Protein names","Gene names  (primary )","Organism"])
        return []
       
    def getSummaryInformation(self,featureIDs,filter = {"Type" : "Whole proteome"}):
        ""
        #get species filter per feature
        organismnByFeature = self.DB.getDBInfoForFeatureList(featureIDs,["Organism"],entryInfoDictAsOutput=True)
        datasetsByFeatureID, numberDataFitFilter = self.getDatasets(featureIDs,filter,returnNumberOfData=True,featureSpecFilter=organismnByFeature)
       
        summaryInformation = OrderedDict() 
        expressionDistribution = None
        for featureID, dataIDs in datasetsByFeatureID.items():
            summaryInformation[featureID] = OrderedDict() 
           
            summaryInformation[featureID]["coverageInDatasets"] = {"detectedInDatasets" : len(dataIDs), "totalDatasets":numberDataFitFilter[featureID]}
            #if len(dataIDs) > 0 and expressionDistribution is None:
        expressionDistribution = self.data.getMedianExpressionByFeatureIDs(datasetsByFeatureID)

        if expressionDistribution is None:
            return dict([(featureID,{"success":False}) for featureID in featureIDs])
        for featureID in featureIDs:
            if featureID in expressionDistribution:
                medianExpression = expressionDistribution[featureID]["m"]
                if isinstance(medianExpression,pd.DataFrame):
                    medianExpression = medianExpression.values.flatten()[0]
                summaryInformation[featureID]["expression"] = {"median" : medianExpression}
        
        ## add non featureID specific details.
                summaryInformation[featureID]["totalExpressionDistribution"] = dict([(q,v) for q,v in zip(["min","q25","m","q75","max","fillColor"],expressionDistribution[featureID]["dist"].tolist()+["#efefef"])])
        return summaryInformation

    def getSummaryInformationForCharts(self,featureIDs,summaryInformation):

        summaryInformationForCharts = OrderedDict([(featureID,{}) for featureID in featureIDs]) 
        for featureID in featureIDs:
            quantIn = summaryInformation[featureID]["coverageInDatasets"]
            relValue = quantIn["detectedInDatasets"] / (quantIn["totalDatasets"] + 0.5)
          
            if quantIn["detectedInDatasets"] == 0:
                chartData = {"graphType":{},"graphData":{}}
            else:
                IQR = summaryInformation[featureID]["totalExpressionDistribution"]["q75"]-summaryInformation[featureID]["totalExpressionDistribution"]["q25"]
                chartData = {"graphType":{"1":"barplot", "2" : "boxplot"},
                            "graphData":{
                                "1": {
                                    "values" : [relValue],
                                    "labelValues" : ["({}/{})".format(quantIn["detectedInDatasets"],quantIn["totalDatasets"])],
                                    "featureNames" : [] ,
                                    "minValue" : 0,
                                    "maxValue" : quantIn["totalDatasets"]+0.5,
                                    "title":"Quantified in N Experiments"
                                },
                                "2": {
                                    "minValue" : summaryInformation[featureID]["totalExpressionDistribution"]["min"] - 0.25 * IQR,
                                    "maxValue" : summaryInformation[featureID]["totalExpressionDistribution"]["max"] + 0.25 * IQR,
                                    "title" : "Protein abundance (log2 LFQ)",
                                    "values" : [
                                                [summaryInformation[featureID]["totalExpressionDistribution"]]],
                                    "featureNames" : [],
                                    "highlightPoint" : [[summaryInformation[featureID]["expression"]["median"]]],
                                    "legend" : {},
                                    "vertical" : False,
                                    "hoverboxOff" : True
                                },
                                }, 
                            
                }
            summaryInformationForCharts[featureID] = {"success":True,"chart":chartData}

        return summaryInformationForCharts

# MCSVGFrame.defaultProps = {
#     graphData : 
#         {1: {
#             values : [0.5,0.8,0.7],
#             labelValues : ["24","35","21"],
#             featureNames : ["Gene1","as","Gene2"] ,
#             minValue : 0,
#             maxValue : 22,
#             title:"Quantified in N Tissues1"
#         },
#         2: {
#             minValue : 1,
#             maxValue : 22,
#             title : "Half-life distribution",
#             values : [
#                         {q25:4,m:6,q75:9,min:3,max:11},
#                         {q25:4,m:6,q75:9,min:3,max:11},
#                         {q25:4,m:8,q75:9,min:3,max:11}],
#             featureNames : ["Gene1","as","Gene2"]
#         },
#         3 : {
#         xLimits : [-2,27],
#         yLimits : [1,-0.05],
#         xLabel : "Time (days)",
#         yLabel : "Incorporation rate",
#         values : [
#             [[0,0],[7,0.1],[11,0.4],[14,0.6],[21,0.8],[26,0.82]],
#             [[0,0],[7,0.15],[11,0.7],[14,0.8],[21,0.9],[26,0.89]]
#         ],
#         title:"Ndufa1"
#         }
#     },
#     graphType : {1 : "barplot", 2 : "boxplot", 3 : "pointplot"}
# }

        


    def getDatasets(self,featureIDs,filter,returnNumberOfData = False, featureSpecFilter = {}):
        """
        Identifies datasets that contain the feature ids. 
        Returns a dict with key=feature ID and value = list of dataIDs
        """
        if not self.__checkDataObject():
            return {} 
        if len(featureIDs) == 0:
            return {} 

        r = OrderedDict([(featureID,[]) for featureID in featureIDs])
        numbOfDataFitFilter = OrderedDict([(featureID,0) for featureID in featureIDs])
        
        for dataID, X in self.data.dfs.items():
            
            if self.__checkParamByFilterDict(X["params"],filter):
                
                for featureID in featureIDs:
                    if featureID in featureSpecFilter:
                        
                        if not self.__checkParamByFilterDict(X["params"],featureSpecFilter[featureID]):
                            continue
                    if np.any(X["data"].index == featureID):
                        r[featureID].append(dataID) 
                    numbOfDataFitFilter[featureID] += 1
        if returnNumberOfData:
            return r, numbOfDataFitFilter
        else:          
            return r 


