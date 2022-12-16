

import axios from "axios";
import { useEffect, useMemo, useState } from "react";

import { MCClusterOverview } from "./MCClusterOverview";

import _, { isNaN }  from "lodash";
import { Column, Cell, Table2} from "@blueprintjs/table";
import { MCSpinner } from "../../spinner/MCSpinner";
import { MCMenuIcon } from "../protein-view/Layout";
import { scaleLinear } from "@visx/scale";

import { Text } from "@visx/text";
import { Popover2 } from "@blueprintjs/popover2";
import { Menu, MenuItem, Button, NumericInput, ButtonGroup } from "@blueprintjs/core";
import { downloadTxtFile, arrayOfObjectsToTabDel, downloadSVGAsText } from "../../utils/Misc";
import { useParams } from "react-router";
import { MCCombobox } from "../../utils/components/MCCombobox";
import { MCSuggest } from "../../utils/components/MCSuggest";
import MCHeatmapRow from "./MCHeatmaprow"

const legendTextProps = {textAnchor:"start",
verticalAnchor:"middle",
fontSize:9,
fill:"#262626"
}

export function MCClusterANOVASelection(props) {

    const {groupingNames, setANOVASettings, buttonText,  askForNumberClusters } = props 
    const [anovaType,setANOVAType] = useState("1-way ANOVA")
    const [groupingSelection, setGroupingSelection] = useState({pvalue:0.001, ncluster:6})
    const oneWayANOVA = anovaType === "1-way ANOVA" || groupingNames.length === 1

    const saveGroupingSelection = (groupingKey,groupingValue) => {
        setGroupingSelection(
            prevValues => {
              return { ...prevValues,[groupingKey]:groupingValue}}) 
    }

    const submitANOVAsettings = (e) => {
        const groupingSettings = groupingSelection
        groupingSettings["anovaType"] = anovaType
        setANOVASettings(groupingSelection)
    }
    
    
    return (
        <div style={{transform:"translateX(50%)",width:"50%"}}>
            <h3>ANOVA Selection</h3>

                <div className="hor-aligned-div" >
                    <div style={{paddingRight:"0.5rem",paddingTop:"2px"}}>
                        <p>Analysis of variance:</p>
                    </div>
                <MCCombobox  
                    items = {groupingNames.length === 1?["1-way ANOVA"]:["1-way ANOVA","2-way ANOVA"]} placeholder={anovaType} callback={setANOVAType}
                    buttonProps ={{minimal : false,
                                    small : true,
                                    intent : "primary"
                                    }}/>
                                    
                </div>
                <div className="hor-aligned-div" >
                    <div style={{paddingRight:"0.5rem",paddingTop:"2px"}}>
                        <p>Grouping 1:</p>
                    </div>
                <MCCombobox  
                    items = {groupingNames}
                    placeholder = {groupingSelection.grouping1}
                    callbackKey = "grouping1"
                    callback = {saveGroupingSelection}
                    buttonProps ={{minimal : false,
                                    small : true,
                                    intent : "none"
                                    }}/>
                                    
                    
                </div>

                <div className="hor-aligned-div" >
                    <div style={{paddingRight:"0.5rem",paddingTop:"2px"}}>
                        <p>Grouping 2:</p>
                    </div>
                <MCCombobox  
                    items = {groupingNames}
                    placeholder = {groupingSelection.grouping2}
                    callbackKey = "grouping2"
                    callback = {saveGroupingSelection}
                    buttonProps ={{minimal : false,
                                    small : true,
                                    intent : "none",
                                    disabled : oneWayANOVA
                                    }}/>
                </div>
            

            {askForNumberClusters ?
                //ask for number of clusters (important for hierarchical clustering)
                <div className="hor-aligned-div" >
                        <div style={{paddingRight:"0.5rem",paddingTop:"2px"}}>
                            <p>Number of cluster:</p>
                        </div>
                        <NumericInput 
                            min={2} 
                            max={25} 
                            value={groupingSelection.ncluster} 
                            onValueChange = {value => saveGroupingSelection("ncluster",value)} 
                            placeholder={"Number of clusters."} 
                            stepSize={1} 
                            minorStepSize={1}/>
                </div>
                    : null
            }
                <div className="hor-aligned-div" >
                    <div style={{paddingRight:"0.5rem",paddingTop:"2px"}}>
                        <p>Significance:</p>
                    </div>
                <MCCombobox  
                    items = {oneWayANOVA?["Grouping p-value"]:_.concat(_.map(groupingNames, v=> `p-value ${v}`),["p-value Interaction"])}
                    callbackKey = "pvalueType"
                    placeholder = {oneWayANOVA?"Grouping p-value":groupingSelection.pvalueType===undefined?"Select p-value":groupingSelection.pvalueType}
                    callback = {saveGroupingSelection}
                    buttonProps ={{minimal : false,
                                    small : true,
                                    intent : "none",
                                    disabled : oneWayANOVA
                                    }}/>
                                    
                <NumericInput 
                    min={1e-12} 
                    max={0.5} 
                    value={groupingSelection.pvalue} 
                    onValueChange = {value => saveGroupingSelection("pvalue",value)} 
                    placeholder={"p-value cutoff"} 
                    stepSize={0.000001} 
                    minorStepSize={0.000001}/>
                </div>

                <Button text = {buttonText} small={true}  minimal={false} intent={"primary"} onClick={submitANOVAsettings}/>

                

        </div>
    ) 
}

