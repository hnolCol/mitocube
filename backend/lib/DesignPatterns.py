import typing
from abc import ABC, ABCMeta, abstractmethod
from threading import Lock, Thread


class JsonSerializable(ABC):
    """"""
    # ToDo: Write documentation
    # ToDo: Check if there are useful methods one can implement

    @abstractmethod
    def toJson(self) -> typing.Dict:
        """"""
        # ToDo: Write documentation
        pass


class SingletonABCMeta(ABCMeta):  # ToDo: Move SingletonMeta to a different file
    """Thread-safe Singleton ABC meta-class."""

    #: Holds the singleton instance
    _instances = {}

    #: Lock used for multi-threading
    _lock: Lock = Lock()

    def __call__(cls, *args, **kwargs):
        """
        Return a list of random ingredients as strings.

        :param kind: Optional "kind" of ingredients.
        :type kind: list[str] or None
        :raise lumache.InvalidKindError: If the kind is invalid.
        :return: The ingredients list.
        :rtype: list[str]
        """
        with cls._lock:
            if cls not in cls._instances:
                instance = super().__call__(*args, **kwargs)
                cls._instances[cls] = instance
        return cls._instances[cls]


class SingletonMeta(type):  # ToDo: Move SingletonMeta to a different file
    """Thread-safe Singleton meta-class."""

    #: Holds the singleton instance
    _instances = {}

    #: Lock used for multi-threading
    _lock: Lock = Lock()

    def __call__(cls, *args, **kwargs):
        """
        Return a list of random ingredients as strings.

        :param kind: Optional "kind" of ingredients.
        :type kind: list[str] or None
        :raise lumache.InvalidKindError: If the kind is invalid.
        :return: The ingredients list.
        :rtype: list[str]
        """
        with cls._lock:
            if cls not in cls._instances:
                instance = super().__call__(*args, **kwargs)
                cls._instances[cls] = instance
        return cls._instances[cls]
