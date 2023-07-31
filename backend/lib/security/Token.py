from __future__ import annotations

from lib2to3.pgen2 import token
import time
import os
import hashlib
from datetime import date, datetime, timedelta

import typing
import json
from decouple import config
import pandas as pd

from collections import OrderedDict
import psycopg2

# Python program showing
# abstract base class work

from abc import ABC, abstractmethod
from backend.lib.DesignPatterns import SingletonABCMeta, JsonSerializable


import numpy as np

from backend.lib.data.PostgreSQLHandling import PostgreSQLConnection


class Token(ABC):
    """"""
    # ToDo: Write documentation

    def __init__(self, token_string: str, salt_str: str,
                 validTill: datetime, validationCode: str,
                 isAdminToken: bool, isEmailValidated: bool, isSuperAdmin: bool, isSharedToken: bool):
        """"""
        # ToDo: Write documentation

        self.token_string = token_string  # TODO: other way of doing it since it will be None/NULL if not newly created
        self.md5_token_string = token_string  # ToDo: Salt & Pepper
        self.isAdminToken = isAdminToken
        self.validTill = validTill
        self.isEmailValidated = isEmailValidated  # ToDo: requiresEMailValidation: bool and wasValidated: timestamp?
        self.validationCode = validationCode  # ToDo: if not None or empty, requiresEMailValidation = True
        self.isSuperAdmin = isSuperAdmin
        self.isSharedToken = isSharedToken

    @abstractmethod
    def create(self):
        """"""
        # ToDo: Write documentation
        pass

    @staticmethod
    @abstractmethod
    def read(str_token: str) -> Token:
        """"""
        # ToDo: Write documentation
        pass

    @abstractmethod
    def update(self):
        """"""
        # ToDo: Write documentation
        pass


class PostgreSQLToken(Token):
    """"""
    # ToDo: Write documentation

    def create(self):
        """"""
        # ToDo: Write documentation
        # ToDo: Implement
        if self.validationCode is None:  # TODO: does not work... goes into else with "None" as string, okay for now ...
            str_validation_code = "NULL"
        else:
            str_validation_code = "'{}'".format(self.validationCode)

        db_conn = PostgreSQLConnection().getConnection()
        db_cur = db_conn.cursor()

        db_cur.execute("INSERT INTO sec_tokens (token, \"isUserToken\", \"validTill\", validated, " \
                       "                        \"validationCode\", superadmin, \"sharedToken\", salt) " \
                       "   VALUES ('{0}', {1}, '{2}', {3}, {4}, {5}, {6}, '{7}');".format(self.md5_token_string,
                                                                                          "False", self.validTill,
                                                                                          self.isEmailValidated,
                                                                                          str_validation_code,
                                                                                          self.isSuperAdmin,
                                                                                          self.isSharedToken,
                                                                                          "salt"))
        db_conn.commit()  # TODO: Catch any exceptions
        db_cur.close()

        return

    @staticmethod
    def read(str_token: str) -> Token:
        """"""
        # ToDo: Write documentation
        # ToDo: Implement
        md5_str_token = str_token  # TODO: Salt & Pepper

        db_conn = PostgreSQLConnection().getConnection()
        db_cur = db_conn.cursor()

        db_cur.execute("SELECT token, \"isUserToken\", \"validTill\", validated, \"validationCode\", superadmin, \"sharedToken\", salt " \
                       "   FROM sec_tokens WHERE token = '{}';".format(md5_str_token))

        db_row = db_cur.fetchall()
        db_row = db_row[0]

        db_cur.close()

        return PostgreSQLToken(token_string=db_row[0],
                               salt_str=db_row[7],  # salt TODO: Generate salt
                               isAdminToken=db_row[1],  # isUserToken ???
                               validTill=db_row[2],  # validTill
                               isEmailValidated=db_row[3],  # validated
                               validationCode=db_row[4],  # validationCode
                               isSuperAdmin=db_row[5],  # superadmin
                               isSharedToken=db_row[6])  # sharedToken

    def update(self):
        """"""
        # ToDo: Write documentation
        # ToDo: Implement
        print("UPDATE sec_tokens SET validated = {} WHERE token = '{}';".format(self.isEmailValidated, self.md5_token_string))
        raise Exception("PostgreSQLToken.update() not implemented yet")
        pass


class PandaFileToken(Token):
    """"""
    # ToDo: Write documentation
    # config("token-datadir") == "/home/andreaslindner/Projects/Major/Immuscience/mitocube/backend/data/dynamic/tokens"
    def create(self):
        """"""
        # ToDo: Write documentation
        # ToDo: Implement
        raise Exception("The Class PandaFileToken(Token) is not implemented yet")
        pass

    @staticmethod
    def read(str_token: str) -> Token:
        """"""
        # ToDo: Write documentation
        # ToDo: Implement
        return PandaFileToken(token_string="ksdjflksdjfdslkj",
                              salt_str="nothingyet",  # TODO: Generate salt
                              isAdminToken=False,
                              validTill=datetime.now(),
                              isEmailValidated=False,
                              validationCode="None",
                              isSuperAdmin=False,
                              isSharedToken=False)

    def update(self):
        """"""
        # ToDo: Write documentation
        # ToDo: Implement
        pass