MCClusterANOVASelection.defaultProps = {
    groupingNames : ["A","B"],
    buttonText: "Show Heatmap",
    askForNumberClusters : true

}


export function MCHeatmapWrapper(props) {
    const params = useParams()
    const [highlightedItem, setHighLightedItem] = useState(undefined)
    const {token, responseData, saveHeatmapData, setClusterIndex, groupingNames, setHeatmapANOVASettings} = props 
    const {dataID} = params
    //const [responseData,setData] = useState({isLoading:false,data:{}}) 
    
    //console.log(responseData)
   
    useEffect(() => {
       

        if (Object.keys(responseData.data).length !== 0) return 
        if (!_.isFunction(saveHeatmapData)) return 
        if (responseData.anovaDetails===undefined  ||  Object.keys(responseData.anovaDetails).length === 0) return 
        saveHeatmapData(prevValues => {
            return { ...prevValues,"isLoading":true}
          })

        const controller = new AbortController();

        axios.get('/api/data/heatmap',
            {
                params:
                {
                    dataID: dataID,
                    token: token,
                    anovaDetails: responseData.anovaDetails
                },
                signal: controller.signal
            }).then(response => {
                
            console.log(response.data)
            if ("success" in response.data && response.data["success"]) {
                if (response.data.params === undefined) {
                    
                    saveHeatmapData(prevValues => {
                        return { ...prevValues,"isLoading":false,"data":undefined,"msg":"Received data were undefined."}
                      })
                    return
                }
                saveHeatmapData(prevValues => {
                    return { ...prevValues,"isLoading":false,"data":response.data.params,"msg":"Loaded."}
                  })
                }
            else if ("error" in response.data){
                saveHeatmapData(prevValues => {
                    return { ...prevValues,"isLoading":false,"data":{},"msg":response.data["error"]}
                  })
            }
            }
        ).catch((err) => {
            console.log(err)
            })

            return () => {
               
                controller.abort()
            }
        } , [dataID,responseData.anovaDetails,token]);

    
    const handleClusterSelectionBySearch = (item) => {

        setClusterIndex([item.clusterIndex])
        setHighLightedItem(item.itemKey)
    }

    const handleHighlightedItems = (itemKey) => {
        if (highlightedItem !== itemKey) {
            setHighLightedItem(itemKey)
        }
    }

    return(
        <div>
                {
                    responseData.anovaDetails===undefined || Object.keys(responseData.anovaDetails).length === 0  ? 
                        <MCClusterANOVASelection groupingNames = {groupingNames} setANOVASettings = {setHeatmapANOVASettings}/>
                        :

                    responseData.data === undefined?null:responseData.isLoading?
                            <MCSpinner/>:
                                Object.keys(responseData.data).length > 0?
                            <div>
                                <p >
                                {`${responseData.data.heatmap.values.length} features were found to meet the significance cutoff ${responseData.anovaDetails.anovaType} (p-value < ${responseData.anovaDetails.pvalue})
                                in groupings ${responseData.anovaDetails.grouping1} / ${responseData.anovaDetails.grouping2}. Click on the cluster to explore the features.
                                Holding shift when selecting allows to combine features of multiple clusters.`}
                                </p>
                    <div style={{display:"flex",flexDirection:"row"}}>
                            {
                                <MCClusterOverview 
                                    {...responseData.data.clusterView} 
                                    groupingColorMapper = {responseData.data.legend.groupingColorMapper}
                                    nColumns = {responseData.data.heatmap.nColumns}
                                    groupingNames = {responseData.data.legend.groupingNames}
                                    groupColorValues = {responseData.data.heatmap.groupColorValues}
                                    handleClusterIndexSelection = {setClusterIndex}
                                    colorPalette = {responseData.data.heatmap.colorPalette}
                                    colorPaletteValues = {responseData.data.heatmap.colorValues}
                                    clusterIndex = {responseData.data.heatmap.clusterIndex}
                                    clusterIndexToShow = {responseData.clusterIndex===undefined?[]:responseData.clusterIndex}
                                />
                            }
                            
                            {<MCScaledHeatmap  
                                    nColumns = {responseData.data.heatmap.nColumns}
                                    colorPalette = {responseData.data.heatmap.colorPalette}
                                    colorPaletteValues = {responseData.data.heatmap.colorValues}
                                    values = {responseData.data.heatmap.values}
                                    columnNames = {responseData.data.heatmap.columnNames}
                                    groupingNames = {responseData.data.legend.groupingNames}
                                    groupingMapper = {responseData.data.legend.groupingMapper}
                                    groupingColorMapper = {responseData.data.legend.groupingColorMapper}
                                    groupingItems = {responseData.data.legend.groupingItems} 
                                    groupColorValues = {responseData.data.heatmap.groupColorValues}
                                    clusterIndex = {responseData.data.heatmap.clusterIndex}
                                    clusterIndexToShow = {responseData.clusterIndex}
                                    clusterColors = {responseData.data.clusterView.clusterColors}
                                    dataID = {responseData.data.heatmap.dataID}
                                    nExtraColumns = {responseData.data.heatmap.nExtraColumns}
                                    setHeatmapANOVASettings = {setHeatmapANOVASettings}
                                    handleClusterSelectionBySearch = {handleClusterSelectionBySearch}
                                    highlightedItem = {highlightedItem}
                                    handleHighlightedItems = {handleHighlightedItems}
                                   />}
                    </div>
                    </div>:
                        <div style={{marginTop:"2rem"}}>
                        <p style={{fontSize:"0.95rem"}}>
                                    The API returned an error: {responseData.msg}.
                        </p>
                        <Button text = "Return to group selection" small={true} minimal={true} intent="primary" onClick={e => setHeatmapANOVASettings({},true)}/>
                        </div>
                     }
        </div>
    )
}


