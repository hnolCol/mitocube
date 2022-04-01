from flask import request, jsonify
from flask_restful import Resource
import json

def getFilterFromRequest(request):
    featureFilter = {}
    if request.data != b'':
            data = json.loads(request.data, strict=False)
            if "filter" in data:
                featureFilter = data["filter"]
    return featureFilter 

class Features(Resource):
    def __init__(self,*args,**kwargs):
        """
        """
        self.featureFinder = kwargs["featureFinder"]
        self.token = kwargs["token"]
    

    def get(self):
        "Returns features in data"
        
        featureFilter = getFilterFromRequest(request)
        return jsonify({"success":True,"params":self.featureFinder.getFeatures(filter=featureFilter)})


class FeatureSummary(Resource):
    ""
    def __init__(self,*args,**kwargs):
        self.featureFinder = kwargs["featureFinder"]
    
    def post(self):
        ""
        if request.data != b'':
            data = json.loads(request.data, strict=False)
            if "featureIDs" in data:
                featureIDs = data["featureIDs"]
                featureFilter = getFilterFromRequest(request)
                return self.featureFinder.getSummaryInformation(featureIDs)



class FeatureDBInfo(Resource):
    """Returns DB info (e.g. Uniprot) information."""
    def __init__(self,*args,**kwargs) -> None:
        self.data = kwargs["data"]

    def post(self):
        ""
        if request.data != b'':
            data = json.loads(request.data, strict=False)
            if "featureIDs" in data:
                featureIDs = data["featureIDs"]
                
                success, DBInfo = self.data.getFeatureDBInfo(featureIDs, plainExport=False)
               
                return jsonify({"success":success,"params":DBInfo})


class FeatureDetails(Resource):
    def __init__(self,*args,**kwargs):
        ""
        self.featureFinder = kwargs["featureFinder"]
        self.token = kwargs["token"]

    def post(self):
        "Returns feature information in data"
        
        featureFilter = getFilterFromRequest(request)
       # print(featureFilter)
        features = self.featureFinder.getFeatureInfoFromDB(filter=featureFilter)
       # print(len(features))
        return jsonify({
            "success":True,
            "params":features})

class FeaturesInDatasets(Resource):
    """Find datasets in which the featureID is present"""
    def __init__(self,*args,**kwargs):
        """
        """
        self.featureFinder = kwargs["featureFinder"]
        self.token = kwargs["token"]

    def get(self):
        "Returns dataID if feature was found"
        featureFilter = {} 
        if request.data != b'':
            data = json.loads(request.data, strict=False)
            if "filter" in data:
                featureFilter = data["filter"]
            if "featureIDs" in data:
                featureIDs = data["featureIDs"] 
                return jsonify({
                    "success":True,
                    "params":self.featureFinder.getDatasets(featureIDs = featureIDs, filter=featureFilter)})
        return jsonify({"success":False,"error":"Either featureIDs not found in json data or internal error."})
        

