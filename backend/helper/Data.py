


from ast import Or
from typing import OrderedDict
import matplotlib
import pandas as pd 
import numpy as np 
import os 
import json
from scipy.stats import zscore
import seaborn as sns 
from pingouin import anova
from sklearn import cluster
from decouple import config
import matplotlib.cm as cm
from matplotlib.colors import ListedColormap, to_hex
import scipy.cluster.hierarchy as sch
from scipy.stats import f_oneway,ttest_ind
import fastcluster
import itertools
from statsmodels.stats.multitest import multipletests

from .Misc import buildRegex


Set6 = ["#444444", "#a6cee3", "#1f78b4", "#b2df8a", "#33a02c", "#fb9a99",
            "#e31a1c", "#fdbf6f", "#ff7f00", "#cab2d6", "#6a3d9a"]
Set7 = ["#f0f0f1","#99999c","#3b9673","#f0ab04","#11395d","#bc3618"]
customColors = dict(
    [("Set6",Set6),
     ("Set7",Set7)]
)
for paletteName, colorList in customColors.items():
    sns.palettes.SEABORN_PALETTES[paletteName] = colorList


pingouinColumn = {"SS":"Sum of squares", "F":"F-values","MS" : "Mean squares","DF":"Degree of freedom","p-unc":"p-value (uncorrected)"}

DB_ENTRY_COLUMN = "Entry"

class DBFeatures(object):
    ""
    def __init__(self,pathToDB,*args,**kwargs):
        ""
        self.pathToDB = pathToDB
        self.__readData()

    def __readData(self):
        ""
        #print(self.__getFiles())
        Xs = [pd.read_csv(f, sep="\t") for f in self.__getFiles()]
        if len(Xs) > 1:
            self.DBs = pd.concat(Xs,axis=1,ignore_index=True)
        elif len(Xs) == 1:
            self.DBs = Xs[0]
        else:
            self.DBs  = pd.DataFrame()  
        if self.DBs.index.size > 0 and DB_ENTRY_COLUMN in self.DBs.columns: 
            self.DBs = self.DBs.set_index("Entry")

    def __getFiles(self):
        ""
        return [os.path.join(self.pathToDB,x) for x in os.listdir(self.pathToDB) if x.endswith(".txt")]

    def _findMatchingColumns(self,columnNames):
        ""
        return [colName for colName in columnNames if colName in self.DBs.columns]

    def update(self):
        ""
        self.__readData()
    
    def getDBFeatures(self,requiredColNames=["Entry","Gene names  (primary )","Protein names","Organism"]):
        ""
        if self.DBs.index.size > 0 :
            matchedColNames = self._findMatchingColumns(requiredColNames)

            if len(matchedColNames) == 0:
                return self.DBs.index
            else:
                return self.Dbs[matchedColNames]

    def getDBInfoForFeatureList(self,featureIDs, requiredColNames, plainExport = True, entryInfoDictAsOutput = False):
        ""

        idxIntersection = self.DBs.index.intersection(featureIDs)
        matchedColNames = self._findMatchingColumns(requiredColNames)
        if len(matchedColNames) > 0:
            if entryInfoDictAsOutput:
                DB = self.DBs.loc[idxIntersection,matchedColNames].replace({np.nan: None})

                return DB.to_dict(orient="index")
            else:
                DB = self.DBs.loc[idxIntersection,matchedColNames].replace({np.nan: None}).reset_index()
                if  plainExport:
                    return DB.to_json(orient="records")
                else:
                    DBInfo = OrderedDict() 
                    for entry in DB.index:
                        databaseInfo = []
                        for colName in DB.columns:
                            eDetails = DB.loc[entry,colName]
                            if isinstance(eDetails,pd.Series):
                                eDetails = eDetails.values[0]
                            elif isinstance(eDetails,str):
                                pass
                            elif isinstance(eDetails,np.bool_):
                                eDetails = bool(eDetails)
                            else:
                                eDetails = str(eDetails)

                            databaseInfo.append({"title":colName,"details":eDetails})
                        DBInfo[DB.loc[entry,"Entry"]] = databaseInfo
                    return True, DBInfo

    def getDBInfoForFeatureListByColumnName(self,featureIDs,columnName = "Gene names  (primary )",checkShape=True):
        ""
        
        if columnName in self.DBs.columns:
            idxIntersection = self.DBs.index.intersection(featureIDs)

            if idxIntersection.size == len(featureIDs):
                return self.DBs.loc[featureIDs,columnName]
            elif not checkShape:
                
                return self.DBs.loc[idxIntersection,columnName]
            else:
                return pd.Series([self.DBs.loc[idx,columnName] if idx in idxIntersection else "-" for idx in featureIDs], index=featureIDs)



