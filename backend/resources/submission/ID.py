from logging import PlaceHolder
from flask import request
from flask_restful import Resource
import json
from datetime import date
from ...helper.Misc import getRandomString

class DataID(Resource):
    def __init__(self,*args,**kwargs):
        """
        """
        self.token = kwargs["token"]
        self.data = kwargs["data"]
        
        
    def get(self):
        "Returns features in data"
        token = request.args.get('token', default="None", type=str)
        if token == "None" or not self.token.isValid(token):
            return {"success":False,"error":"Token is not valid."}
        else:

            ID = getRandomString(N=12)
            if ID in self.data.dfs:
                #highly unlikely 
                ID = getRandomString(N=12)
            
            return {"success":True,"id":ID,"time":date.today().strftime("%Y%m%d")}


details = [
    {"field":"text-input","q":"Title","opts":None,"default":"","placeholder":"Enter your project's title.","name":"title"},
    {"field":"text-input","q":"Name","opts":None,"default":"","placeholder":"Enter your name.","name":"Researcher"},
    {"field":"text-input","q":"Email adresse","placeholder":"Email adresse","name":"email","leftIcon":"envelope","intent":"primary"},
    {"field":"textfield-input","q":"Research aim","placeholder":"Please provide a short description of your project and it's research aims.","name":"Research Aim","title":"Research Aim"},
    {"field":"combo-input","q":"Organism","items":["Homo sapiens (Human)", "Mus musculus (Mouse)", "Caenorhabditis elegans (Worm)", "Saccharomyces cerevisiae (Baker's Yeast)"],"name":"Organism","text":"Organism"},
    {"field":"combo-input","q":"Experiment type","items":["Whole proteome","Neo N-term enrichment","Phophoproteome","Whole proteome & Neo N-term enrichment","Whole proteome & phospho"],"name":"Type","text":"Experiment Type"},
    {"field":"numeric-input","q":"Number of samples","min":1,"max":5000,"minorStepSize":1,"defaultValue":2,"placeholder":"Number of samples.","name":"n_samples"},
    {"field":"numeric-input","q":"Number of replicates","min":1,"max":5000,"minorStepSize":1,"defaultValue":2,"placeholder":"Number of replicate per group.","name":"n_replicates"},
    {"field":"text-input","q":"Material","placeholder":"Material used (HeLa,Liver,..)","name":"Material"},
    {"field":"textfield-input","q":"Experimental procedure","placeholder":"Please provide details about the experimental procedure of cell culture / treatments","name":"Experimental Info","title":"Experimental procedure"},
    {"field":"textfield-input","q":"Notes","placeholder":"Please provide additional information if required. Examples might be about a bias in sample preparation. Experimental errors.  Batch effects.","name":"Add. Info","title":"Additional Information"},
    {"field":"numeric-input","q":"Number of groupings","min":1,"max":5000,"minorStepSize":1,"defaultValue":2,"placeholder":"Number of groupings (Genotype, Treatment, ..).","name":"n_groupings"},
]



class DataSubmissionDetails(Resource):
    def __init__(self,*args,**kwargs):
        """
        """
        self.token = kwargs["token"]
    
    def get(self):
        "Returns features in data"
        token = request.args.get('token', default="None", type=str)
        if token == "None" or not self.token.isValid(token):
            return {"success":False,"error":"Token is not valid."}

        return {"success":True,"details":details}
        

