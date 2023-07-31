from typing import Dict

from backend.lib.DesignPatterns import SingletonABCMeta, JsonSerializable


class User(JsonSerializable):
    """"""
    # Todo: Write documentation
    # ToDo: Implement

    def toJson(self) -> Dict:
        """"""
        # Todo: Write documentation
        # ToDo: Implement
        return {}


class UserManager(metaclass=SingletonABCMeta):
    """"""
    # ToDo: Document
    # ToDo: Implement


class PostgreSQLUserManager(UserManager):
    """"""
    # ToDo: Document
    # ToDo: Implement


class PandaFileUserManager(UserManager):
    """"""
    # ToDo: Document
    # ToDo: Implement


class PostgreSQLUser(User):
    """"""
    # ToDo: Document
    # ToDo: Implement


class PandaFileUser(User):
    """"""
    # ToDo: Document
    # ToDo: Implement
