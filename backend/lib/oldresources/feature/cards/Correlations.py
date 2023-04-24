from flask import request
from flask_restful import Resource
import json

class CorrelationsToFeature(Resource):
    def __init__(self,*args,**kwargs):
        """
        """
        self.data = kwargs["data"]
        self.token = kwargs["token"]

    def post(self):
        """
        Change to get? Post used for easy json data submission
        """
        if request.data != b'':
            data = json.loads(request.data, strict=False)
            if not all(param in data for param in ["token","featureIDs","dataID"]):
                return {
                    "success" : False, 
                    "msg" : "Not all required param found."}
            if not self.token.isValid(data['token']):
                return {
                    "success": False, 
                    "tokenValid" : False, 
                    "msg":"Token is not valid."}
            
            featureIDs = data["featureIDs"]
            dataID = data["dataID"]
           # print(featureIDs)
            corrDataForHeatmap = self.data.getCorrelatedFeatures(dataID,featureIDs)
            if corrDataForHeatmap is None:
                return {
                    "success": False, 
                    "tokenValid" : True, 
                    "msg":"The dataID was not found or no features given."}

            return {"success":True, "tokenValid" : True, "correlationData":corrDataForHeatmap}