from flask import request
from flask_restful import Resource

import json
from werkzeug.security import generate_password_hash, check_password_hash

from backend.lib.security.Token import TokenManager


class LoginValidation(Resource):
    """"""
    # ToDo: Write documentation

    def __init__(self, *args, **kwargs):
        """"""
        # ToDo: Write documentation
        # ToDo: Implement

        self.pwHash = generate_password_hash("Apalala", "sha256")  # Todo,read the hashed password from somehwere else
        print(self.pwHash)

    def post(self):
        """"""
        # ToDo: Write documentation
        # ToDo: Implement

        post_data = json.loads(request.data, strict=False)
        # pages = self.data.getAPIParam("pages")

        print("<!> LoginValidation")
        print(post_data)

        if "pw" in post_data:
            print("   >>> yes? :-)")
            if check_password_hash(self.pwHash, post_data["pw"]):
                tkm = TokenManager()
                tk = tkm.createToken()
                print(tk.token_string)
                print(tk.md5_token_string)
                return {"success": True, "token": tk.token_string, "pages":
                    {  # TODO: Outsource this variable (originally from config.api.page
                        "protein": 1,
                        "dataset": 1,
                        "ptm": 1,
                        "submission": 1,
                        "performance": 0,
                        "admin": 1
                    } }

        return {"success": False, "token": None}


class TokenValidation(Resource):
    """"""
    # ToDo: Write documentation

    def __init__(self, *args, **kwargs):
        """"""
        # ToDo: Write documentation
        # ToDo: Implement

    def post(self):
        """"""
        # ToDo: Write documentation
        # ToDo: Implement

        post_data = json.loads(request.data, strict=False)
        print("<!> admin token TokenValidation")
        print(post_data)

        if "token" in post_data and len(post_data["token"]) > 0:
            tkm = TokenManager()
            if tkm.challenge(post_data["token"]):
                return {
                    "success": True,
                    "pages": {  # TODO: Outsource this variable (originally from config.api.page
                        "protein": 1,
                        "dataset": 1,
                        "ptm": 1,
                        "submission": 1,
                        "performance": 0,
                        "admin": 1
                    }
                }

        return {"success": False}


class AdminTokenValidation(Resource):
    """"""
    # ToDo: Write documentation

    def __init__(self, *args, **kwargs):
        """"""
        # ToDo: Write documentation
        # ToDo: Implement

    def post(self):
        """"""
        # ToDo: Write documentation
        # ToDo: Implement

        post_data = json.loads(request.data, strict=False)
        print("<!> admin token AdminTokenValidation")
        print(post_data)

        if "token" in post_data and len(post_data["token"]) > 0:
            tkm = TokenManager()
            tkm.challenge(post_data["token"])
            print("   >>> yes? :-)")
            pass
            # if self.token.isAdminTokenValidated(post_data["token"]):
            #     superAdmin = self.token.isTokensuperAdmin(post_data["token"])
            #     return {"success":True,"valid":True,"superAdmin":superAdmin}

        return {"success": False}
