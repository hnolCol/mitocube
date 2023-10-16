from flask import request
from flask_restful import Resource
from scipy.cluster.hierarchy import dendrogram, linkage, cut_tree, to_tree
import numpy as np 
#!/usr/bin/python
from functools import reduce
# Load required modules
import pandas as pd 
import scipy.spatial
import scipy.cluster
import numpy as np
import json
import matplotlib.pyplot as plt
from collections import OrderedDict

# Example data: gene expression
# geneExp = {'genes' : ['a', 'b', 'c', 'd', 'e', 'f'],
#      	   'exp1': [-2.2, 5.6, 0.9, -0.23, -3, 0.1],
# 	   'exp2': [5.4, -0.5, 2.33, 3.1, 4.1, -3.2]
#           }
# df = pd.DataFrame( geneExp )

# # Determine distances (default is Euclidean)
# dataMatrix = np.array( df[['exp1', 'exp2']] )
# distMat = scipy.spatial.distance.pdist( dataMatrix )

# # Cluster hierarchicaly using scipy
# clusters = scipy.cluster.hierarchy.linkage(distMat, method='single')
# T = scipy.cluster.hierarchy.to_tree( clusters , rd=False )

# # Create dictionary for labeling nodes by their IDs


# # Draw dendrogram using matplotlib to scipy-dendrogram.pdf
# scipy.cluster.hierarchy.dendrogram(clusters, labels=labels, orientation='right')


# Create a nested dictionary from the ClusterNode's returned by SciPy
def add_node(node, parent ):
    # First create the new node and append it to its parent's children
    newNode = dict( node_id=node.id, children=[], count = node.count)
    parent["children"].append( newNode )

    # Recursively add the current node's children
    if node.left: add_node( node.left, newNode )
    if node.right: add_node( node.right, newNode )
        



# Label each node with the names of each leaf in its subtree
def label_tree( n, id2name):
	# If the node is a leaf, then we have its name
	if len(n["children"]) == 0:
		leafNames = [ id2name[n["node_id"]] ]
	
	# If not, flatten all the leaves in the node's subtree
	else:
		leafNames = reduce(lambda ls, c: ls + label_tree(c, id2name), n["children"], [])

	# Delete the node id since we don't need it anymore and
	# it makes for cleaner JSON
	del n["node_id"]

	# Labeling convention: "-"-separated leaf names
	n["name"] = "" if len(leafNames) > 1 else "-".join(sorted(map(str, leafNames)))
	
	return leafNames

#label_tree( d3Dendro["children"][0] )

# Output to JSON
#json.dump(d3Dendro, open("d3-dendrogram.json", "w"), sort_keys=True, indent=4)





class DendrogramTest(Resource):
    def __init__(self,*args,**kwargs):
        ""
    def get(self):

        # generate two clusters: a with 100 points, b with 50:
        np.random.seed(4711)  # for repeatability of this tutorial
        a = np.random.multivariate_normal([10, 0], [[3, 1], [1, 4]], size=[100,])
        b = np.random.multivariate_normal([0, 20], [[3, 1], [1, 4]], size=[50,])
        X = np.concatenate((a, b),)
        
        Z = linkage(X, 'ward')

       # print(Z)    
        T = to_tree( Z  , rd=False)
        
        clusters = cut_tree(Z, n_clusters=12)
       # print(clusters)
        X = np.concatenate([X,clusters],axis=1)
        
        
        # XX = pd.DataFrame(X,columns=["x","y","cluster"])
        # GG = XX.groupby("cluster")
        # print(GG.agg("count"))
        # GGS = GG.agg("median")
        # labels = list(GG.groups.keys())
        # id2name = dict(zip(range(len(labels)), labels))
        # ZZ = linkage(GGS,"ward")
        # TT = to_tree( ZZ  , rd=False)

        L = dendrogram(Z,truncate_mode="lastp",p=12, no_plot=True)
        #plt.scatter(x=X[:,0], y=X[:,1], c=X[:,2])
        points = []
        for i, d, c in zip(L['icoord'], L['dcoord'], L['color_list']):
            x = 0.5 * sum(i[1:3])
            y = d[1]
        #print(L)
        ls = []
        for x,y in zip(L["icoord"], L["dcoord"]):

            ls.append([{"x" : xcoord, "y": ycoord} for xcoord, ycoord in zip(x,y)])

        # # Initialize nested dictionary for d3, then recursively iterate through tree
        # d3Dendro = dict(children=[], name="Root1")
        # add_node( TT, d3Dendro )
        # label_tree( d3Dendro["children"][0], id2name)

        #print(d3Dendro)
        return {"lines" : ls }



class TestMitoCarta(Resource):
    def __init__(self,*args,**kwargs):
        """
        """
        self.token = kwargs["token"]
        self.data = kwargs["data"]

    def get(self):
        dataID = "8dlTWpi5MMhF"
        grouping = {"main" : "Genotype", "group1" : "WT", "group2" : "TMBIM5KO"}
        totalValues = self.data.getDBFeatureCounts("MitoCarta3.0_SubMitoLocalization",{"Organism" : ["Homo sapiens (Human)"]})
        print(totalValues.to_dict())
        bool, results, tTestResult = self.data.getVolcanoData(dataID,grouping)
        boolIdx = tTestResult["MitoCarta3.0_SubMitoLocalization"] != "-"
        tTestResult = tTestResult.rename(columns={"Gene names  (primary )":"GeneNames"})
        print(tTestResult.columns)
        return {"success" : True, 
                "data" : tTestResult.loc[boolIdx,:].dropna(subset=["MitoCarta3.0_SubMitoLocalization"]).fillna("-").to_dict(orient="records"),
                "yaxisName" : "x", 
                "yLabel" : f"Log2 Fold Change {grouping['group1']} vs {grouping['group2']}",
                "totalSubplotValues" : totalValues.to_dict(),
                "subplotName" : "MitoCarta3.0_SubMitoLocalization"}
        


class KeyFigures(Resource):
    def __init__(self,*args,**kwargs):
        """
        """
    def get(self):
        return [{"label": "Proteins", "metric" : 7834}, {"label": "Instruments", "metric" : 5}, {"label": "Users", "metric" : 25}, {"label": "Turnaround [d]", "metric" : 23}]

class WelcomeText(Resource):
    def __init__(self,*args,**kwargs):
        """
        """
        self.data = kwargs["data"]

    def get(self):
        ""
        appName = self.data.getConfigParam("app-name")
        welcomeText = self.data.getConfigParam("welcome-text")

        return {"appName":appName if not None else "Welcome to MitoCube.","welcomeText":welcomeText if not None else "MitoCube offers protein-centric information of proteomics experiments."}
        

class News(Resource):
    def __init__(self,*args,**kwargs):
        """
        """
    def get(self):
        ""
        return [{"title" : "New Dataset online.","date" : "02.02.2023","message" : "This is an example message", "link" : "/dataset/asdada"}]


         

class DataTest(Resource):

    def __init__(self,*args,**kwargs):
            """
            """
            self.featureFinder = kwargs["featureFinder"]
            self.token = kwargs["token"]
            self.data = kwargs["data"]
            print(self.featureFinder)
          
    def get(self):
        
        token = request.args.get('token', default="None", type=str)
        featureID = request.args.get('featureID', default="None", type=str)
        dataIDsByFeature = self.featureFinder.getDatasets([featureID], {}, returnNumberOfData=False,featureSpecFilter= {})
        for featureID, dataIDs in dataIDsByFeature.items():
            X = OrderedDict([(dataID, self.data.getDataForCard(dataID,featureID,{})) for dataID in dataIDs])

        

        return X
