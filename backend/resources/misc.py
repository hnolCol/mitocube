

def isAdminValid(tokenProcessor,tokenString) -> bool:
    """Checks if an admin tokenString is valid"""
    if hasattr(tokenProcessor,"isAdminValid") and tokenString != "None":
        if tokenProcessor.isAdminValid(tokenString):
            return True
    return False
        