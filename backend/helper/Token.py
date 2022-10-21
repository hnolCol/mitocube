
from lib2to3.pgen2 import token
from .Misc import getRandomString
import time 
import os 
from datetime import date, datetime, timedelta
import pickle 

class Token(object):
    ""
    def __init__(self,pathToTokens,tokensValid=48,shareTokensValid=3000,*args,**kwargs):
        ""
        self.tokens = dict() 
        self.pathToTokens = pathToTokens
        self.tokensValid = tokensValid
        self.shareTokensValid = shareTokensValid
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

    def __createToken(self,N, isAdminToken = False, validHours = 48, emailValidated = False, superAdmin = False, shareToken = False):
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
            "validationCode" : validateCode,
            "superAdmin" : superAdmin,
            "shareToken" : shareToken
            }
        return  tokenString,validateCode,t

    def createAdminToken(self, superAdmin = False):
        ""
        #create admin token, quires validated by email
        tokenString, validateCode, t = self.__createToken(N = 120, isAdminToken = True, validHours = self.tokensValid, emailValidated = False, superAdmin=superAdmin)
        
        self.tokens[tokenString] = t
        self.__saveTokens()
        return tokenString, validateCode

    def createShareToken(self):
        ""
        time.sleep(5)
        tokenString, _, t = self.__createToken(N = 120,isAdminToken = False, validHours = self.shareTokensValid,emailValidated = True, shareToken = True)
        self.tokens[tokenString] = t
        self.__saveTokens()
        return tokenString

    def createToken(self):
        ""
        #create token, that does not have to be validated.
        tokenString, _, t = self.__createToken(N = 40,isAdminToken = False, validHours = self.tokensValid, emailValidated = True)
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
            if token["validated"] and self.isValid(tokenID) and token["isAdminToken"]:
                return True
        return False

    def isShareToken(self,tokenID):
        ""
        self.__readTokens()
        if tokenID in self.tokens:
            token = self.tokens[tokenID]
            if token["shareToken"]:
                return True
        return False

    def isShareTokenValid(self,tokenID):
        ""
        return self.isShareToken(tokenID) and self.isValid(tokenID)
                

    def isAdminToken(self,adminToken):
        ""
        self.__readTokens()
        if adminToken in self.tokens and self.tokens[adminToken]["isAdminToken"]:
            return True
        return False

    def isAdminTokenValidated(self,adminToken):
        ""
        return self.isAdminToken(adminToken) and self.tokens[adminToken]["validated"]

    def isTokensuperAdmin(self,adminToken):
        ""
        if adminToken in self.tokens and "superAdmin" not in self.tokens[adminToken]:
            return False
        return self.isAdminToken(adminToken) and self.tokens[adminToken]["validated"] and self.tokens[adminToken]["superAdmin"]

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