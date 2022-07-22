import { Axis, AxisRight } from "@visx/axis"
import { scaleLinear, scaleOrdinal, scaleTime } from "@visx/scale"
import { useMemo, useState } from "react"
import _ from "lodash"
import { motion } from "framer-motion"
import { Text } from "@visx/text"



const domain = [new Date("2022-06-04"),new Date("2023-12-04")]

export function MCPerformanceChart(props) {

    const {width, height, margin, points, highlightItem, itemColors, quantileData } = props
    
    const lineItems = Object.keys(points)
    const highlightItemExists = lineItems.includes(highlightItem)
    console.log(itemColors)
    const dateScale = useMemo(
        () => {
            
            return scaleTime({
                range : [margin.left, width-margin.right-margin.left],
                domain: domain,
                nice : true
            })
        },
        [ width, margin.left, margin.right]
    )

    const yScale = useMemo(
        () => {

            return scaleLinear({
                range : [margin.top, height-margin.bottom-margin.top],
                domain: [1,0],
                nice : true
            })
        },
        [ height,margin.top, margin.bottom]
    )


    const colorScale = useMemo(
        () => {
            return scaleOrdinal({
                range : lineItems.map(lineItem => !(lineItem in itemColors)===undefined?"darkgrey":highlightItem===undefined?itemColors[lineItem]:lineItem===highlightItem?itemColors[lineItem]:"#efefef"),
                domain: lineItems,
            })
        },
        [ lineItems, highlightItem, itemColors]
    )


    return(
        <div>
            <div className="hor-aligned-div">
            {
                lineItems.map(lineItem => {
                    const svgWidth = 105
                    const itemColor = colorScale(lineItem)
                    return(
                            <div >
                                <motion.svg width={svgWidth} height={40} >
                                    <motion.g whileHover={{scale:1.1}}>
                                            <line x1 = {10} x2 = {30} y1 = {20} y2 = {20} stroke={itemColor}/>
                                            <circle cx = {20} cy = {20} r = {3} stroke="black" fill={itemColor} strokeWidth={0.1}/>
                                            <Text x = {32} y = {20} verticalAnchor="middle" cursor="default" width={svgWidth-30} >{lineItem}</Text>
                                    </motion.g>

                                </motion.svg>
                            </div>
                    )
                })
                }
            </div>
            <svg width={width} height={height}>
            <rect x ={margin.left} y = {margin.top} width={width-margin.left-margin.right-margin.left} height={height-margin.bottom-margin.top-margin.top} fill="white"/>
                {/* //x-axis */}
                <Axis scale={dateScale} top = {height-margin.bottom-margin.top} orientation="bottom" label="Time"  numTicks={5}/>
                {/* //y-axis */}
                <Axis scale = {yScale} left = {margin.left} orientation="left" label = "Metric" numTicks={3}/>
            
                <AxisRight  scale={yScale} left={width-margin.right-margin.left}/>
            {lineItems.map(lineItem => {
                
                const pps = points[lineItem].map(vv => [dateScale(new Date(vv.x)),yScale(vv.y)])
                
                const lineCircleColor = colorScale(lineItem)
                return(
                    <g>

                    {lineItem===highlightItem && lineItem in quantileData?
                        <motion.g>
                            <motion.rect 
                                    x = {margin.left+5} 
                                    width = {width-margin.left*2-margin.right-10} 
                                    initial={{ 
                                            height:      0, 
                                            y :  yScale(quantileData[lineItem].q50)
                                        }}
                                    animate={{ 
                                                height :     yScale(quantileData[lineItem].q25)-yScale(quantileData[lineItem].q75),
                                                y :          yScale(quantileData[lineItem].q75)
                                            }}
                                    fill="#efefef"
                                    transition={{
                                        type: "spring",
                                        stiffness: 260,
                                        damping: 20,
                                        default: { duration: 1 },
                                    }}/>
                            <motion.line 
                                    x1 = {margin.left+5} 
                                    
                                    y1 = {yScale(quantileData[lineItem].q50)} 
                                    y2 = {yScale(quantileData[lineItem].q50)} 
                                    initial={{ x2:      margin.left+5 }}
                                    animate={{ x2 :     width-margin.left-margin.right-10 }}
                                    
                                    transition={{
                                        type: "spring",
                                        stiffness: 260,
                                        damping: 20,
                                        default: { duration: 1 },
                                   
                                    }}
                                    stroke="black"/>
                        </motion.g>
                        :
                        null}

                    <polyline key = {lineItem} points = {_.join(pps.map(vv => `${vv[0]},${vv[1]}`)," ")} stroke={lineCircleColor} strokeWidth={1} fill="transparent"/>
                    {pps.map((vv,ii) =>
                       {
                        return(
                            <circle key = {`${ii}`}
                                cx = {vv[0]}
                                cy = {vv[1]}
                                r = {4}
                                stroke="black"
                                strokeWidth={0.5}
                                fill = {lineCircleColor}
                                />    
                         ) 
                        })}
                    </g>
                
                    
                )
            })}

            </svg>



        </div>
    )
}


MCPerformanceChart.defaultProps = {
    width : 800,
    height : 200,
    highlightItem : undefined,
    quantileData : {
            "Peptides" : {q25 : 0.2, q50 : 0.3, q75 : 0.7}
    },
    points : {
        "Peptides" : [{x:"2022-06-03",y:0.5},{x:"2022-07-03",y:0.6},{x:"2022-08-03",y:0.6}],
        "MS/MS Identification" : [{x:"2022-06-03",y:0.8},{x:"2022-07-03",y:0.3}]
    },
    itemColors : {"Peptides":"#d8976b","MS/MS Identification":"#7a6b9e"},
    margin : {
        left : 40,
        top: 15,
        right : 20,
        bottom : 40
    }

}