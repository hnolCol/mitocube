import os
import shutil
from typing import List, Dict, Tuple
from .Misc import getRandomString
from datetime import date, datetime
from itertools  import product
from collections import OrderedDict
import pandas as pd 
import numpy as np 
import json
class Submission(object):

    def __init__(self,pathToSubmissionFolder,pathToArchive,data,email,*args,**kwargs):

        self.pathToFolder = pathToSubmissionFolder
        self.pathToArchive = pathToArchive
        self.data = data
        self.email = email

    def _createFolder(self, dataID) -> Tuple[str,str]:
        "Create a folder for a new dataID if it does not exists"
        pathToFolder = self._getPath(dataID)
        if not os.path.exists(pathToFolder):
            os.mkdir(pathToFolder)
        
        return pathToFolder, os.path.join(pathToFolder,"params.json")

    def _getListOfSubmissions(self) -> List[str]:
        "Runs through the submission folder and returns all the dataIDs (e.g. folder names)"
        return [ f.name for f in os.scandir(self.pathToFolder) if f.is_dir() ]

    def _getPath(self,dataID) -> str:
        "Returns the path to a specific submission"
        return os.path.join(self.pathToFolder,dataID)

    def _getArchivePath(self,dataID) -> str:
        ""
        return os.path.join(self.pathToArchive,dataID)

    def _getPathToParam(self,dataID) -> str:
        "Returns the path to the parameter file by dataID"
        return os.path.join(self._getPath(dataID),"params.json")

    def _readParams(self,dataID) -> dict:
        "Loads the json file for a parameter."
        pathToParam = self._getPathToParam(dataID)
        if os.path.exists(pathToParam):
            params = json.load(open(pathToParam))
            return params

    def _writeParams(self,pathToParamFile,sampleSubmission):
        ""
        with open(pathToParamFile, 'w', encoding='utf-8') as f:
            json.dump(sampleSubmission, f, ensure_ascii=False, indent=4)


    def getID(self):
        "Generate random string"
        dataID = getRandomString(N=12)
        if self.data.dataIDExists(dataID):
            #highly unlikely 
            dataID = getRandomString(N=12)

        return dataID

    def getSummaryColumns(self):
        ""
        summaryColumns = self.data.getAPIParam("submission-summary-short")
        return summaryColumns if summaryColumns is not None else []

    def getSearchColumns(self):
        ""
        searchColumns = self.data.getAPIParam("submission-search-columns")
        return searchColumns if searchColumns is not None else []

    def getTagNames(self):
        ""
        tagNames = self.data.getAPIParam("submission-tags")
        return tagNames if tagNames is not None else []

    def _getAllRunsFromGrouping(self,groupings):
        ""
        runs = []
        groupingsToGenerateName = []
        for groupingName, groups in groupings.items():
            mappingDict = {}
            for groupName, groupItems in groups.items():
                runs.extend(groupItems)
                for r in groupItems:
                    mappingDict[r] = groupName
            groupingsToGenerateName.append(mappingDict)
        return np.sort(np.unique(np.array(runs).flatten())), groupingsToGenerateName

    def _updateGrouping(self,prevGroupings,nameMapper):
        ""

        groupings = OrderedDict()
        for groupingName, groups in prevGroupings.items():
            groupings[groupingName] = OrderedDict()
            
            for groupName, groupItems in groups.items():
                
                groupings[groupingName][groupName] = [nameMapper[x] for x in groupItems]
        return groupings

    def getSampleList(self,dataID,replaceNumberID, startRow = "A", startColumn = 1, direction="Rows", scramble = True):
        """
        Creates a list of samples on a 96 well plate outline.
        Paramters
            
            dataID(str)     -   dataID asssigned to a submission
            replaceNumberID(str)    -   string to replace the placeholder (000 by default) to add facility specific information (internalID, columnID)
            starRow     -
            startColumn     -
            scramble(bool) - enables scrambling of the sample list
        """
        columns = list(range(1,13))
        rows = ["A","B","C","D","E","F","G","H"]
        if direction == "Rows":
            orderedWellPosition = ["{}{}".format(rowID,colID) for rowID,colID in  product(rows,columns)] 
        else:
            orderedWellPosition = ["{}{}".format(rowID,colID) for  colID,rowID in  product(columns,rows)] 
        
        startIndex = orderedWellPosition.index("{}{}".format(startRow,startColumn))

        params = self._readParams(dataID)
        if params is not None:
           
            if "grouping-init" not in params:
                params["grouping-init"] = params["groupings"].copy()
            groupingsToRename = params["grouping-init"]
            runs, groupingsToGenerateName = self._getAllRunsFromGrouping(groupingsToRename)
            
            #create replacing names incorporating useful info
            newRunNames = {} #mapping dict old -> new name
            for run in runs:
                srun = run.rsplit("_",maxsplit=1)
                stringAdd = []
                for mapper in groupingsToGenerateName:
                    #split last number of 
                    if run in mapper:
                        stringAdd.append(mapper[run])

                newName = "_".join([srun[0].replace(params["Creation Date"],date.today().strftime("%Y%m%d")).replace("_000_","_{}_".format(replaceNumberID))]+[srun[1]]+stringAdd)
                newRunNames[run] = newName
            
            params["groupings"] = self._updateGrouping(groupingsToRename,newRunNames)
            params["internalID"] = replaceNumberID
            ok, msg, paramsFile = self.update(dataID,params)

            #create list 
            lastIndex = startIndex+len(newRunNames)
            
            if lastIndex >= len(orderedWellPosition):
                #more than one plate
                d = OrderedDict([(colName,[]) for colName in ["Run","Position","Plate"]+ params["groupingNames"]])
                plate = 1 
                runningIndex = startIndex
                for runIdx, run in enumerate(newRunNames.values()):
        
                    pos = orderedWellPosition[runningIndex]
                      
                    d["Run"].append(run)
                    d["Position"].append(pos)
                    d["Plate"].append(plate)
                    
                    for mapperIdx,mapper in enumerate(groupingsToGenerateName):
                    #split last number of 
                       
                        if runs[runIdx] in mapper:
                            d[params["groupingNames"][mapperIdx]].append(mapper[runs[runIdx]])

                    runningIndex+=1

                    if runningIndex >= len(orderedWellPosition):
                        runningIndex = 0
                        plate += 1

                sampleList = pd.DataFrame(d)

            else:
                newRunNames = list(newRunNames.values())
                sampleList = pd.DataFrame(
                    OrderedDict([
                            ("Run",newRunNames),
                            ("Position",orderedWellPosition[startIndex:startIndex+len(newRunNames)])] + 
                        [
                            (params["groupingNames"][mapperIdx],[mapper[run] if run in mapper else "" for run in runs]) for mapperIdx,mapper in enumerate(groupingsToGenerateName)
                            ]
                    )
                    )
            
            if scramble:
                if "Plate" in sampleList.columns:
                    #randomly only over plates
                    sampleList = sampleList.groupby('Plate').apply(lambda x: x.sample(frac=1.0)).reset_index(drop=True)
                else:
                    sampleList = sampleList.sample(frac=1.0)

            if ok:
                return ok, paramsFile,sampleList.to_json(orient="records")
            else:
                return ok, msg, None
        else:

            return False, "DataID not found.", None


    def getSubmission(self) -> Tuple[List[Dict],List[str]]:
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
        submissions.sort(key = lambda v: submissionStates.index(v["paramsFile"]["State"]))
        
        return submissions, submissionStates

    def getParamFile(self,dataID) -> Dict:
        ""
        params = self._readParams(dataID)
        if params is not None:
            return params
        else:
            return {}
    def add(self,sampleSubmission) -> bool:
        ""
        if "dataID" not in sampleSubmission:
            return False
        dataID = sampleSubmission["dataID"]
        if dataID in self._getListOfSubmissions():
            return False
        _, pathToParamFile = self._createFolder(dataID)
        self._writeParams(pathToParamFile,sampleSubmission)
        
        return True


    def delete(self, dataID) -> Tuple[bool,str]:
        ""
        pathToFolder = self._getPath(dataID)
        #print(pathToFolder)
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
        ""
        pathToFolder = self._getPath(dataID)
        states = self.data.getAPIParam("submission-states")
        if os.path.exists(pathToFolder):
    
            prevParamFile = self._readParams(dataID)
            if "State" not in prevParamFile:
                prevParamFile["State"] = states[0]
            if prevParamFile["State"] != paramsFile["State"]:
                if "updatedState" not in paramsFile:
                
                    paramsFile["updatedState"] = {}

                paramsFile["updatedState"][paramsFile["State"]] = date.today().strftime("%Y%m%d")

                
                if paramsFile["State"] == states[-1]:
                    # add days till done to state.
                    creationDate = datetime.strptime(paramsFile["Creation Date"] , '%Y%m%d').date()
                    today = date.today() 
                    deltaDays = today - creationDate
                    
                    paramsFile["daysFromCreationToLastState"] = deltaDays.days
                additionalInfo = "You will be notified if the project's state will change again." if paramsFile["State"] != states[-1] else "The results will be delivered in another email or using the network attached server."
                
                emailAdresses = [paramsFile["Email"]] if "," not in paramsFile["Email"] else paramsFile["Email"].split(",")
                self.email.sendEmail(
                        title="Project {} State Changed To {}".format(paramsFile["dataID"],paramsFile["State"]),
                        body="",
                        recipients = emailAdresses + self.data.getConfigParam("email-cc-submission-list"),
                        html = "<div><p>Dear {}</p><p>We are happy to inform you that the state of the project: {} has been changed to {}.</p><p>{}</p><p>The MitoCube Team</p></div>".format(paramsFile["Experimentator"],paramsFile["Title"],paramsFile["State"],additionalInfo)
                )

            self._writeParams(os.path.join(pathToFolder,"params.json"),paramsFile)
            return True, "Submission updated.", paramsFile
        else:
            return False, "Path not found", self.getParamFile(dataID)


