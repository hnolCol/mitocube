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
                #featureFilter = getFilterFromRequest(request)
                return self.featureFinder.getSummaryInformation(featureIDs)



class FeatureDBInfo(Resource):
    """Returns DB info (e.g. Uniprot) information."""
    def __init__(self,*args,**kwargs) -> None:
        self.data = kwargs["data"]
        self.token = kwargs["token"]

    def get(self):
        ""
        token = request.args.get('token', default="None", type=str)
        if not self.token.isValid(token):
            return {"msg":"Token is not valid.","success":False,"tokenIsValid" : False}
        featureID = request.args.get("featureID",default= None,type=str)
        if featureID is None:
            return {"success" : False, "tokenIsValid" : True, "msg" : "No featureID found."}
        DBInfo = self.data.getFeatureDBInfo([featureID], plainExport= False)
        return {"success" : DBInfo is not None, "tokenIsValid" : True, "params" : DBInfo}

class FeatureDetails(Resource):
    def __init__(self,*args,**kwargs):
        ""
        self.featureFinder = kwargs["featureFinder"]
        self.token = kwargs["token"]

    def post(self):
        print("FeatureDetails.post()")
        "Returns feature information in data"
        print(" ? 1")
        featureFilter = getFilterFromRequest(request)
        print(" ? 2")
        features = self.featureFinder.getFeatureInfoFromDB(filter=featureFilter)
        print(" ? 3")
        featureLabels = self.featureFinder.getFeatureLabels()
        print(" ? 4")
        sortByColumnName = self.featureFinder.getFeatureSortByColumnName()
        print(" ? 5")
        return {
            "success":True,
            "features":features,
            "sortBy" : sortByColumnName,
            "featureLabels" : featureLabels}

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
        return {"success":False,"error":"Either featureIDs not found in json data or internal error."}
        

