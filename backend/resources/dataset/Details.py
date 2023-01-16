
from flask import request, jsonify
from flask_restful import Resource

from collections import OrderedDict
import json 
import os

class DatasetDetails(Resource):
    def __init__(self,*args,**kwargs):
        """
        """
        self.data = kwargs["data"]
        self.token = kwargs["token"]
        self.detailHeaders = self.data.getAPIParam('detail-params') 
        

    def get(self):
        "Returns a formatted way way of params"
        
        token = request.args.get('token', default="None", type=str)
        if token == "None" or not self.token.isValid(token):
            return {"success":False,"error":"Token is not valid."}
        dataID = request.args.get('dataID', default="None", type=str)
        params = self.data.getParams(dataID)

        if params is not None:
            groupItems = OrderedDict([(groupingName, list(groupingItems.keys())) for groupingName, groupingItems in params["groupings"].items()])
            numberFeatures, _ = self.data.dataCollection[dataID].getDataShape()
            details = OrderedDict([("DataID",dataID)] + [(h,params[h]) for h in self.detailHeaders if h in params] + [("groupItems",groupItems)])
            details["Number of Proteins"] = numberFeatures

            orderedColumnNames = list(details.keys())
            if "Experimental Info" in orderedColumnNames: #ugly fix
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
        token = request.args.get('token', default="None", type=str)
        if token == "None" or not self.token.isValid(token):
            return {"success":False,"msg":"Token is not valid."}
        featureID = request.args.get('featureID', default="", type=str)
        if featureID == "":
            return {"success":False,"msg":"Feature ID must be a Uniprot ID. Found empty string."}

        featureIDDataIDMapper = self.featureFinder.getDatasets([featureID],filter = {"Type":"Whole proteome"}, featureSpecFilter = {})
        numDatasets = len(featureIDDataIDMapper[featureID])
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
                return jsonify({
                    "success":True,
                    "groupings":{
                        "groupingNames" : params["groupingNames"],
                        "groupings" : params["groupings"]
                    }})
            else:
                return jsonify({"success":True,"error":"groupingNames not defined for this dataID."})
        return jsonify({"success":False,"error":"Parameter file not found."})


class DatasetExperimentalInfo(Resource):
    def __init__(self,*args,**kwargs):
        ""
        self.data = kwargs["data"]
        self.token = kwargs["token"]

    def get(self) -> dict:
        """
        Returns the experimental information for a specific dataset (dataID)
        """
        token = request.args.get('token', default="None", type=str)
        if token == "None" or not self.token.isValid(token):
            return {"error":"Token is not valid.","success":False}
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