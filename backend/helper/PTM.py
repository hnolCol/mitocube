

import numpy as np 
from numba import jit
from typing import Any, List, Dict, Tuple
from collections import OrderedDict
from .Misc import getRandomString, mergeDicts
import pandas as pd
import random

@jit()
def findNonOverlappingPosition(A,Xs : np.array ,NXs : int, indices : np.array)-> Tuple[np.array,np.array]: 
    """
    Identify positions of peptides to pack peptides sufficently. 
    """
    N = Xs.shape[0]
    detectedPositions = np.empty(shape=(N,4))
    ii = 1
    for idx in range(N):
        x0,x1 = Xs[idx][0] , Xs[idx][1]

        for n in range(NXs):
            X = A[n,x0:x1]
            
            if not np.any(X):
                A[n,x0:x1] = ii
                detectedPositions[idx,0:4] = [indices[idx],n,x0,x1]
                break
        ii += 1
       
    return A, detectedPositions

class PTMPeptidePosition:
    
    def __init__(self,length : int, peptidePositions : pd.DataFrame) -> None:
        """"""
        self.L = length #length of protein 
        self.peptidePositions = peptidePositions.loc[peptidePositions["start"] > -1] #np array shape (n-peptides,2 - start pos  :: end pos)
        self.N = peptidePositions.shape[0] #number of peptides to arrange
        self.A = np.zeros(shape=(self.N,self.L), dtype=int)

    def __call__(self, *args: Any, **kwds: Any) -> Tuple[np.array,np.array]:
        """Calculates the position of peptides"""

        self.A, foundPositions = findNonOverlappingPosition(
                    self.A,
                    self.peptidePositions[["start","end"]].values,
                    self.N,
                    self.peptidePositions.index.values)

        boolIdx = np.sum(self.A,axis=1) > 0 #find positions that are filled 
        return self.A[boolIdx,:], foundPositions


class PTMAnnotations:

    def __init__(self, proteinLength : int, annotations : Dict[str,np.array]) -> None:
        """
        annotations :   The key of the dict indicates the annotation (PTM, secondary structures)
                        Values are np arrays of length of at least n column 2 indicating start and stop.
        """
        self.proteinLength = proteinLength
        self.annotations = annotations
        self.NAnnotatios = len(self.annotations)
        self.annotationLabelPositions = OrderedDict([(k,0) for k in self.annotations])
        self.annotationPositions = OrderedDict()

    def calculatePostions(self):
        """
        
        """
        siteDetails = []
        
        for annotation, positions in self.annotations.items():
            positionArray, foundPositions = PTMPeptidePosition(self.proteinLength,positions)()
            positions = pd.DataFrame(foundPositions, columns=["idx","rowIdx","start","end"])
            positions["id"] = [getRandomString(4) for _ in range(positions.index.size)]

            sites = dict([(peptideID,[{"position":random.randint(positions.iloc[n]["start"],positions.iloc[n]["end"]),"label" : f'S{random.randint(positions.iloc[n]["start"],positions.iloc[n]["end"])}'} for _ in range(2)]) for n,peptideID in enumerate(positions["id"].values)])
            siteDetails.append(sites)
            if positionArray.shape[0] > 0:
                self.annotationPositions[annotation] = {
                        "positions" : positions.to_dict(orient="records"), 
                        "positionArray" : positionArray.tolist(),
                        "totalLength" : positionArray.shape[0],
                        "labelPosition" : positionArray.shape[0]/2,
                        "n" : foundPositions.shape[0]
                    }

        return self.annotationPositions, mergeDicts(siteDetails)


class PTMManger:
    def __init__(self,data,featureFinder):
        ""

        self.data = data
        self.featureFinder = featureFinder 
        self.getFeatures()

    def getFeatures(self):
        """Finds all features coming from datasets that contain PTMs"""
        
        featureIDs  = self.featureFinder.getFeatures(filter={"PTM":"True"})
        dbAnnotatedFeautures = self.featureFinder.getFeatureInfoFromDB(featureIDs,DBColumns=["Entry","Gene names","Protein names","Organism"])
       
        return dbAnnotatedFeautures

    def annotations(self,*args,**kwargs):
        ""
        return PTMAnnotations(*args,**kwargs)
        
    def chartPositioning(self,*args,**kwargs):
        """"""
        return PTMPeptidePosition(*args,**kwargs)

    def getPTMPeptides(self, featureIDs):
        """"""
        dataIDsMapper = self.featureFinder.getDatasets(featureIDs,filter={"PTM":"True"},featureSpecFilter = {})
        print(featureIDs,dataIDsMapper)
        for featureID, dataIDs in dataIDsMapper.items():
            print(dataIDs)
            for dataID in dataIDs:
                print(self.data.dfs[dataID]["data"].index.isin([featureID]))
                
                print(self.data.dfs[dataID]["data"].loc[[featureID]])
                print(dataID)