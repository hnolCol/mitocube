from flask import request, jsonify
from flask_restful import Resource
from werkzeug.security import generate_password_hash, check_password_hash
import json


class ShareToken(Resource):
    def __init__(self,*args,**kwargs):
        """
        """
        self.token = kwargs["token"]
    
    def post(self):
        "Returns features in data"
        data = json.loads(request.data, strict=False)
        if "token" in data:
            if not self.token.isAdminTokenValidated(data["token"]):
                return {"success": False, "msg":"Admin token not valid."}
            else:
                tokenString = self.token.createShareToken()
                return {"success": True, "msg":"Share token created.","token" : tokenString}
        return False


class ShareTokenValid(Resource):
    def __init__(self,*args,**kwargs):
        """
        """
        self.token = kwargs["token"]
    
    def post(self):
        "Returns features in data"
        data = json.loads(request.data, strict=False)
        if "token" in data:
            return self.token.isShareTokenValid(data["token"])
            
        return False