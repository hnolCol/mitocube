
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


    def createToken(self):
        ""
        t1 = datetime.now()
        t2 = t1 + timedelta(hours=48)
        tokenString = getRandomString(40)
        t = {
            "token" : tokenString,
            "validTill" : t2
            }
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



