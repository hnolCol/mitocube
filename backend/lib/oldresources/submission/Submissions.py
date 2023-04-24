
from typing import OrderedDict

import pandas as pd 
from flask import request
from flask_restful import Resource
import json
from datetime import date
from backend.lib.oldresources.utils.html import *
from backend.lib.oldresources.misc import isAdminValid, adminTokenInValidResponse
from backend.helper.Misc import getCurrentDate

def handleDetailInputs(submissionDetail):
    """"""
    if submissionDetail["field"] == "date-input":
        submissionDetail["default"] = date.today().strftime("%Y%m%d")
    if "disabled" in submissionDetail:
        submissionDetail["disabled"] = submissionDetail["disabled"] == "True"
    if "opts" in submissionDetail and submissionDetail["opts"] == "None":
        submissionDetail["opts"] = None
    return submissionDetail


def emailProjectSummary(
        sampleSubmission : dict, 
        showInList : list = ["Creation Date","Experimentator","Number Samples","Material","Organism","groupingNames"],
        addExperimentalInfo : bool = True):
    """"""
    html = "</div>"
    html = addHeader(html,f"Project submission complete: {sampleSubmission.get('Title')} ({sampleSubmission.get('dataID')})")
    html = addTextElement(html, f"Dear {sampleSubmission.get('Experimentator')} <br>Thank you very much for your sample submission. Please let us know where the samples are stored (-80°C rack).")
    html = addTextElementInNewLine(html,f"Please save the dataID assigned to your project in your documents: {sampleSubmission.get('dataID')}")
    listItems = OrderedDict([(header,sampleSubmission[header]) for header in showInList if header in sampleSubmission])
    html = addList(html,listItems)
    if addExperimentalInfo:
        for expDetail in sampleSubmission["Experimental Info"]:
            if "title" in expDetail and "details" in expDetail:
                html = addSubHeader(html, expDetail["title"])
                html = addTextElement(html, expDetail["details"])
        
    html = addTextElementInNewLine(html,"Please just reply to this email if you have any question.")
    html = addTextElementInNewLine(html,"The MitoCube Team")
    html += "</div>"
    return html

#sampleSubmission["Experimentator"],sampleSubmission["Number Samples"],sampleSubmission["Material"],sampleSubmission["Organism"],",".join(sampleSubmission["groupingNames"])


class DataSubmissionID(Resource):
    def __init__(self,*args,**kwargs):
        """
        """
        self.token = kwargs["token"]
        self.submission = kwargs["submission"]
        
    def get(self):
        "Returns features in data"
        token = request.args.get('token', default="None", type=str)
        if not self.token.isValid(token):
            return {"success":False,"msg":"Token is not valid."}

        dataID = self.submission.getID()
        return {"success":True,"dataID":dataID,"time":date.today().strftime("%Y%m%d")}


