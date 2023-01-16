import _ from "lodash";

export function filterArrayBySearchString(searchString, array, searchColumns) {
    
    // filter array of objects
    if (!_.isArray(searchColumns)) return []
    if (!_.isArray(array)) return []
    const re = new RegExp(_.escapeRegExp(searchString), 'i')
    const isMatch = arrayItem => _.filter(searchColumns.map(v => re.test(arrayItem[v]))).length > 0
    return _.filter(array, isMatch)
}