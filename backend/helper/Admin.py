
from tabnanny import check
from decouple import config
import os 
import pickle
from werkzeug.security import generate_password_hash, check_password_hash

class AdminUsers(object):
    ""
    def __init__(self,pathToUsers,*args,**kwargs):
        ""
        self.users = dict() 
        self.pathToUsers = pathToUsers
        self.__readUsers()
        self.__initMainUser()

    def __initMainUser(self):
        ""
        if len(self.users) == 0:
            
            email = generate_password_hash(config("email-admin"))
            pw = generate_password_hash(config("admin-pw"))

            print(check_password_hash(email,"h.nolte@age.mpg.de"))
            self.users[email] = {"pw":pw,"super-admin":True}


    def __readUsers(self):
        ""
        if os.path.exists(self.pathToUsers):
            with open(self.pathToUsers, 'rb') as f:
                usersFromFile = pickle.load(f)
            self.users = {**usersFromFile,**self.users}

    def __saveUsers(self):
        ""
        with open(self.pathToUsers, 'wb') as f:
            pickle.dump(self.users,f)

    def addUser(self,emailString,pwString,superAdmin=False):
        ""
        if any( check_password_hash(userEmailHash,emailString) for userEmailHash in self.users.keys()):
            return False,"Email already included."
        else:
            print("")
            email = generate_password_hash(config(emailString))
            pw = generate_password_hash(config("pwString"))
            self.users[email] = {"pw":pw,"super-admin":superAdmin}

    def isUserSuperAdmin(self,emailString):
        ""
        for userEmailHash, userDetails in self.users.items():
            if check_password_hash(userEmailHash,emailString):
                return userDetails["super-admin"]
        return False

    def validateUser(self,emailString,pwString):
        ""
        for userEmailHash, userDetails in self.users.items():
            if check_password_hash(userEmailHash,emailString) and check_password_hash(userDetails["pw"],pwString):
                return True, userDetails["super-admin"]
        return False, False

