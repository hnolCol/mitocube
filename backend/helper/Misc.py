from datetime import date
import numpy as np 
import string
import random
import re 
import seaborn as sns 
from typing import List, Tuple


def matchValueRangeToColors(
            minValue : float, 
            maxValue : float, 
            colorPaletteName : str = "RdBu_r", 
            N : int = 5) -> Tuple[List[float],List[str]]:
    """"""
    colorValues = np.linspace(minValue,maxValue,num=N).flatten().tolist()
    colorPalette = sns.color_palette(colorPaletteName,n_colors=N).as_hex()
    return colorValues, colorPalette

def mergeDicts(dicts):
    result = dict()
    for _dict in dicts:
        for k,v in _dict.items():
            result[k] = v
    return result

def getRandomString(N  : int = 20) -> str:
    "returns a random string of N characters"
    return ''.join(random.choices(string.ascii_uppercase + string.digits + string.ascii_lowercase, k=N))

def getCurrentDate(format : str = "%Y%m%d") -> str:
    """Returns the current day in desired format"""
    return date.today().strftime("%Y%m%d")

def corr2_coeff_rowwise2(A,B):
    A_mA = A - A.mean(1)[:,None]
    B_mB = B - B.mean(1)[:,None]
    ssA = np.einsum('ij,ij->i',A_mA,A_mA)
    ssB = np.einsum('ij,ij->i',B_mB,B_mB)
    return np.einsum('ij,ij->i',A_mA,B_mB)/np.sqrt(ssA*ssB)

def buildRegex(categoriesList : List[str], withSeparator : bool = True, splitString : str = None) -> str:
    '''
    Build regular expression that will search for the selected category. Importantly it will prevent 
    cross findings with equal substring
    =====
    Input:
        List of strings (categories) - userinput
    Returns:
        Regular expression that can be used. 
    ====

    '''
    regExp = r'' #init reg ex
    for category in categoriesList:
        category = re.escape(category) #escapes all special characters
        if withSeparator and splitString is not None:
            regExp = regExp + r'({}{})|(^{}$)|({}{}$)|'.format(category,splitString,category,splitString,category)
        else:
            regExp = regExp + r'({})|'.format(category)
            
    regExp = regExp[:-1] #strip of last |
    return regExp