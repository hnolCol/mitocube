import _ from "lodash"


export function fromGroupingsToGroupMapper(paramsFile) {
    
    let groupings = paramsFile["groupings"]
    let groupingNames = Object.keys(paramsFile["groupings"])
    let groupingMapperAsArray = Object.fromEntries(groupingNames.map(groupingName => [groupingName,Object.keys(groupings[groupingName]).map(groupName => groupings[groupingName][groupName].map(item => [item, groupName]))]))
    let groupingMapper = Object.fromEntries(groupingNames.map(groupingName => [groupingName,Object.fromEntries(_.flatten(groupingMapperAsArray[groupingName]))]))

    return groupingMapper

}