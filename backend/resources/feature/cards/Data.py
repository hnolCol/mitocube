from flask import request, jsonify
from flask_restful import Resource
import json
import numpy as np 
import seaborn as sns

# class ChartDataForFeatures(Resource):
#     def __init__(self,*args,**kwargs):
#         """
#         """
#         self.data = kwargs["data"]
#         self.token = kwargs["token"]
        
#     def post(self):
#         """
#         TO DO_ move this to another class..
#         """
#         if request.data != b'':
            
#             data = json.loads(request.data, strict=False)
 
#             if not "token" in data or not self.token.isValid(data['token']):
#                 return {"error":"Token is not valid."}

#             if "props" in data and "Entry" in data["props"] and "dataID" in data["props"]:
#                 featureID = data["props"]["Entry"]
#                 dataID = data["props"]["dataID"]

#                 dataset = self.data.getDataset(dataID)
#                 if dataset is not None:

#                     meltedData = dataset.getMeltedData([featureID])
#                     groupings = dataset.getGroupings()
#                     groupingNames = dataset.getGroupingNames()

#                 #groupings = self.data.getParam(dataID,"groupings") 
#                 #groupingNames = list(groupings.keys())
#                 groupingColormaps = self.data.getParam(dataID,"groupingCmap")
#                 colorsForGroupings = dict([(groupingName,sns.color_palette(groupingColormaps[groupingName],n_colors=len(groupings[groupingName]),desat=0.75).as_hex()) for groupingName in groupingNames if groupingName in groupingColormaps])
#                 groupingColors = dict([(groupingName, dict([(groupName,colorsForGroupings[groupingName][n]) for n,groupName in enumerate(groupings[groupingName].keys())])) for groupingName in groupingNames])
#                 groupingColorM = dataset.getGroupingColorMapper()
#                 #get data (quantiles for boxplot)
#                 tickLabel = [group for group in groupings[groupingNames[0]].keys()]
#                 minValue, maxValue = meltedData["value"].quantile(q=[0,1]).values
#                 marginRange = np.sqrt(maxValue**2 - minValue**2) * 0.01
#                 boxplotData = meltedData.groupby(by = groupingNames).quantile(q=[0,0.25,0.5,0.75,1]).reset_index() #level_X == quantile due to reset_index
#                 quantileColumnName = "level_{}".format(len(groupingNames)) # get name for quantile
#                 boxplotData[quantileColumnName] = boxplotData[ quantileColumnName].replace([0,0.25,0.5,0.75,1],["min","q25","m","q75","max"])

#                 # ´handle data extraction depending on the number of groupings
#                 v = []
#                 if len(groupingNames) == 1:
#                     for groupName,groupData in boxplotData.groupby(groupingNames):

#                         vv = dict([(idx,value) for idx,value in groupData.loc[:,[quantileColumnName,"value"]].values])
#                         vv["fillColor"] = groupingColors[groupingNames[0]][groupName]
#                         v.append(vv)
#                     legendData = {}
#                     legendTitle = ""
#                 elif len(groupingNames) == 2:
#                     groupedBoxData = boxplotData.groupby(groupingNames)
                   
#                     for groupName1 in groupings[groupingNames[0]].keys():
#                         vi = []
#                         for groupName2 in groupings[groupingNames[1]].keys():
                            
#                             groupData = groupedBoxData.get_group((groupName1,groupName2))
#                             groupData.loc[:,"value"] = groupData["value"].replace({np.nan: None})

#                             vv = dict([(idx,value) for idx,value in groupData.loc[:,[quantileColumnName,"value"]].values])
#                             vv["fillColor"] = groupingColors[groupingNames[1]][groupName2]
#                             vi.append(vv)
#                         v.append(vi)
#                     legendTitle = groupingNames[1]
#                     legendData = groupingColors[legendTitle]
                    
#                # if len(groupings) == 1:
                
#                 chartData = {"graphType":{"1":"boxplot"},
#                             "graphData":{
#                                 "1":{
#                                     "minValue" : minValue - marginRange,
#                                     "maxValue" : maxValue + marginRange,
#                                     "values" : v,
#                                     "title" : "",
#                                     "featureNames" : tickLabel,
#                                     "legend" : legendData,
#                                     "legendTitle" : legendTitle
#                                 }
#                                 }
#                             }
                

#                 if meltedData is None:
#                     return {"success":False,"download":[],"chart":[]}
#                 return {"success":True,"download":meltedData.to_json(orient="records"),"chart":chartData}

#             return {"success":False}



class CorrelationsToFeature(Resource):
    def __init__(self,*args,**kwargs):
        """
        """
        self.data = kwargs["data"]
        self.token = kwargs["token"]

    def post(self):
        ""
        if request.data != b'':
            data = json.loads(request.data, strict=False)
            if not all(param in data for param in ["token","featureIDs","dataID"]):
                return {"success" : False, "msg" : "Not all required param found."}
            if not self.token.isValid(data['token']):
                return {"success": False, "error":"Token is not valid."}
            
            featureIDs = data["featureIDs"]
            dataID = data["dataID"]
            
            corrDataForHeatmap = self.data.getCorrelatedFeatures(dataID,featureIDs)
        
            return {"success":True,"correlationData":corrDataForHeatmap}