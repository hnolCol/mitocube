from ast import Or
from collections import OrderedDict
import pandas as pd
import numpy as np
from sklearn.pipeline import FeatureUnion 
from typing import Tuple, List, Dict


class FeatureFinder(object):
    
    def __init__(self,*args,**kwargs):
        ""
        self.data = kwargs["data"]
        self.DB = kwargs["DB"]

    def __checkParamByFilterDict(self,paramFile : dict,filter : dict) -> bool:
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
                else:
                    if all(k not in paramFile for k in filter.keys()):
                        #if all filter keys are missing -> false
                        addFeaturesOfDataID  = False

                if not addFeaturesOfDataID:
                    break

        return addFeaturesOfDataID 

    def getFeatures(self, filter = dict()):
        ""
        
        # if not self.__checkDataObject():
        #     return [] 
        #dataIDs = []
        r = []
        self.data.checkForMissingDataset() #check if there are dataIDs that are not present yet.
        for dataset in self.data.dataCollection.values():
            params = dataset.getParams()
            if self.__checkParamByFilterDict(params,filter):
                r.append(pd.Series(dataset.getData().index.values))
                #dataIDs.append(dataID)

        if len(r) > 0:
            featureIDs = pd.concat(r,ignore_index=True).unique().flatten()
            return featureIDs

        return []

    def getFeatureInfoFromDB(self,featureIDs : List[str] = list(), filter = dict(), annotationColumns : List[str] = None) -> List[Dict[str,str]]:
        """
        Returns database annotations for features in list featureIDs. If an empty list is given
        all available features are returned of the datasets that match the filter (dict).
        """
        
        if hasattr(self,"DB") and self.DB is not None:
            if annotationColumns is None:
                annotationColumns = self.data.getAPIParam("db-feature-annotations")
            if len(featureIDs) == 0:
                featureIDs = self.getFeatures(filter = filter)
            return self.DB.getDBInfoForFeatureList(featureIDs,requiredColNames = annotationColumns)
        return []

    def getFeatureLabels(self) -> Dict[str,str]:
        ""
        labelHierarchy = self.data.getAPIParam("feature-item-labels")
        if labelHierarchy is None:
            return {}
        return labelHierarchy
    
    def getFeatureSortByColumnName(self) -> str:
        """Returns the name of the attribute that should be used for sorting by the front-end."""
        return self.data.getAPIParam("feature-sort-by")
       
    def getSummaryInformation(self,featureIDs : List[str],filter = {"Type" : "Whole proteome"}):
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

    def getSummaryInformationForCharts(self,featureIDs : List[str], summaryInformation : dict) -> Dict[str,dict]:

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
                                    "hoverboxOff" : True,
                                    "legendItems" : []
                                },
                                }, 
                            
                }
            summaryInformationForCharts[featureID] = {"success":True,"chart":chartData}

        return summaryInformationForCharts

 
    def getDatasets(self,featureIDs : List[str], filter : dict, featureSpecFilter : dict, returnNumberOfData : bool = False) -> Tuple[dict,dict]:
        """
        Finds datasets that contain the featureIDs, if returnNumberOfData equals True, 
        the number of datasets that match the filter criteria is reported
        All data are reported as dict where featureID is key.
        To - do: save featureID -> dataID, rather create a mapping dict at start.
        """
        # if not self.__checkDataObject():
        #     return {} 

        if len(featureIDs) == 0:
            return {} 
        self.data.checkForMissingDataset()
        dataIDsByFeature = OrderedDict()
        numbOfDataFitFilter = OrderedDict([(featureID,0) for featureID in featureIDs])
        
        for featureID in featureIDs:
            if featureID in featureSpecFilter:
                filterForFeature = {**filter, **featureSpecFilter[featureID]} #filter for all, and feature ID merged, featureID spec filter overwrites
            else:
                filterForFeature = filter.copy()
            
            dataIDMatchingFilter = self.data.dataCollection.getDataIDsByFilter(filter = filterForFeature)
            dataIDs = self.data.dataCollection.getDataIDsThatContainFeature(featureID = featureID,filter = filterForFeature)
            numbOfDataFitFilter[featureID] = len(dataIDMatchingFilter)
            dataIDsByFeature[featureID] = dataIDs

        if returnNumberOfData:
            return dataIDsByFeature, numbOfDataFitFilter
        else:          
            
            return dataIDsByFeature 


