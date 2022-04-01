import numpy as np 
import string
import random

def getRandomString(N = 20):
    "returns a random string of N characters"
    return ''.join(random.choices(string.ascii_uppercase + string.digits + string.ascii_lowercase, k=N))

def corr2_coeff_rowwise2(A,B):
    A_mA = A - A.mean(1)[:,None]
    B_mB = B - B.mean(1)[:,None]
    ssA = np.einsum('ij,ij->i',A_mA,A_mA)
    ssB = np.einsum('ij,ij->i',B_mB,B_mB)
    return np.einsum('ij,ij->i',A_mA,B_mB)/np.sqrt(ssA*ssB)