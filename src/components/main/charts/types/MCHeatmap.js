
import { scaleLinear } from '@visx/scale';
import { Text } from "@visx/text"

const legendTextProps = {textAnchor:"start",
verticalAnchor:"middle",
fontSize:9,
fill:"#262626"
}




export function MCHeatmap (props) {

    const {width, height, values, groupingColors, groupingLegend, featureNames} = props
    const margin = {left:5,top:15,bottom:10,right:50}
    const heatmapWidth = width-margin.left-margin.right
    const binWidth = heatmapWidth / values[0].length
    
    
    
    const dxdyMargin = 0 

    const colorScale = scaleLinear({
        //iniate blue_red linear color scale by default
        range:props.colorPalette,
        domain:props.colorValues
            })

    const groupLines = groupingColors!==undefined && Array.isArray(groupingColors)?groupingColors.length:0
    const marginBetweenGroupsAndHeat = 5
    
    const binHeight = (height-margin.top-margin.bottom-marginBetweenGroupsAndHeat*2) / (values.length+groupLines + Object.keys(groupingLegend).length)
    const marginForGroupingLegend = binHeight * (Object.keys(groupingLegend).length) +  marginBetweenGroupsAndHeat
    const groupMargin = groupLines*binHeight + marginBetweenGroupsAndHeat
    const startHeatmap = margin.top+ groupMargin + marginForGroupingLegend
    const renderHeatmap = binHeight > 2 && width > 160

   
    return(
        
        <g>
            {renderHeatmap?<g>
                {props.colorPalette.map((hexColor,i) => {
                    const xtext = margin.left + i * 35 + 12
                    return(
                        <g key={hexColor}>
                            <rect x = {margin.left + i * 35 } y = {2} height={10} width={10} fill = {hexColor} {...props.heatmapRectProps}/>
                            <Text 
                            
                                x = {xtext} 
                                y = {7} 
                                {...legendTextProps}
                                >
                                    {Math.round(props.colorValues[i]*10 + Number.EPSILON) / 10}
                            </Text>
                        </g>
                    )
                })}
                <Text x = 
                    {margin.left + (props.colorPalette.length-1) * 35 + 30} 
                    y = {7} 
                    {...legendTextProps}>Z-Score</Text>
            </g>:null}
            {marginForGroupingLegend>marginBetweenGroupsAndHeat && renderHeatmap?Object.keys(groupingLegend).map((groupingName,ig) => {
                const groupingColor = groupingLegend[groupingName]
                const groupNames = Object.keys(groupingColor)
                const legendY = margin.top + binHeight * ig
                const widthPerLegendItem = (heatmapWidth) / groupNames.length
                return(
                    groupNames.map((v,i) =>{
                    const legendItemStart = margin.left + widthPerLegendItem * i 
                    return(
                        <g key = {`${i}${ig}-legend.item`}>
                        <rect x={legendItemStart} y = {legendY+2} width={10} height={binHeight-2} fill = {groupingColor[v]} {...props.heatmapRectProps}/>
                        <Text
                        x = {legendItemStart+18}
                        y = {legendY+2+(binHeight-2)/2}
                        {...legendTextProps}
                        >
                            {v}
                        </Text>
                        </g>
                    
                    )}))})
                :null}
                    
               
            
            {groupLines>0 && renderHeatmap?
                groupingColors.map((vc,nr) =>{
                    return(
                        vc.map((hexC,nc) => {
                            return(
                            <rect 
                                key = {`${nr}-${nc}-grouping`}
                                x={binWidth*nc+margin.left} 
                                y={binHeight*nr+margin.top+marginForGroupingLegend} 
                                width={binWidth-dxdyMargin} 
                                height={binHeight-dxdyMargin} 
                                fill={hexC} 
                                strokeWidth={0.2} 
                                stroke={"black"}/>
                                    )
                        })
                    )
                })
            :null}
            {groupingLegend!==undefined && renderHeatmap?Object.keys(groupingLegend).map((groupingName,nc) =>{
                return(
                    <Text 
                            key = {`${nc}-heatlabel`}
                            x={binWidth*groupingColors[0].length+margin.left+4} 
                            y={binHeight*(nc)+binHeight/2+margin.top+marginForGroupingLegend}
                            textAnchor={"start"}
                            verticalAnchor={"middle"}
                            fontSize={9}>
                            {groupingName}
                        </Text>
                )
            }):null}
            {
            renderHeatmap?values.map((vs,nr)=>{
                return(
                vs.map((v,nc) => {
                return (
                    <rect 
                        key = {`${nr}-${nc}-heat`}
                        x={binWidth*nc+margin.left} 
                        y={binHeight*nr+startHeatmap} 
                        width={binWidth-dxdyMargin} 
                        height={binHeight-dxdyMargin} 
                        fill={v === null?"#efefef":colorScale(v)} 
                        strokeWidth={0.2} 
                        stroke={"black"}/>
            )
            }
            ))
            }):null}
            <g>
                {featureNames.length > 0 && renderHeatmap?
                featureNames.map((l,nc)=> {return(
                        <Text 
                            key = {`${nc}-heatlabel`}
                            x={binWidth*values[0].length+margin.left+4} 
                            y={binHeight*(nc)+startHeatmap+binHeight/2}
                            textAnchor={"start"}
                            verticalAnchor={"middle"}
                            fontSize={9}>
                            {l}
                        </Text>)})
                :null}
            </g>
        </g>
        
    )
}

MCHeatmap.defaultProps = {
    values : [[]],
    heatmapRectProps : {stroke : "black", strokeWidth : 0.5},

}