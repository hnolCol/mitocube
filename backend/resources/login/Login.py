from flask import request, jsonify
from flask_restful import Resource
from werkzeug.security import generate_password_hash, check_password_hash
import json




class LoginWebsite(Resource):
    def __init__(self,*args,**kwargs):
        """
        """
        self.token = kwargs["token"]
        self.data = kwargs["data"]
        self.pwHash = generate_password_hash(self.data.getConfigParam("pw"))
        
    def post(self):
        "Returns features in data"
        data = json.loads(request.data, strict=False)
        tokenString = self.token.createToken()
        if "pw" in data:
            if check_password_hash(self.pwHash,data["pw"]):
                return {"success":True,"token":tokenString}
    
        return {"success":False,"token":None}

class TokenValid(Resource):
    def __init__(self,*args,**kwargs):
        """
        """
        self.token = kwargs["token"]
    
    def post(self):
        "Returns features in data"
        data = json.loads(request.data, strict=False)
        if "token" in data:
            return self.token.isValid(data["token"])
            
        return False
        