
from flask import request, jsonify
from flask_restful import Resource
from ..misc import isTokenValid, isAdminValid, adminTokenInValidResponse, formatDateAndAddIndexInParam
from collections import OrderedDict



class AdminDataset(Resource):
    def __init__(self,*args,**kwargs):
        """
        """
        self.data = kwargs["data"]
        self.token = kwargs["token"]
        self.detailHeaders = self.data.getAPIParam("detail-params")
        self.adminTableHeader = ["Index"] + self.data.getAPIParam("dataset-admin-table-params")
        
        self.contactViaEmailParamName = self.data.getAPIParam("dataset-admin-email-param")

    def get(self):
        "Returns the parameters of all datasets"
        
        token = request.args.get('token', default="None", type=str)
        
        if not isAdminValid(token,self.token):
            return adminTokenInValidResponse

        dataIDs = self.data.dataCollection.getDataIDs()
       
        parameters = [self.data.getParams(dataID) for dataID in dataIDs]
        filteredParameters = [formatDateAndAddIndexInParam(param,idx) for idx,param in enumerate(parameters) if param is not None]
        

        if len(filteredParameters) > 0:
            return {"success":True,"tokenIsValid" : True,"data" : {"tableHeader" : self.adminTableHeader, "params" : filteredParameters, "emailParamName" : self.contactViaEmailParamName}}
        else:
            return {"success":False,"msg":"No datasets found.","tokenIsValid" : True}

        # if params is not None:
        #     groupItems = OrderedDict([(groupingName, list(groupingItems.keys())) for groupingName, groupingItems in params["groupings"].items()])
        #     numberFeatures, _ = self.data.dataCollection[dataID].getDataShape()
        #     details = OrderedDict([("DataID",dataID)] + [(h,params[h]) for h in self.detailHeaders if h in params] + [("groupItems",groupItems)])
        #     details["Number of Proteins"] = numberFeatures

        #     orderedColumnNames = list(details.keys())
        #     if "Experimental Info" in orderedColumnNames: #ugly fix to put i
        #         orderedColumnNames.remove("Experimental Info")
        #         orderedColumnNames.append("Experimental Info")
                


            return {"success":True,"details":details,"names":orderedColumnNames}
        return {"success":False,"error":"Parameter file not found."}
