import React from "react"
import _ from "lodash"
import { Text } from "@visx/text"
function MCHeatmapRow(props) {
    /* render using props */

    const {binHeight, 
            rowData, 
            rowIndex, 
            nColumns, // column numbers of expression columns - next is key
            nExtraColumns,
            clusterColors,
            handleHighlightedItems,
            colorScale,
            opacity } = props 
    
    return(
        
        <g 
                    opacity={opacity} 
                    onMouseEnter = {e => handleHighlightedItems(rowData[nColumns])}>
                    
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
                            fill = {rowData[nColumns+(3+iiExtra)]!=="-"?"#bf3525":"#efefef"}
                            stroke="black" 
                            strokeWidth={0.4}/>)})}
                </g>


    )
  }
  function areEqual(prevProps, nextProps) {
    /*
    return true if passing nextProps to render would return
    the same result as passing prevProps to render,
    otherwise return false
    */

   // check first if data changed 
   if (prevProps.rowData === undefined && nextProps.rowData !== undefined) {
    return false
   }
      
   if (prevProps.rowIndex !== nextProps.rowIndex) {
    return false
   }
   // check if column number changed
      if (prevProps.rowData[prevProps.nColumns] !== nextProps.rowData[nextProps.nColumns]) {
       
    return false
   }
   //deep comparision of data array
   if (!_.isEqual(prevProps.rowData,nextProps.rowData)){
    return false
   }
   // check opacity change
   if (prevProps.opacity !== nextProps.opacity) {
    return false
   }
      
    
      
   return true

  }
  
  export default React.memo(MCHeatmapRow, areEqual);

