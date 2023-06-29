

import axios from "axios";
import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { MCHeatmapWrapper} from "./heatmap/MCScaledHeatmap";
import { MCVolcanoGrid } from "./volcano/MCVolcano";
import { MCCombobox } from "../../utils/components/MCCombobox";
import _, { isFunction, rest } from "lodash";
import { Button, H4, Icon } from "@blueprintjs/core";
import { useToggle } from "../../../hooks/useToggle";
import { getFeatureLists } from "../../utils/Misc";
import { MCMitoMap } from "./mitomap/MitoMap";
import { MCDatasetSummary } from "./summary/MCDatasetSummary";
import { MCSimpleResponseCheck } from "../../utils/ResponseChecks";
import { useQuery } from "react-query"

const plotTypes = [{typeName:"summary",label:"Summary"},{typeName:"volcano",label:"Volcano"},{typeName:"heatmap",label:"Heatmap"},{typeName:"mitomap",label:"MitoMap"}]


export function MCDataset(props) {
    const {token, dataID} = props
    const [dataDetails, setDataDetails] = useState({details: {},dataExist : false, names : []})
    const [volcanoWindows,setVolcanoWindows] = useState([])
    const [volcanoData, setVolcanoData] =useState([])
    const [activeListName, setActiveList] =useState([])
    const [heatmapData, setHeatmapData] = useState({isLoading:true,data:{},msg:"",clusterIndex : undefined, anovaDetails: {}})
    const [mitoMapData, setMitoMapData] = useState({mitomapPathways:{},msg:"",selectedPathway : undefined, anovaDetails: {}, showNames:false})
    const [transferPoints, toggleTransfer] = useToggle(true)
    const [searchParams] = useSearchParams()
    const plotType = searchParams.get("type")
    
    const featureLists = getFeatureLists()


    const getDatasets = async () => {
        let res = await axios.get('/api/dataset/details', { params: { dataID: dataID, token: token } })
        return res.data 
    }
    // fetch data 
    useQuery("datasetDetails", getDatasets, {
        refetchOnWindowFocus: false, 
        enabled : dataID !== undefined && token !== undefined && dataDetails.details.dataID !== dataID, //avoid calling if no data there or data loaded.
        onSuccess: (data) => {
            if (MCSimpleResponseCheck(data) && _.isObject(data["details"]) && _.isArray(data["names"])) {
                setDataDetails(
                    {
                        dataExist: true,
                        details: data["details"],
                        names: data["names"]
                    }
                )
            }
            else {
                setDataDetails({dataExist:false,details:{},names:[]})
            }
        }
    })
   
    
    
    const setClusterIndex = (clusterIndex) => {
        setHeatmapData(prevValues => {
            return { ...prevValues,"clusterIndex": clusterIndex}
          })
    }


    const  setMitoMapANOVADetails = (anovaDetails,reset=false)=> {
        if (reset) {
            setMitoMapData(prevValues => {
                return { ...prevValues,"anovaDetails": undefined,"data":{}}
              })
        }

        else {
            
            setMitoMapData(prevValues => {
                return { ...prevValues,"anovaDetails": anovaDetails,"data":{}}
            })   
        }
        }
    
    
    const setHeatmapANOVASettings = (anovaDetails,reset=false) => {
        if (reset) {
            setHeatmapData(prevValues => {
                return { ...prevValues,"anovaDetails": undefined,"data":{}}
              })
        }

        else {

            setHeatmapData(prevValues => {
                return { ...prevValues,"anovaDetails": anovaDetails,"data":{}}
              })
        }
        }

    const handleVolcanoData = (data) => {
        setVolcanoData(_.concat(volcanoData,[data]))
    } 

    const handleActiveList = (listName) => {
        if (activeListName === listName) {
            setActiveList(undefined)
        }
        else {
            setActiveList(listName)
        }
    }

    return(

        <div className="fill-grid margin-for-grid-item">
            {dataDetails.dataExist?
                // <div style={{fontSize:"0.75rem",outline:"none"}}>
                //     <div className="topbar-fixed-dataset">
                //     <div className="hor-aligned-out">
                //         <div className="hor-aligned-center-div-sapce-between">

                //             <div style={{color:"#2F5597",marginLeft:"2rem"}}> 
                //                 <h3 >{dataDetails.details["shortDescription"]}</h3>
                //             </div>
                                
                //                 {plotTypes.map(plotTypeItem => {
                //                     return (
                //                         <div className="navbar-link" key={plotTypeItem.typeName}>
                //                             <Link
                //                                 style={
                //                                     {
                //                                         textDecoration: "none",
                //                                         color: plotType === plotTypeItem.typeName ? "#2F5597" : "grey",
                //                                         fontWeight: "light"
                //                                     }}
                //                                 to={`/dataset/${props.dataID}?type=${plotTypeItem.typeName}`}>{plotTypeItem.label}</Link>
                //                         </div>
                //                 )
                //             })}
                            
                //         </div>

                //         <div className="hor-aligned-center-div-sapce-between">
                //             <div className="navbar-link">
                //                 <Link style={{textDecoration:"none", color:"grey"}} to = {`/dataset/`}><Icon icon="database"/></Link>
                //             </div>
                //             <div className="navbar-link">
                //                 <Link style={{textDecoration:"none", color:"grey"}} to = {`/`}><Icon icon="home"/></Link>
                //             </div>

                //         </div>
                //     </div>
                //     </div>
                    plotType==="heatmap"?
                    
                        <MCHeatmapWrapper 
                            token = {props.token} 
                            responseData = {heatmapData} 
                            groupingNames={dataDetails.details.groupingNames} 
                            setHeatmapANOVASettings = {setHeatmapANOVASettings}
                            saveHeatmapData = {setHeatmapData} 
                            setClusterIndex = {setClusterIndex}/>
                        :plotType==="volcano"?
                            <MCVolcanoGrid 
                                token = {props.token}
                                dataID = {props.dataID} 
                                volcanoWindows = {volcanoWindows}
                                setVolcanoWindows = {setVolcanoWindows}
                                volcanoData = {volcanoData} 
                                setVolcanoData = {handleVolcanoData}
                                groupingNames={dataDetails.details.groupingNames} 
                                groupItems={dataDetails.details.groupItems}
                                transferPoints = {transferPoints}
                                toggleTransfer = {toggleTransfer}
                                handleActiveList  = {handleActiveList}
                                activeListName = {activeListName}
                                activeList = {activeListName!==undefined && Object.keys(featureLists).includes(activeListName)?featureLists[activeListName]:[]}
                                savedFeatureLists = {Object.keys(featureLists)}
                                />
                        :plotType==="mitomap"?
                            <div>
                                <MCMitoMap 
                                    token = {props.token}
                                    dataID = {props.dataID} 
                                    mitoMapData = {mitoMapData}
                                    setMitoMapData = {setMitoMapData}
                                    groupingNames={dataDetails.details.groupingNames} 
                                    setMitoMapANOVADetails = {setMitoMapANOVADetails}
                                            />
                            </div>
                        : plotType === "summary" ?
                            <div>
                                        <MCDatasetSummary details={dataDetails.details} names={dataDetails.names} token={token} dataID={dataID} />
                            </div>
                        : null
                :
                
                <p>Data ID not found. Please check url.</p>}
        </div>
    )
}



