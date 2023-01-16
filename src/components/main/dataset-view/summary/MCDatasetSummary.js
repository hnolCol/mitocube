import { Button } from "@blueprintjs/core"
import axios from "axios";
import _ from "lodash"
import { useState } from "react";
import { useQuery } from "react-query"
import { MCTableLikeItem } from "../../../utils/components/MCTableLikeItem";
import { arrayOfObjectsToTabDel, downloadTxtFile } from "../../../utils/Misc";
import { MCSimpleResponseCheck } from "../../../utils/ResponseChecks";


export function MCDatasetSummary(props) {

    const { details, names,dataID, token } = props    
    const [dataForDownload, setDataForDownload] = useState([])
    const getDatasetData = async () => {
        const res = await axios.get('/api/dataset',{params:{...{token,dataID}}})
        return res.data
    }
    
    const { isLoading, isFetching, refetch} = useQuery("downloadDataset",getDatasetData,{enabled:false})

    const downloadData = (e) => {
        if (!_.isArray(dataForDownload)) return 
        if (dataForDownload.length === 0) {
            refetch().then(response => {
                if (response.isSuccess && MCSimpleResponseCheck(response.data)) {
                    if (_.isObject(response.data) && _.has(response.data, "data"))
                        setDataForDownload(response.data.data)
                }
            })
        }
        else {
            // download the data when they are there.
            if (_.isObject(dataForDownload[0])) {
                let columnNames = Object.keys(dataForDownload[0])
                downloadTxtFile(arrayOfObjectsToTabDel(dataForDownload,columnNames),`Data(${dataID}).txt`)
            }
            
        }
        }

    return (
        <div style={{height:"90vh",overflowY:"scroll",paddingRight:"1rem",fontSize:"0.85rem"}}>
        
        <div className="hor-aligned-div middle-m white-bg ">
                <div className="dataset-attr-name">Download Data:</div>
                <div><Button small={true} text={dataForDownload.length > 0 ? "Download" : "Fetch data"}
                    minimal={true} icon="download" intent="primary" loading={isLoading || isFetching} onClick={downloadData} /></div>
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