// export function MCLegendTable(props) {
//     const {binHeight,groupingNames,groupingItems, groupingColorMapper} = props
//     const numGroupings = groupingNames.length
    
//     const cellRenderer = (rowIndex,columnIndex) => {
//         const groupItem = groupingItems[groupingNames[columnIndex]][rowIndex]
//         const bgColor = groupingColorMapper[groupingNames[columnIndex]][groupItem]
//         return(

//         <Cell style={{backgroundColor:bgColor}}>
//             {groupingItems[groupingNames[columnIndex]][rowIndex]}
//         </Cell>
//         )
//     }
//     return(
//         <div style={{height:"100px",paddingRight:"20px"}}>
//                 <Table2 
//                     numRows={groupingItems[groupingNames[0]].length}
//                     forceRerenderOnSelectionChange={false}
//                     defaultRowHeight = {binHeight}
//                     enableRowHeader = {false}
//                     enableColumnHeader = {false}
//                     // columnWidths = {[binHeight,binHeight,binHeight,binHeight, undefined]}
//                     enableColumnResizing={true}
//                     enableRowResizing = {false}     
//                     >
//                         {_.range(numGroupings).map((headerName,index) => {
//                             return(<Column key = {`${index}`} name = {groupingNames[index]} cellRenderer = {cellRenderer}/>)
//                         })}
                            
//                     </Table2>

//             </div>

//     )
    
// }

// MCLegendTable.defaultProps = {
//     groupingNames : ["G1","G2"],
//     groupingColorMapper : {},
//     groupingItems : {},
//     binHeight: 20
// }



const svgHeatID = "heat-svg"
const svgGroupingID = "grouping-svg"