class SampleList(Resource):
    ""
    def __init__(self,*args,**kwargs):
        """
        """
        self.token = kwargs["token"]
        self.submission = kwargs["submission"]

    def get(self) -> dict:
        ""
        token = request.args.get('token', default="None", type=str)
        if not isAdminValid(token,self.token):
            return adminTokenInValidResponse

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
    
    def get(self) -> dict:
        "Returns information about the required sample submissions. Also the type of input (see main-config-file)."
        token = request.args.get('token', default="None", type=str)
        if not self.token.isValid(token):
            return {"success":False,"error":"Token is not valid."}

        submissionItems = [handleDetailInputs(submissionDetail) for submissionDetail in self.submission.data.getAPIParam("submission-details")]
        allowCustomRunNames = self.submission.data.getAPIParam("submission-allow-custom-runName") == 1
        return {"success":True,"details":submissionItems, "allowCustomRunNames" : allowCustomRunNames}


    def put(self) -> dict:
        ""
        if request.data != b'':
            data = json.loads(request.data, strict=False)
            if all(x in data for x in ["dataID","token","paramsFile"]):
                token = data["token"]
                
                if not isAdminValid(token,self.token):
                    return adminTokenInValidResponse
                dataID = data["dataID"]
                paramsFile = data["paramsFile"]
                ok, msg, paramsFile = self.submission.update(dataID,paramsFile)
                return {"success":ok,"msg":msg, "paramsFile":paramsFile}
            else:
                return {"success":False,"msg":"Not all required params found."}

    def delete(self) -> dict:
        "'Deletes' a submission and moves it to the archive. Status is changed to 'Archived'"
        if request.data != b'':
            data = json.loads(request.data, strict=False)
            token = data["token"]
            if not isAdminValid(token,self.token):
                    return adminTokenInValidResponse
            dataID = data["dataID"]
            
            ok, msg = self.submission.delete(dataID)
            return {"success":ok,"msg":msg}

    def post(self) -> dict:
        "Handles sample submission - should be probably be moved to submission helper."
        
        if request.data != b'':
            data = json.loads(request.data, strict=False)
            if "token" not in data:
                return {"success":False,"msg":"Token not found.."}
            token = data["token"]
            
            if not self.token.isValid(token):
                return {"success":False,"msg":"Token is not valid."}
        
            try:
                submission = data["submission"]
                #create new submission dict to ensure ordering (just visually not important otherwise)
                sampleSubmission = OrderedDict() 
                #extract time and State from submission
                submissionDetails = self.submission.data.getAPIParam("submission-details")
                experimentalInfoHeaders = self.submission.data.getAPIParam("submission-summarize-as-experimentalInfo")
                dateSubmissionHeader = [submissionDetail["name"] for submissionDetail in submissionDetails if submissionDetail["field"] == "date-input" and "name" in submissionDetail]
                #experimentalInfoHeaders = ["Research Aim","Sample Preparation","Additional Information"] #these are combined to create hierarchy. (admins can add further methods)
                submissionHeaders = ["Creation Date","State","dataID"] + [submissionDetail["name"] for submissionDetail in  submissionDetails if  
                                "name" in submissionDetail and submissionDetail["name"] not in experimentalInfoHeaders]

                for submissionHeader in submissionHeaders:
                    if submissionHeader in submission: #likely only dataID
                        sampleSubmission[submissionHeader] = submission[submissionHeader]
                    elif submissionHeader in submission["details"]:
                        if submissionHeader in dateSubmissionHeader:
                            dateString = submission["details"][submissionHeader]
                            if "-" in dateString:
                                dateString = dateString.replace("-","")
                            sampleSubmission[submissionHeader] = dateString
                        else:
                            sampleSubmission[submissionHeader] = submission["details"][submissionHeader]
                    elif submissionHeader == "Creation Date":
                        sampleSubmission[submissionHeader] = getCurrentDate()
                    else: 
                        return {"success":False,"msg":"The API expected more information. Could not find: {}.".format(submissionHeader)}
                #manage experimental info 
                sampleSubmission["Experimental Info"] = [
                    {
                    "title":experimentalInfoDetails , 
                    "details":submission["details"][experimentalInfoDetails]
                    }
                                for experimentalInfoDetails in experimentalInfoHeaders if experimentalInfoDetails  in submission["details"]]  
                if "groupingTable" not in submission:
                    return {"success":False,"msg":"Could not find any groupingTable."}
                #extracting grouping information
                groupingDf = pd.DataFrame().from_dict(submission["groupingTable"]["data"])
                groupingDf = groupingDf.dropna(axis=1,how="any")
                if groupingDf.index.size != int(float(sampleSubmission["Number Samples"])):
                    return {"success":False,"msg":"The grouping table row number does not match the number of samples."}
                
                #extracting the replicates
                if "Replicate" in groupingDf.columns:
                    replicates = OrderedDict((replicateID,[]) for replicateID in groupingDf["Replicate"].unique())
                    for runName, replicateID in groupingDf[["Run","Replicate"]].values:
                        replicates[replicateID] = runName
                    sampleSubmission["Replicates"] = replicates 
                
                #extract grouping names
                groupingNames = [colName for colName in groupingDf.columns if colName not in ["Run","Replicate"]]
                if len(groupingNames) == 0:
                    return {"success":False,"msg":"Groupings could not be found/infered. All columns/row completed?"}

                #create grouping
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

                if self.submission.add(sampleSubmission):
                    emailSubmission = [sampleSubmission["Email"]] if "," not in sampleSubmission["Email"] else sampleSubmission["Email"].split(",")
                    self.email.sendEmail(title="MitoCube - Submission Complete {}".format(sampleSubmission["dataID"]), 
                                        html= emailProjectSummary(sampleSubmission), 
                                        recipients = emailSubmission + self.submission.data.getConfigParam("email-cc-submission-list"))
                    return {"success":True,"msg":"Confirmation email was sent.","paramsFile":self.submission.getParamFile(sampleSubmission["dataID"])}
                else:
                    return {"success": False, "msg":"DataID exists already. Please contact the administrator, if you want to make changes."}
            except Exception as e:
                
                return {"success":False,"msg":f"There was an error extracting the submission details: {e}"}

        return {"success":False,"msg":"Missing json data in post."}

class DataSubmissions(Resource):
    def __init__(self,*args,**kwargs):
        """
        """
        self.token = kwargs["token"]
        self.submission = kwargs["submission"]

    def get(self) -> dict:
        
        token = request.args.get('token', default="None", type=str)
        if not isAdminValid(token,self.token):
            return adminTokenInValidResponse
        
        submissions, submissionStates = self.submission.getSubmission()
       
        submissionSummaryParams = self.submission.getSummaryColumns()
        searchColumns = self.submission.getSearchColumns()
        tagNames = self.submission.getTagNames()
        return {
            "success":True,
            "tokenIsValid" : True,
            "tagNames" : tagNames,
            "submissions":submissions,
            "states":submissionStates,
            "searchColumns" : searchColumns,
            "submissionSummaryParams" : submissionSummaryParams}