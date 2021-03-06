
import { useState } from "react";
import _ from "lodash";
import { scaleLinear, scaleBand } from "@visx/scale";
import { Text } from "@visx/text";




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

   
    const minXValue = xscale(-0.5)
    const midPoint = 0+margin.left+(width-margin.right)/2
    const barWidth = xscale.bandwidth()

    const yscale = scaleLinear(        {
                domain : [maxValue, -maxValue],
                range : [0+margin.top,height-margin.bottom-groupingNames.length*barWidth]
            })
        
    const minYValue = yscale(-maxValue)

    return (
        <g>
            
            <rect x = {0} y = {0} width={width} height={height} fill="#f2f2f2"/>
            <rect x = {midPoint-40} y = {2} width={80} height={10} fill={selected?mouseOverColor:"transparent"}/>
            <Text x = {midPoint} y = {4} fontWeight={selected?500:350} textAnchor={"middle"} verticalAnchor={"start"} fontSize={9}>{`Cluster ${clusterIndex} `}</Text>
            <Text x = {width-margin.right} y = {0} verticalAnchor="start" textAnchor="end" fontSize={10}>{`${mouseOverText}`}</Text>
            <line x1 = {0+margin.left} x2={width-margin.right} y1={yscale(0)} y2={yscale(0)} stroke="black" strokeWidth={selected?0.75:0.25}/>
            <line x1 = {0+margin.left} x2={0+margin.left} y1={minYValue} y2={yscale(maxValue)} stroke="black" strokeWidth={selected?0.75:0.25}/>
            {vs.map((p,i) => {
                const barX = xscale(i);
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

                    {mouseOver || selected?groupingNames.map((groupingName,ii) => {
                        let n = hoverColorAndGroups[i][0][ii]
                        let hexColor = hoverColorAndGroups[i][1][ii]
                        let labelOnRightSide = barX / width < 0.55
                        let xtext = labelOnRightSide?barX + barWidth+5:barX-5
                        let widthtext = labelOnRightSide? width - xtext - margin.right : xtext 
                        
                            return(
                                <g key = {`${ii} - legen bars label`}>
                                <rect x = {barX} y = {yscale(-maxValue)+5 + barWidth * ii} width={barWidth} height={barWidth*0.85} fill={hexColor} stroke="black" strokeWidth={0.5} 
                                opacity={mouseOverBarIndex===undefined?1:mouseOverBarIndex===i?1:0.2}/>
                                {mouseOverBarIndex!==undefined&&mouseOverBarIndex===i?
                                    <Text 
                                                x = {xtext} 
                                                y = {yscale(-maxValue)+5 + barWidth * ii + barWidth/2} 
                                                textAnchor={labelOnRightSide?"start":"end"}
                                                verticalAnchor="middle" 
                                                fontSize={10}
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
                
            {/* <polyline points = {`${vs.map((p,i) => ' ' + xscale(i) + ',' + yscale(p))}`} 
                                fill={"transparent"} 
                                stroke={mouseOver || selected?mouseOverColor:"black"} 
                                strokeWidth={mouseOver || selected?2:0.9}/> */}
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
            
            groupingNames,
            colorPalette,colorPaletteValues,hoverColorAndGroups} = props

    const [mouseOverIndex, setMouseOverIndex] = useState()
    const [selectedIndex, setSelectedIndex] = useState([])
    
    const colorScale = scaleLinear({
        range:colorPalette,
        domain:colorPaletteValues
    })

    const handleClusterSelection = (e,clusterIndex) => {
        if (e.shiftKey){
            if (selectedIndex.includes(clusterIndex)){
                setSelectedIndex(_.difference(selectedIndex,[clusterIndex]))
                handleClusterIndexSelection(_.difference(selectedIndex,[clusterIndex]))
            }
            else {
                setSelectedIndex(_.concat(selectedIndex,[clusterIndex]))
                handleClusterIndexSelection(_.concat(selectedIndex,[clusterIndex]))
            }
        }
        else {
            setSelectedIndex([clusterIndex])
            handleClusterIndexSelection([clusterIndex])
        }

        
        
    }
    return (

        <div style={{flexDirection:"row",flexWrap:"wrap",display:"flex",minWidth:"200px",maxWidth:"400px",height:"800px",overflowY:"scroll"}}>
            {clusterIndexValues.map((clusterIndex, idx) => {
                const selectedCluster = selectedIndex.includes(clusterIndex)
                return(
                    <div key={`clust${clusterIndex}`} style={{width:"200px"}}>
                        <svg width={180} height={110} onMouseUp={e => handleClusterSelection(e,clusterIndex)} onMouseEnter={e => setMouseOverIndex(clusterIndex)} onMouseLeave={e => setMouseOverIndex()}>
                            <rect x = {0} y = {0} width={180} height={110} fill="#efefef" />
                            <MCMinimalClusterView 
                                vs = {values[idx]} 
                                width = {170} 
                                height={100} 
                                clusterIndex = {clusterIndex} 
                                mouseOverText = {`n=${nValuesInCluster[idx]}`} 
                                mouseOverColor = {clusterColors[clusterIndex]}
                                mouseOver = {clusterIndex===mouseOverIndex}
                                groupingColorMapper = {groupingColorMapper}
                                groupingNames = {groupingNames}
                                selected = {selectedCluster}
                                colorScale = {colorScale}
                                hoverColorAndGroups = {hoverColorAndGroups}
                                />
                    
                    
                    
                    {/* {groupingNames.map((groupingName,groupingIndex) => {
                        return(

                            <g key={`${groupingName}-groupHeader`}>
                            
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
                                            strokeWidth={0.1}/>
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
                        

                    })} */}
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