import { useState } from 'react';
import { Text } from '@visx/text';
import { localPoint } from '@visx/event';
import { scaleLinear } from '@visx/scale';

export function MCRelativeBar(props) {

    const {x, y, width, height, values, labelValues, title, featureNames, minValue, maxValue} = props

    const [mousePoint,changeMousePoint] = useState(undefined)
    const marginLeft = 5
    const marginTop = 20
    const marginRight = 50
    const marginBottom = 15
    const marginBetweenBars = 5
    const heightPerBar = (height -  marginBetweenBars * (values.length-1) - marginTop -  marginBottom)/values.length
    const rangeMin =  x + marginLeft
    const rangeMax = (x + width)  - marginRight - marginLeft
    const scaleX = scaleLinear({
        domain : [minValue,maxValue],
        range : [rangeMin, rangeMax]
    })
    const labelText = mousePoint !== undefined && mousePoint.x < rangeMax && mousePoint.x > rangeMin? scaleX.invert(mousePoint.x): undefined
    
    return (
        <g
            onMouseMove={e => changeMousePoint(localPoint(props.svgRef.current,e))} 
            onMouseLeave={e => changeMousePoint(undefined)}>
            {values.map(function(p,i){
                const barStart = heightPerBar*i +  marginBetweenBars*i + marginTop + y
                return( 
                    <rect 
                    key={`background-${i}`}
                    x = {scaleX(minValue)} 
                    y={barStart} 
                    height={heightPerBar} 
                    width = {scaleX(maxValue)-scaleX(minValue)} 
                    fill={"#efefef"}/>)
                })}
           


            <Text x = {x} y={y} verticalAnchor="start" textAnchor ="start" width = {width}>{title}</Text>
            {labelText!==undefined?
                <g>
                    <line x1={mousePoint.x} x2={mousePoint.x} y1 = {marginTop+y} y2 = {y+height-marginBottom} stroke="black" strokeWidth={0.5}/>
                    <Text 
                        x={mousePoint.x} 
                        y = {y+height-marginBottom+2} 
                        textAnchor={mousePoint.x < x+ (rangeMax-rangeMin)/2 ? "start" : "end"} 
                        verticalAnchor={"start"}>
                            {Math.round(labelText)}
                    </Text> 
                </g>
                    :null}
            {values.map(function(p,i){

                const barStart = heightPerBar*i +  marginBetweenBars*i + marginTop + y
                const barWidth = (width-marginLeft- marginRight) * p 
                const barMiddleY = heightPerBar/2 + heightPerBar*i +  marginBetweenBars*i + marginTop + y
                const backgroundBarEnd = x + width - marginRight
                const totalBarWidth = width - marginRight - marginLeft
                const valueTextAnchor =  barWidth < 0.65* totalBarWidth ? "start" : "end"
                const valueTextFill =  valueTextAnchor === "start"? "black" : "white"
                return(
                    <g key={`${i}`}>

                        <rect 
                            x = {x + marginLeft} 
                            y={barStart} 
                            height={heightPerBar} 
                            width = {barWidth} 
                            fill={"#477eb0"}/>
                        
                        <Text 
                            x = {x + marginLeft  + barWidth} 
                            y={barMiddleY} 
                            verticalAnchor="middle"
                            textAnchor = {valueTextAnchor}
                            fill = {valueTextFill}>

                                {labelValues[i]}
                            
                        </Text>

                        <Text 
                            x = {backgroundBarEnd} 
                            y={barMiddleY} 
                            verticalAnchor="middle">
                                
                                {featureNames[i]}
                        </Text>
                    </g>
                )
            })}
            
        </g>
    )
}