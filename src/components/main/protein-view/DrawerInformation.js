import { Drawer } from "@blueprintjs/core"
import axios from "axios"
import _ from "lodash"
import { useQuery } from "react-query"
import { useState } from "react"
import { MCCSVDownload } from "../../utils/components/MCCSVDownload"
import { MCSpinner } from "../../spinner/MCSpinner"
import { MCSimpleResponseCheck } from "../../utils/ResponseChecks"
import { MCTableLikeItem } from "../../utils/components/MCTableLikeItem"


export function MCDrawerInformation(props) {

    const { isSummary, ...rest } = props
    if (isSummary) {

        return <MCDBDrawer {...rest}/> 
    }
    else {

        return <MCExperimentalInfoDrawer {...rest}/>
    }

}

MCDrawerInformation.defaultProps = {
    isOpen : false,
    title: "Experimental Information",
    isSummary: false
}


export function MCDBDrawer(props) {
    const { featureID, token, isOpen, title, onClose } = props
    const [databaseInfo, setDatabaseInfo] = useState({})
    
    const entryName = featureID.Entry
    const getProteinInfo = async () => {
        const res = await axios.get('/api/features/db/info', { params: { featureID: entryName, token: token } })
        return res.data.params
    }

    const { isLoading, isFetching } = useQuery("getProteinInfo", getProteinInfo, {
        refetchOnWindowFocus: false,
        onSuccess: (data) => {
            setDatabaseInfo(prevValues => { return { ...prevValues, ...data } })
        },
        enabled: entryName !== undefined && _.isString(entryName) && isOpen && !_.has(databaseInfo, entryName) //only fetch again if not there yet.
    })
    
    if (_.isObject(databaseInfo) && _.has(databaseInfo, entryName)) {
        return (
            <MCDrawer dataToShow={databaseInfo[entryName]} {...{ isOpen, isLoading: isLoading || isFetching, title, onClose }} />
        )
    }
    return (
        null
    )
}


function MCExperimentalInfoDrawer(props) {
    const { token, dataID, isOpen, title, onClose } = props 
    const [experimentalInfo, setExperimentalInfo] = useState({})
    const getProteinInfo = async () => {
        const res = await axios.get('/api/dataset/details/experimentalInfo', {params: { dataID: dataID, token: token } })
        return res.data
    }
    
    const { isLoading, isFetching } = useQuery("getProteinInfo", getProteinInfo, {
        refetchOnWindowFocus: false,
        onSuccess: (data) => {
            if (MCSimpleResponseCheck(data) && _.has(data, "params")) {
                let expInfoData = Object.fromEntries([[dataID,data.params]])
                setExperimentalInfo(prevValues => { return { ...prevValues, ...expInfoData } })
            }
        },
        enabled: dataID !== undefined && _.isString(dataID) && isOpen && !_.has(experimentalInfo,dataID) //only fetch again if not there yet.
    })

    if (_.isObject(experimentalInfo) && _.has(experimentalInfo, dataID)) {
        return (
            <MCDrawer
                {...{ isOpen, isLoading: isLoading || isFetching, title, onClose }}
                dataToShow={experimentalInfo[dataID]}/>
        )
    }
    return null 
    

}

function MCDrawer(props) {
    const { isLoading, isOpen, title, onClose, dataToShow, enableDownload } = props
    return (
        <Drawer {...{ title, isOpen, onClose }}>
            
            <div style={{overflowY:"scroll",display:"flex",justifyContent:"flex-start", backgroundColor:"#efefef",height:"100%"}}>
            <div>
                    {isLoading ? <MCSpinner /> :
                        _.isArray(dataToShow) ? 
                            
                            dataToShow.map((v, i) => {
                                if (_.has(v, "title") && _.has(v, "details")) {
                                    return (
                                        <MCTableLikeItem
                                            key={`${v.title}-${i}`}
                                            attrName={v.title}
                                            attr={v.details} />
                                    )
                                }
                                return null
                            }): null}
                </div>
                {enableDownload ?
                    <MCCSVDownload data={dataToShow} fileName={`ProteinDBInfo.csv`} />
                    : null}
        
        </div>
        </Drawer>
    )
}

MCDrawer.defaultProps = {

    enableDownload : true
}