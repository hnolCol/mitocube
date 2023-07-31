from flask import request
from flask_restful import Resource


class InitialLanding(Resource):
    def __init__(self, *args, **kwargs):
        """"""
        # ToDo: Write documentation
        # ToDo: Implement
        # ToDo: Implement

    def get(self):
        """"""
        # ToDo: Write documentation
        # ToDo: Implement
        appName = None  # self.data.getConfigParam("app-name")
        welcomeText = None  # self.data.getConfigParam("welcome-text")

        return {"appName": appName if not None else "Welcome to MitoCube.",
                "welcomeText": welcomeText if not None else "MitoCube offers protein-centric information of proteomics experiments."}
