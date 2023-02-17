import { Button } from "@blueprintjs/core"
import axios from "axios";
import _ from "lodash"
import { useState } from "react";
import { useQuery } from "react-query"
import { MCTableLikeItem } from "../../../utils/components/MCTableLikeItem";
import { fromGroupingsToGroupMapper } from "../../../utils/Groupings";
import { arrayOfObjectsToTabDel, downloadTxtFile } from "../../../utils/Misc";
import { MCSimpleResponseCheck } from "../../../utils/ResponseChecks";


export function MCDatasetSummary(props) {

    const { details, names,dataID, token } = props    
    const [dataForDownload, setDataForDownload] = useState([])
    const getDatasetData = async () => {
        const res = await axios.get('/api/dataset',{params:{...{token,dataID}}})
        return res.data
    }
    
    const { isLoading, isFetching, isError, refetch} = useQuery(["downloadDataset",dataID],getDatasetData,{enabled:false})

    const downloadData = (e) => {
            // downloads data
            refetch().then(response => {
                if (response.isSuccess && MCSimpleResponseCheck(response.data)) {
                    if (_.isObject(response.data) && _.has(response.data, "data") && _.isObject(response.data.data)) {
                        if (!_.isArray(response.data.data)) return 
                        if (!_.isObject(response.data.params)) return 
                        let dataForDownload = response.data.data
                        let paramsFile = response.data.params
                        let columnNames = Object.keys(dataForDownload[0])
                        let groupingMapper = fromGroupingsToGroupMapper(paramsFile)
                        downloadTxtFile(arrayOfObjectsToTabDel(dataForDownload, columnNames, groupingMapper), `Data(${dataID}).txt`)
                    }
                }
            })
        
        }

    return (
        <div style={{height:"90vh",overflowY:"scroll",paddingRight:"1rem",fontSize:"0.85rem"}}>
        
        <div className="hor-aligned-div middle-m white-bg ">
                <div className="dataset-attr-name">Download Data:</div>
                <div><Button small={true} text={ isError?"API returned an error":"Fetch & Download"}
                    minimal={true} icon="download" intent={isError ? "danger" : "primary"} loading={isLoading || isFetching} onClick={downloadData} /></div>
        </div>
        {names.map(attrName => {
            return (
                <MCTableLikeItem key={attrName} {...{attrName, attr : details[attrName]}} />
            )
            
        }
            )}
    </div>
    )
}


