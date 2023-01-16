import _ from "lodash";



export function MCSimpleResponseCheck(responseData) {

    if (_.isObject(responseData) && _.has(responseData,"success")){
        return responseData["success"]
    }
    return false
}

export function MCTokenValidCheck(responseData) {

    if (_.isObject(responseData) && _.has(responseData,"tokenIsValid")){
        return responseData["tokenIsValid"]
    }
}