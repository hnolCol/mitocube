
import _ from "lodash"

  export function filterDatasetsByDataIDs (datasets, dataIDs) {
        // filter the array of objects datasets using another array of dataIDs.
        if (_.isArray(dataIDs) && _.isArray(datasets)) {
            return _.filter(datasets, (datasetProps) => dataIDs.includes(datasetProps.dataID))
        }
        return []
    }