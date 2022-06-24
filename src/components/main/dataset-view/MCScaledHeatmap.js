

import axios from "axios";
import { useEffect, useState } from "react";

import { MCClusterOverview } from "./MCClusterOverview";

import _, { filter } from "lodash";
import { Column, Cell, Table2} from "@blueprintjs/table";
import { MCSpinner } from "../../spinner/MCSpinner";
import { MCMenuIcon } from "../protein-view/Layout";
import { scaleLinear } from "@visx/scale";

import { Text } from "@visx/text";
import { Popover2 } from "@blueprintjs/popover2";
import { Menu, MenuItem } from "@blueprintjs/core";
import { downloadTxtFile, arrayOfObjectsToTabDel, downloadSVGAsText } from "../../utils/Misc";
import { useParams } from "react-router";

export function MCHeatmapWrapper(props) {
    const params = useParams()
    const {token, responseData, saveHeatmapData, setClusterIndex} = props 
    const {dataID} = params
    //const [responseData,setData] = useState({isLoading:false,data:{}}) 
    

   
    useEffect(() => {
        
        if (Object.keys(responseData.data).length !== 0) return 
        saveHeatmapData({isLoading:true,data:{},msg:""})
        axios.get('/api/data/heatmap', {params:{dataID:dataID,token:token}}).then(response => {
            
            if ("success" in response.data && response.data["success"]) {
                if (response.data.params === undefined) {
                    saveHeatmapData({isLoading:false,data:undefined,msg:"Loaded"})
                    return
                }
                saveHeatmapData({isLoading:false,data:response.data.params,msg:"Loaded"})
                }
            else if ("error" in response.data){
                saveHeatmapData(
                    {
                        isLoading:false,
                        data:{},
                        msg:response.data["error"]
                    }
                )
            }
            
            }
        )
      }, []);

   
    
    
    return(
        <div>
            
                {
                    responseData.data === undefined?null:responseData.isLoading?
                            <MCSpinner/>:
                        Object.keys(responseData.data).length > 0?
                            <div>
                                <p >
                                {responseData.data.heatmap.values.length} features were found to meet the significance cutoff. 
                                Click on the cluster to explore the features.
                                Holding shift when selecting allows to combine features of multiple clusters.
                                </p>
                    <div style={{display:"flex",flexDirection:"row"}}>
                            {<MCClusterOverview 
                                {...responseData.data.clusterView} 
                                groupingColorMapper = {responseData.data.legend.groupingColorMapper}
                                nColumns = {responseData.data.heatmap.nColumns}
                                groupingNames = {responseData.data.legend.groupingNames}
                                groupColorValues = {responseData.data.heatmap.groupColorValues}
                                handleClusterIndexSelection = {setClusterIndex}
                                colorPalette = {responseData.data.heatmap.colorPalette}
                                colorPaletteValues = {responseData.data.heatmap.colorValues}
                                
                                />
                            }
                            {/* {
                                <MCLegendTable 
                                groupingNames = {data.legend.groupingNames}
                                groupingColorMapper = {data.legend.groupingColorMapper}
                                groupingItems = {data.legend.groupingItems} />
                                } */}
                            
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
                                   />}
                    </div>
                    </div>:
                        <p style={{fontSize:"0.75rem"}}>
                                The API returned an error: {responseData.msg}.
                    </p>}
        </div>
    )
}


