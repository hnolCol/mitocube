from logging import PlaceHolder
from typing import OrderedDict

import pandas as pd 
from flask import request
from flask_restful import Resource
import json
from datetime import date
from ...helper.Misc import getRandomString


def createEmailSummaryForProject(sampleSubmission):
    ""
    return "<div><h3>Submission complete {}</h3><p>Dear {} <br>Thank you very much for your sample submission. Please let us know where the samples are stored (-80°C rack).</p><p>Submission Summary</p><h4>{}</h4><ul><li>Number of Sample : {}</li></ul><p>Please just reply to this email if you have any question.</p><p>The MitoCube Team</p></div>".format(sampleSubmission["dataID"],sampleSubmission["Experimentator"],sampleSubmission["Title"],sampleSubmission["SampleNumber"])


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
    {"field":"text-input","q":"Research Question","opts":None,"default":"","placeholder":"What question would you like to answer with your project.","name":"ResearchQuestion"},
    {"field":"text-input","q":"Name (First and last)","opts":None,"default":"","placeholder":"Enter your name.","name":"Experimentator"},
    {"field":"date-input","q":"Date of Sample Subbmission","opts":None,"default":date.today().strftime("%Y%m%d"),"placeholder":"Enter data of sample collection.","name":"Creation Date"},
    {"field":"text-input","q":"Email adresse","placeholder":"Email adresse","name":"email","leftIcon":"envelope","intent":"primary"},
    {"field":"textfield-input","q":"Research aim","placeholder":"Please provide a short description of your project and it's research aims.","name":"Research Aim","title":"Research Aim"},
    {"field":"combo-input","q":"Organism","items":["Homo sapiens (Human)", "Mus musculus (Mouse)", "Caenorhabditis elegans (Worm)", "Saccharomyces cerevisiae (Baker's Yeast)","Other (Specify in Additional Info)"],"name":"Organism","text":"Organism"},
    {"field":"combo-input","q":"Experiment type","items":["Whole proteome","Neo N-term enrichment","Phophoproteome","Pulse-SILAC","Immunoprecipitation","Whole proteome & Neo N-term enrichment","Whole proteome & phospho"],"name":"Type","text":"Experiment Type"},
    {"field":"numeric-input","q":"Number of samples","min":1,"max":5000,"minorStepSize":1,"defaultValue":2,"placeholder":"Number of samples.","name":"n_samples"},
    {"field":"numeric-input","q":"Number of replicates","min":1,"max":5000,"minorStepSize":1,"defaultValue":2,"placeholder":"Number of replicate per group.","name":"n_replicates"},
    {"field":"text-input","q":"Material","placeholder":"Material used (HeLa,Liver,..)","name":"Material"},
    {"field":"textfield-input","q":"Experimental procedure","placeholder":"Please provide details about the experimental procedure of cell culture / treatments. In addition, provide the cell culture media and supplements.","name":"Experimental Info","title":"Experimental procedure"},
    {"field":"textfield-input","q":"Notes","placeholder":"Please provide additional information if required. Examples might be about a bias in sample preparation. Experimental errors.  Batch effects.","name":"Add. Info","title":"Additional Information"},
    {"field":"numeric-input","q":"Number of groupings","min":1,"max":5000,"minorStepSize":1,"defaultValue":2,"placeholder":"Number of groupings (Genotype, Treatment, ..).","name":"n_groupings"},
]



class DataSubmissionDetails(Resource):
    def __init__(self,*args,**kwargs):
        """
        """
        self.token = kwargs["token"]
        self.email = kwargs["email"]
    
    def get(self):
        "Returns features in data"
        token = request.args.get('token', default="None", type=str)
        if token == "None" or not self.token.isValid(token):
            return {"success":False,"error":"Token is not valid."}

        return {"success":True,"details":details}


    def post(self):
        "Returns JSON object"
       
        if request.data != b'':
            data = json.loads(request.data, strict=False)
            
            token = data["token"]
            
            if token == "None" or not self.token.isValid(token):
                return {"success":False,"error":"Token is not valid."}
            
            else:
                    submission = data["submission"]
                    print(submission)
                    sampleSubmission = OrderedDict() 
                    sampleSubmission["Creation Date"] = submission["time"]

                    for submissionName, submissionSaveName in [
                                        ("id","dataID"),
                                        ("Experimentator","Experimentator"), 
                                        ("title","Title"), 
                                        ("Research Aim","shortDescription"),
                                        ("Material","Material"),
                                        ("Organism","Organism"),
                                        ("n_samples","SampleNumber"),
                                        ("email","Email")]:
                        
                        if submissionName in submission:
                            sampleSubmission[submissionSaveName] =  submission[submissionName]
                        elif submissionName in submission["details"]:
                            sampleSubmission[submissionSaveName] =  submission["details"][submissionName]

                    sampleSubmission["Experimental Info"] = [
                        {"title":"Research Aim", "details":submission["details"]["ResearchQuestion"]},
                        {"title":"Cell culture", "details":submission["details"]["Experimental Info"]}
                    ]  

                    groupingDf = pd.DataFrame().from_dict(submission["groupingTable"]["data"])
                    groupingDf = groupingDf.dropna(axis=1,how="any")
                   
                    groupingNames = [colName for colName in groupingDf.columns if colName not in ["Run","Replicate"]]

                    self.email.sendEmail(title="MitoCube - Submission Complete {}".format(sampleSubmission["dataID"]), 
                                        html= createEmailSummaryForProject(sampleSubmission), recipients = [sampleSubmission[submissionSaveName]])
                        #body = "Sample Submission for your project completed. Thank you. Currently more than XX projects are incompleted that were submitted previously.")
                    
                    
                    if len(groupingNames) == 0:
                        return {"success":False,"msg":"Groupings could not be found/infered. All columns/row completed?"}
                    groupings = OrderedDict() 
                    sampleSubmission["groupingNames"] = groupingNames
                    for groupingName in groupingNames:
                        groupItems = groupingDf[groupingName]
                        grouping = OrderedDict([(uniqueGroupItem.strip(),[]) for uniqueGroupItem in groupItems.unique()])
                        for run,group in groupingDf[["Run",groupingName]].values:
                            grouping[group.strip()].append(run)
                        groupings[groupingName.strip()] = grouping
                    sampleSubmission["groupings"] = groupings
                    

                    with open("params.json", 'w', encoding='utf-8') as f:
                        json.dump(sampleSubmission, f, ensure_ascii=False, indent=4)

                    return {"success":True,"sampleSubmission":{}}


        return {"success":False,"msg":"missing json data"}



        

# {
#     "Creation Date": "20220105 15:54:49",
#     "Software": "Instant Clue",
#     "Version": "0.10.10.20211105",
#     "Computer": "TL-047",
#     "Experimentator" : "Hendrik Nolte",
#     "groupingNames" : ["Treat","Time (h)"],
#     "Type" : "Whole proteome",
#     "Material" : "HeLa",
#     "Organism" : "Homo sapiens (Human)",
# #     "shortDescription" :  "Time series in HeLa afte"Experimental Info" : [
#         {
#             "title" : "Protein Digestion",
#             "details" : "I have done this cool experiment."
#         },
#         {
#             "title" :  "Liquid Chromatography and Mass Spectrometry",
#             "details" : "Insturmentation consisted out of an Exploris 480. Yeaahha"
#         }
#     ],