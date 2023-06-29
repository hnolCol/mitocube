
from flask import request, jsonify
from flask_restful import Resource
from ..misc import isTokenValid
from collections import OrderedDict
import json 
import os

class DatasetDetails(Resource):
    def __init__(self,*args,**kwargs):
        """
        """
        self.data = kwargs["data"]
        self.token = kwargs["token"]
        self.detailHeaders = self.data.getAPIParam("detail-params") 
        
        

    def get(self):
        "Returns a formatted way way of params"
        
        # token = request.args.get('token', default="None", type=str)
        # ok, msg = isTokenValid(token,self.token)
        # if not ok:
        #     return {"success":False,"msg":msg}

        dataID = request.args.get('dataID', default="None", type=str)
        params = self.data.getParams(dataID)

        if params is not None:
            groupItems = OrderedDict([(groupingName, list(groupingItems.keys())) for groupingName, groupingItems in params["groupings"].items()])
            numberFeatures, _ = self.data.dataCollection[dataID].getDataShape()
            details = OrderedDict([("DataID",dataID)] + [(h,params[h]) for h in self.detailHeaders if h in params] + [("groupItems",groupItems)])
            details["Number of Proteins"] = numberFeatures

            orderedColumnNames = list(details.keys())
            if "Experimental Info" in orderedColumnNames: #ugly fix to put it in the end
                orderedColumnNames.remove("Experimental Info")
                orderedColumnNames.append("Experimental Info")
                


            return {"success":True,"details":details,"names":orderedColumnNames}
        return {"success":False,"error":"Parameter file not found."}


class DatasetSearch(Resource):
    def __init__(self,*args,**kwargs):
        """
        """
        self.featureFinder = kwargs["featureFinder"]
        self.token = kwargs["token"]

    def get(self):
        ""
        tokenString = request.args.get('token', default="None", type=str)
        ok, msg = isTokenValid(tokenString,self.token)
        if not ok:
            return {"success":ok,"msg":msg}
        featureIDs = request.args.get('featureIDs', default="", type=str)
        if featureIDs == "":
            return {"success":False,"msg":"Feature ID must be a Uniprot ID. Found empty string."}
        if ";" in featureIDs:
            featureIDs = featureIDs.split(";")
        else:
            featureIDs = [featureIDs]
            
        featureIDDataIDMapper = self.featureFinder.getDatasets(
            featureIDs,
            filter = {"Type":"Whole proteome"}, 
            featureSpecFilter = {}) #put whole proteome to config? 
        
        numDatasets = len(featureIDDataIDMapper[featureIDs[0]])
        return {
            "success":True,
            "msg":f"Database searched. Found in {numDatasets } dataset(s).",
            "featureIDMapper":featureIDDataIDMapper,
            "numberOfDatasets" : numDatasets  
            }


class DatasetGroupings(Resource):
    def __init__(self,*args,**kwargs):
        """
        """
        self.data = kwargs["data"]
        self.token = kwargs["token"]
        

    def get(self):
        "Returns a grouping information."
        dataID = request.args.get('dataID', default="None", type=str)
        params = self.data.getParams(dataID)
        if params is not None:
            if "groupingNames" in params:
                return {
                    "success":True,
                    "groupings":{
                        "groupingNames" : params["groupingNames"],
                        "groupings" : params["groupings"]
                    }}
            else:
                return {"success":True,"error":"groupingNames not defined for this dataID."}
        return {"success":False,"error":"Parameter file not found."}


class DatasetExperimentalInfo(Resource):
    def __init__(self,*args,**kwargs):
        ""
        self.data = kwargs["data"]
        self.token = kwargs["token"]

    def get(self) -> dict:
        """
        Returns the experimental information for a specific dataset (dataID)
        """
        tokenString = request.args.get('token', default="None", type=str)
        ok, msg = isTokenValid(tokenString,self.token)
        if not ok:
            return {"success":ok,"msg":msg}
        dataID = request.args.get('dataID', default="None", type=str)
        succes, params = self.data.getExperimentalInformation(dataID=dataID,joinListItems=True)
        if succes:
            return {"success":succes,"params":params}
        else:
            return {"success":succes,"error":params}


class DatasetsHeatmap(Resource):
    def __init__(self,*args,**kwargs):
        ""
        self.data = kwargs["data"]
        self.token = kwargs["token"]


    def get(self):
        ""
        token = request.args.get('token', default="None", type=str)
        if token == "None" or not self.token.isValid(token):
             return {"error":"Token is not valid.","success":False}
        dataID = request.args.get('dataID', default="None", type=str)
        anovaDetails = json.loads(request.args.get("anovaDetails",default="{}",type=str))
        succes, params = self.data.getHeatmapData(dataID,anovaDetails)
        #print(succes)
        if succes:
            return {"success":succes,"params":params}
        else:
            return {"success":succes,"error":params}



class DatasetsVolcano(Resource):
    def __init__(self,*args,**kwargs):
        ""
        self.data = kwargs["data"]
        self.token = kwargs["token"]

    def get(self):

        token = request.args.get('token', default="None", type=str)
        if token == "None" or not self.token.isValid(token):
             return {"error":"Token is not valid.","success":False}

        dataID = request.args.get('dataID', default="None", type=str)
        
        grouping = json.loads(request.args.get('grouping',default="{}",type=str))

        succes, params = self.data.getVolcanoData(dataID,grouping)
        if succes:
            return {"success":succes,"params":params}
        else:
            return {"success":succes,"error":params}