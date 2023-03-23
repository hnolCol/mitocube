import _ from "lodash";

export function filterArrayBySearchString(searchString, array, searchColumns) {
    
    // filter array of objects
    if (!_.isArray(searchColumns)) return []
    if (!_.isArray(array)) return []
    const re = new RegExp(_.escapeRegExp(searchString), 'i')
    const isMatch = arrayItem => _.filter(searchColumns.map(v => re.test(arrayItem[v]))).length > 0
    return _.filter(array, isMatch)
}

export function filterDatasetsByDataIDs (datasets, dataIDs) {
        // filter the array of objects datasets using another array of dataIDs.
        if (_.isArray(dataIDs) && _.isArray(datasets)) {
            return _.filter(datasets, (datasetProps) => dataIDs.includes(datasetProps.dataID))
        }
        return []
  }

export function handleSearchTagFiltering(items, searchTags, headers) {
    let itemsMatchingSearchTags = searchTags.map(searchTag => {
        return filterArrayBySearchString(searchTag,items,headers)
    })
    return  _.uniq(_.intersection(...itemsMatchingSearchTags))
}

export function handleSearchTagBasedFiltering (datasets, searchTags, searchNames) {
    //and based filtering
    //terrible function
    let filteredDataIDs = searchTags.map(searchTag => {
        return (
            filterArrayBySearchString(searchTag,datasets,searchNames).map(o=>o.dataID) //easier to compare just dataIDs to find intersection.
        )
    })
    let dataIDs = _.intersection(...filteredDataIDs)
    return filterDatasetsByDataIDs(datasets, dataIDs)
}