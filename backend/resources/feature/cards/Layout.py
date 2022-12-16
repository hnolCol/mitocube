from flask import request, jsonify
from flask_restful import Resource
from ..Features import getFilterFromRequest
import pandas as pd
import json

def getSummaryCardDetails(featureID):
    ""
    return {"id":featureID,"cardType":"summary","dataID":None,"featureID":featureID,"filterName":"Summary","filterColor":"#efefef","shortDescription":"Regulation Overview"}


def getCardLayout(cs,numColumns,w=2,h=2):
    ""
    r = []
    nr = 0 
    nc = 0 
    for n,k in enumerate(cs):
        if n == 0:
            pass
        else:
            if nr + w > numColumns:
                nr = 0
                nc += h
            else:
                nr += w 

        c = {
            "i":k["id"],
            "x":nr,
            "y": nc,
            "w":w,
            "h":h,
            "static":False
            }
        r.append(c)
    return r 





class CardLayout(Resource):
    def __init__(self,*args,**kwargs):
        """
        """
        self.data = kwargs["data"]
        self.token = kwargs["token"]
        self.featureFinder = kwargs["featureFinder"]
    
    def post(self):
        "Returns details about the cards and the layout"
        
        if request.data != b'': 

            data = json.loads(request.data, strict=False)
            if not "token" in data:
                return {"success":False, "error" : "No Token detected."}
            if not self.token.isValid(data['token']):
                return {"success":False, "error":"Token is not valid."}
            if all(x in data for x in ['token','featureIDs','columnNumber']):

                featureIDs = [f["Entry"] for f in data["featureIDs"]]
                columnNumberBreakpoints = data["columnNumber"]
                dataIDFilter  = getFilterFromRequest(request)
                filterParamName = self.data.getAPIParam("short-cut-filter-param")

                dataIDsByFeature = self.featureFinder.getDatasets(featureIDs, dataIDFilter, returnNumberOfData=False,featureSpecFilter= {})
                
                shortCutFiltersByFeatures = dict([(k,pd.Series([self.data.getParam(dataID,filterParamName) for dataID in dataIDs]).unique().tolist()) for k,dataIDs in  dataIDsByFeature.items() ])
                shortCutFilterColors = self.data.getFilterColors()
               
                summaryCards = [getSummaryCardDetails(k) for k in dataIDsByFeature.keys()]
                summaryData = self.featureFinder.getSummaryInformation(featureIDs)
              
                summaryChartData = self.featureFinder.getSummaryInformationForCharts(featureIDs,summaryData)
                featureCards = [{
                        "id":"{}_{}".format(featureID,dataID),
                        "dataID":dataID,
                        "featureID":featureID,
                        "filterName":self.data.getParam(dataID,filterParamName),
                        "shortDescription":self.data.getParam(dataID,"shortDescription"),
                        "filterColor":shortCutFilterColors[self.data.getParam(dataID,filterParamName)]} for featureID,dataIDs in dataIDsByFeature.items() for dataID in dataIDs]

                layouts = {}
                cards = {}
                for featureID in featureIDs:
                    
                    cs = [c for c in summaryCards + featureCards if c["featureID"] == featureID]
                    
                    ll = {}
                    for bp, columnNumber in columnNumberBreakpoints.items():
                        ll[bp] = getCardLayout(cs,columnNumber)#[{
                        
                    layouts[featureID] = ll
                    cards[featureID] = [
                        {"id":k["id"],"Entry":k["featureID"]} 
                            if "filterName" not in k else 
                            {
                                "id":k["id"],
                                "Entry":k["featureID"],
                                "filterName":k["filterName"],
                                "filterColor":k["filterColor"],
                                "shortDescription":k["shortDescription"],
                                "dataID" : k["dataID"],
                                "chartData" :  summaryChartData[k["featureID"]] if k["filterName"] == "Summary" else self.data.getDataForCard(k["dataID"],k["featureID"],k["filterName"]),
                            } 
                                    for k in cs]
            
                return {
                    "success":True,
                    "layout":layouts,
                    "cards":cards,
                    "filter":shortCutFiltersByFeatures,
                    "filterColors":shortCutFilterColors,
                    "activeFilter":[]
                    }
            
        return {"success":False, "error":"Error not sufficient data provided. JSON data must contain 'token','featureIDs' and 'columnNumber'"}