import _ from "lodash"

export function extractGroupsByRunNameFromGrouping(paramsFile) {
    var groupingsMappedToRunNames = {}
    if (_.has(paramsFile, "groupings") && _.has(paramsFile, "groupingNames") && _.isArray(paramsFile["groupingNames"])) {
        let runNames = _.flatten(Object.values(paramsFile["groupings"][paramsFile["groupingNames"][0]])).sort()
        groupingsMappedToRunNames = Object.fromEntries(_.map(runNames, runName => {

            return ([runName,
                _.flatten(_.map(paramsFile["groupingNames"], groupingName => {
                    let grouping = paramsFile["groupings"][groupingName]
                    let groupNames = Object.keys(grouping)
                    let filteredGroup = _.filter(groupNames, groupName => grouping[groupName].includes(runName))
                    //find filteredGroup and return it to the list which is flattened.
                    return (
                        filteredGroup
                    )
                }))]
            )
        }))
    }
    return groupingsMappedToRunNames
}
