
from lib2to3.pgen2 import token
from .Misc import getRandomString
import time 
from datetime import date, datetime, timedelta

class Token(object):
    ""
    def __init__(self,*args,**kwargs):
        ""
        self.tokens = dict() 
        self.token = "abc"


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

        return tokenString

    def isValid(self,tokenID):
        ""
        if tokenID in self.tokens:
            validTillTtime = self.tokens[tokenID]["validTill"]
            if validTillTtime > datetime.now():
                return True
        return False



