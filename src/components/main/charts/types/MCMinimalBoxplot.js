
import { useState } from 'react';
import { localPoint } from '@visx/event';
import { Text } from '@visx/text';
import { scaleLinear } from '@visx/scale';
import { getLuma } from '../../../utils/Misc';
import _ from 'lodash';


const legendTextProps = {textAnchor:"start",
        verticalAnchor:"middle",
        fontSize:10,
        fill:"#262626",
        scaleToFit : "shrink-only"
}

export function drawVertBoxplot(min,q25,m,q75,max,boxHeight,middlePointY,boxPlotStartY,fillColor="red"){
    return(
        <g>
            <rect 
                x = {q25} 
                y={boxPlotStartY} 
                height={boxHeight} 
                width = {q75-q25} 
                fill={fillColor}
                strokeWidth={0.5}
                stroke={"black"}/>
            <line 
                y1={middlePointY} 
                y2 = {middlePointY} 
                x1={min} 
                x2 = {q25} strokeWidth={0.75} stroke="black"/>

            <line 
                y1={middlePointY} 
                y2 = {middlePointY}
                x1={max} 
                x2 = {q75} 
                strokeWidth={0.75} 
                stroke="black"/>
            <line 
                y1={middlePointY-boxHeight/3} 
                y2 = {middlePointY+boxHeight/3}
                x1={max} 
                x2 = {max} 
                strokeWidth={0.75} 
                stroke="black"/>
            <line 
                y1={middlePointY-boxHeight/3} 
                y2 = {middlePointY+boxHeight/3}
                x1={min} 
                x2 = {min} 
                strokeWidth={0.75} 
                stroke="black"/>
               
            <line 
                y1={boxPlotStartY} 
                y2 = {boxPlotStartY+boxHeight} 
                x1={m} 
                x2 = {m} strokeWidth={1} stroke="black"/> 
        </g>
    )
}


