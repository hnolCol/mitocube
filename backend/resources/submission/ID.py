
from typing import OrderedDict

import pandas as pd 
from flask import request
from flask_restful import Resource
import json
from datetime import date



def createEmailSummaryForProject(sampleSubmission):
    ""
    return "<div><h3>Submission complete {}</h3><p>Dear {} <br>Thank you very much for your sample submission. Please let us know where the samples are stored (-80°C rack).</p><p>Please save the dataID assigned to your project in your documents: {}<p><p>Submission Summary</p><h4>{}</h4><ul><li>Experimentator : {}</li><li>Number of Sample : {}</li><li>Material : {}</li><li>Organism : {}</li><li>Groupings : {}</li></ul><p><h4>Project Summary</h4><p>{}</p>Please just reply to this email if you have any question.</p><p>The MitoCube Team</p></div>".format(sampleSubmission["dataID"],sampleSubmission["Experimentator"],sampleSubmission["dataID"],sampleSubmission["Title"],sampleSubmission["Experimentator"],sampleSubmission["SampleNumber"],sampleSubmission["Material"],sampleSubmission["Organism"],",".join(sampleSubmission["groupingNames"]),sampleSubmission["shortDescription"])


class DataID(Resource):
    def __init__(self,*args,**kwargs):
        """
        """
        self.token = kwargs["token"]
        self.submission = kwargs["submission"]
        self.data = kwargs["data"]

        
        
    def get(self):
        "Returns features in data"
        token = request.args.get('token', default="None", type=str)
        if token == "None" or not self.token.isValid(token):
            return {"success":False,"error":"Token is not valid."}
        else:
            ID = self.submission.getID()
            
            return {"success":True,"id":ID,"time":date.today().strftime("%Y%m%d")}

## put this in the configuration file...
details = [
    {"field":"text-input","q":"State","opts":None,"default":"Submitted","placeholder":"State of your project.","name":"State", "disabled" : True},
    {"field":"date-input","q":"Date of Sample Submission","opts":None,"default":date.today().strftime("%Y%m%d"),"placeholder":"Enter data of sample collection.","name":"Creation Date"},
    {"field":"text-input","q":"Name (First and last)","opts":None,"default":"","placeholder":"Enter your name.","name":"Experimentator"},
    {"field":"text-input","q":"Email adresse","placeholder":"Email adresse","name":"email","leftIcon":"envelope","intent":"primary"},
    {"field":"text-input","q":"Group Name","opts":None,"default":"Langer Department","placeholder":"Enter the group / principal investigator name.","name":"GroupName"},
    {"field":"text-input","q":"Title","opts":None,"default":"","placeholder":"Enter your project's title.","name":"title"},
    {"field":"text-input","q":"Research Question","opts":None,"default":"","placeholder":"What question would you like to answer with your project.","name":"ResearchQuestion"}, 
    {"field":"textfield-input","q":"Research Aim","placeholder":"Please provide a short description of your project and it's research aims.","name":"Research Aim","title":"Research Aim"},
    {"field":"combo-input","q":"Organism","items":["Homo sapiens (Human)", "Mus musculus (Mouse)", "Caenorhabditis elegans (Worm)", "Saccharomyces cerevisiae (Baker's Yeast)","Other (Specify in Additional Info)"],"name":"Organism","text":"Organism"},
    {"field":"combo-input","q":"Experiment type","items":["Whole proteome","Neo N-term enrichment","Phophoproteome","Pulse-SILAC","Immunoprecipitation","Whole proteome & Neo N-term enrichment","Whole proteome & Phosphoproteomic","Other (Specify in Additional Info)"],"name":"Type","text":"Experiment Type"},
    {"field":"text-input","q":"Material","placeholder":"Material used (HeLa,Liver,..)","name":"Material"},
    {"field":"textfield-input","q":"Experimental procedure","placeholder":"Please provide details about the experimental procedure of cell culture / treatments. In addition, provide the cell culture media and supplements. Please enter SILAC labelling information here as well.","name":"Experimental Info","title":"Experimental procedure"},
    {"field":"textfield-input","q":"Notes","placeholder":"Please provide additional information if required. Examples might be about a bias in sample preparation. Experimental errors.  Batch effects.","name":"Add. Info","title":"Additional Information"},
    {"field":"numeric-input","q":"Number of samples","min":1,"max":999,"minorStepSize":1,"defaultValue":2,"placeholder":"Number of samples.","name":"n_samples"},
    {"field":"numeric-input","q":"Number of replicates","min":1,"max":999,"minorStepSize":1,"defaultValue":2,"placeholder":"Number of replicate per group.","name":"n_replicates"},
    {"field":"numeric-input","q":"Number of groupings","min":1,"max":999,"minorStepSize":1,"defaultValue":2,"placeholder":"Number of groupings (Genotype, Treatment, ..).","name":"n_groupings"},
]


class SampleList(Resource):
    ""
    def __init__(self,*args,**kwargs):
        """
        """
        self.token = kwargs["token"]
        self.submission = kwargs["submission"]

    def get(self):
        ""
        token = request.args.get('token', default="None", type=str)
        if token == "None" or not self.token.isAdminToken(token):
            return {"success":False,"error":"Token is not valid. Admin token required."}

        dataID = request.args.get('dataID', default="None", type=str)
        startRow = request.args.get('startRow', default="A", type=str)
        startColumn = request.args.get('startColumn', default=1, type=int)
        direction = request.args.get('direction', default="Rows", type=str)
        scramble = request.args.get('scramble', default="True", type=str) == "True"
        internalID = request.args.get('internalID', default="000", type=str)
        
        ok, paramsFile, sampleList = self.submission.getSampleList(dataID,internalID,startRow=startRow,startColumn=startColumn,direction=direction, scramble=scramble)
        if ok:
            return {"success":ok,"paramsFile":paramsFile, "sampleList":sampleList}
        else:
            return {"success":ok,"msg":paramsFile}


