
from lib2to3.pgen2 import token
from .Misc import getRandomString
import time 
import os 
from datetime import date, datetime, timedelta
import pickle 

class Token(object):
    ""
    def __init__(self,pathToTokens,*args,**kwargs):
        ""
        self.tokens = dict() 
        self.pathToTokens = pathToTokens
        self.__readTokens()

    def __readTokens(self):
        ""
        if os.path.exists(self.pathToTokens):
            with open(self.pathToTokens, 'rb') as f:
                tokensFromFile = pickle.load(f)
            self.tokens = {**tokensFromFile,**self.tokens}
            #remove invalid tokens
            self.tokens = dict([(k,v) for k,v in self.tokens.items() if v["validTill"] > datetime.now()])
    
    def __saveTokens(self):
        ""
        with open(self.pathToTokens, 'wb') as f:
            pickle.dump(self.tokens,f)
            

    def updateTokens(self):
        ""

    def __createToken(self,N, isAdminToken = False, validHours = 48, emailValidated = False):
        ""
        t1 = datetime.now()
        t2 = t1 + timedelta(hours=validHours)
        tokenString = getRandomString(N)
        validateCode = "None" if not isAdminToken else getRandomString(10)
        t = {
            "token" : tokenString,
            "isAdminToken" : isAdminToken,
            "validTill" : t2,
            "validated" : emailValidated,
            "validationCode" : validateCode
            }
        return  tokenString,validateCode,t

    def createAdminToken(self):
        ""
        #create admin token, quires validated by email
        tokenString, validateCode, t = self.__createToken(N = 120, isAdminToken = True, validHours = 48, emailValidated = False)
        
        self.tokens[tokenString] = t
        self.__saveTokens()
        return tokenString, validateCode

    def createToken(self):
        ""
        #create token, that does not have to be validated.
        tokenString, _, t = self.__createToken(N = 40,isAdminToken = False, validHours = 48,emailValidated = True)
        self.tokens[tokenString] = t
        self.__saveTokens()

        return tokenString

    def isValid(self,tokenID):
        ""
        self.__readTokens()
        if tokenID in self.tokens:
            validTillTtime = self.tokens[tokenID]["validTill"]
            if validTillTtime > datetime.now():
                return True
        return False

    def isAdminValid(self,tokenID):
        ""
        self.__readTokens()
        if tokenID in self.tokens:
            token = self.tokens[tokenID]
            if token["validated"]:
                return True
        return False

    def isAdminToken(self,adminToken):
        ""
        if adminToken in self.tokens and self.tokens[adminToken]["isAdminToken"]:
            return True
        return False

    def isAdminTokenValidated(self,adminToken):
        ""
        return adminToken in self.tokens and self.isAdminToken(adminToken) and self.tokens[adminToken]["validated"]

    def validateToken(self,adminTokenID,validationCode):
        ""
        if self.isAdminToken(adminTokenID) and not self.isAdminTokenValidated(adminTokenID):
            if self.tokens[adminTokenID]["validationCode"] == validationCode:
                self.tokens[adminTokenID]["validated"] = True
                self.__saveTokens()
                return True, "Token validated. You can visit this site for 48 hours until you have to login again."
            else:
                return False, "Validation code wrong"
        elif self.isAdminTokenValidated():
            return True,"Token already validated"

        return False, "Token not valid."