export function drawHorizontalBoxplot(min,q25,m,q75,max,boxWidth,middlePointX,boxPlotStartX,fillColor="red"){
    return(
        <g>
            <rect 
                x = {boxPlotStartX} 
                y={q75} 
                height={q25-q75} 
                width = {boxWidth} 
                fill={fillColor}
                strokeWidth={0.5}
                stroke={"black"}/>
            <line 
                y1={min} 
                y2 = {q25} 
                x1={middlePointX} 
                x2 = {middlePointX} strokeWidth={1} stroke="black"/>

            <line 
                y1={q75} 
                y2 = {max}
                x1={middlePointX} 
                x2 = {middlePointX} 
                strokeWidth={0.75} 
                stroke="black"/>
            <line 
                y1={max} 
                y2 = {max}
                x1={middlePointX-boxWidth/4} 
                x2 = {middlePointX+boxWidth/4} 
                strokeWidth={0.75} 
                stroke="black"/>
            <line 
                y1={min} 
                y2 = {min}
                x1={middlePointX-boxWidth/4} 
                x2 = {middlePointX+boxWidth/4} 
                strokeWidth={0.75} 
                stroke="black"/>
            <line 
                y1={m} 
                y2 = {m} 
                x1={boxPlotStartX} 
                x2 = {boxPlotStartX+boxWidth} strokeWidth={1} stroke="black"/> 
        </g>
    )
}
export function MCMinimalBoxplot(props) {
    const [mousePoint,changeMousePoint] = useState(undefined)
    const [highlightColor, changeHighlightColor] = useState(undefined)
    const [highlightDetails, setHighlightDetails] = useState(undefined)
    const {x,y,width,height,minValue,maxValue,values, featureNames, title, legend, legendTitle, vertical, highlightPoint} = props
   
    const legendItems = _.isObject(legend) ? Object.keys(legend) : []
    const marginForLegend = legendItems.length > 0?20:0
    const marginLeft = 5
    const marginRight =  props.vertical?30:50 
    const marginTop = 20 + marginForLegend
    const marginBottom = 15
    const marginBetweenBox = 5

    const heightPerBoxplot = (height-marginTop - marginBottom - marginBetweenBox * (values.length-1)) / values.length
    const widthPerBoxplot = (width-marginLeft - marginRight - marginBetweenBox * (values.length-1)) / values.length
    const rangeMin = props.vertical? y + marginTop : x + marginLeft 
    const rangeMax = props.vertical? (y+height) - marginBottom : (x + width) - marginLeft - marginRight
    const scaleX = scaleLinear({
        domain : [maxValue,minValue],
        range : vertical?[rangeMin, rangeMax]:[rangeMax,rangeMin],
    })
    
    const widthPerLegendItem = (width-marginLeft-marginRight) / legendItems.length
    const legendBoxWidth = 15
    const legendY = y+15
  
    const marginBetweenBoxAndLabel = 3

    const validMousePoint = (mousePoint) => {
        if (mousePoint === undefined) return false

        if (vertical && mousePoint.y > rangeMin && mousePoint.y < rangeMax) return true

        if (!vertical && mousePoint.x < rangeMax && mousePoint.x > rangeMin) return true

        return false
    }

    const checkHighLightDetails = (i,ii,middleY) => {

        if (highlightDetails === undefined){
            setHighlightDetails([i,ii,middleY])
        }
        else if (highlightDetails[0] !== i) {
            setHighlightDetails([i,ii,middleY])
        }
        else if (highlightDetails[1] !== ii) {
            setHighlightDetails([i,ii,middleY])
        }

    }
    
    const labelText = validMousePoint(mousePoint)? scaleX.invert(vertical?mousePoint.y:mousePoint.x): undefined
    const mouseOverBoxplotDetails = highlightDetails!==undefined && highlightDetails.length === 3?
                [
                    featureNames[highlightDetails[0]],
                    legendItems[highlightDetails[1]],
                    `m=${Math.round(values[highlightDetails[0]][highlightDetails[1]].m*100)/100}`,
                    `n=${values[highlightDetails[0]][highlightDetails[1]].n}`
                ].filter((v) => v!=="")
                    :
                    undefined
                 //highlightDetails[0] === i && highlightDetails[1] === ii
    
    
   
    const valueRange = maxValue-minValue
    const hoverBoxUp = highlightDetails!==undefined? values[highlightDetails[0]][highlightDetails[1]].max < maxValue - valueRange*0.4 :undefined
    
    const mouseOverY = 
        highlightDetails!==undefined?
            hoverBoxUp?scaleX(values[highlightDetails[0]][highlightDetails[1]].q75)-12*mouseOverBoxplotDetails.length-10:
                scaleX(values[highlightDetails[0]][highlightDetails[1]].q25) + 10:
                    undefined
        
    //      values[highlightDetails[0]][highlightDetails[1]].min:values[highlightDetails[0]][highlightDetails[1]].max:undefined
    
    // scaleX(mouseOverY)-12*mouseOverBoxplotDetails.length-6-4
    

    return (

        <g 
            onMouseMove={e => changeMousePoint(localPoint(props.svgRef.current,e))} 
            onMouseLeave={e => changeMousePoint(undefined)}>
            
            {/* plot legend */}
            {
            marginForLegend > 0 && _.isObject(legend) && Object.keys(legend).length < 20?
                <g> 
                    <Text 
                        x = {x+marginLeft} 
                        y={y+1} 
                        textAnchor={"start"} 
                        verticalAnchor={"start"}
                        fontSize = {11}
                        fill = "#262626"
                        scaleToFit = "shrink-only"
                        >
                            {legendTitle}
                    </Text>
                    {Object.keys(legend).map((k,i) => {
                       
                        const legendItemStart = x+marginLeft + widthPerLegendItem * i 
                        return(
                            <g key = {`${i}-legend-item`}>
                            <rect x = {legendItemStart} 
                                y = {legendY} width={legendBoxWidth} height={12} fill={legend[k]} 
                                strokeWidth={0.5} stroke='black' 
                                onMouseEnter={e => changeHighlightColor(legend[k])}
                                onMouseLeave={e => changeHighlightColor(undefined)}/>

                            <Text
                                
                                x = {legendItemStart + legendBoxWidth + marginBetweenBoxAndLabel}
                                y = {legendY+6}
                                width = {widthPerLegendItem-legendBoxWidth-marginBetweenBoxAndLabel-2}
                                {...legendTextProps}
                                >
                                {k}
                            </Text>
                            </g>
                        )
                    })}

                </g>
            :
                        <g>
                        <Text 
                        x = {x+marginLeft} 
                        y={y+1} 
                        textAnchor={"start"} 
                        verticalAnchor={"start"}
                        fontSize = {11}
                        fill = "#262626"
                        scaleToFit = "shrink-only"
                        >
                            {legendTitle}
                        </Text>
                        <Text 
                            x = {x+marginLeft} 
                            y={legendY+6} 
                            textAnchor={"start"} 
                            verticalAnchor={"start"}
                            fontSize = {11}
                            fill = "#262626"
                            scaleToFit = "shrink-only"
                            >
                                {"To many legend items. Please use tooltip to identify groups."}
                        </Text>
                        </g>
            }
        
            <g>
                <Text x = {x} y={y} verticalAnchor="start" textAnchor ="start">{title}</Text>
            </g>
            {values.map((v,i) => {
                return(
                    props.vertical?
                    <rect key={`${i}-boxplot-background`}
                        x = {x + marginLeft + widthPerBoxplot * i + marginBetweenBox * i} 
                        y={y + marginTop} 
                        height={height-marginBottom-marginTop} 
                        width = {widthPerBoxplot} 
                        fill={props.backgroundColor}
                    />:
                <rect key={`${i}-boxplot-background`}
                    x = {scaleX(minValue)} 
                    y={y+marginTop + heightPerBoxplot * i + marginBetweenBox * i} 
                    height={heightPerBoxplot} 
                    width = {scaleX(maxValue)-scaleX(minValue)} 
                    fill={props.backgroundColor}
                />
                )
                
            })}
            {labelText!==undefined?<g>
                        <Text 
                        x = {x+width-marginRight-2}
                        y = {y+marginTop+2}
                        textAnchor={"end"}
                        verticalAnchor={"start"}
                        fontSize = {8}
                        >
                            {Math.round(maxValue*10)/10}

                        </Text>
                        <Text 
                        x = {x+width-marginRight-2}
                        y = {y+height-marginBottom-2}
                        textAnchor={"end"}
                        verticalAnchor={"end"}
                        fontSize = {8}
                        >
                            {Math.round(minValue*10)/10}

                        </Text>
                        </g>:null}

            {labelText!==undefined?
            props.vertical?
                <g>
                    <line 
                        x1={marginLeft+x} 
                        x2={x+(width-marginRight)} 
                        y1 = {mousePoint.y+1} 
                        y2 = {mousePoint.y+1} stroke="black" strokeWidth={0.5}/>
                    <Text 
                        x={x+width-marginRight} 
                        y = {mousePoint.y} 
                        textAnchor={"start"} 
                        verticalAnchor={"middle"}>
                            {Number((labelText).toFixed(1))}
                    </Text> 
                </g>:
            
                <g>
                    <line 
                        x1={mousePoint.x+1} 
                        x2={mousePoint.x+1} 
                        y1 = {y+marginTop} 
                        y2 = {y+height-marginBottom} stroke="black" strokeWidth={0.5}/>
                    <Text 
                        x={mousePoint.x} 
                        y = {y+height-marginBottom+2} 
                        textAnchor={mousePoint.x < x + (rangeMax-rangeMin)/2 ? "start" : "end"} 
                        verticalAnchor={"start"}>
                            {Number((labelText).toFixed(1))}
                    </Text> 
                </g>
                    :null}
            

            {featureNames.length > 0?
                values.map((v,i) => {
                    const boxPlotStart = vertical? x+marginLeft + widthPerBoxplot*i + marginBetweenBox*i : y+marginTop + heightPerBoxplot * i + marginBetweenBox * i
                    const middlePoint = boxPlotStart + widthPerBoxplot/2
                    return(
                        <Text
                            key = {`${i}-box-label`}
                                x={vertical?middlePoint:rangeMax}
                                y = {vertical?y+height-marginBottom+3:middlePoint} 
                                fill = {legendTextProps.fill}
                                textAnchor={vertical? "middle":"start"}
                                verticalAnchor={vertical?"start":"middle"}>
                                    {featureNames[i]}
                        </Text>
                    )
                }
                )
                :null }        

            
            {
                values.map((v,i) => {
                    
                    const boxPlotStart = vertical? x+marginLeft + widthPerBoxplot*i + marginBetweenBox*i : y+marginTop + heightPerBoxplot * i + marginBetweenBox * i
                    if (Array.isArray(v)){
                        const sizePerCatBoxplot = 0.90 * (vertical?widthPerBoxplot:heightPerBoxplot) / v.length
                        
                        return(
                            
                            v.map((vi,ii) => {
                                const {min,q25,m,q75,max,fillColor} = vi
                                const boxPlotStartCatBoxplot =  boxPlotStart + ii * sizePerCatBoxplot + heightPerBoxplot * 0.05
                                const middlePointY = boxPlotStartCatBoxplot + sizePerCatBoxplot/2
                                if (min === null)return <g key = {`${ii}boxplot`}></g>
                                return(
                                    <g key = {`${ii}boxplot`} 
                                        onMouseLeave = {e => setHighlightDetails(undefined)} 
                                        onMouseEnter = {props.hoverboxOff?null:e => checkHighLightDetails(i,ii,middlePointY)}> 
                                    {props.vertical?
                                        drawHorizontalBoxplot(
                                            scaleX(min),
                                            scaleX(q25),
                                            scaleX(m),
                                            scaleX(q75),
                                            scaleX(max),
                                            sizePerCatBoxplot,
                                            middlePointY,
                                            boxPlotStartCatBoxplot,
                                            highlightColor===undefined?fillColor:highlightColor===fillColor?fillColor:"#efefef"):
                                            drawVertBoxplot(scaleX(min),scaleX(q25),scaleX(m),scaleX(q75),scaleX(max),heightPerBoxplot,middlePointY,boxPlotStart,fillColor)}

                                    </g>
                                )
                            }) 
                        )
                       


                    }
                    else {
                        const {min,q25,m,q75,max,fillColor} = v
                        const middlePointY = boxPlotStart + heightPerBoxplot/2
                        if (min === null)return <g key={`${i}boxplot`}></g>
                        return (
                            <g key={`${i}boxplot`}>
                                {drawVertBoxplot(scaleX(min),scaleX(q25),scaleX(m),scaleX(q75),scaleX(max),heightPerBoxplot,middlePointY,boxPlotStart,fillColor)}
                            </g>)
                        }
                        }
                    )
            }


            {highlightDetails!==undefined&&mouseOverBoxplotDetails!==undefined?
                                        
                <rect 
                    x={highlightDetails[2]-4} 
                    y = {mouseOverY} 
                    width={60+8} 
                    height={12*mouseOverBoxplotDetails.length+8} 
                    opacity={1} 
                    fill={"#e8e8e8"}/>
                    
                :null
            }

            {
                    
                    highlightDetails!==undefined&&mouseOverBoxplotDetails!==undefined?
                        
                        mouseOverBoxplotDetails.map((t,i)=>{
                            const isColorLegendItem = legendItems.includes(t)
                            var rgbColor = isColorLegendItem?legend[t]:legendTextProps.fill
                            if (getLuma(rgbColor) > 180){
                                rgbColor = "black"
                            }
                            return(
                                
                                <Text 
                                    key={t} 
                                    x = {highlightDetails[2]} 
                                    y ={mouseOverY+(12*i)+4} 
                                    verticalAnchor="start" 
                                    textAnchor="start"
                                    fontSize={12}
                                    fontWeight={isColorLegendItem  ||  i === 0?700:250}
                                    fill = {rgbColor }
                                    width = {35}
                                    scaleToFit={"shrink-only"}>
                                        {t}
                                </Text>
                                                                            )
                    })
                        
                    :null
                        }


            {
            highlightPoint!==undefined&&Array.isArray(highlightPoint)?highlightPoint.map((hv,i) => {
                // const middlePointY = boxPlotStartCatBoxplot + sizePerCatBoxplot/2
                const boxPlotStart = vertical? x+marginLeft + widthPerBoxplot*i + marginBetweenBox*i : y+marginTop + heightPerBoxplot * i + marginBetweenBox * i
                const sizePerCatBoxplot = 0.90 * (vertical?widthPerBoxplot:heightPerBoxplot) / hv.length
                return(
                hv.map((vv,ii) => {
                    const boxPlotStartCatBoxplot =  boxPlotStart + ii * sizePerCatBoxplot + heightPerBoxplot * 0.05
                    const middlePointY = boxPlotStartCatBoxplot + sizePerCatBoxplot/2
                    return(
                        <g key = {`highPoint-${i}-${ii}`}>
                            <circle cx={scaleX(vv)} cy = {middlePointY} fill="red" r={7} stroke="black" strokeWidth={0.5}/>
                        </g>
                )}))}):null}
           
                
        </g>
    )
               
}

MCMinimalBoxplot.defaultProps = {
    backgroundColor : "#f5f5f5",
    x : 0,
    y : 0,
    vertical : true,
    hoverboxOff : false,
}