from requests import delete
from flask import request, jsonify, make_response
from flask_restful import Resource
from collections import OrderedDict
import json

import numpy as np 
import pandas as pd 


class PTMView(Resource):
    def __init__(self,*args,**kwargs):
        """
        """
        self.token = kwargs["token"]
        self.ptmManager  = kwargs["ptm"]
        self.libs = kwargs["libs"]

    def get(self):
        ""
        token = request.args.get('token', default="None", type=str)
        featureID = request.args.get('featureID', default="None", type=str)
        #print(featureID)
        r = self.libs.getLibEntriesByFeatureID([featureID])
        print(r)
        print("///")
        libPeptidePositions, N = self.ptmManager.localizeLibFeatures(featureID,r)
        print(libPeptidePositions)
        print("====")
       # print(r)
        #fake data to mimic something.
        pepitdes  = np.array([[5,34],[-5,34],[15,30],[45,60],[29,46],[61,70],[1,4],[250,290],[240,295],[230,260]])#start, end, id
        peptides2 = np.array([[6,34],[13,30],[45,60],[29,46],[61,70],[1,4]])#start, end, id
        peptides3 = np.array([[126,134],[220,246]])#start, end, id
        activeSites = np.array([[20,25]])



        self.ptmManager.getPTMPeptides([featureID])
       # N = 300
        response = {}
        annotations = OrderedDict([
                ("Active Site" , pd.DataFrame(activeSites,columns=["start","end"])), 
                ("Phosphorylation" , pd.DataFrame(pepitdes,columns=["start","end"])), 
                ("Acetlyation" , pd.DataFrame(peptides2,columns=["start","end"])),
                ("Glocylsation" , pd.DataFrame(peptides3,columns=["start","end"]))] + [(libName,pd.DataFrame(libPeptidePos,columns=["start","end"])) for libName, libPeptidePos in libPeptidePositions.items()])
               
            
        # else:
        #     annotations = OrderedDict([
        #         ("Active Site" , pd.DataFrame(activeSites,columns=["start","end"])), 
        #         ("Phosphorylation" , pd.DataFrame(pepitdes,columns=["start","end"])), 
        #         ("Acetlyation" , pd.DataFrame(peptides2,columns=["start","end"])),
        #         ("Glocylsation" , pd.DataFrame(peptides3,columns=["start","end"])),
        #         ("HEK-GFP" , pd.DataFrame(libPeptidePositions,columns=["start","end"]))
        #     ])

        
        annotationPositioned, sites = self.ptmManager.annotations(N,annotations).calculatePostions(False)
       # print(ptmAnnotations)
        response ["annotations"] = annotationPositioned
        response ["sites"] = sites
        response ["length"] = N 
        response ["success"] = True
            
        return response

class PTMItems(Resource):
    def __init__(self,*args,**kwargs):
        ""
        self.token = kwargs["token"]
        self.ptmManager = kwargs["ptm"]

    def get(self):
        ""
        token = request.args.get('token', default="None", type=str)
        
        if token == "None" or not self.token.isValid(token):
            return {"success":False,"error":"Token is not valid. Please login again."}
        
        
        #get colors for annotations
        annotationColors = {"Active Site" : "orange","Phosphorylation":"#0066e7","Acetlyation":"#ff0000","Glocylsation":"#53a200"}
                    
        features = self.ptmManager.getFeatures()# [{"ID":str(s),"title" : "Protein"+str(s),"Species": "Homo sapiens" if s % 2 else "Mus Musculus"}for s in range(100)]
        #items = genItems
       # print(features)
      
        return {
                "success":True, 
                "searchItems" : {
                        "annotationColors" : annotationColors,
                        "identifierColumn" : "Entry",
                        "titleColumn" : "Gene names",
                        "categoricalColumns" : ["Organism"],
                        "items" : features}
                }

    