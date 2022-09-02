from importlib.resources import path
import os
import shutil
from typing import OrderedDict
from .Misc import getRandomString
import json
from datetime import date

class Submission(object):

    def __init__(self,pathToSubmissionFolder,pathToArchive,data,email,*args,**kwargs):

        self.pathToFolder = pathToSubmissionFolder
        self.pathToArchive = pathToArchive
        self.data = data
        self.email = email

    def _createFolder(self, dataID):
        ""
        pathToFolder = self._getPath(dataID)
        if not os.path.exists(pathToFolder):
            os.mkdir(pathToFolder)
        
        return pathToFolder, os.path.join(pathToFolder,"params.json")

    def _getListOfSubmissions(self):
        ""
        return [ f.name for f in os.scandir(self.pathToFolder) if f.is_dir() ]

    def _getPath(self,dataID):

        return os.path.join(self.pathToFolder,dataID)

    def _getArchivePath(self,dataID):

        return os.path.join(self.pathToArchive,dataID)

    def _getPathToParam(self,dataID):
        ""
        return os.path.join(self._getPath(dataID),"params.json")

    def _readParams(self,dataID):
        ""
        pathToParam = self._getPathToParam(dataID)
        print(pathToParam)
        if os.path.exists(pathToParam):
            params = json.load(open(pathToParam))
            print(params)
            return params

    def _writeParams(self,pathToParamFile,sampleSubmission):
        ""
        with open(pathToParamFile, 'w', encoding='utf-8') as f:
            json.dump(sampleSubmission, f, ensure_ascii=False, indent=4)


    def getID(self):
        "Generate random string"
        ID = getRandomString(N=12)
        if ID in self.data.dfs:
            #highly unlikely 
            ID = getRandomString(N=12)

        return ID


    def getSubmission(self):
        ""
        dataIDs = self._getListOfSubmissions()
        submissionStates = self.data.getAPIParam("submission-states")
        #submissionSatesCounts = dict([(s,0) for s in submissionStates])
        submissions = []
        for dataID in dataIDs:
            params = self._readParams(dataID)
            if params is not None:

                submissions.append({
                    "dataID" : dataID,
                    "Creation Date" : params["Creation Date"],
                    "paramsFile" : params
                })
                # if "State" in params:
                #     if params["State"] in  submissionSatesCounts:
                #          submissionSatesCounts[params["State"]] += 1
        
        return submissions, submissionStates


    def add(self,sampleSubmission):
        ""
        if "dataID" not in sampleSubmission:
            return False
        
        dataID = sampleSubmission["dataID"]
        pathToFolder, pathToParamFile = self._createFolder(dataID)
        self._writeParams(pathToParamFile,sampleSubmission)
        
        return True


    def delete(self, dataID):
        ""
        pathToFolder = self._getPath(dataID)
        print(pathToFolder)
        if os.path.exists(pathToFolder):
            params = self._readParams(dataID)
            if params is not None:
                params["State"] = "Archived"
                #reading, saving, moving - yes if we decide to put more files in the folder.
                self._writeParams(os.path.join(pathToFolder,"params.json"),params)
                archivePath = self._getArchivePath(dataID)
                shutil.move(pathToFolder,archivePath)
                return True, "Submission {} archived.".format(dataID)
        else:
            return False, "DataID not found."

    def update(self,dataID,paramsFile):
        pathToFolder = self._getPath(dataID)
        
        if os.path.exists(pathToFolder):
    
            prevParamFile = self._readParams(dataID)
            if "State" not in prevParamFile:
                prevParamFile["State"] = "Submitted"
            if prevParamFile["State"] != paramsFile["State"]:
                if "updatedState" not in paramsFile:
                
                    paramsFile["updatedState"] = {}

                paramsFile["updatedState"][paramsFile["State"]] = date.today().strftime("%Y%m%d")

                self.email.sendEmail(
                        title="Project {} State Changed To {}".format(paramsFile["dataID"],paramsFile["State"]),
                        body="",
                        recipients = [paramsFile["Email"]] + self.data.getConfigParam("email-cc-submission-list"),
                        html = "<div><p>Dear {}</p><p>We are happy to inform you that the state of the project: {} has been changed to {}.</p><p>You will be notified if the project's state will change again.</p><p>The MitoCube Team</p></div>".format(paramsFile["Experimentator"],paramsFile["Title"],paramsFile["State"])
                        )
            self._writeParams(os.path.join(pathToFolder,"params.json"),paramsFile)
            return True, "Submission updated.", paramsFile
        else:
            return False, "Path not found", self._readParams(dataID)