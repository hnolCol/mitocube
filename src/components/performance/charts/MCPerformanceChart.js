import { Axis, AxisLeft } from "@visx/axis"
import { scaleLinear, scaleOrdinal, scaleTime } from "@visx/scale"
import { useEffect, useMemo, useState } from "react"
import _ from "lodash"
import { motion } from "framer-motion"
import { Text } from "@visx/text"

import { computeMovingAverage, getDomainFromArray, quantile } from "../../utils/Misc"
import {format} from "d3-format"
import { sortDates } from "../../utils/Misc"
import { localPoint } from "@visx/event"

const scientificNotation = format(".1e")

function subtractMonth(numOfMonth, date = new Date()) {
    date.setMonth(date.getMonth() - numOfMonth);
    return date;
  }
  
function findDateRange(array, kw, addMargin = true) {

    let dates = array.map(v => v[kw].getTime())

    let minDate = _.min(dates)
    let maxDate = _.max(dates) 
    if (!addMargin) return [new Date().setTime(minDate), new Date().setTime(maxDate)]
    
    let marginDate = Math.sqrt(Math.pow(maxDate,2) - Math.pow(minDate,2)) * 0.01
    return ([
            new Date().setTime(minDate-marginDate), 
            new Date().setTime(maxDate+marginDate)
        ])
}   

function findYTDStart(date = new Date()) {

    date.setMonth(0)
    date.setDate(0)
    date.setHours(0)
    return date

}

const qsToShow  = [0.25,0.5,0.75]
const qsKws = ["q25","q50","q75"]

//const domain = [new Date("2020-06-04"),new Date("2023-12-04")]

