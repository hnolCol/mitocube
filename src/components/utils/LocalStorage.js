

export function getMitoCubeToken() {
    // get mitocube token from local storage
    const tokenString = localStorage.getItem("mitocube-token")
    return tokenString
}

export function removeMitoCubeToken() {
    // removes mitocube-token from local storage
    if (localStorage.getItem("mitocube-token") !== null){
        localStorage.removeItem("mitocube-token")
    }
}
