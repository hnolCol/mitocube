
from typing import Tuple, Any
import json 

def isTokenInRequestDataValid(requestData, tokenCheck) -> Tuple[bool,Any]:
    data = json.loads(requestData, strict=False)
    if "token" not in data:
        return False, "No token found."
    token = data["token"]
    if not tokenCheck.isValid(token):
        return False,"Token is not valid."
    return True, data


def isAdminValid(tokenProcessor,tokenString) -> bool:
    """Checks if an admin tokenString is valid"""
    if hasattr(tokenProcessor,"isAdminValid") and tokenString != "None":
        if tokenProcessor.isAdminValid(tokenString):
            return True
    return False
        