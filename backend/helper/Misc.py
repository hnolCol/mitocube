import numpy as np 
import string
import random
import re 

def getRandomString(N = 20):
    "returns a random string of N characters"
    return ''.join(random.choices(string.ascii_uppercase + string.digits + string.ascii_lowercase, k=N))

def corr2_coeff_rowwise2(A,B):
    A_mA = A - A.mean(1)[:,None]
    B_mB = B - B.mean(1)[:,None]
    ssA = np.einsum('ij,ij->i',A_mA,A_mA)
    ssB = np.einsum('ij,ij->i',B_mB,B_mB)
    return np.einsum('ij,ij->i',A_mA,B_mB)/np.sqrt(ssA*ssB)

def buildRegex(categoriesList, withSeparator = True, splitString = None):
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