class TokenManager(metaclass=SingletonABCMeta):
    """"""
    # ToDo: Write documentation

    def __init__(self, defaultTokensValidHours: int = 48, defaultSharedTokensValidHours: int = 3000):
        """"""
    # ToDo: Write documentation
        # self.tokens = dict()
        self.session_salt = "kjsdflsdjflksdjflskj"  # ToDo: Generate random string
        # self.pathToTokens = pathToTokens
        self.tokensValidHours = defaultTokensValidHours
        self.sharedTokensValidHours = defaultSharedTokensValidHours
        # self.__readTokens()

    @staticmethod
    def __createToken(isAdminToken: bool = False, validHours: int = 48, isEmailValidated: bool = False,
                      isSuperAdmin: bool = False, isSharedToken: bool = False) -> Token:
        """"""
        # ToDo: Write documentation

        if config("db-handler") == "postgresql":
            fun_token_init = PostgreSQLToken
        elif config("db-handler") == "pandafiles":
            fun_token_init = PandaFileToken
        else:
            raise Exception("Invalid MitoCubeDatabase configuration. Only 'postgresql' and 'pandafiles' are supported.")

        obj = fun_token_init(token_string=hashlib.md5(str(time.time()).encode("utf-8")).hexdigest(),  # TODO Check for better method
                             salt_str="nothingyet",  # TODO: Generate salt
                             isAdminToken=isAdminToken,
                             validTill=datetime.now() + timedelta(hours=validHours),
                             isEmailValidated=isEmailValidated,
                             validationCode="None" if not isAdminToken else "ksdjflksdjfdslkj",  # ToDo: getRandomString(10)
                             isSuperAdmin=isSuperAdmin,
                             isSharedToken=isSharedToken)
        obj.create()

        return obj

    @staticmethod
    def __findToken(md5_str_token: str) -> Token:
        """"""
        # ToDo: Write documentation

        if config("db-handler") == "postgresql":
            obj = PostgreSQLToken.read(md5_str_token)
        elif config("db-handler") == "pandafiles":
            obj = PandaFileToken.read(md5_str_token)
        else:
            raise Exception("Invalid MitoCubeDatabase configuration. Only 'postgresql' and 'pandafiles' are supported.")

        return obj

    def createAdminToken(self, isSuperAdmin: bool = False):
        """"""
        # ToDo: Write documentation
        # create admin token, quires validated by email
        obj = TokenManager.__createToken(isAdminToken=True, validHours=self.tokensValidHours,
                                         isEmailValidated=False, isSuperAdmin=isSuperAdmin)

        # self.tokens[tokenString] = t
        # self.__saveTokens()
        return obj

    def createSharedToken(self):
        """"""
        # ToDo: Write documentation
        # time.sleep(5) ## ToDo: why sleep?
        obj = TokenManager.__createToken(isAdminToken=False, validHours=self.tokensValidHours,
                                         isEmailValidated=True, isSharedToken=True)
        # self.tokens[tokenString] = t
        # self.__saveTokens()
        return obj

    def createToken(self):
        """"""
        # ToDo: Write documentation
        # create token, that does not have to be validated.
        obj = TokenManager.__createToken(isAdminToken=False, validHours=self.tokensValidHours, isEmailValidated=True)
        # self.tokens[tokenString] = t
        # self.__saveTokens()
        return obj

    def challenge(self, str_token: str) -> bool:  # ToDo: is it better to throw an exception here?
        """"""
        # ToDo: Write documentation
        # ToDo: switch here between postgresql or pandaToken constructor
        # ToDo: Implement

        md5_str_token = str_token  # ToDo: Salt & Pepper
        obj = TokenManager.__findToken(md5_str_token)

        return obj.md5_token_string == md5_str_token  # ToDo: also check if obj.validTill > now()

    def challengeAdminToken(self, str_token: str, isAdminTokenValidated, session_salt: str = "") -> bool:
        """"""
        # ToDo: Write documentation
        # ToDo: Is it better to throw an exception here?
        # ToDo: Implement

        self.session
        md5_str_token = str_token  # ToDo: Salt & Pepper
        obj = TokenManager.__findToken(md5_str_token)

        return False

    def challengeAdmin(self, str_token: str, isAdminTokenValidated, session_salt: str = "") -> bool:
        """"""
        # ToDo: Write documentation
        # ToDo: Is it better to throw an exception here?
        # ToDo: Implement

        self.session
        md5_str_token = str_token  # ToDo: Salt & Pepper
        obj = TokenManager.__findToken(md5_str_token)

        return False

    def challengeSharedToken(self, str_token: str, isAdminTokenValidated, session_salt: str = "") -> bool:
        """"""
        # ToDo: Write documentation
        # ToDo: Is it better to throw an exception here?
        # ToDo: Implement

        self.session
        md5_str_token = str_token  # ToDo: Salt & Pepper
        obj = TokenManager.__findToken(md5_str_token)

        return False
