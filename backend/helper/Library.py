
from dataclasses import dataclass
from typing import List, Tuple, AnyStr
import pandas as pd 
import numpy as np 
import os 
import json 

@dataclass()
class Library:
    """Dataclass that contains a peptide library"""
    libName : str
    pathToLib : str
    params  : dict #information about the library (e.g. gradient, material)

    def __readDataFile(self,*args,**kwargs):
        """Reads the datafile"""
        return pd.read_csv(self.getPathToData(), sep="\t", *args, **kwargs)

    def featureExists(self,featureID : str) -> Tuple[bool,np.ndarray]:
        ""
        if hasattr(self,"entries"):
            boolIdx = self.entries["Entry"] == featureID
            return np.any(boolIdx), boolIdx
        return False, np.array()

    def featuresExist(self, featureIDs : List[str]) -> Tuple[np.ndarray,np.ndarray]:
        if hasattr(self,"entries"):
            boolIdx = self.entries["Entry"].isin(featureIDs)
            return self.entries["Entry"].loc[boolIdx].unique(), boolIdx
        return False, np.array()

    def getPathToData(self):
        ""
        return os.path.join(self.pathToLib,"lib.txt")
    

    def getLibDataForFeatures(self, featureIDs : List[str]) -> pd.DataFrame:
        """"""
        featureIdsFound, boolIdx = self.featuresExist(featureIDs)
        featureData = []
        with open(self.getPathToData(),"r") as f:
            for lineNum, line in enumerate(f,-1):
                if lineNum in boolIdx.index and boolIdx.loc[lineNum]:

                    featureData.append(line.split("\t"))
        extractedFeatureData = pd.DataFrame(featureData, columns=self.shortLib.columns.values)
        return extractedFeatureData

    def prepareLib(self):
        ""
        self.readColumnNameAndDataTypes()
        self.readEntries()

    def readColumnNameAndDataTypes(self):
        ""
        self.shortLib =  self.__readDataFile(nrows=1)
        print(self.shortLib)

    def readEntries(self):
        ""
        entriesInLib = self.__readDataFile(usecols=["Entry"])
        self.entries = entriesInLib.loc[~entriesInLib["Entry"].str.contains(";"),:]

        print(self.entries)


class Libraries(object):
    """Collection of all peptide/precursor libraries"""

    def __init__(self) -> None:
        self.libs = dict()

    def __contains__(self,libName) -> bool:
        ""
        return libName in self.libs

    def __getitem__(self,libName) -> Library:
        ""
        return self.libs.get(libName)

    def __len__(self) -> int:
        "Returns the number of libaries"
        return len(self.libs)

    def __str__(self) -> str:
        ""
        return f"Total number of libaries : {self.getNumberOfDatasets()} - hash : ${self.__hash__()}"

    def addLibsFromFolder(self,folderToLibs : str) -> None:
        """"""
        
        libs = [libName for libName in os.listdir(folderToLibs) if os.path.isdir(os.path.join(folderToLibs,libName))]
        for libName in libs:
            pathToLib = os.path.join(folderToLibs,libName)
            libDataPath = os.path.join(pathToLib,"lib.txt")
            if not os.path.exists(libDataPath): continue #jump to next one
            libParamsPath = os.path.join(pathToLib,"params.json")
            libParams = json.load(open(libParamsPath)) if os.path.exists(libParamsPath) else {}
            self.libs[libName] = Library(libName, pathToLib ,libParams)
            self.libs[libName].prepareLib()


    def getNumberOfLibs(self) -> int:
        ""
        return len(self.libs)

    def getLibEntriesByFeatureID(self,featureID : List[str]) -> pd.DataFrame:
        r = dict()
        for libName, lib in self.libs.items():
            r[libName] = lib.getLibDataForFeatures(featureID)
        return r 

    def items(self) -> List[Tuple[str,Library]]:
        "Returns the items (libName, Dataset)"
        return self.libs.items() 
