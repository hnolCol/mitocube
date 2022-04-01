
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

        apiConfig = json.load(open(os.path.join(self.data.pathToAPIConfig,"api_docs_config.json")))
        self.detailHeaders = apiConfig['api']['detail-params']
        print(self.detailHeaders) 

    def get(self):
        "Returns a formatted way way of params"
        dataID = request.args.get('dataID', default="None", type=str)
        params = self.data.getParams(dataID)
        if params is not None:
            print(self.detailHeaders)
            details = OrderedDict([("DataID",dataID)] + [(h,params[h]) for h in self.detailHeaders])


            return jsonify({"success":True,"details":details})
        return jsonify({"success":False,"error":"Parameter file not found."})

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

    def get(self):
        token = request.args.get('token', default="None", type=str)
        if token == "None" or not self.token.isValid(token):
            return {"error":"Token is not valid."}
        dataID = request.args.get('dataID', default="None", type=str)
        succes, params = self.data.getExperimentalInformation(dataID=dataID)
        if succes:
            return jsonify({"success":succes,"params":params})
        else:
            return jsonify({"success":succes,"error":params})