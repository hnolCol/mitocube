
from flask import request
from flask_restful import Resource
from backend.lib.oldresources.misc import isAdminValid, adminTokenInValidResponse

from collections import OrderedDict

class DatasetExample(Resource):
    def __init__(self,*args,**kwargs):
        """
        """
        self.data = kwargs["data"]
        self.token = kwargs["token"]

    def get(self):
        ""

        return {"success" : True}

class DatasetParamsExample(Resource):
    def __init__(self,*args,**kwargs):
        """
        """
        self.data = kwargs["data"]
        self.token = kwargs["token"]
        

    def get(self):
        "Returns a paramFile example."
        token = request.args.get('token', default="None", type=str)
        
        if not isAdminValid(token,self.token):
            return adminTokenInValidResponse

        paramsExample = OrderedDict()
        submissionDetails = self.data.getAPIParam("submission-details")
        experimentalInfoHeaders = self.data.getAPIParam("submission-summarize-as-experimentalInfo")

        for submissionDetail in submissionDetails:
            detailName = submissionDetail["name"]
            if submissionDetail["field"] == "numeric-input":
                paramsExample[detailName ] =  "<Integer Number>"
            elif submissionDetail["field"] == "combo-input" and "items" in submissionDetail:
                availableItems = submissionDetail["items"]
                itemStringJoined = ", ".join(availableItems)
                paramsExample[detailName ] =  f"Any <String> in [{itemStringJoined}]"
            else:
                #handle intern params
                if detailName == "State": #to match submission based datasets
                    paramsExample[detailName] =  "Done"
                elif detailName == "Creation Date": #to match submission based datasets
                    paramsExample[detailName] =  "Date of format: YYYYMMDD"
                else:
                    paramsExample[detailName ] =  "<String>"

        #add experimental info headers
        paramsExample["Experimental Info"] = []
        for expHeader in experimentalInfoHeaders:
            paramsExample["Experimental Info"].append({
                "title" : expHeader,
                "details" : "Fill details here..."
            })
        ##add MitoCube internal groupings
        paramsExample["groupings"] = {"groupingName1" : {"groupName-1" : ["sampleName01","sampleName02"], "groupName-2" : ["sampleNames03","sampleName04"]}}
        paramsExample["groupingNames"] = ["groupingName1"]
        paramsExample["groupingCmap"] = {"groupingName1" : "<string>: Blues color palette"}
        return {"success" : True, "paramsFile" : paramsExample, "tokenIsValid" : True}