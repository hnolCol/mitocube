from ast import Or
from errno import EADDRNOTAVAIL
from importlib.resources import path
from typing import OrderedDict
import pandas as pd 
import numpy as np 
import os 
import json
from scipy.stats import zscore
import seaborn as sns 
from pingouin import anova
from decouple import config
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

    def getDBInfoForFeatureListByColumnName(self,featureIDs,columnName = "Gene names  (primary )"):
        ""
        if columnName in self.DBs.columns:
            idxIntersection = self.DBs.index.intersection(featureIDs)
        
            if idxIntersection.size == len(featureIDs):
                return self.DBs.loc[featureIDs,columnName]
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



    def getDataForCard(self,dataID,featureID,filterName):
        ""
        meltedData = self.getDataForFeatures(dataID = dataID, featureIDs=[featureID])
       # groupingMapper = self.getGroupingMapper(dataID)
        groupingColorMapper = self.getGroupingColorMapper(dataID)
        groupings = self.getParam(dataID,"groupings") 
        
        if groupings is None: return {}
        groupingNames = list(groupings.keys())
        #groupingColormaps = self.getParam(dataID,"groupingCmap")
        #colorsForGroupings = dict([(groupingName,sns.color_palette(groupingColormaps[groupingName],n_colors=len(groupings[groupingName]),desat=0.75).as_hex()) for groupingName in groupingNames if groupingName in groupingColormaps])
      #  groupingColors = dict([(groupingName, dict([(groupName,colorsForGroupings[groupingName][n]) for n,groupName in enumerate(groupings[groupingName].keys())])) for groupingName in groupingNames])
                
        #get data (quantiles for boxplot)
        
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