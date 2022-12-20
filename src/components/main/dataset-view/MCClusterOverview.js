
import { useState } from "react";
import _ from "lodash";
import { scaleLinear, scaleBand } from "@visx/scale";
import { Text } from "@visx/text";
import { getLuma } from "../../utils/Misc";




function MCMinimalClusterView(props) {

    const {margin,width,height,vs,clusterIndex,mouseOver,mouseOverText,mouseOverColor,selected,colorScale, groupingNames, hoverColorAndGroups} = props
    
    const [mouseOverBarIndex, setMouseOverBarIndex] = useState(undefined)
    const nXValues = vs.length
    const maxValue = _.max(vs.map(v => Math.abs(v)))

    const xscale = scaleBand(
        {
            domain : _.range(nXValues),
            range : [0+margin.left, width-margin.right],
            padding: 0.15,
            round : true
        }
    )

    const heightGroupingRect = 13
    const minXValue = xscale(-0.5)
    
    const barWidth = xscale.bandwidth()
    const yscale = scaleLinear(        {
                domain : [maxValue, -maxValue],
                range : [0+margin.top,height-margin.bottom-groupingNames.length*heightGroupingRect]
            })
        
    const minYValue = yscale(-maxValue)
    //when dark background color, use white as txt color.
    const textColor = getLuma(mouseOverColor) > 180?"black":"white"
      
           
    return (
        <g>
            
            <rect x = {0} y = {0} width={width} height={height} fill="#f2f2f2"/> 
            
            <rect x={margin.left+1} y={2} width={40} height={12} fill={selected ? mouseOverColor : "transparent"} />
            <Text x={margin.left + 21} y={4} fill={selected?textColor:"black"} fontWeight={selected?500:350} textAnchor={"middle"} verticalAnchor={"start"} fontSize={11}>{`C(${clusterIndex})`}</Text>
            
            <Text x={width - margin.right} y={0} verticalAnchor="start" textAnchor="end" fontSize={11}>{`${mouseOverText}`}</Text>
            <line x1 = {0+margin.left} x2={width-margin.right} y1={yscale(0)} y2={yscale(0)} stroke="black" strokeWidth={selected?0.75:0.25}/>
            <line x1 = {0+margin.left} x2={0+margin.left} y1={minYValue} y2={yscale(maxValue)} stroke="black" strokeWidth={selected?0.75:0.25}/>
            
            {vs.map((p, i) => {
                const barX = xscale(i );
                // const barY = maxValue - barHeight;
                const barGoesDown = p < 0 
                const barHeight = barGoesDown?yscale(p)-yscale(0):yscale(0)-yscale(p)
                const barY = barGoesDown?yscale(0):yscale(p)
                
                return(
                    <g key = {`${i}-clusterViewBar`} >
                    <rect 
                            x = {barX}
                            y = {barY}  
                            height = {barHeight} 
                            width = {barWidth} 
                            fill={colorScale(p)} 
                            stroke="black" 
                            strokeWidth={mouseOver || selected?0.5:0.25}
                            onMouseEnter={e => setMouseOverBarIndex(i)}
                            onMouseLeave={e => setMouseOverBarIndex(undefined)}/>

                    {mouseOver || selected ? groupingNames.map((groupingName, ii) => {
                       
                        let n = hoverColorAndGroups[i][0][ii]
                        let hexColor = hoverColorAndGroups[i][1][ii]
                        let labelOnRightSide = barX / width < 0.50
                        let xtext = labelOnRightSide?barX + barWidth+5:barX-5
                        let widthtext = labelOnRightSide? width - xtext - margin.right : xtext 
                        
                            return(
                                <g key = {`${ii} - legen bars label`}>
                                    <rect
                                        x={barX}
                                        y={yscale(-maxValue) + 5 + heightGroupingRect * ii}
                                        width={barWidth}
                                        height={heightGroupingRect}
                                        fill={hexColor}
                                        stroke="black"
                                        strokeWidth={0.5} 
                                        opacity={mouseOverBarIndex === undefined ? 1 : mouseOverBarIndex === i ? 1 : 0.2}
                                    />
                                {mouseOverBarIndex!==undefined&&mouseOverBarIndex===i?
                                    <Text 
                                                x = {xtext} 
                                                y = {yscale(-maxValue)+5 + heightGroupingRect * ii + heightGroupingRect/2} 
                                                textAnchor={labelOnRightSide?"start":"end"}
                                                verticalAnchor="middle" 
                                                fontSize={11}
                                                width = {widthtext}
                                                scaleToFit = {"shrink-only"}
                                               >
                                        {n}
                                    </Text>
                                    :null
                                }
                                </g>
                            )
                        }):null}    
                    
                        
                
                    </g>
                        
                )
            })}
                
        
            {mouseOver?<Text x={minXValue+5} y={minYValue-5} fontSize={8}>{mouseOverText}</Text>:null}
        </g>
    )
}


