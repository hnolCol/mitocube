from flask import request, jsonify
from flask_restful import Resource


class DatasetParams(Resource):
    def __init__(self,*args,**kwargs):
        """
        """
        self.data = kwargs["data"]
        self.token = kwargs["token"]

    def get(self):
        ""
        dataID = request.args.get('dataID', default="None", type=str)
        return jsonify({"message":"success","params":self.data.getParams(dataID)})