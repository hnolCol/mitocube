from flask import request, jsonify
from flask_restful import Resource
import json 
import pandas as pd 
from ..misc import isTokenInRequestDataValid, isTokenValid, adminTokenInValidResponse, isAdminValid, formatDateAndAddIndexInParam
from werkzeug.security import generate_password_hash, check_password_hash


class FileStorageServiceWithoutToken(Resource):
    ""
    def __init__(self,*args,**kwargs):
        """
        """
        self.data = kwargs["data"]
        self.token = kwargs["token"]
        self.pwHash = generate_password_hash(self.data.getWebsitePassword())

    def post(self):
        "Should be post due to pw sending in plaint text"
        #this should not be the case, showing prupose for seminar.
        #would be better to login first, then save the token in InstantClue 
        #add shareToken? 
        data = json.loads(request.data, strict=False)
        if "dataID" not in data:
            return {"success":False,"msg":"DataID not found."}
        if "pw" in data:
            if check_password_hash(self.pwHash,data["pw"]):
                dataID = data["dataID"]
                if not self.data.dataIDExists(dataID):
                    return {"success" : False, "msg" : "DataID does not exist."}
                matrix = self.data.getDataByDataIDWithAnnotations(dataID).reset_index()
                params = self.data.getParams(dataID)
                return {
                    "success" : True, 
                    "msg" : "Login successful. Data and Groupings will be added to the data frames.", 
                    "data" : matrix.fillna("NaN").to_dict(), 
                    "params" : params}

        return {"success" : False, "msg" : "Login not successful. Please check the password."}

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
        if not isTokenValid(token,self.token):
            return adminTokenInValidResponse #admin? 
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

    def delete(self):
        """Moves dataset into the archive"""
        data = json.loads(request.data, strict=False)
        token = data["token"]
        if not isAdminValid(token,self.token):
                return adminTokenInValidResponse
        dataID = data["dataID"]
        if self.data.dataIDExists(dataID):
            print("removing dataID")
            self.data.transferDataToArchive(dataID)
            dataIDs = self.data.dataCollection.getDataIDs()
       
            parameters = [self.data.getParams(dataID) for dataID in dataIDs]
            filteredParameters = [formatDateAndAddIndexInParam(param,idx) for idx,param in enumerate(parameters) if param is not None]
            return {"success":True,"msg":f"Data moved to archive - {dataID}","data":{"params" : filteredParameters}}
        return {"success":False,"msg":"DataID does not exists."}