from flask import request, jsonify
from flask_restful import Resource


class DatasetSummary(Resource):
    def __init__(self,*args,**kwargs):
        """
        """
        self.data = kwargs["data"]
        self.token = kwargs["token"]

    def get(self):
        ""
        return jsonify({"message":"success","summary":self.data.getSummary()})



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
        if token == "None" or not self.token.isValid(token):
            return {"error":"Token is not valid.","success":False}
        else:
            df = self.data.getDataSummary()
           
            return {"success":True,"data":df.to_json(orient="records")}