MCMinimalClusterView.defaultProps = {

    margin : {left:5,bottom:5,right:10,top:15}
}






export function MCClusterOverview(props) {
    const {clusterIndexValues,
            values,nValuesInCluster,
            clusterColors,
            handleClusterIndexSelection,
            groupingColorMapper,
            clusterIndexToShow,
            groupingNames,
            colorPalette,colorPaletteValues,hoverColorAndGroups} = props

    const [mouseOverIndex, setMouseOverIndex] = useState()
   
    
    const colorScale = scaleLinear({
        range:colorPalette,
        domain:colorPaletteValues
    })

    const handleClusterSelection = (e,clusterIndex) => {
        if (e.shiftKey){
            if (clusterIndexToShow.includes(clusterIndex)){
                handleClusterIndexSelection(_.difference(clusterIndexToShow,[clusterIndex]))
            }
            else {
                handleClusterIndexSelection(_.concat(clusterIndexToShow,[clusterIndex]))
            }
        }
        else {
            handleClusterIndexSelection([clusterIndex])
        }

        
        
    }
    return (

        <div style={
            {
                flexDirection: "row",
                flexWrap: "wrap",
                display: "flex",
                minWidth: "80px",
                maxWidth: "400px",
                height: "85vh",
                overflowY: "scroll",
                marginTop: "2rem"
            }}>
            {clusterIndexValues.map((clusterIndex, idx) => {
                const selectedCluster = clusterIndexToShow.includes(clusterIndex)
                let widthForGroupings = 80+groupingNames.length*30
                return(
                    <div key={`clust${clusterIndex}`} >
                        <svg width={widthForGroupings+10} height={110} 
                            onMouseUp={e => handleClusterSelection(e,clusterIndex)} 
                            onMouseEnter={e => setMouseOverIndex(clusterIndex)} 
                            onMouseLeave={e => setMouseOverIndex()}>
                                
                            <rect x = {0} y = {0} width={widthForGroupings} height={110} fill="#efefef" />
                            <MCMinimalClusterView 
                                vs = {values[idx]} 
                                width = {widthForGroupings} 
                                height={100} 
                                clusterIndex = {clusterIndex} 
                                mouseOverText = {`${nValuesInCluster[idx]}`} 
                                mouseOverColor = {clusterColors[clusterIndex]}
                                mouseOver = {clusterIndex===mouseOverIndex}
                                groupingColorMapper = {groupingColorMapper}
                                groupingNames = {groupingNames}
                                selected = {selectedCluster}
                                colorScale = {colorScale}
                                hoverColorAndGroups = {hoverColorAndGroups}
                                />
                    
                        </svg>
                    </div>
                )
            })}
        </div>
    )
}



MCClusterOverview.defaultProps = {
    clusterIndexValues : [0,1,2,3,4],
    values : [[-1,2,3,4],[2,2,3,4,1,-3,-3,4,5,2],[1,2,1,-1],[1,2,1,-1],[1,2,1,-1]],
    nValuesInCluster : [3,400,5,6,6],
    clusterColors : ["red","green","blue","yellow","orange"]
}