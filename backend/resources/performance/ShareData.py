from ast import Or
from re import M
from typing import OrderedDict
from flask import request, jsonify
from flask_restful import Resource
from werkzeug.security import generate_password_hash, check_password_hash
import json
REQUIRED_INFO = ["General","Metrices","Properties","Distributions"]

renameInfoToKw = {"General" : "generalInfo", "Metrices":"metrices","Properties":"properties","Distributions":"distributions","QC-Peptides":"qcPeptides"}

class ShareData(Resource):

    def __init__(self,*args,**kwargs):
        """
        """
        self.token = kwargs["token"]
        self.performance = kwargs["performance"]
    

    def get(self):
        "Returns required details (properties etc)"

        performanceColumns = self.performance.getColumnsForPerformanceData()
        uniquePropertyValues = self.performance.getUniquePropertyOptions()
        r = OrderedDict()
        for k,v in performanceColumns:
            if k not in r: r[k] = []
            r[k].append(v)

        return {
                "success":len(performanceColumns) > 0,
                "tuples":performanceColumns,
                "performanceHeaders": r,
                "uniqueProperties" : uniquePropertyValues
                }

    def post(self):
        "Adds a perfromance data."
        data = json.loads(request.data, strict=False)
        if "shareToken" in data:
            if not self.token.isShareTokenValid(data["shareToken"]):
                return {"success": False, "msg":"Share token is not valid."}
        if "token" in data:
                if not self.token.isAdminValid(data["token"]):
                    return {"success":False,"msg":"Token not valid"}
        #check data
        if not "performanceData" in data:
            return {"success": False, "msg":"no performance data found in json data... (performanceData)."}

        performanceData = data["performanceData"]
        if all(x in performanceData for x in REQUIRED_INFO):
            
            kwargs = OrderedDict([(renameInfoToKw[k],{})for k in performanceData if k in renameInfoToKw])
            for k, v in performanceData.items():
                hierarchHeaderData = dict([((k,kk),vv) for kk, vv in v.items()])
                
                if k in renameInfoToKw:
                    kwargs[renameInfoToKw[k]] = hierarchHeaderData
            ok, msg = self.performance.addPerformanceData(**kwargs)
            
            return {"success": ok, "msg":msg}
        else:
            return {"success":False,"msg":"Not all required data found "+";".join(REQUIRED_INFO)}
            
        
