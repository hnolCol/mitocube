from typing import OrderedDict
from flask import request
from flask_restful import Resource
import json
from backend.lib.oldresources.misc import isAdminValid, adminTokenInValidResponse


REQUIRED_INFO = ["General","Metrices","Properties","Distributions","QC-Peptides"]

renameInfoToKw = {"General" : "generalInfo", "Metrices":"metrices","Properties":"properties","Distributions":"distributions","QC-Peptides":"qcPeptides","Misc":"misc"}



class ShareDataDetails(Resource):

    def __init__(self,*args,**kwargs):
        """
        """
        self.token = kwargs["token"]
        self.performance = kwargs["performance"]
    

    def get(self) -> dict:
        "Returns required details (properties etc)"

        token = request.args.get('token', default="None", type=str)
        if not isAdminValid(token, self.token):
            return adminTokenInValidResponse

        performanceColumns = self.performance.getRequiredInfo()
        uniquePropertyValues = self.performance.getUniquePropertyOptions()
        r = OrderedDict()
        for k,v in performanceColumns:
            if k not in r: r[k] = []
            r[k].append(v)

        return {
                "success":len(performanceColumns) > 0,
                "tuples":performanceColumns, #tuples shounds like a weird name
                "performanceHeaders": r,
                "uniqueProperties" : uniquePropertyValues
                }


class ShareData(Resource):

    def __init__(self,*args,**kwargs):
        """
        """
        self.token = kwargs["token"]
        self.performance = kwargs["performance"]
        self.data = kwargs["data"]

    def get(self) -> dict:
        "Returns performance data"

        token = request.args.get('token', default="None", type=str)
        if not isAdminValid(token, self.token):
            return {"success":False,"msg":"Token is not valid."}
        
        if self.performance.df.index.size == 0:
            return {"success":False,"msg":"No performance runs found. Please add them using the add button in the top right corner or add data using the share token that you can create at admin/users."}

        performanceDataByProperty, groupbyProps, matchingGroupNames, performanceConfig, mainGroupProperty = self.performance.getPerformanceData()
        
        #extract property info 
        propertyInfo = dict(
            [(k,dict([(columnName, groupbyProps.get_group(tuple(v))[("Properties",columnName)].values[0]) 
                            for columnName in self.performance.performanceConfig["Properties"]])) for k,v in matchingGroupNames.items()])
        
        #self.performance.propertyOptions
        groupDetails = [{**{
                    "name" : " - ".join(v), 
                    "key" : k, 
                    "size" : groupbyProps.get_group(tuple(v)).index.size, 
                    }, 
                    **propertyInfo[k]  
                        } for k,v in matchingGroupNames.items()]   #"timestamp" : groupbyProps.get_group(tuple(v))[("General","Timestamp")].values[0]

        #metricDistanceData, metricDistribution = self.performance.getLastRunDistance(groupbyProps)
        mainGroupUniqueValue = self.performance.getUniqueMainGroup()

        return {
                "success":True,
                "performanceData" : performanceDataByProperty, 
                "matchingGroupNames" : matchingGroupNames, 
                "groupDetails" : groupDetails,
               # "metricDistance" : metricDistanceData, 
                #"metricDistributions" : metricDistribution,
                "metricColors" : self.data.getAPIParam("performance-metrices-colors"),
                mainGroupProperty: mainGroupUniqueValue,
                "mainGroup" : mainGroupProperty,
                "performanceConfig" : performanceConfig,
                "msg": f"Found {self.performance.df.index.size} performance run(s) and {len(groupbyProps)} property group(s). Property groups are unique combinations of the following properties: {', '.join(performanceConfig['Properties'])}."
                }

    def post(self) -> dict:
        "Adds a perfromance data."

        data = json.loads(request.data, strict=False)

        if all(tokenType not in data for tokenType in ["shareToken","token"]):
            return {"success": False, "msg":"Neither shareToken not token found."}

        if "shareToken" in data:
            if not self.token.isShareTokenValid(data["shareToken"]):
                return {"success": False, "msg":"Share token is not valid."}

        if "token" in data:
            if not isAdminValid(data["token"], self.token):
                return {"success":False,"msg":"Token not valid and shareToken not found."}
      
        if not "performanceData" in data:
            return {"success": False, "msg":"no performance data found in json data... (performanceData)."}

        performanceData = data["performanceData"]
        
        if all(x in performanceData for x in REQUIRED_INFO):
            
            kwargs = OrderedDict([(renameInfoToKw[k],{})for k in performanceData if k in renameInfoToKw])
            for k, v in performanceData.items():
                if isinstance(v,dict):
                    hierarchHeaderData = dict([((k,kk),vv) for kk, vv in v.items()])
                    if k in renameInfoToKw:
                        kwargs[renameInfoToKw[k]] = hierarchHeaderData

            ok, msg = self.performance.addPerformanceData(**kwargs)
            return {"success": ok, "msg":msg}
        else:
            return {"success":False,"msg":"Not all required data found "+";".join(REQUIRED_INFO)}
            
        