class Data(object):
    def __init__(self,pathToData,pathToAPIConfig,dbManager,*args,**kwargs):
        ""
        self.pathToData = pathToData
        self.pathToAPIConfig = pathToAPIConfig 
        self.dbManager = dbManager
        self.dfs = dict() 
        self.__readConfig()
        self.update()

    def __checkData(self):
        ""
        return all(dataID in self.dfs for dataID in self.getDataIDs())

    def __readData(self):
        ""
       
        shortCutFilterValues = []
        param = self.getAPIParam("short-cut-filter-param")
        for dataID in self.getDataIDs():
            paths = self.__getPaths(dataID)
            if paths is not None and dataID not in self.dfs:
                X = pd.read_csv(paths[1],sep="\t",index_col="Key")
                idx = X.index.duplicated(keep='first')
               
                self.dfs[dataID] = {
                    "params":json.load(open(paths[0])),
                    "data":X.loc[~idx,:]}
            
            if dataID in self.dfs and param is not None and param in self.dfs[dataID]["params"]:
                filterParamName = self.dfs[dataID]["params"][param]
                if filterParamName not in shortCutFilterValues:
                    shortCutFilterValues.append(filterParamName)
    
        availableColors = self.getAPIParam("short-cut-colors")
        if isinstance(availableColors,list) and len(availableColors) > 0:
            self.shortcutFilterColors = dict([(filterName,availableColors[n % len(availableColors)]) for n,filterName in enumerate(sorted(shortCutFilterValues))])
       

    def __readDataInfo(self):
        ""
        columnNames = self.getAPIParam("data-presentation")
        sortByColumnNames = [colName for colName in self.getAPIParam("data-presentation-sort-by") if colName in columnNames]
        r = []
        
        for dataID, data in self.dfs.items():
            
           # print(data["params"])
            params = data["params"]
            v = dict([(k,params[k]) for k in columnNames if k in params])
            features = data["data"].index
            N = features.size 
            v["dataID"] = dataID
            v["#Features"] = N
            r.append(v)
            
        self.dataSummary = pd.DataFrame(r).sort_values(by=sortByColumnNames)

    def __readConfig(self):
        pathToDocs = os.path.join(self.pathToAPIConfig,"api_docs_config.json")
        if os.path.exists(pathToDocs):
            self.config = json.load(open(pathToDocs))
            
            APIpassword = config("mitocube-pw")
            self.config["pw"] = APIpassword

    def __getPaths(self,dataID):
        ""
        paramFilePath = os.path.join(self.pathToData,dataID,"params.json")
        dataFilePath = os.path.join(self.pathToData,dataID,"data.txt")
        if all(os.path.exists(filePath) for filePath in [paramFilePath,dataFilePath]):
            return paramFilePath,dataFilePath

    def getDataSummary(self):
        "Return da data frame containing a summary for data in the database"

        if hasattr(self,"dataSummary"):
            return self.dataSummary
        else:
            return pd.DataFrame(columns=self.getAPIParam("data-presentation"))

    def getExpressionColumns(self,dataID):
        ""
        if dataID in self.dfs:
            groupings = self.getParam(dataID,"groupings") 
            firstGroupingName = self.dfs[dataID]["params"]["groupingNames"][0]
            return np.array([i for v in groupings[firstGroupingName].values() for i in v ]).flatten().tolist() 

    def getFilterColors(self):
        ""
        
        if hasattr(self,"shortcutFilterColors"):
            return self.shortcutFilterColors
        

    def getGroupingMapper(self,dataID):
        ""
        groupingMapper = OrderedDict() 
        if dataID in self.dfs:
            groupings = self.getParam(dataID,"groupings") 
            for groupingName, grouping in groupings.items():
                groupingMapper[groupingName] = dict([(v,k) for k,vs in grouping.items() for v in vs])
        return groupingMapper 

    def getGroupingColorMapper(self,dataID):
        if dataID in self.dfs:
            groupings = self.getParam(dataID,"groupings") 
            groupingNames = list(groupings.keys())
            groupingColormaps = self.getParam(dataID,"groupingCmap")
            colorsForGroupings = dict([(groupingName,sns.color_palette(groupingColormaps[groupingName],
                                            n_colors=len(groupings[groupingName]),desat=0.75).as_hex()) for groupingName in groupingNames if groupingName in groupingColormaps])
            groupingColorMapper = dict([(groupingName, dict([(groupName,colorsForGroupings[groupingName][n]) for n,groupName in enumerate(groupings[groupingName].keys())])) for groupingName in groupingNames])
            
            
            return groupingColorMapper

    def getDataIDs(self):
        "Datasets are stored in separate folders. Function returns dataID (=folder name)"
        return [x for x in os.listdir(self.pathToData) if os.path.isdir(os.path.join(self.pathToData,x))]



    def getMedianExpression(self,featureIDs,dataID,returnDataQuantiles=False):
        ""
        
        if dataID in self.dfs:
            idxIntersection = self.dfs[dataID]["data"].index.intersection(featureIDs)
            expColumns = self.getExpressionColumns(dataID)
            if returnDataQuantiles:
                return (self.dfs[dataID]["data"].loc[idxIntersection,expColumns].median(axis=1), np.nanquantile(self.dfs[dataID]["data"].values.flatten(),q=[0,0.25,0.5,0.75,1]))
            else:
                return self.dfs[dataID]["data"].loc[idxIntersection,expColumns].median(axis=1)
            

    def getMedianExpressionByFeatureIDs(self,datasetsByFeatureID):
        ""
        distributionByFeatureID = OrderedDict()
        if len(datasetsByFeatureID) > 0 : 
            
            for featureID, dataIDs in datasetsByFeatureID.items():
                if len(dataIDs) > 0:
                    X = [self.getMedianExpression([featureID],dataID,True) for dataID in dataIDs]
                    Ms = [x[0] for x in X] #get medians
                    totalDistributionInDatasets = np.nanmedian(np.concatenate([x[1].reshape(1,-1) for x in X], axis=0),axis=0)
                    if len(Ms) == 1:
                        M = Ms[0].median()
                    else:
                       # print(pd.concat(Ms,axis=1).median(axis=1))
                        M = pd.DataFrame(pd.concat(Ms,axis=1).median(axis=1), columns=["m"]) #merge and get median
                    distributionByFeatureID[featureID] = {"m" : M, "dist":totalDistributionInDatasets}
            # featureIDs = list(datasetsByFeatureID.keys())
            # dataIDs = np.unique([dataID for dataIDs in datasetsByFeatureID.values() for dataID in dataIDs])
   
        return distributionByFeatureID



    def update(self):
        "Updates data and checks for new ones"
        if not self.__checkData():
            self.__readData()
            self.__readDataInfo()


    def getParams(self,dataID):
        ""
        if dataID in self.dfs:
            return self.dfs[dataID]["params"]

    def getParam(self,dataID,param):
        ""
        if dataID in self.dfs:
            return self.dfs[dataID]["params"][param]

    def getConfigParam(self,k):
        ""
        if k in self.config:
            return self.config[k]
    
    def getAPIParam(self,k):
        if k in self.config["api"]:
            return self.config["api"][k]

    def getSummary(self):
        "Returns a summary of all available datasets"
        return {"ID":"1231","descirption":"This dataset is cool."}


    def getExperimentalInformation(self, dataID):
        
        dataParams = self.getParams(dataID)
        if dataParams is None:
            return False, "Data ID not found"
        else:
            paramKeywords = self.getAPIParam("experiment-procedure-params")
            if paramKeywords is not None:
                if isinstance(paramKeywords,str):
                    paramKeywords = [paramKeywords]
                if not any(pKey in dataParams for pKey in paramKeywords):
                    return False, "param keywords not in dataID specific configuration file."
                
                experimentalInfo = []

                for pKey in paramKeywords:
                    if pKey in dataParams:
                        if isinstance(dataParams[pKey],str):
                            experimentalInfo.append({"title":pKey,"details":dataParams[pKey]})
                        elif isinstance(dataParams[pKey],list):
                            experimentalInfo.extend(dataParams[pKey])
                        else:
                            experimentalInfo.append(dataParams[pKey])
                return True, experimentalInfo 
            else:
                return False, "api-config misses param 'experiment-procedure-params"

    def getDataForFeatures(self,dataID,featureIDs,addGroupings=True):
        ""
        if dataID in self.dfs:
            boolIdx = self.dfs[dataID]["data"].index.isin(featureIDs)
            expColumns = self.getExpressionColumns(dataID)
            data = self.dfs[dataID]["data"].loc[boolIdx]
            data.loc[:,"idx"] = data.index
           # print(data)
            #print(expColumns)
            meltedData = data.melt(value_vars=expColumns, id_vars = ["idx"])
            
            if addGroupings:

                groupingMapper = self.getGroupingMapper(dataID)
                for groupingName, mapper in groupingMapper.items():

                    meltedData[groupingName] = meltedData["variable"].map(mapper)
           
            return meltedData
        return None
    

    def getFeatureDBInfo(self,featureIDs,*args,**kwargs):
        ""
        dbInfoColumns = self.getAPIParam("db-summary-params")
        if dbInfoColumns  is not None:
           return self.dbManager.getDBInfoForFeatureList(featureIDs,dbInfoColumns,*args,**kwargs)

    def getCorrelatedFeatures(self,dataID,featureIDs,scale=True):
        ""
        if dataID in self.dfs:
            boolIdx = self.dfs[dataID]["data"].index.isin(featureIDs)
            if np.any(boolIdx):
                expColumns = self.getExpressionColumns(dataID)
                expColumnsWithNonNan = self.dfs[dataID]["data"].loc[boolIdx,expColumns].dropna(axis=1).columns.values
                
                if expColumnsWithNonNan.size > 5:
                    Y = self.dfs[dataID]["data"].loc[boolIdx,expColumnsWithNonNan]
                    #filter other features to have overlapping non NaN columns (n=4)
                    X = self.dfs[dataID]["data"].dropna(subset=expColumnsWithNonNan, thresh=expColumnsWithNonNan.size)
                    correlation = X.corrwith(pd.Series(Y.values.T.flatten(),index=expColumnsWithNonNan),axis=1).dropna().sort_values(ascending=False)
                    corrHead = correlation.head(20)
                    XX = self.dfs[dataID]["data"].loc[corrHead.index,]
                    values = XX.loc[:,expColumns].values                
                    

                    if scale:
                        values = zscore(values,axis=1,nan_policy="omit")
                        maxValue = np.nanmax(np.abs(values.flatten()))
                        values = pd.DataFrame(values).replace({np.nan: None}).values
                        colorPalette = sns.color_palette("RdBu_r",n_colors=5).as_hex()
                        colorValues = np.linspace(-maxValue,maxValue,num=5).flatten().tolist()
                    
                    groupingMapper = self.getGroupingMapper(dataID)
                    groupingColorMapper = self.getGroupingColorMapper(dataID)

                    groupColorValues = []
                    for groupingName, groupingMapper in groupingMapper.items():
                        hexColorValues = [groupingColorMapper[groupingName][groupingMapper[colName]] for colName in expColumns]
                        groupColorValues.append(hexColorValues)
                    IDsOfCorrFeatures = corrHead.index.values
                    featureNames = self.dbManager.getDBInfoForFeatureListByColumnName(IDsOfCorrFeatures).values.flatten().tolist()
                    corrCoeff = corrHead.values.flatten().tolist()
                    
                    corrDataForHeatmap = {
                    
                        "values"          :   values.tolist(), 
                        "columnNeams"     :   expColumns,
                        "colorPalette"    :   colorPalette,
                        "colorValues"     :   colorValues,
                        "corrCoeff"       :   corrCoeff,
                        "groupingColors"  :  groupColorValues,
                        "groupingLegend"  :  groupingColorMapper,
                        "featureNames"    :  featureNames,
                        "downloadData"    : [dict([(expColumns[n],v) for n,v in enumerate(vv)] + 
                                [("Feature Name",featureNames[m])] + 
                                [("FeatureID",IDsOfCorrFeatures[m])] + 
                                [("CorrCoeff to {}".format(featureIDs[0]),corrCoeff[m])]) for m,vv in enumerate(values)]
                        }

                    
                    return  corrDataForHeatmap
            #find columns with no nan 
            else:
                print("Not in index.")
        else:
            print("Data ID not found")


    def getFiltersOptions(self):
        ""
        filterHeader = self.getAPIParam("filter-params")
        filterOptions = OrderedDict([(h,[]) for h in filterHeader])
        for h in filterHeader:
            availableOptions = []
            for _, X in self.dfs.items():
            
                if h in X["params"]:
                    availableOptions.append(X["params"][h])
            filterOptions[h] = pd.Series(availableOptions).unique().tolist() 
        return filterOptions

    def getGroupingDetails(self,dataID, expColumns):
        ""
        groupings = self.getParam(dataID,"groupings") 
        
            
        groupingNames = list(groupings.keys())
        groupingMapper = self.getGroupingMapper(dataID)
        groupingColorMapper = self.getGroupingColorMapper(dataID)

        groupColorValues = OrderedDict()
        groupingItems = OrderedDict()
        for groupingName, groupingSpecMapper in groupingMapper.items():
            hexColorValues = [groupingColorMapper[groupingName][groupingSpecMapper[colName]] for colName in expColumns]
            groupColorValues[groupingName] = hexColorValues
            #print(groupingMapper)
            groupingItems[groupingName] = list(groupingColorMapper[groupingName].keys())

        return groupings, groupingNames, groupingMapper, groupingColorMapper, groupColorValues, groupingItems

    def getHeatmapData(self,dataID,anovaCutoff = 0.0001):
        ""
        if dataID in self.dfs:
            expColumns = self.getExpressionColumns(dataID)
            annotationColumn = self.getAPIParam("annotation-colum")
            extraColumns = self.getAPIParam("extra-colums-in-dataset-heatmaps")
            groupings, groupingNames, groupingMapper, groupingColorMapper, groupColorValues, groupingItems = self.getGroupingDetails(dataID,expColumns)
            
            X = self.dfs[dataID]["data"].dropna(subset=expColumns)
            #print(X.index.size)
            results = pd.DataFrame(index = X.index)
            groupingName = groupingNames[0]
            testGroupData = [X[columnNames].values for columnNames in groupings[groupingName].values()]
            F,p = f_oneway(*testGroupData,axis=1)
            oneWayANOVAColumnName = "p-1WANOVA({})".format(groupingName)
            results[oneWayANOVAColumnName] = p
            boolIdx = results.index[results[oneWayANOVAColumnName] < anovaCutoff]

            if not np.any(boolIdx):
                return False, "Signficance cutoff resulted in an empty data frame (e.g. no signficiantly different proteins)."

            X = X.loc[boolIdx]
           
            values = X.loc[:,expColumns].values   
            values = zscore(values,axis=1,nan_policy="omit")
            maxValue = np.nanmax(np.abs(values.flatten()))
           # print(values)
            colorPalette = sns.color_palette("RdBu_r",n_colors=5).as_hex()
            colorValues = np.linspace(-maxValue,maxValue,num=5).flatten().tolist()
            rowLinkage = fastcluster.linkage(values, method ="complete", metric = "euclidean")   
            maxD = 0.75*max(rowLinkage[:,2])
            Z_row = sch.dendrogram(rowLinkage, orientation='left', color_threshold= maxD, 
                                    leaf_rotation=90, ax = None, no_plot=True)
            clusters = sch.fcluster(rowLinkage,16,'maxclust')
           
            vvs = pd.DataFrame(values,columns=expColumns)
           
            vvs = vvs.join([
                pd.Series(clusters,name="clusterIndex"),
                pd.Series(X.index,name="idx"),
                pd.Series(self.dbManager.getDBInfoForFeatureListByColumnName(X.index,annotationColumn).values.flatten(), 
                                name="annotationColumn").fillna("-"),
                pd.Series(results.loc[X.index,oneWayANOVAColumnName].values, name=oneWayANOVAColumnName)
                                ] + [
                pd.Series(self.dbManager.getDBInfoForFeatureListByColumnName(X.index,colName).values.flatten(),
                        name = colName).fillna("-") for colName in extraColumns])
            columnNamesForExport = expColumns+["idx","clusterIndex","annotationColumn",oneWayANOVAColumnName]+extraColumns
            #print(vvs)

            #print([pd.Series(self.dbManager.getDBInfoForFeatureListByColumnName(X.index,colName).values.flatten(),
             #                   name = colName).fillna("-") for colName in extraColumns])
           # print([pd.Series(self.dbManager.getDBInfoForFeatureListByColumnName(X.index,colName).unique(),
           #                     name = colName).fillna("-") for colName in extraColumns])
            vvs = vvs.iloc[Z_row['leaves']]
            values = vvs.loc[:,columnNamesForExport]
            
            columnsForClusterMedian = [colName for colName in columnNamesForExport if colName != oneWayANOVAColumnName]

            nClusters = np.unique(clusters).size
           
            clusterMedians = vvs[columnsForClusterMedian].groupby("clusterIndex").agg("median")
            clusterSize = vvs[columnsForClusterMedian].groupby("clusterIndex").agg("size")
            clusterMediansT = clusterMedians.transpose()
           
            for groupingName in groupingNames:
                clusterMediansT[groupingName] = [groupingMapper[groupingName][x] for x in clusterMediansT.index]
            clustersMediansGrouped  = clusterMediansT.groupby(by=groupingNames, sort=False).agg("median").transpose()

            #save group names and colors 
            r = []
            for x in clustersMediansGrouped.columns:
                
                if isinstance(x,tuple):
                    x1,x2 = x 
                    cs = groupingColorMapper[groupingNames[0]][x1],groupingColorMapper[groupingNames[1]][x2]
                    r.append([x,cs])
                elif isinstance(x,str):
                    cs = groupingColorMapper[groupingNames[0]][x]
                    r.append([[x],[cs]])

            out = {
                "legend" : {
                        "groupingNames" : groupingNames,
                        "groupingColorMapper" : groupingColorMapper,
                        "groupingItems" : groupingItems,
                        "groupingMapper" : groupingMapper
                    },

                "heatmap" : {
                        "nColumns" : len(expColumns),
                        "values" : values.values.tolist(),
                        "groupColorValues" : groupColorValues,
                        "colorPalette" : colorPalette,
                        "colorValues" : colorValues,
                        "clusterIndex" : vvs["clusterIndex"].values.flatten().tolist(),
                        "columnNames" : columnNamesForExport,
                        "dataID" : dataID,
                        "nExtraColumns" : len(extraColumns)
                    },
                "clusterView" : {
                    "clusterIndexValues" : clusterSize.index.values.tolist(),
                    "values" : clustersMediansGrouped.values.tolist(),
                    "clusterColors" : dict([(int(clusterSize.index.values[n]),hex) for n,hex in enumerate(sns.color_palette("Blues",n_colors=nClusters).as_hex())]),
                    "nValuesInCluster" : clusterSize.values.tolist(),
                    "hoverColorAndGroups" : r

                }

            }
    #        n : 5,
    # values : [[-1,2,3,4],[2,2,3,4,1,-3,-3,4,5,2],[1,2,1,-1],[1,2,1,-1],[1,2,1,-1]],
    # nValuesInCluster : [3,400,5,6,6],
    # clusterColors : ["red","green","blue","yellow","orange"]
            return True, out
        return False, "Unknwon error."

    def getVolcanoData(self,dataID,grouping):
        ""
       
        if dataID in self.dfs:

            #check grouping
            if "withinGrouping" not in grouping:
                grouping["withinGrouping"] = "None"

            expColumns = self.getExpressionColumns(dataID)
            
            annotationColumn = self.getAPIParam("annotation-colum")
            filterColumns = self.getAPIParam("filters-in-volcano-plots")
            highlightColumns = self.getAPIParam("highlight-in-volcano-plots")
            highlightColumnSepForMenu = self.getAPIParam("highlight-in-volcano-plots-sep-cat-by")
            #print(highlightColumnSepForMenu)
            groupings, groupingNames, groupingMapper, groupingColorMapper, groupColorValues, groupingItems = self.getGroupingDetails(dataID,expColumns)
            
            d = self.dfs[dataID]["data"]
            data = d.join([self.dbManager.getDBInfoForFeatureListByColumnName(d.index,colName,checkShape=False).fillna("-") for colName in filterColumns ]+ [self.dbManager.getDBInfoForFeatureListByColumnName(d.index,annotationColumn,checkShape=False).fillna("-")])
            
            data[filterColumns] = data[filterColumns].fillna("-")
            

            groupingName, group1, group2 = grouping["main"], grouping["group1"], grouping["group2"]
            if groupingName in groupings and group1 in groupings[groupingName] and group1 in groupings[groupingName]:
                columnNames1 = groupings[groupingName][group1]
                columnNames2 = groupings[groupingName][group2]
                if grouping["withinGrouping"] != "None" and grouping["withinGrouping"] in groupings and grouping["withinGroup"] in groupings[grouping["withinGrouping"]]:
                    withinGroupingColumnNames = groupings[grouping["withinGrouping"]][grouping["withinGroup"]]

                    columnNames1 = [colName for colName in columnNames1 if colName in withinGroupingColumnNames]
                    columnNames2 = [colName for colName in columnNames2 if colName in withinGroupingColumnNames]
               
            #get highlight column data 
            highlightFeatures = OrderedDict() 
            highlightMenuBuilder = OrderedDict() 
            if len(highlightColumns) > 0:
                
                data = data.join([self.dbManager.getDBInfoForFeatureListByColumnName(d.index,colName,checkShape=False).fillna("-") for colName in highlightColumns])
                for highlightColumn in highlightColumns:
                    
                    splitData = data[highlightColumn].astype("str").str.split(";").values
                    #get unique values 
                    flatSplitDataList = list(set(itertools.chain.from_iterable(splitData)))
                    vs = dict([(cat if highlightColumn not in highlightColumnSepForMenu else cat.split(">")[-1],data.index[data[highlightColumn].str.contains(buildRegex([cat],splitString=";")).fillna(False)].values.tolist()) for cat in flatSplitDataList if cat not in ["-","0"]])
                    if 'nan' in vs:
                        del vs['nan']

                    # if highlightColumn in highlightColumnSepForMenu:
                    #     #menuBuilder = OrderedDict() 
                    #     menuBuilder  = dict([(item.split(">")[0].strip(),{}) for item in vs.keys()])
                    #     maxLevel = np.max([len(item.split(">")) for item in vs.keys()])
                    #     # print(maxLevel)
                    #     # print(menuBuilder)
                    #     for item in vs.keys():
                    #         splitItems = [item.strip() for item in item.split(">")]

                    #         if len(splitItems) == 2:
                    #             continue
                    #             if isinstance(menuBuilder[splitItems[0]],dict):
                    #                 menuBuilder[splitItems[0]] = []
                    #             menuBuilder[splitItems[0]].append(splitItems[1])
                            
                    #         elif len(splitItems) == 3:
                    #             if splitItems[1] not in menuBuilder[splitItems[0]] and isinstance(menuBuilder[splitItems[0]],dict):
                                   
                    #                 menuBuilder[splitItems[0]][splitItems[1]] = []

                    #             menuBuilder[splitItems[0]][splitItems[1]].append(splitItems[2])

                    #     print(menuBuilder)   
                    #     highlightMenuBuilder[highlightColumn] = highlightMenuBuilder     
                        
                    highlightFeatures[highlightColumn] = vs 

            X = data.loc[:,columnNames1]
            Y  = data.loc[:,columnNames2]
            T,p = ttest_ind(X,Y,nan_policy="omit",axis=1)
            # print(p)
            boolIdx, p_adj, _, _ = multipletests(p,alpha=0.05,method="fdr_tsbky")
            # print(p_adj)
            diff = pd.DataFrame(pd.Series(d.loc[:,columnNames1].mean(axis=1) - d.loc[:,columnNames2].mean(axis=1), name="x"))
            diff["y"] = (-1)*np.log10(p)
            diff["s"] = boolIdx
            
            diff = diff.join(data[filterColumns + [annotationColumn]])
            
            diff = diff.reset_index()
            # print(self.dbManager.getDBInfoForFeatureListByColumnName(X.index,annotationColumn,checkShape=False).values.flatten())
            #diff = diff.join(pd.Series(self.dbManager.getDBInfoForFeatureListByColumnName(X.index,annotationColumn,checkShape=False).values.flatten(), 
             #               name="l"))
            diff[annotationColumn] = diff[annotationColumn].fillna("-")
            diff = diff.dropna(subset=["x","y"])
            # print(diff[filterColumns[0]].unique())

            maxXValue, maxYValue = diff["x"].abs().max(), diff["y"].abs().max()
            #print(diff)
            xLabel = "log2FC {} vs {}".format(group1,group2) if grouping["withinGrouping"] == "None" else "log2FC {} vs {} - ({}:{})".format(group1,group2,grouping["withinGrouping"],grouping["withinGroup"])
            
            defaultColumns = ["x","y","s","Key",annotationColumn]
            out = {
                "points": diff[defaultColumns + filterColumns].values.tolist(),
                "xDomain" : [-maxXValue-maxXValue*0.1,maxXValue+maxXValue*0.1],
                "yDomain" : [maxYValue+maxYValue*0.1,-0.005*maxYValue],
                "xlabel"  : xLabel,
                "ylabel"  : "-log10 p-value",
                "filterColumns" : [(colName,len(defaultColumns)+n) for n,colName in enumerate(filterColumns)],
                "searchIndex" : [defaultColumns.index("Key"),defaultColumns.index(annotationColumn)],
                "pointColumnNames" : [xLabel,"-log10 p-value","Significant","Key","Label"]+ filterColumns,
                "highlightFeatures" : highlightFeatures,
                #"highlightMenuBuilder" : highlightMenuBuilder.copy()
            }
            return True, out
                

        return False, None

    def getDataForCard(self,dataID,featureID,filterName):
        ""
        meltedData = self.getDataForFeatures(dataID = dataID, featureIDs=[featureID])
       # groupingMapper = self.getGroupingMapper(dataID)
        groupingColorMapper = self.getGroupingColorMapper(dataID)
        groupings = self.getParam(dataID,"groupings") 
        
        if groupings is None: return {}
        groupingNames = list(groupings.keys())
       
        minValue, maxValue = meltedData["value"].quantile(q=[0,1]).values
        marginRange = np.sqrt(maxValue**2 - minValue**2) * 0.05
        groupedData = meltedData.groupby(by = groupingNames,sort=False) #level_X == quantile due to reset_index
        boxplotData = groupedData.quantile(q=[0,0.25,0.5,0.75,1]).reset_index() 
        quantileColumnName = "level_{}".format(len(groupingNames)) # get name for quantile
        boxplotData[quantileColumnName] = boxplotData[ quantileColumnName].replace([0,0.25,0.5,0.75,1],["min","q25","m","q75","max"])
        try:
            statsData = anova(meltedData,dv="value",between=groupingNames)
            statsData.columns = [pingouinColumn[colName] if colName in pingouinColumn else colName for colName in statsData.columns]
        # ´handle data extraction depending on the number of groupings
        except:
            statsData = pd.DataFrame(["ANOVA could not be calculated."], columns=["Error"])
        v = []
        if len(groupingNames) == 1:
            tickLabel = [""]
            for groupName,groupData in boxplotData.groupby(groupingNames,sort=False):
                groupData.loc[:,"value"] = groupData["value"].replace({np.nan: None})
                N = groupedData.get_group(groupName).dropna(subset=["value"]).index.size
                vv = dict([(idx,value) for idx,value in groupData.loc[:,[quantileColumnName,"value"]].values])
                vv["fillColor"] = groupingColorMapper[groupingNames[0]][groupName]
                vv["n"] = N
                v.append(vv)
            legendTitle = groupingNames[0]
            legendData = groupingColorMapper[legendTitle]
            v = [v]
            #return {"success":True,"download":meltedData.to_json(orient="records"),"chart":chartData,"statsData":statsData.to_json(orient="records")}
        elif len(groupingNames) == 2:
            tickLabel = [group for group in groupings[groupingNames[0]].keys()]
            #calculate statistics

            groupedBoxData = boxplotData.groupby(groupingNames,sort=False)
            for groupName1 in groupings[groupingNames[0]].keys():
                vi = []
                for groupName2 in groupings[groupingNames[1]].keys():
                    
                    groupData = groupedBoxData.get_group((groupName1,groupName2))
                    N = groupedData.get_group((groupName1,groupName2)).dropna(subset=["value"]).index.size
                    groupData.loc[:,"value"] = groupData["value"].replace({np.nan: None})

                    vv = dict([(idx,value) for idx,value in groupData.loc[:,[quantileColumnName,"value"]].values])
                    vv["fillColor"] = groupingColorMapper[groupingNames[1]][groupName2]
                    vv["n"] = N  
                    vi.append(vv)
                v.append(vi)
            legendTitle = groupingNames[1]
            legendData = groupingColorMapper[legendTitle]
                    
               # if len(groupings) == 1:
                
                    
            #print(v)
            
        chartData = {"graphType":{"1":"boxplot"},
                        "graphData":{
                            "1":{
                                "minValue" : minValue - marginRange,
                                "maxValue" : maxValue + marginRange,
                                "values" : v,
                                "title" : "",
                                "featureNames" : tickLabel,
                                "legend" : legendData,
                                "legendTitle" : legendTitle
                            }
                            }, 
                        
            }
        
        #print(chartData)

        return {"success":True,"download":meltedData.to_json(orient="records"),"chart":chartData,"statsData":statsData.to_json(orient="records")}