export function MCLegendTable(props) {
    const {binHeight,groupingNames,groupingItems, groupingColorMapper} = props
    const numGroupings = groupingNames.length
    
    const cellRenderer = (rowIndex,columnIndex) => {
        const groupItem = groupingItems[groupingNames[columnIndex]][rowIndex]
        const bgColor = groupingColorMapper[groupingNames[columnIndex]][groupItem]
        return(

        <Cell style={{backgroundColor:bgColor}}>
            {groupingItems[groupingNames[columnIndex]][rowIndex]}
        </Cell>
        )
    }
    return(
        <div style={{height:"100px",paddingRight:"20px"}}>
                <Table2 
                    numRows={groupingItems[groupingNames[0]].length}
                    forceRerenderOnSelectionChange={false}
                    defaultRowHeight = {binHeight}
                    enableRowHeader = {false}
                    enableColumnHeader = {false}
                    // columnWidths = {[binHeight,binHeight,binHeight,binHeight, undefined]}
                    enableColumnResizing={true}
                    enableRowResizing = {false}     
                    >
                        {_.range(numGroupings).map((headerName,index) => {
                            return(<Column key = {`${index}`} name = {groupingNames[index]} cellRenderer = {cellRenderer}/>)
                        })}
                            
                    </Table2>

            </div>

    )
    
}

MCLegendTable.defaultProps = {
    groupingNames : ["G1","G2"],
    groupingColorMapper : {},
    groupingItems : {},
    binHeight: 20
}

const svgHeatID = "heat-svg"
const svgGroupingID = "grouping-svg"

