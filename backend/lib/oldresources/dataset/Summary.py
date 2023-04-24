from flask import request, jsonify
from flask_restful import Resource


# class DatasetSummary(Resource):
#     def __init__(self,*args,**kwargs):
#         """
#         """
#         self.data = kwargs["data"]
#         self.token = kwargs["token"]

#     def get(self):
#         ""
#         return jsonify({"message":"success","summary":self.data.getSummary()})





class DatasetsSummary(Resource):
    "Summary of all datasets available."
    def __init__(self,*args,**kwargs):
        """
        """
        self.data = kwargs["data"]
        self.token = kwargs["token"]

    def get(self):
        ""
        token = request.args.get('token', default="None", type=str)
        if not self.token.isValid(token):
            return {"msg":"Token is not valid.","success":False,"tokenIsValid" : False}
        
        df = self.data.getDataSummary()
        tagNames = self.data.getAPIParam("dataset-tag-names")#names that describe a dataset
        searchNames = self.data.getAPIParam("dataset-search-names")
        datasetHeader = self.data.getAPIParam("dataset-header")
        return {
            "success":True,
            "tokenIsValid" : True,
            "datasets": df.fillna("-").to_dict(orient="records"),
            "tagNames":tagNames, 
            "headerName" : datasetHeader,
            "searchNames":searchNames}