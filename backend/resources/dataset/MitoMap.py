from flask import request, jsonify
from flask_restful import Resource

from collections import OrderedDict
import json 
import os

class DatasetsMitoMap(Resource):
    def __init__(self,*args,**kwargs):
        """
        """
        self.data = kwargs["data"]
        self.token = kwargs["token"]
        

    def get(self):
        "Returns MitoMap Data"
        
        token = request.args.get('token', default="None", type=str)
        if token == "None" or not self.token.isValid(token):
            return {"success":False,"error":"Token is not valid."}
        dataID = request.args.get('dataID', default="None", type=str)
        anovaDetails = json.loads(request.args.get("anovaDetails",default="{}",type=str))
        success, details = self.data.getMitoMapData(dataID,anovaDetails)
        if not success:
            return jsonify({"success":success,"error":details})
        else:
            return jsonify({"success":success,"data":details})
       