export function MCScaledHeatmap(props) {
    const {binHeight, nColumns,margin,values,colorPalette,colorPaletteValues,groupColorValues,groupingNames,clusterIndexToShow,clusterIndex,clusterColors,columnNames,groupingMapper,dataID,nExtraColumns} = props
    
    
    
    const numberRows = values.length
    const numberColumns = nColumns+2
    const clusterSelected = clusterIndexToShow!==undefined && clusterIndexToShow.length
    const filteredValues = clusterSelected?values.filter((v,i) => clusterIndexToShow.includes(clusterIndex[i])):values
    const marginForLabel = nExtraColumns*10+4
    const colorScale = scaleLinear({
            range:colorPalette,
            domain:colorPaletteValues
        })
   
   


    return(

        <div style={{height:"800px",marginRight:margin.right, marginLeft:margin.left, marginTop:margin.top, marginBottom:margin.bottom}}>
            {/* <Table2 
                numRows={nRows+groupings.length}
                forceRerenderOnSelectionChange={false}
                defaultRowHeight = {binHeight}
                enableRowHeader = {true}
                columnWidths = {_.concat(Array(numberColumns).fill(binHeight),[undefined])}
                enableColumnResizing={false}
                enableRowResizing = {false}     
                rowHeaderCellRenderer={rowHeaderRenderer}  
                numFrozenRows = {groupings.length} 
                
                 
                >
                    {_.range(numberColumns+1).map((headerName,index) => {
                        return(<Column key = {`${index}`} name = {numberColumns===index?"Name":""} cellRenderer = {cellRenderer}/>)
                    })}
                        
                </Table2> */}
            <div style={{height:"30px"}}>
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
                            
                        
                    </Menu>}>
                <MCMenuIcon size={20}/>
                </Popover2>
            </div>
            <div>
            <svg 
                width = {numberColumns*binHeight+80} 
                height = {binHeight*groupingNames.length+15+marginForLabel} 
                id = {svgGroupingID} 
                viewBox = {`0 0 ${numberColumns*binHeight+80} ${binHeight*groupingNames.length+15+marginForLabel}`}>
            <g>
                    {groupingNames.map((groupingName,groupingIndex) => {
                        return(

                            <g key={`${groupingName}`}>
                            <Text 
                                x = {0} 
                                y={0} 
                                fontSize = {10} 
                                verticalAnchor={"start"}>
                                    {clusterSelected?`n=${filteredValues.length} / ${values.length} in ${clusterIndexToShow.length} cluster ${clusterIndexToShow}`:"Select cluster."}
                            </Text>
                            {_.range(nColumns).map(columnIndex => {
                                const bgColor = groupColorValues[groupingName][columnIndex]
                                // groupingColorMapper[groupingNames[groupIndex]][groupItem]
                                return(
                                    <rect 
                                            key={`heat-rect-group-${columnIndex}-${groupingName}-${groupingIndex}`}
                                            x = {columnIndex*binHeight+binHeight+5} 
                                            y={groupingIndex*binHeight+15} 
                                            width={binHeight} 
                                            height = {binHeight} 
                                            fill = {bgColor} 
                                            stroke="black" 
                                            strokeWidth={0.4}/>
                                )
                            })}
                            <Text  
                                    x = {(nColumns+1)*binHeight+binHeight/4+5} 
                                    y={groupingIndex*binHeight+binHeight/2+15} 
                                    fontSize={10} 
                                    textAnchor={"start"} 
                                    verticalAnchor={"middle"}>
                                        {`${groupingName}`}
                                </Text>
                            </g>
                        )
                        

                    })}

                <Text x={binHeight/2} y={binHeight*groupingNames.length+15+marginForLabel} angle={-90} fontSize={10} verticalAnchor="middle">Cluster</Text>
                
                {nExtraColumns>0?_.range(nExtraColumns).map(iiExtra => {
                        const x = 0+(nColumns+1+iiExtra)*binHeight+8
                        const y = binHeight*groupingNames.length+15+(iiExtra)*10+4
                        return(
                            <g key={`${iiExtra}-extraText`}>
                            <Text 
                                x = {x} 
                                y = {binHeight*groupingNames.length+15+(iiExtra)*10+4}
                                verticalAnchor="start" fontSize={9}>
                                    {columnNames[nColumns+4+iiExtra]}
                            </Text>
                            {iiExtra!==nExtraColumns-1?
                                <line 
                                    x1={x+binHeight/2} 
                                    x2={x+binHeight/2}  
                                    y1={y+9}  
                                    y2={binHeight*groupingNames.length+15+marginForLabel} 
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
            <svg width = {numberColumns*binHeight+120} id = {svgHeatID} height = {binHeight*numberRows} viewBox = {`0 0 ${numberColumns*binHeight+120} ${binHeight*numberRows}`}>
                <g>
                    
                    {
                        filteredValues.map((rowData,rowIndex) => {  
                            
                            return(
                            <g key={`${rowIndex}-rowID`}>
                                <rect 
                                    key = {`cluster-${rowIndex}`}
                                    x = {0} 
                                    y={rowIndex*binHeight} 
                                    width={binHeight} 
                                    height = {binHeight} 
                                    fill = {clusterColors[rowData[nColumns+1]]}
                                    stroke="black" 
                                    strokeWidth={0.4}/>
                                {_.range(nColumns).map(columnIndex => {
                                    const v = rowData[columnIndex]
                                    return(
                                        <rect 
                                                key = {`${columnIndex}-${rowIndex}`}
                                                x = {(columnIndex+1)*binHeight+5} 
                                                y={rowIndex*binHeight} 
                                                width={binHeight} 
                                                height = {binHeight} 
                                                fill = {colorScale(v)} 
                                                stroke="black" 
                                                strokeWidth={0.4}/>)
                                })}
                                
                                <Text  
                                    x = {(nColumns+(nExtraColumns+1))*(binHeight)+binHeight/4+8} 
                                    y={rowIndex*binHeight+binHeight/2} 
                                    fontSize={10} 
                                    textAnchor={"start"} 
                                    verticalAnchor={"middle"}>
                                        {`${rowData[nColumns+2]} (${rowData[nColumns]})`}
                                </Text>
                                {_.range(nExtraColumns).map(iiExtra => {
                                return(
                                    <rect 
                                        key = {`mito-${rowIndex}-${iiExtra}`}
                                        x = {(nColumns+1+iiExtra)*binHeight+8} 
                                        y={rowIndex*binHeight} 
                                        width={binHeight} 
                                        height = {binHeight} 
                                        fill = {rowData[nColumns+(4+iiExtra)]!=="-"?"#bf3525":"#efefef"}
                                        stroke="black" 
                                        strokeWidth={0.4}/>)})}
                            </g>
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
    binHeight : 15,
    margin : {left: 5, top: 10, right: 50, bottom:5},
    
    colorPalette : [],
    colorPaletteValues : [],
    values : []
}