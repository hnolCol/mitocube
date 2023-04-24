from flask import request, jsonify
from flask_restful import Resource

class Filter(Resource):
    def __init__(self,*args,**kwargs):
        """
        """
        self.data = kwargs["data"]
        self.token = kwargs["token"]
       
    
    def get(self):
        "Returns features in data"
        
        return {"success":True,"params":self.data.getFiltersOptions()}
        
        
        