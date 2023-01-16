from flask import request, jsonify
from flask_restful import Resource
import json 
import pandas as pd 
from ..misc import isTokenInRequestDataValid

class FileStorageService(Resource):
    "Download quantitative matrix."
    def __init__(self,*args,**kwargs):
        """
        """
        self.data = kwargs["data"]
        self.token = kwargs["token"]

    def get(self):
        """Returns the dataset"""
        token = request.args.get('token', default="None", type=str)
        if not self.token.isValid(token):
            return {"msg":"Token is not valid.","success":False}
        dataID = request.args.get('dataID', default="None", type=str)
        matrix = self.data.getDataByDataID(dataID).reset_index()
        params = self.data.getParams(dataID)
        if matrix is None or params is None:
            return {
                "success":False,
                "msg":"DataID not found.."
                }
        else:
            return {
                "success":True,
                "msg":"Data found and attached.",
                "data" : matrix.fillna("").to_dict(orient="records"),
                "params" : params
                }

    def post(self):
        """Add data to database (usually from submission)"""

        if request.data != b'':
            succes, res = isTokenInRequestDataValid(request.data,self.token)
            if not succes:
                return {"success":False,"msg":res}

            if all(paramName in res for paramName in ["values","paramsFile","columnNames","dataID"]):

                dataID, values, paramsFile, columnNames = res["dataID"] ,res["values"], res["paramsFile"], res["columnNames"]
                if self.data.dataIDExists(dataID):
                    return {"success":False,"msg":"DataID exists already. Please use the put method to update a dataset."}
                try:
                    df = pd.DataFrame(values, columns=columnNames).set_index("Key",drop=True)
                except Exception as e:
                    return {"success":False,"msg":f"There was an error reading the values/columnNames {e}"}

                succees = self.data.addDatasetToStorage(dataID,df,paramsFile)
                if succees:
                    return {"success":True,"msg":f"Data added - {dataID}"}
                return {"success":False,"msg":"There was an error while adding the data to the database."}

            else:
                return {"success":False,"msg":"Missing paramName. Requires: 'dataID', 'values', 'columnNames', and 'paramsFile'"}