export function MCScaledHeatmap(props) {
    const {binHeight, 
            nColumns,
            margin,
            values,
            colorPalette,
            colorPaletteValues,
            groupColorValues,
            groupingNames,
            groupingItems,
            clusterIndexToShow,
            clusterIndex,
            clusterColors,
            columnNames,
            groupingMapper,
            dataID,
            nExtraColumns,
            setHeatmapANOVASettings,
            groupingColorMapper,
            handleClusterSelectionBySearch,
            highlightedItem,
            handleHighlightedItems} = props
        
    
    
    //const [svgHeight, setSVGHeight] = useState(0)
    const numberColumns = nColumns+2
    const clusterSelected = clusterIndexToShow!==undefined && clusterIndexToShow.length
    // access filtered values
    const filteredValues = useMemo(
            () => clusterSelected?values.filter((v,i) => clusterIndexToShow.includes(clusterIndex[i])):values,
                [clusterIndexToShow,clusterSelected, clusterIndex]) 

    // searchable value calculation
    const searchableValues = useMemo(() => values.map((rawData,i) => {
        return({name : `${rawData[nColumns+2]} (${rawData[nColumns]})`,clusterIndex : clusterIndex[i], itemKey : rawData[nColumns]})
            }),[nColumns]) 
    
    const svgHeight = useMemo(() => isNaN(filteredValues.length * binHeight)?0:filteredValues.length * binHeight,[filteredValues.length,binHeight])
    

    const colorScale = useMemo(() => scaleLinear({
            range:colorPalette,
            domain:colorPaletteValues
        }),[colorPalette,colorPaletteValues])
   
    //fixed margins
    const marginForLabel = nExtraColumns*10+4
    const marginForLegend = 30
    const itemHighlighted = highlightedItem !== undefined
    
    return(

        <div style={{height:"800px",marginRight:margin.right, marginLeft:margin.left, marginTop:margin.top, marginBottom:margin.bottom}}>

            <div style={{height:"30px"}}>
                <ButtonGroup>
                <Popover2 content={
                    <Menu large={false}>
                        <MenuItem  text={"Download (selection)"} icon={"download"} disabled={!clusterSelected}
                                onClick={e => downloadTxtFile(arrayOfObjectsToTabDel(filteredValues,columnNames,groupingMapper),`Heatmap-${dataID}-C${clusterIndexToShow}.txt`)}/>
                        <MenuItem  text={"Download data"} icon={"download"}
                            onClick={e => downloadTxtFile(arrayOfObjectsToTabDel(values,columnNames,groupingMapper),`Heatmap-${dataID}-C${clusterIndexToShow}.txt`)}/>
                        <MenuItem text="Save grouping (svg)" icon={"group-objects"} onClick={() => {
                                downloadSVGAsText(document.getElementById(`${svgGroupingID}`),`Grouping(${dataID}).svg`)}}/>
                            
                        <MenuItem text="Save heatmap (svg)" icon={"heat-grid"} disabled={!clusterSelected} onClick={() => {
                                downloadSVGAsText(document.getElementById(`${svgHeatID}`),`MitoCube(${dataID}-${clusterIndexToShow}).svg`)}}/>

                        <MenuItem text="Reset" icon={"reset"} onClick={e => setHeatmapANOVASettings({},true)} intent="danger"/>
                        
                    </Menu>}>
                <MCMenuIcon size={20}/>
                </Popover2>
           
                <MCSuggest items = {searchableValues} handleSelection = {handleClusterSelectionBySearch}/>
                </ButtonGroup>
            </div>
            <div>
            <svg 
                width = {numberColumns*binHeight+130} 
                height = {binHeight*groupingNames.length+15+marginForLabel+marginForLegend} 
                id = {svgGroupingID} 
                viewBox = {`0 0 ${numberColumns*binHeight+130} ${binHeight*groupingNames.length+15+marginForLabel+marginForLegend}`}>
            <g>
                    
                {<g>
                    {colorPalette.map((hexColor,i) => {
                        const xtext = margin.left + i * 35 + 12
                        return(
                            <g key={hexColor}>
                                <rect x = {margin.left + i * 35 } 
                                    y = {2} height={10} width={10} fill = {hexColor}
                                    stroke="black" strokeWidth={0.2}/>
                                <Text 
                                
                                    x = {xtext} 
                                    y = {7} 
                                    {...legendTextProps}
                                    >
                                        {Math.round(colorPaletteValues[i]*10 + Number.EPSILON) / 10}
                                </Text>
                            </g>
                        )
                    })}
                    <Text x = 
                        {margin.left + (colorPalette.length-1) * 35 + 30} 
                        y = {7} 
                        {...legendTextProps}>Z-Score</Text>
                </g>}
                {Object.keys(groupingItems).map((groupingName , ii) =>
                    
                    {
                        const yLegend = margin.top + 12 * ii + 10 + 2
                        const legendItems = groupingItems[groupingName]
                        return(
                        legendItems.map((t,n) => {
                            const bgColor = groupingColorMapper[groupingName][t]
                            return(
                                <g key = {t}>
                                <rect x = {0+63*n+margin.left} y = {yLegend-10/2} width={10} height={10} fill={bgColor} stroke="black" strokeWidth={0.2}/>
                                <Text x = {0+63*n+15+margin.left} y = {yLegend} {...legendTextProps}>
                                    {t}
                                </Text>
                                
                                </g>
                            )

                        }))
                    })}

                        <Text 
                                x = {numberColumns*binHeight+130} 
                                y={0} 
                                fontSize = {10} 
                                textAnchor={"end"}
                                verticalAnchor={"start"}>
                                    {clusterSelected?`n=${filteredValues.length} / ${values.length} in ${clusterIndexToShow.length} cluster ${clusterIndexToShow}`:"Select cluster."}
                    </Text>


                    {groupingNames.map((groupingName,groupingIndex) => {
                        return(

                            <g key={`${groupingName}`}>
                            

                            {_.range(nColumns).map(columnIndex => {
                                const bgColor = groupColorValues[groupingName][columnIndex]
                                // groupingColorMapper[groupingNames[groupIndex]][groupItem]
                                return(
                                    <rect 
                                            key={`heat-rect-group-${columnIndex}-${groupingName}-${groupingIndex}`}
                                            x = {columnIndex*binHeight+binHeight+5} 
                                            y={groupingIndex*binHeight+15+marginForLegend} 
                                            width={binHeight} 
                                            height = {binHeight} 
                                            fill = {bgColor} 
                                            stroke="black" 
                                            strokeWidth={0.4}/>
                                )
                            })}
                            <Text  
                                    x = {(nColumns+1)*binHeight+binHeight/4+5} 
                                    y={groupingIndex*binHeight+binHeight/2+15+marginForLegend} 
                                    fontSize={10} 
                                    textAnchor={"start"} 
                                    verticalAnchor={"middle"}>
                                        {`${groupingName}`}
                                </Text>
                            </g>
                        )
                        

                    })}

                <Text x={binHeight/2} y={binHeight*groupingNames.length+15+marginForLabel+marginForLegend} angle={-90} fontSize={10} verticalAnchor="middle">Cluster</Text>
                
                {nExtraColumns>0?_.range(nExtraColumns).map(iiExtra => {
                        const x = 0+(nColumns+1+iiExtra)*binHeight+8
                        const y = binHeight*groupingNames.length+15+(iiExtra)*10+4
                        return(
                            <g key={`${iiExtra}-extraText`}>
                            <Text 
                                x = {x} 
                                y = {binHeight*groupingNames.length+15+(iiExtra)*10+4+marginForLegend}
                                verticalAnchor="start" fontSize={9}>
                                    {columnNames[nColumns+3+iiExtra]}
                            </Text>
                            {iiExtra!==nExtraColumns-1?
                                <line 
                                    x1={x+binHeight/2} 
                                    x2={x+binHeight/2}  
                                    y1={y+9+marginForLegend}  
                                    y2={binHeight*groupingNames.length+15+marginForLabel+marginForLegend} 
                                    stroke ="black"/>
                                :
                            null}
                            </g>
                        )
                    }):null} 
    
                </g>
            </svg>
            </div>
            <div style={{overflowY:"scroll",height:"600px"}}> 
            
            {clusterIndexToShow!==undefined && clusterIndexToShow.length > 0?        
            <svg 
                width = {numberColumns*binHeight+150} 
                id = {svgHeatID} 
                height = {svgHeight}
                //height = {binHeight*numberRows} 
                viewBox = {`0 0 ${numberColumns*binHeight+150} ${svgHeight}`}>
                <g onMouseLeave = {e => handleHighlightedItems(undefined)}>
                    
                    {
                        filteredValues.map((rowData,rowIndex) => {  
                            return(
                                <MCHeatmapRow 
                                    key={`${rowIndex}-rowID`}
                                    binHeight = {binHeight}
                                    rowData = {rowData}
                                    rowIndex = {rowIndex}
                                    nColumns = {nColumns}
                                    nExtraColumns = {nExtraColumns}
                                    clusterColors = {clusterColors}
                                    handleHighlightedItems = {handleHighlightedItems}
                                    colorScale = {colorScale}
                                    opacity = {!itemHighlighted?1:itemHighlighted&&rowData[nColumns] === highlightedItem?1:0.2}
                                    />
                            )
                        
                    })
                
                }
                </g>

            </svg>:<div style={{marginTop:"0.8rem"}}><p>Select a cluster on the left side to explore features.</p><p>Hold shift to select multiple clusters.</p></div>}
            </div>  

        </div>
    )
}


MCScaledHeatmap.defaultProps = {
    groupings : ["Genotype","Treatment"],
    binHeight : 12,
    margin : {left: 5, top: 10, right: 50, bottom:5},
    
    colorPalette : [],
    colorPaletteValues : [],
    values : []
}