
from decouple import config
import os 
import pickle
from werkzeug.security import generate_password_hash, check_password_hash
from .Misc import getCurrentDate, getRandomString

class AdminUsers(object):
    ""
    def __init__(self,pathToUsers,*args,**kwargs):
        ""
        self.users = dict() 
        self.pathToUsers = pathToUsers
        self.__readUsers()
        self.__initMainUser()
        self.__saveUsers()
        #print(self.users)

    def __initMainUser(self):
        ""
        email = generate_password_hash(config("email-admin"))
        pw = generate_password_hash(config("admin-pw"))
       
        superAdminEmailFound = [userEmailHash for userEmailHash in self.users.keys() if check_password_hash(userEmailHash,config("email-admin"))]
    
        #print(check_password_hash(self.users[superAdminEmailFound[0]]["pw"],config("admin-pw")))
       
        if len(superAdminEmailFound) != 0 and len(self.users) == 0:
            raise ValueError("Something is wrong.")
        if len(self.users) == 0:
           
            email = generate_password_hash(config("email-admin"))
            pw = generate_password_hash(config("admin-pw"))

            #print(check_password_hash(email,"h.nolte@age.mpg.de"))
            self.users[email] = {"pw":pw,"super-admin":True}

        elif len(superAdminEmailFound) > 0 and not check_password_hash(self.users[superAdminEmailFound[0]]["pw"],config("admin-pw")): #pw changed of admin from env file - update!! 
            for sAdminFound in superAdminEmailFound:
                del self.users[sAdminFound]
            self.users[email] = {"pw":generate_password_hash(config("admin-pw")),"super-admin":True}
        

    def __readUsers(self):
        ""
        if os.path.exists(self.pathToUsers):
            with open(self.pathToUsers, 'rb') as f:
                usersFromFile = pickle.load(f)
            self.users = {**usersFromFile}

    def __saveUsers(self):
        ""
        with open(self.pathToUsers, 'wb') as f:
            pickle.dump(self.users,f)

    def addUser(self,emailString,pwString,userName,superAdmin=False):
        ""
        self.__readUsers()
        if any(check_password_hash(userEmailHash,emailString) for userEmailHash in self.users.keys()):
            return False,"Email already included.", None
        else:
            email = generate_password_hash(emailString)
            pw = generate_password_hash(pwString)
            self.users[email] = {"pw":pw,"super-admin":superAdmin,"name":userName,"id":getRandomString(N=5),"date":getCurrentDate(),"email":emailString}
            self.__saveUsers()
            ok, users = self.getUsers()
            return True, "User created.", users

    def deleteUserByID(self,userID):
        ""
        self.__readUsers()
        filteredUsers = [emailHash for emailHash, userInfo in self.users.items() if "id" in userInfo and userInfo["id"] == userID]
        if len(filteredUsers) == 1:
            del self.users[filteredUsers[0]]
            self.__saveUsers()
            return True, "User deleted."
        
        return False, "User ID not found or dubplicated."

    def getUsers(self):
        "Return list of users"
        self.__readUsers()
        if hasattr(self,"users") and len(self.users) > 0:
            return True, [{"userName":v["name"],"id":v["id"],"date":v["date"]} for k,v in self.users.items() if all(x in v for x in ["name","id","date"])]
        else:
            return False, []

    def isUserSuperAdmin(self,emailString):
        ""
        self.__readUsers()
        for userEmailHash, userDetails in self.users.items():
            if check_password_hash(userEmailHash,emailString):
                return userDetails["super-admin"]
        return False

    def validateUser(self,emailString,pwString):
        ""
        self.__readUsers()
        for userEmailHash, userDetails in self.users.items():
            if check_password_hash(userEmailHash,emailString) and check_password_hash(userDetails["pw"],pwString):
                return True, userDetails["super-admin"]
        return False, False

