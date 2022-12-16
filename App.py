


#import flask utils
from flask import Flask, request, jsonify, send_from_directory, render_template
from flask_restful import Resource, Api

#import internal helpers/resources 
from backend.resources.resources import mitoCubeResources

from backend.helper.Data import Data, DBFeatures
from backend.helper.Token import Token
from backend.helper.FeatureFinder import FeatureFinder
from backend.helper.Email import EmailHelper
from backend.helper.Admin import AdminUsers
from backend.helper.Submission import Submission
from backend.helper.Performance import Performance
from backend.helper.PTM import PTMAnnotations, PTMManger
#external package imports

import os

from decouple import config

#internal imports
# set the project root directory as the static folder
app = Flask(__name__,
            static_folder='build/static',
            template_folder="build",
            )

api = Api(app)
#define improtant paths
pathToTokens = os.path.join(app.root_path,"backend","data","dynamic","tokens.json")
pathToUsers = os.path.join(app.root_path,"backend","data","dynamic","users.json")
pathToData = os.path.join(app.root_path,"backend","data","static","datasets")
pathToPerformanceData = os.path.join(app.root_path,"backend","data","dynamic","performance")
pathToDB = os.path.join(app.root_path,"backend","data","static","dbs","uniprot")
pathToSubmissionFolder =  os.path.join(app.root_path,"backend","data","dynamic","submissions")
pathToArchive =  os.path.join(app.root_path,"backend","data","archive")
pathToAPIConfig = os.path.join(app.root_path,"backend","config","docs")
#define data helpers

dbManager = DBFeatures(pathToDB=pathToDB)
dataManger = Data(pathToData,pathToAPIConfig,dbManager)
adminUserManager = AdminUsers(pathToUsers)
tokenManager = Token(pathToTokens, tokensValid = dataManger.getAPIParam("token-valid(h)"), shareTokensValid = dataManger.getAPIParam("share-token-valid(h)"))
performanceManager = Performance(pathToData = pathToPerformanceData, 
                        performanceConfig = dataManger.getAPIParam("performance-runs"), 
                        propertyOptions = dataManger.getAPIParam("performancePropertyOptions"),
                        mainGroup = dataManger.getAPIParam("performance-main-group"))

##update email settings
emailSettings = dataManger.getConfigParam("email-sever-settings")
for k,v in emailSettings.items():
        if v in [0,1]:
                app.config[k] = v == 1
        else:
                app.config[k] = v
app.config["MAIL_PASSWORD"] = config("email-pw")

#init email and submission manager
emailHelper = EmailHelper(app)
submissionManager =  Submission(pathToSubmissionFolder,pathToArchive ,dataManger, emailHelper)
featureFinder = FeatureFinder(data = dataManger, DB = dbManager)
ptmManger = PTMManger(dataManger,featureFinder)
##put helpers in dict for easy init
helpers = {
        "data" :  dataManger,
        "featureFinder" : featureFinder,
        "db" : dbManager,
        "token" : tokenManager,
        "email" : emailHelper,
        "user" : adminUserManager,
        "submission" : submissionManager,
        "ptm" : ptmManger,
        "performance" : performanceManager
}

# add resources 
for resource in mitoCubeResources:
        resourceKwargs = dict()
        if len(resource["reqKwargs"]) > 0:
                resourceKwargs = dict([(k,helpers[k]) for k in resource["reqKwargs"]])
        api.add_resource(resource["obj"],resource["url"],resource_class_kwargs=resourceKwargs)


@app.route("/")
def build_index():
        return render_template("index.html")#

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, use_reloader = True)