export function MCPerformanceChart(props) {

    const {width, height, 
            margin, points, 
            highlightItem, 
            itemColors,
            circleRadius, 
            timeFrame, 
            movingAvgPeriod, 
            mouseCoords, 
            setMouseCoords, 
            selectedRun, 
            setSelectedRun} = props
    

    const [domains, setDomains] = useState({
                    y:[2000,7000], 
                    x: [],pointsInRange : {}, 
                    movingAverage : {},
                    quantileData : {}})
    
    const lineItems = Object.keys(points)
    const graphWidth = width-margin.left-margin.right-margin.left
    const graphHeight = height-margin.bottom-margin.top

    useEffect(() => 
        // ugly dependcy to items in the Combobox.
            {
            let pointHeader = Object.keys(points)
            if (pointHeader.length > 0) {
                let firstkey = pointHeader[0]
                var timeDomain = []
                var timeDomainMax = undefined 
                switch(timeFrame){
                case "Max" : 
                    timeDomain = findDateRange(points[firstkey],"x")
                    break
                case "2 Month":
                    timeDomainMax = findDateRange(points[firstkey],"x",false)
                    let maxMinusTwoMonth = subtractMonth(2,new Date(timeDomainMax[1]))
                    timeDomain = [maxMinusTwoMonth , timeDomainMax[1]]
                    break
                    
                case "3 Month" :
                    timeDomainMax = findDateRange(points[firstkey],"x",false)
                    let maxMinusThreeMonth = subtractMonth(3,new Date(timeDomainMax[1]))
                    timeDomain = [maxMinusThreeMonth , timeDomainMax[1]]
                    break

                case "1 Year" : 
                    timeDomainMax = findDateRange(points[firstkey],"x",false)
                    let maxMinusOneYear = subtractMonth(12,new Date(timeDomainMax[1]))
                    timeDomain = [maxMinusOneYear , timeDomainMax[1]]
                    break
                
               case "YTD" : 
                    timeDomainMax = findDateRange(points[firstkey],"x",false)
                    let startYTD = findYTDStart(new Date(timeDomainMax[1]))
                    timeDomain = [startYTD , new Date()]
                    break
                
                default : 
                    //default just shows the maximum range by data
                    timeDomain = findDateRange(points[firstkey],"x")
                }
                //filter points by new timeDomain
                // take points which come in object from, filter based on domain, 
                let pointsToShow = Object.fromEntries(Object.keys(points).map(mName => [mName,sortDates(points[mName].filter(v => v.x >= timeDomain[0] && v.x <= timeDomain[1]))]))
                // at the moment only a single y axis is supported, therefore get domain from flattened array
                let yData = _.flatten(_.flatten(Object.values(points)).map(vv => vv.y))
                let yDomain = getDomainFromArray(yData)

                // get quantile data
                const {qs, n} = quantile(yData,qsToShow,1.8,false)
                let quantileData = {[firstkey] : Object.fromEntries(qs.map((v,idx) => [qsKws[idx],v]))}
                let movingAverage = Object.fromEntries(Object.keys(pointsToShow).map(mName => [mName,computeMovingAverage(pointsToShow[mName].slice(), movingAvgPeriod,true)]))
                setDomains(prevValues => {return {...prevValues,
                        "x":timeDomain,
                        "pointsInRange":pointsToShow,
                        "y" : yDomain, 
                        "quantileData" : quantileData, 
                        "movingAverage" : movingAverage
                        }
                    })
            }
            }, [timeFrame,points, movingAvgPeriod])
       

    const dateScale = useMemo(
        () => {
            return scaleTime({
                range : [margin.left, width-margin.right-margin.left],
                domain: domains.x,
                nice : true
            })
        },
        [ width, margin.left, margin.right, domains.x]
    )

    const yScale = useMemo(
        () => {
            return scaleLinear({
                range : [margin.top, height-margin.bottom],
                domain: domains.y,
                nice : true
            })
        },
        [ height,margin.top, margin.bottom, domains.y]
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

    const handleMouseMovement = (e) => {
        let mouseCoord = localPoint(e)
        if ((mouseCoord.y > margin.top && mouseCoord.y < margin.top + graphHeight) && 
            (mouseCoord.x > margin.left &&  mouseCoord.x < margin.left + graphWidth)) {
                setMouseCoords(mouseCoord)
        }
        else {
            setMouseCoords({x:undefined,y:undefined})
        }
        
    }

    const isPointSelected = (run) => {
        //check if point is selected
        return selectedRun!==undefined&&
                _.isObject(selectedRun)&& 
                run.ID === selectedRun.ID
    }

    const isPointHovered = (lineItem, run) => {
        if (hoverPoints.hasOwnProperty(lineItem) 
                && _.isArray(hoverPoints[lineItem]) 
                && hoverPoints[lineItem].length > 0) {
        
            return _.filter(hoverPoints[lineItem],v => v.ID === run.ID).length > 0      
        }

        return false
    }



    const hoverPoints = useMemo(()=>{
        let pixelRange = 0.95 * circleRadius
       // const point = [dateScale.invert(mouseCoords.x),yScale.invert(mouseCoords.y)]
        //console.log(point)
        let pointAtDate = Object.fromEntries(lineItems.map(lineItem => {
            return [lineItem, 
                _.isObject(domains.pointsInRange)&&_.isArray(domains.pointsInRange[lineItem]) && _.isNumber(mouseCoords.x)?
                    domains.pointsInRange[lineItem].filter(p => 
                            _.inRange(mouseCoords.x, dateScale(p.x)-pixelRange, dateScale(p.x)+pixelRange))
                    :
                    []]
        }))

        return pointAtDate
        //setHoverData(pointAtDate)
        //console.log(pointAtDate)
    },[
        mouseCoords, 
        domains.pointsInRange, 
        dateScale, 
        lineItems, 
        circleRadius])

    //console.log(hoverData)
    return(
        graphHeight > 0 && graphWidth > 0 ? 
        <div>
            <svg width={width} height={height} onMouseMove = {handleMouseMovement}>
            <rect x ={margin.left} 
                y = {margin.top} 
                width={graphWidth} 
                height={graphHeight} 
                fill="white"/>

                {/* //x-axis */}
                <Axis scale={dateScale} 
                    top = {height-margin.bottom} 
                    orientation="bottom" 
                    label="Time"  numTicks={5}/>
                {/* //y-axis */}
                <AxisLeft 
                    scale = {yScale} 
                    left = {margin.left} 
                    label = "Metric" 
                    tickFormat={(v) => v>10000  ||  v < 1/10000 ?scientificNotation(v):v}
                    numTicks={4}/>

            {lineItems.map(lineItem => {
                if (domains.x.length !== 2) return null
                
                // filter points to be in timeFrame.dmain and transform points to pixel values
                const lastItemInQuantile = _.isObject(selectedRun)?domains.quantileData[lineItem].q25 < selectedRun[lineItem]  && domains.quantileData[lineItem].q75 > selectedRun[lineItem]:false
                
                const pps = domains.pointsInRange[lineItem].map(vv => {
                    return({
                        cx : dateScale(vv.x), 
                        cy : yScale(vv.y), 
                        selected : isPointSelected(vv), 
                        hovered : isPointHovered(lineItem,vv), 
                        run : vv}
                        )
                })

                const lineCircleColor = colorScale(lineItem)
                
                return(
                    <g key={`${lineItem}-mainGroup`}>
                    
                    

                    {_.isObject(domains.quantileData) && lineItem in domains.quantileData && _.isObject(domains.quantileData[lineItem])?
                        <motion.g>
                            <motion.rect 
                                    x = {margin.left+5} 
                                    width = {width-margin.left*2-margin.right-10} 
                                    initial={{ 
                                            height:      0, 
                                            y :  yScale(domains.quantileData[lineItem].q50)
                                        }}
                                    animate={{ 
                                                height :     yScale(domains.quantileData[lineItem].q25)-yScale(domains.quantileData[lineItem].q75),
                                                y :          yScale(domains.quantileData[lineItem].q75)
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
                                    y1 = {yScale(domains.quantileData[lineItem].q50)} 
                                    y2 = {yScale(domains.quantileData[lineItem].q50)} 
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
                    {
                        _.isNumber(mouseCoords.x) && _.isNumber(mouseCoords.y) ? 
                            <line 
                                x1 = {mouseCoords.x} 
                                x2 = {mouseCoords.x} 
                                y1 = {margin.top} 
                                y2={margin.top+graphHeight} 
                                stroke="darkgrey"
                                strokeWidth={0.75}/> : null
                    }

                    {_.isObject(domains.movingAverage)?
                        Object.keys(domains.movingAverage).map(mName => {
                            const d = domains.movingAverage[mName]

                            if (d.length === 1) {
                                return(
                                    <circle 
                                        key = {`circleAg-${mName}`}
                                        cx = {dateScale(d[0].x)}
                                        cy = {yScale(d[0].y)}
                                        r = {circleRadius}
                                        fill = "red"
                                        stroke = "black"
                                        strokeWidth={0.5}
                                        />
                                )
                            }
                            else 
                            {
                                return(
                                    <polyline 
                                        key={`movingAvg-${mName}`}
                                        points = {_.join(d.map(vv => `${dateScale(vv.x)},${yScale(vv.y)}`), " ")}
                                        stroke="red"
                                        strokeWidth={1.5}
                                        fill = {"transparent"}
                                    />)
                            }
                        })
                        :null}

                    {pps.map((vv,ii) =>
                       {
                        const {cx, cy, selected, hovered, run } = vv
                        return(
                            <circle key = {`${ii}`}
                                cx = {cx}
                                cy = {cy}
                                r = {selected?2*circleRadius:circleRadius}
                                stroke="black"
                                strokeWidth={0.5}
                                fill = {hovered?"red":lineCircleColor}
                                onClick = {() => setSelectedRun(run)}
                            />    
                         ) 
                        })}
                    {
                        hoverPoints.hasOwnProperty(lineItem) && _.isArray(hoverPoints[lineItem]) && hoverPoints[lineItem].length > 0?
                        hoverPoints[lineItem].map((hoverPoint,idx) => {
                            
                            let xPosition = dateScale(hoverPoint.x)
                            let yPosition = yScale(hoverPoint.y)
                            return(
                                <g key={`hoverPoint-${idx}`}>
                                    <Text
                                        x = {xPosition}
                                        y = {yPosition}
                                        dx = {12}
                                        dy = {-8}
                                        width = {80}
                                        verticalAnchor={"start"}
                                        textAnchor={"start"}
                                        >
                                        {hoverPoint.ID}
                                    </Text>
                                </g>
                            )
                        })
                        :null
                    }

                    {!lastItemInQuantile?
                        //annotate last quantile item
                        <Text
                            x = {graphWidth + margin.left}
                            y = {margin.top - 5}
                            verticalAnchor="end"
                            textAnchor="end"
                            fill={"#be031e"}>
                                {"Not in IQR!"}
                            </Text>
                            : null}
                    {
                        lineItems.map(lineItem => {
                            let yPosition = margin.top+15
                            let xCenterPosition = margin.left+20
                            let xStartPosition = margin.left+10
                            let xEndPosition = xStartPosition + 20
                            return (
                                <motion.g key={lineItem}>
                                    <line x1 = {xStartPosition} x2 = {xEndPosition} y1 = {yPosition} y2 = {yPosition} stroke={colorScale(lineItem)} strokeWidth={2}/>
                                    <circle cx = {xCenterPosition} cy = {yPosition} r = {circleRadius} stroke="black" fill={colorScale(lineItem)} strokeWidth={0.1}/>
                                    <Text x = {xEndPosition+2} y = {yPosition} verticalAnchor="middle" cursor="default" width={80} >{lineItem}</Text>
                                </motion.g>
                            )
                            })
                    }
                    </g>
                
                    
                )
            })}

            </svg>



        </div>:null
    )
}


MCPerformanceChart.defaultProps = {
    width : 800,
    height : 200,
    highlightItem : undefined,
    quantileData : {
            "Peptides" : {q25 : 0.2, q50 : 0.3, q75 : 0.7},
    },
    circleRadius : 4,
    points : {
        "Peptides" : [{x:"2022-06-03",y:0.5},{x:"2022-07-03",y:0.6},{x:"2022-08-03",y:0.6}],
        "MS/MS Identification" : [{x:"2022-06-03",y:0.8},{x:"2022-07-03",y:0.3}]
    },
    itemColors : {"Peptides":"#d8976b","MS/MS Identification":"#7a6b9e"},
    margin : {
        left : 40,
        top: 30,
        right : 5,
        bottom : 30
    }

}