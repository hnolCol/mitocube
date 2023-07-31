
from typing import Tuple, Any, Callable
import json 

adminTokenInValidResponse = {"success":False,"msg":"Admin token is not valid.", "tokenIsValid":False}

def isTokenValid(tokenString : str, tokenProcessor : Callable) -> bool:
    ""
    if not hasattr(tokenProcessor,"isValid"):
        return False, "TokenCheck invalid"
    if  not tokenProcessor.isValid(tokenString):
        return False, "Token is not valid."
    return True, "Token is valid"

def isTokenInRequestDataValid(requestData, tokenProcessor) -> Tuple[bool,Any]:
    data = json.loads(requestData, strict=False)
    if "token" not in data:
        return False, "No token found."
    token = data["token"]
    if not tokenProcessor.isValid(token):
        return False,"Token is not valid."
    return True, data


def isAdminValid(tokenString, tokenProcessor) -> bool:
    """Checks if an admin tokenString is valid"""
    if hasattr(tokenProcessor,"isAdminValid") and tokenString != "None":
        if tokenProcessor.isAdminValid(tokenString):
            return True
    return False
        

def formatDateAndAddIndexInParam(param,idx):
    "Ugly function to modify param creation for easy reading - maybe put in front end??"

    if "Creation Date" in param and "-" not in param["Creation Date"]:
        
        dateString = param["Creation Date"]
        
        dateStringSplit = dateString.split(" ")[0]

        param["Creation Date"] = f"{dateStringSplit[0:4]}-{dateStringSplit[4:6]}-{dateStringSplit[6:]}"
    if "Index" not in param:
        param["Index"] = idx
    return param