export function MCGroupingSelection(props) {

    const {groupItems, groupingNames, confirmButtonText, callback} = props
    const [grouping,setGrouping] = useState({main:undefined,group1:undefined,group2:undefined,mainItems:[],withinGroupings:[],withinGroup:undefined})
    //const [mainGroups, setMainGroups] = useState([undefined,undefined])

    const handleMainGroupingSelection = (groupingName) => {
        const itemsForSelcetion = groupItems[groupingName]
        const withinGroupings = _.filter(groupingNames, o => o!==groupingName)
        const autoSelectWT = itemsForSelcetion.length > 10 && itemsForSelcetion.includes("WT")
        setGrouping({
            main:groupingName,
            group1:autoSelectWT?itemsForSelcetion[0]!=="WT"?itemsForSelcetion[0]:itemsForSelcetion[1]:itemsForSelcetion[0],
            group2:autoSelectWT?"WT":itemsForSelcetion[1],
            mainItems:itemsForSelcetion.length > 10?itemsForSelcetion.sort():itemsForSelcetion,
            withinGroupings : _.concat(["None"], withinGroupings),
            withinGrouping: "None",
            withinItems : withinGroupings[0]!==undefined?groupItems[withinGroupings[0]]:[],
            withinGroup : withinGroupings[0]!==undefined?groupItems[withinGroupings[0]][0]:"None"
        })
   
    }

    const handleGroupingChange = (groupKey,groupValue) =>{
        
        setGrouping(
            prevValues => {
              return { ...prevValues,[groupKey]:groupValue}}) 
    }


    const confirmGroupSelection = (e) => {

        const filteredGrouping = _.pick(grouping, ["group1","group2","main","withinGrouping","withinGroup"])
       
        if (isFunction(callback)){
            callback(filteredGrouping)
        }
        
    }

    return(
        <div style={{fontSize:"0.85rem"}}>
            <H4>Grouping for volcano plot.</H4>
            <p>Select groups to perform pariwise t-test.</p>
            <MCCombobox callback={handleMainGroupingSelection} items = {groupingNames} placeholder={grouping.main}/>
            {grouping.main in groupItems?
                <div className="hor-aligned-center-div">
                    <div className="hor-aligned-div" >
                    <div style={{paddingRight:"0.5rem",paddingTop:"2px"}}>
                        <p>Group 1:</p>
                    </div>
                    <MCCombobox 
                        items = {grouping.mainItems} 
                        callback = {handleGroupingChange} 
                        placeholder = {grouping.group1} 
                        callbackKey = "group1"
                        buttonProps ={{minimal : false,
                                        small : true,
                                        intent : "primary"
                                        }}/>
                                       
                        
                    </div>
                    <div className="hor-aligned-div">
                    <div style={{paddingRight:"0.5rem",paddingTop:"2px"}}>
                        <p>vs</p>
                    </div>
                    </div>
                    <div className="hor-aligned-div">
                    <div style={{paddingRight:"0.5rem",paddingTop:"2px"}}>
                        <p>Group 2:</p>
                    </div>
                    <MCCombobox 
                            items = {grouping.mainItems} 
                            callback = {handleGroupingChange} 
                            placeholder = {grouping.group2} 
                            callbackKey = "group2"
                            buttonProps ={{minimal : false,
                                        small : true,
                                        intent : "success"
                                        }}/>
                    </div>
                </div>
            
            :null}
            
            {grouping.withinGroupings.length > 1?
                <div>
                    <p>Within Grouping:</p>
                    <MCCombobox 
                        items = {grouping.withinGroupings} 
                        placeholder={grouping.withinGrouping}
                        callback = {handleGroupingChange} 
                        callbackKey = "withinGrouping"/>
                    <MCCombobox     
                        disabled = {grouping.withinGrouping === "None"}
                        items = {grouping.withinItems} 
                        callback = {handleGroupingChange} 
                        placeholder = {grouping.withinGroup} 
                        callbackKey = "withinGroup"
                        buttonProps ={{minimal : false,
                            small : true,
                            intent : "danger"
                            }}/>
                </div>:
            null}
            <p>The resulting log2 fold change will: log2 FC({`${grouping.group1}/${grouping.group2}`})</p>

        <Button 
            disabled = {grouping.group1 === grouping.group2} 
            text={confirmButtonText} 
            intent="primary" 
            small={true}
            onClick = {confirmGroupSelection}/>
        </div>
    )
}

MCGroupingSelection.defaultProps = {
    groupingNames : ["Treatment","Time"],
    groupItems : {"Treatment":["A","B"],"Time":["A1","B1"]},
    confirmButtonText : "Show Volcano"
}
