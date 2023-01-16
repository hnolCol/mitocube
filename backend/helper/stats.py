

import numpy as np 
import pandas as pd 

from scipy import stats
from statsmodels.stats.multitest import multipletests

from typing import Dict, List

def calculateTTest(X : pd.DataFrame, columNamesGroup1 : List[str], columNamesGroup2 : List[str], multipleTestMethod : str = "fdr_tsbky"):
    """"""
    X1, X2 = X.loc[:,columNamesGroup1], X.loc[:,columNamesGroup2]
    T,p = stats.ttest_ind(X1, X2, nan_policy="omit", axis=1)

    boolIdx, p_adj, _, _ = multipletests(p, alpha=0.05, method=multipleTestMethod)
    tTestDifference = pd.DataFrame(pd.Series(X1.mean(axis=1) - X2.mean(axis=1), name="x"))
    tTestDifference["y"] = (-1)*np.log10(p)
    tTestDifference["s"] = boolIdx
    return tTestDifference

        # boolIdx, p_adj, _, _ = multipletests(p,alpha=0.05,method="fdr_tsbky")
        # # print(p_adj)
        # diff = pd.DataFrame(pd.Series(d.loc[:,columnNames1].mean(axis=1) - d.loc[:,columnNames2].mean(axis=1), name="x"))
        # diff["y"] = (-1)*np.log10(p)
        # diff["s"] = boolIdx
        
        # diff = pd.concat([diff,data[filterColumns + [annotationColumn]]],axis=1)
        
        # diff = diff.reset_index()
        
        # diff = diff.rename({"index":"Key"})

        # # print(self.dbManager.getDBInfoForFeatureListByColumnName(X.index,annotationColumn,checkShape=False).values.flatten())
        # #diff = diff.join(pd.Series(self.dbManager.getDBInfoForFeatureListByColumnName(X.index,annotationColumn,checkShape=False).values.flatten(), 
        #     #               name="l"))
        # diff[annotationColumn] = diff[annotationColumn].fillna("-")
        # diff = diff.dropna(subset=["x","y"])
        # # print(diff[filterColumns[0]].unique())

def calculateOneWayANOVA(X : pd.DataFrame, groupings : Dict[str,Dict[str,list]], groupingName : str, anovaCutoff : float = 0.05):
    """
    Calculate one way anova p values.
    """
    if not groupingName in groupings:
        raise ValueError(f"{groupingName} not found in groupings.")
    #create empty result data frame   
    oneWayANOVAColumnName = f"p-1WANOVA({groupingName})"
    results = pd.DataFrame(index = X.index, columns=[oneWayANOVAColumnName])
    #create list of values to be tested using anova
    testGroupData = [X[columnNames].values for columnNames in groupings[groupingName].values()]
    #returns F-value and p-values
    F,p = stats.f_oneway(*testGroupData,axis=1)
    #put values into result dataframe
    results.loc[X.index,oneWayANOVAColumnName] = p
    #annotate significant hits.
    significantBoolIdx = results.index[results[oneWayANOVAColumnName] < anovaCutoff]
    #create pandas Series with significant p-values
    selectionpvalues = [pd.Series(
                        results.loc[X.index,oneWayANOVAColumnName].values, 
                        name=oneWayANOVAColumnName, index=X.index).loc[significantBoolIdx].reset_index()]
    pValueColumnName = [oneWayANOVAColumnName]

    return significantBoolIdx, selectionpvalues, pValueColumnName



class TwoWAyANOVA(object):

    def __init__(self,df, groupings,columnNames,*args,**kwargs):
        ""
        self.groupings = groupings
        self.groupingNames = list(groupings.keys())
        self.columnNames = columnNames
        self.df = df
        self.N = len(columnNames)

    def caulculate(self):

        df_a, df_b, df_axb, df_w = self.calculateDFs(self.groupingNames,self.groupings)
        grandMean = self.df[self.columnNames].mean(axis=1)
        ssq_a, ssq_b, ssq_axb, ssq_t, ssq_w = self.calculateSumOfSquares(self.groupings,self.groupingNames, grandMean)
        ms_a, ms_b, ms_axb, ms_w = self.calculateMS(ssq_a, ssq_b, ssq_axb, ssq_w, df_a,df_b,df_axb,df_w)
        F = self.calculateF(ms_a, ms_b, ms_axb, ms_w)
        p_a = pd.DataFrame([{
                "p-value {}".format(self.groupingNames[0]):stats.f.sf(fa,df_a,df_w),
                "p-value {}".format(self.groupingNames[1]):stats.f.sf(fb,df_b,df_w),
                "p-value Interaction":stats.f.sf(fab,df_axb,df_w)} for fa,fb,fab in F.values],
            index=self.df.index)
        return p_a

    def  calculateDFs(self,groupingNames,groupings):
        ""
        
        df_a = len(groupings[groupingNames[0]]) - 1
        df_b = len(groupings[groupingNames[1]]) - 1
        df_axb = df_a*df_b 
        df_w = self.N - (len(groupings[groupingNames[0]])*len(groupings[groupingNames[1]]))

        return df_a, df_b, df_axb, df_w


    def calculateSumOfSquares(self,groupings,groupingNames,grandMean):
        ""
        ssq_a_group = pd.DataFrame(dict([(groupItem,(self.df[groupItems].mean(axis=1)-grandMean).pow(2)) for _, groupItems in groupings[groupingNames[0]].items() for groupItem in groupItems]))
        ssq_b_group = pd.DataFrame(dict([(groupItem,(self.df[groupItems].mean(axis=1)-grandMean).pow(2)) for _, groupItems in groupings[groupingNames[1]].items() for groupItem in groupItems]))
        ssq_a = ssq_a_group.sum(axis=1)
        ssq_b = ssq_b_group.sum(axis=1)
        ssq_t = self.df[self.columnNames].subtract(grandMean,axis=0).pow(2,axis=1).sum(axis=1)
        withinMeans = []
        for groupName, groupItems in groupings[groupingNames[0]].items():

            groupData = self.df[groupItems]
            r = []
            colNames = []
            for groupName2, groupItems2 in groupings[groupingNames[1]].items():
                gis = [colName for colName in groupItems2 if colName in groupData.columns]
                r.extend([pd.Series(groupData[gis].mean(axis=1), name = gg) for gg in gis])
                colNames.extend(gis)

            withinMeans.append(pd.concat(r,axis=1))

        withinMeans = pd.concat(withinMeans,axis=1)
        rr = []
        for _, groupItems in groupings[groupingNames[0]].items():
            rr.append((self.df[groupItems].subtract(withinMeans[groupItems],axis=0)).pow(2))
        ssq_w = pd.concat(rr,axis=1).sum(axis=1)
        ssq_axb = ssq_t - ssq_a - ssq_b - ssq_w
        return ssq_a, ssq_b, ssq_axb, ssq_t, ssq_w

    def calculateMS(self,ssq_a,ssq_b,ssq_axb,ssq_w,df_a,df_b,df_axb,df_w):
        ""
        ms_a = ssq_a.divide(df_a)
        ms_b = ssq_b.divide(df_b)
        ms_axb = ssq_axb.divide(df_axb)
        ms_w = ssq_w.divide(df_w)

        return ms_a, ms_b, ms_axb, ms_w
    
    def calculateF(self,ms_a,ms_b,ms_axb,ms_w):
        ""
        f_a = ms_a.divide(ms_w)
        f_b = ms_b.divide(ms_w)
        f_axb = ms_axb.divide(ms_w)

        F = pd.concat([f_a,f_b,f_axb], axis=1)
        return F 