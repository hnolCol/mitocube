from requests import delete
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

            adminTokenString, validateCode = self.token.createAdminToken(superAdmin)
           
            self.email.sendEmail(
                title="Admin Login Validation Code",
                recipients = [data["email"]],
                html="<div><h3>MitoCube Validation Code</h3><p>You validation code for MitoCube Login is: {}</p><p>Enter the code at the login window in your browser and enjoy.<br>The MitoCube Team</p></div>".format(validateCode))
            return {"success":True,"token":adminTokenString,"msg":"Validate code sent via email.","superAdmin":superAdmin}
        return {"success":False,"token":"","msg":"Input not valid."}



class AdminUser(Resource):
    def __init__(self,*args,**kwargs):
        """
        Handles user management.
        """
        self.token = kwargs["token"]
        self.users = kwargs["user"]
    

    def get(self):
        ""
        token = request.args.get('token', default="None", type=str)
        if token == "None" or not self.token.isAdminTokenValidated(token):
            return {"success":False,"error":"Token is not valid."}
        ok, users = self.users.getUsers()

        return {"success":ok, "users":users}


    def  post(self):
        "Add user"
        data = json.loads(request.data, strict=False)
        if all(x in data for x in ["token","pw","email","name"]):
            
            if self.token.isAdminTokenValidated(data["token"]):
                ok, msg, users = self.users.addUser(data["email"],data["pw"],data["name"],superAdmin=False)
                return {"success":ok, "msg":msg, "users": users}
            else:
                return {"success":False,"msg":"Admin token is not valid."}
        else:
            return {"success":False, "msg":"Not all required data foud in json."}


    def delete(self):
        ""
        if request.data != b'':
            data = json.loads(request.data, strict=False)
            if not "token" in data:
                return {"success":False,"error":"token missing."}
            if not "userID" in data:
                return {"success":False,"error":"userID missing."}

            token = data["token"]
            userID = data["userID"]
            if token != "None" and self.token.isAdminValid(token):
                okDeleteUsers, msg =  self.users.deleteUserByID(userID)
                okGetUsers, users = self.users.getUsers()
                if okDeleteUsers:
                    return {"success":True,"msg":msg,"users":users}
            
            return {"success":False,"error":"Token is not valid."}
        return {"success":False,"error":"No json data."}

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
        self.users = kwargs["user"]

    def post(self):
        "Returns if token is valid"
        data = json.loads(request.data, strict=False)
        if "token" in data:
            if self.token.isAdminTokenValidated(data["token"]):
                superAdmin = self.token.isTokensuperAdmin(data["token"])
                return {"success":True,"valid":True,"superAdmin":superAdmin}
            
        return {"success":False}