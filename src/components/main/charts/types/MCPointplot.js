
import { useState} from 'react';
import { localPoint } from '@visx/event';
import { Text } from '@visx/text';
import { scaleLinear } from '@visx/scale';

export function MinimalPointplot(props) {
    const [mousePoint,changeMousePoint] = useState(undefined)
    const {x,y,xLimits, yLimits, xLabel,yLabel, values, title, width, height} = props
   
  
    const margin = {left:5,top:20,bottom:20,right:50}
    const chartWidth = width - margin.left - margin.right
    const chartHeigth = height - margin.bottom - margin.top
    const marginForTicksAndLabels = 0

    const rangeXMin =  x + margin.left
    const rangeXMax = (x + width)  - margin.right - margin.left

    const scaleX = scaleLinear({
        domain : xLimits,
        range : [rangeXMin+marginForTicksAndLabels, rangeXMax-marginForTicksAndLabels]
    })

    const scaleY = scaleLinear({
        domain : yLimits,
        range : [y+margin.top+marginForTicksAndLabels, y+height-margin.bottom-marginForTicksAndLabels]
    })

    
    
    return (
       
        <g
            >

            <Text 
                x = {rangeXMin} 
                y={y+margin.top-5} 
                textAnchor={"start"} 
                verticalAnchor={"end"}
                >
                    {title}
            </Text>
            <g
            onMouseLeave={e => changeMousePoint(undefined)}
            onMouseMove={(e) => changeMousePoint(localPoint(props.svgRef.current,e))}>
            
            <rect 
                x = {rangeXMin} 
                y = {y+margin.top} 
                width = {chartWidth} 
                height = {chartHeigth} 
                fill={"#FFFFFF"}
            
            />
            
            <line x1 = {scaleX(xLimits[0])-5} x2 = {scaleX(xLimits[1])} y1 = {scaleY(yLimits[1])} y2 = {scaleY(yLimits[1])} stroke={"black"} strokeWidth={0.5}/>
            <line x1 = {scaleX(xLimits[0])} x2 = {scaleX(xLimits[0])} y1 = {scaleY(yLimits[1])+5} y2 = {scaleY(yLimits[0])} stroke={"black"} strokeWidth={0.5}/>
            
            
                {
                values.map((vv,ii) => {
                    return(
                        <g key = {ii}>
                        <polyline 
                            points = {`${vv.map((p) => ' ' + scaleX(p[0]) + ',' + scaleY(p[1]))}`} 
                            fill={"transparent"} 
                            stroke={"black"} 
                            strokeWidth={0.5}/>
            
                        {vv.map((p,i)=>{
                            return (
                                <circle 
                                    key = {`${i}-circle`}
                                    cx={scaleX(p[0])} 
                                    cy={scaleY(p[1])} 
                                    r = {5} 
                                    fill = {props.colors[ii]}
                                    stroke={"black"} 
                                    strokeWidth={0.5}/>
                            )})}
                        </g>)
                    })}
                </g>


            {/* Axis labels*/}
            <Text 
                x = {margin.left + chartWidth/2}//{scaleX((xLimits[1]-xLimits[0])/2)}
                y= {scaleY(yLimits[1])+4} 
                textAnchor="middle" 
                verticalAnchor="start">{xLabel}</Text>
            <Text 
                x = {scaleX(xLimits[0])-5}
                y= {margin.top + chartHeigth/2} 
                angle = {-90}
                textAnchor="middle" 
                verticalAnchor="end">{yLabel}</Text>
        
        {/* Handle Mouse Point Changes */}
        {mousePoint!==undefined&&scaleX(mousePoint.x)>xLimits[0]?
            <g>
                <line x1 = {mousePoint.x} x2 = {mousePoint.x} y1 = {scaleY(yLimits[1])} y2 = {mousePoint.y+10} stroke={"black"} strokeWidth={0.5}/>
                <line x1 = {mousePoint.x-5} x2 = {scaleX(xLimits[0])} y1 = {mousePoint.y} y2 = {mousePoint.y} stroke={"black"} strokeWidth={0.5}/>
                <Text
                    x = {mousePoint.x < width/2?mousePoint.x+5:mousePoint.x-5}
                    y= {scaleY(yLimits[1])-5} 
                    textAnchor={mousePoint.x < x + width/2?"start":"end"} 
                    verticalAnchor="end">
                        {Math.round(scaleX.invert(mousePoint.x))}
                </Text>

                <Text
                    x = {scaleX(xLimits[0])+2}
                    y= {mousePoint.y<y + height/2?mousePoint.y+5:mousePoint.y-5} 
                    textAnchor={"start"} 
                    verticalAnchor={mousePoint.y<y + height/2?"start":"end"}>
                        {Number((scaleY.invert(mousePoint.y)).toFixed(2))}
                    </Text>
            </g>:null}
       </g>
    )
}

MinimalPointplot.defaultProps = {
    xLimits : [-5,27],
    yLimits : [1,-0.05],
    xLabel : "Time (days)",
    yLabel : "Incorporation rate",
    values : [
        [[0,0],[7,0.1],[11,0.4],[14,0.6],[21,0.8],[26,0.82]],
        [[0,0],[7,0.15],[11,0.7],[14,0.8],[21,0.9],[26,0.89]]
    ],
    title:"Ndufa1",
    colors : ["red","#477eb0"]
}