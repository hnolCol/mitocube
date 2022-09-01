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
        if "pw" in data:
            if check_password_hash(self.pwHash,data["pw"]):
                tokenString = self.token.createToken()
                return {"success":True,"token":tokenString}
    
        return {"success":False,"token":None}


class AdminLoginWebsite(Resource):
    def __init__(self,*args,**kwargs):
        """
        """
        self.token = kwargs["token"]
        self.data = kwargs["data"]
        self.email = kwargs["email"]
        self.users = kwargs["user"]
        
    def post(self):
        ""
        data = json.loads(request.data, strict=False)
       
        if "email" in data and "pw" in data and "token" in data and self.token.isValid(data["token"]): #standard login token
            validUser, superAdmin = self.users.validateUser(data["email"],data["pw"])
            if not validUser:
                return {"success":False,"token":"","msg":"Account information not valid."}

            adminTokenString, validateCode = self.token.createAdminToken()
           
            self.email.sendEmail(
                title="Admin Login Validation Code",
                recipients = [data["email"]],
                html="<div><h3>MitoCube Validation Code</h3><p>You validation code for MitoCube Login is: {}</p><p>Enter the code at the login window in your browser and enjoy.<br>The MitoCube Team</p></div>".format(validateCode))
            return {"success":True,"token":adminTokenString,"msg":"Validate code sent via email.","superAdmin":superAdmin}
        return {"success":False,"token":"","msg":"Input not valid."}



class AdminUser(Resource):
    def __init__(self,*args,**kwargs):
        """
        """
        self.token = kwargs["token"]
        self.users = kwargs["user"]
    
    def  post(self):
        ""
        data = json.loads(request.data, strict=False)
        if all(x in data for x in ["token","pw","email"]):
            
            if self.token.isAdminTokenValidated(data["token"]):
                ok, msg = self.users.addUser(data["email"],data["pw"],superAdmin=False)
                return {"success":ok, "msg":msg}
            else:
                return {"success":False,"msg":"Admin token is not valid."}
        else:
            return {"success":False, "msg":"Not all required data foud in json."}

class AdminLoginValidation(Resource):
    def __init__(self,*args,**kwargs):
        """
        """
        self.token = kwargs["token"]

    def post(self):
        ""
        data = json.loads(request.data, strict=False)
        
        if "validationCode" in data and "adminToken" in data and "token" in data and self.token.isValid(data["token"]): #standard login token
          
            success, msg = self.token.validateToken(data["adminToken"],data["validationCode"])
            return {"success":success,"msg":msg}

        return {"success":False,"msg":"Login not successful. Tokens reset."}

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
        
class AdminTokenValid(Resource):
    def __init__(self,*args,**kwargs):
        """
        """
        self.token = kwargs["token"]

    def post(self):
        "Returns if token is valid"
        data = json.loads(request.data, strict=False)
        if "token" in data:
            print(data)
            print(self.token.isAdminTokenValidated(data["token"]))
          
            if self.token.isAdminTokenValidated(data["token"]):

                return {"success":True,"valid":True,"superAdmin":False}
            
        return {"success":False}