class DataSubmissionDetails(Resource):
    def __init__(self,*args,**kwargs):
        """
        """
        self.token = kwargs["token"]
        self.email = kwargs["email"]
        self.submission = kwargs["submission"]
    
    def get(self):
        "Returns features in data"
        token = request.args.get('token', default="None", type=str)
        if token == "None" or not self.token.isValid(token):
            return {"success":False,"error":"Token is not valid."}

        return {"success":True,"details":details}


    def put(self):
        ""
        if request.data != b'':
            data = json.loads(request.data, strict=False)
            if all(x in data for x in ["dataID","token","paramsFile"]):
                token = data["token"]
                
                if token == "None" or not self.token.isAdminToken(token):
                    return {"success":False,"error":"Token is not valid."}
                dataID = data["dataID"]
                paramsFile = data["paramsFile"]
                ok, msg, paramsFile = self.submission.update(dataID,paramsFile)
                return {"success":ok,"msg":msg, "paramsFile":paramsFile}
            else:
                return {"success":False,"error":"Not all required params found."}

    def delete(self):
        "'Deletes' a submission and moves it to the archive. Status is changed to 'Archived'"
        if request.data != b'':
            data = json.loads(request.data, strict=False)
            token = data["token"]
            if token == "None" or not self.token.isAdminValid(token):
                return {"success":False,"error":"Token is not valid."}
            dataID = data["dataID"]
            
            ok, msg = self.submission.delete(dataID)
            return {"success":ok,"msg":msg}

    def post(self) -> dict:
        "Handles sample submission - should be probably be moved to submission helper."
        
        if request.data != b'':
            data = json.loads(request.data, strict=False)
            if "token" not in data:
                return {"success":False,"error":"Token not found.."}
            token = data["token"]
            
            if token == "None" or not self.token.isValid(token):
                return {"success":False,"error":"Token is not valid."}
            
            else:
                try:
                    submission = data["submission"]
                    
                    sampleSubmission = OrderedDict() 
                    sampleSubmission["Creation Date"] = submission["time"]
                    sampleSubmission["State"] = submission["details"]["State"]
                    for submissionName, submissionSaveName in [
                                        ("id","dataID"),
                                        ("Experimentator","Experimentator"), 
                                        ("title","Title"), 
                                        ("Research Aim","shortDescription"),
                                        ("Type","Type"),
                                        ("Material","Material"),
                                        ("Organism","Organism"),
                                        ("n_samples","SampleNumber"),
                                        ("email","Email"),
                                        ]:
                        
                        if submissionName in submission:
                            sampleSubmission[submissionSaveName] =  submission[submissionName]
                        elif submissionName in submission["details"]:
                            sampleSubmission[submissionSaveName] =  submission["details"][submissionName]
                        else:
                            return {"success":False,"msg":"Could not find: {}.".format(submissionSaveName)}

                    sampleSubmission["Experimental Info"] = [
                        {"title":"Research Aim", "details":submission["details"]["ResearchQuestion"]},
                        {"title":"Additional Information", "details": submission["details"]["Add. Info"]},
                        {"title":"Sample Preperation", "details":submission["details"]["Experimental Info"]}
                        ]  

                    groupingDf = pd.DataFrame().from_dict(submission["groupingTable"]["data"])
                    groupingDf = groupingDf.dropna(axis=1,how="any")
                    if groupingDf.index.size != int(float(submission["details"]["n_samples"])):
                        return {"success":False,"msg":"The grouping table row number does not match the number of samples."}
                   
                    groupingNames = [colName for colName in groupingDf.columns if colName not in ["Run","Replicate"]]

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
                    #adding groupings to the submisison
                    sampleSubmission["groupings"] = groupings

                    #extracting the replicates
                    if "Replicate" in groupingDf.columns:
                        sampleSubmission["replicates"] = OrderedDict ([(replicate,runName) for runName, replicate in groupingDf[["Run","Replicate"]].values])
                    
                    if self.submission.add(sampleSubmission):
                        emailSubmission = [sampleSubmission["Email"]] if "," not in sampleSubmission["Email"] else sampleSubmission["Email"].split(",")
                        self.email.sendEmail(title="MitoCube - Submission Complete {}".format(sampleSubmission["dataID"]), 
                                            html= createEmailSummaryForProject(sampleSubmission), 
                                            recipients = emailSubmission + self.submission.data.getConfigParam("email-cc-submission-list"))
                        return {"success":True,"msg":"Confirmation email was sent.","paramsFile":self.submission.getParamFile(sampleSubmission["dataID"])}
                    else:
                        return {"success": False, "msg":"DataID exists already. Please contact the administrator, if you want to make changes."}
                except Exception as e:
                    print(e)
                    return {"success":False,"msg":"There was an error extracting the submission details."}

        return {"success":False,"msg":"missing json data"}

class DataSubmissions(Resource):
    def __init__(self,*args,**kwargs):
        """
        """
        self.token = kwargs["token"]
        self.submission = kwargs["submission"]

    def get(self) -> dict:
        
        token = request.args.get('token', default="None", type=str)
        if token == "None" or not self.token.isAdminToken(token):
            return {"success":False,"error":"Token is not valid."}
        
        submissions, submissionStates = self.submission.getSubmission()
        submissionSummaryColumns = self.submission.getSummaryColumns() #submissionSummaryColumns,
        searchColumns = self.submission.getSearchColumns()
        return {
            "success":True,
            "submissions":submissions,
            "states":submissionStates,
            "searchColumns" : searchColumns,
            "submissionSummaryColumns" : submissionSummaryColumns}

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