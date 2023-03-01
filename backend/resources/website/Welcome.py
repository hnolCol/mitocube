from flask import request
from flask_restful import Resource


class WelcomeText(Resource):
    def __init__(self,*args,**kwargs):
        """
        """
        self.data = kwargs["data"]

    def get(self):
        ""
        appName = self.data.getConfigParam("app-name")
        welcomeText = self.data.getConfigParam("welcome-text")

        return {"appName":appName,"welcomeText":welcomeText}
        