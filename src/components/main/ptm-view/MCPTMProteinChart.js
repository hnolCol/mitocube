import { AxisTop } from "@visx/axis";
import { ParentSize } from "@visx/responsive";
import { scaleLinear } from "@visx/scale";
import { useEffect, useMemo, useState } from "react";
import _ from "lodash"

import { Text } from "@visx/text";


// function MCModificationItem(props){
//     // plots a line with peptide info
//     const {ptmPoint, color, xscale, catscale, categoricalColumn, mouseOverItem, fracPosition} = props
    
//     let peptides  = ptmPoint.peptides
//     let xPos = xscale(ptmPoint.start)
//     let yStart = catscale(categoricalColumn)
//     let h = catscale.bandwidth()
//     let nBackgrounds = peptides.length
//     let m = h / 5
//     let innerMargin = nBackgrounds>4?0:h/9 // no background if more than 4 items
//     let backgroundHeight = (h - m - innerMargin * (nBackgrounds-1)) / nBackgrounds
    
//     return(
//         <g>
//             {ptmPoint.peptides.map((peptide,idx) => {
//                 let xStart = xscale(peptide.start)
//                 let xEnd = xscale(peptide.end)
//                 let yBackgroundStart = m/2 + yStart +  idx * innerMargin + backgroundHeight * idx
//                 return(
                    
//                     <rect x = {xStart} y={yBackgroundStart} width={xEnd-xStart} height={backgroundHeight} fill={"grey"} opacity={0.5} stroke="black" strokeWidth={0.2}/>
//                 )
//             })}
//             {/* <rect x = {xStart} y={yStart+m/2} width={xEnd-xStart} height={h-m} fill={"#efefef"} opacity={0.75}/> */}
//             <line x1={xPos} x2={xPos} y1={yStart+m/2} y2={yStart+h-m/2} stroke={color} strokeWidth={2} 
//                 onMouseEnter={fracPosition<0.5?(e) => mouseOverItem(xPos,yStart+h+m,"down"):(e) => mouseOverItem(xPos,yStart-m,"up")} 
//                 onMouseLeave={mouseOverItem}/>          
//         </g>


//     )
// }

function MCPTMPeptide(props) {
    const {data, xscale,itemHeight, yStart, fillColor, setMouseOverItem, sites,handleClick,annotationHeader} = props
    const [mouseOverMe, setMouseOverMe] = useState(false)
    let annotationID = data.id
    let xStart = xscale(data.start)
    let xEnd = xscale(data.end)
    let m = itemHeight/10
    let y  = yStart + data.rowIdx * itemHeight + m
   
    let h = itemHeight-m*2

    const handleMouseOver = (e) => {
        setMouseOverMe(true)
        setMouseOverItem(xStart,xEnd,y,annotationID,data.start,data.end,data.pepSequence)
    } 

    const handleMouseLeave = (e) => {
        setMouseOverMe(false)
        setMouseOverItem()
    }
    return (
        <g 
        onMouseUp={_.isFunction(handleClick)?(e) => handleClick(e,annotationID,annotationHeader):undefined}
        onMouseEnter = {handleMouseOver}
        onMouseLeave = {handleMouseLeave}>
        <rect 
            x = {xStart} 
            width = {xEnd - xStart} 
            y = {y} 
            height = {h} 
            fill={fillColor} 
            opacity={mouseOverMe?0.75:0.4} 
            stroke="black" 
            strokeWidth={0.2} 
            rx={itemHeight/8}
            />
        {_.isArray(sites)?sites.map((siteDetails,idx) => {
            let xSitePosition = xscale(siteDetails.position)
                return (
                    <line 
                        key={`site-pos${annotationHeader}-${idx}-${annotationID}-${siteDetails.position}--${siteDetails.label}`} 
                        x1 = {xSitePosition} 
                        x2 = {xSitePosition}
                        y1 = {y} 
                        y2={y+h} 
                        stroke={"black"} 
                        strokeWidth={2}
                        />
                )
        }):null}
        </g>

    )
}
MCPTMPeptide.defaultProps = {
    fillColor : "grey"
}


function MCTooltip (props) {
    const {texts, ...rest} = props
    rest["height"] = texts.length * 14
    let textMargin = 3

    return(
        <g>
            <rect {...rest} 
                stroke="black" 
                strokeWidth={0.75} 
                fill={"white"} 
                opacity={0.85} 
                rx={4}/>

            {_.isArray(texts) ? texts.map((t,idx) => {
                return (
                    <g key={`tooltipTxt${idx}`}>
                    <Text 
                        x={rest.x+textMargin} 
                        y={rest.y + idx * 13+textMargin} 
                        verticalAnchor="start" fontSize={12} 
                        width={rest.width}>{t}</Text>
                    </g>
                )
            }) : null}
        </g>

    )
}


function MCPTMHoverBackground(props) {
    const {peptiderect, svgMargins, svgHeight} = props
    
    return(
        <g>
            {peptiderect.xStart !== undefined && peptiderect.xEnd !== undefined?
           <rect x = {peptiderect.xStart} y={svgMargins.top} height={svgHeight-svgMargins.top-svgMargins.bottom}  width={peptiderect.xEnd-peptiderect.xStart}  fill={"grey"}/>
            :
            null}
        </g>
    )
}

function MCPTMView (props) {

    const {width, height, chartData, margin, isLoading, itemHeight, marginBetweenAnnotations, svgID, annotationColors, handleOnAnnotationClick} = props
    const [mouseOverItem, setMouseOverItem] = useState(undefined)
    const [mouseOverIdx, setMouseOverIdx] = useState(undefined)
   // const [isLoading, setIsLoading] = useState(false)
    //const [chartData, setChartData] = useState({annotations:{}, length:100})
    const catDomain = chartData!==undefined && chartData.annotations!==undefined?Object.keys(chartData.annotations):[]
    
    let offset = margin.top + marginBetweenAnnotations
    
    const xscale = useMemo(() => scaleLinear({
        domain : [0,chartData.length],
        range : [0+margin.left,width-margin.right],
       
    }),[margin.left,width,margin.right,chartData.length])

    const handleMouseOverItem = (xStart, xEnd, yStart, itemID, pepStart, pepEnd, pepSequence) => {
        if (yStart === undefined){
            setMouseOverItem(undefined)
            return
        }
        if (_.isObject(mouseOverItem) && mouseOverItem.id === itemID) return
        let numberOfTextLines = _.isArray(chartData.sites[itemID])?chartData.sites[itemID].length:1
        let siteTextLabel = _.isArray(chartData.sites[itemID])?_.join(chartData.sites[itemID].map(siteDetails => siteDetails.label),", "):""
        let margin = 5
        let placeToRight = xStart < width *0.6
        let toolTipWidth = pepSequence !== undefined && pepSequence.length * 8 > 120 ? pepSequence.length * 8  : 120 // widht et lteast 200 
        let toolTipHeight = numberOfTextLines * 13
        let toolTipTop = yStart + toolTipHeight > 0.75 * height
        let xTooltip = placeToRight ? xEnd + margin : xStart - toolTipWidth - margin
        var yTooltip = toolTipTop ? yStart - toolTipHeight - itemHeight: yStart + itemHeight / 2 


        
        setMouseOverItem({
                x:xTooltip,
                y:yTooltip, 
                peptiderect : {xStart: xStart, xEnd : xEnd, yStart : yStart},
                width : toolTipWidth, 
                height : toolTipHeight,
            texts: [`Sites : ${siteTextLabel}`, 
                    `${pepSequence}`,
                    `Length : ${pepEnd-pepStart+1}`,
                    `Span : ${pepStart} - ${pepEnd}`]
            })
    }

    const handleMouseOverAnnotationGroup = (mouseOverIdx) => {

        setMouseOverIdx(mouseOverIdx)

    }

    
    return(
        <div>
        {!isLoading && chartData.annotations !== undefined?<div>
            {width > 0 && height > 0? 
            <svg width={width} height={height} id={svgID}>
                <rect x={0} y = {0} width={width} height={height} fill="#efefef" rx = {4}/>
                <AxisTop scale={xscale}  top={margin.top} tickLength = {4} hideZero={true}/>
                {/* <AxisLeft scale={catscale} left = {margin.left-3} tickLength = {4}/> */}
                {_.isObject(mouseOverItem)?
                    <MCPTMHoverBackground {...mouseOverItem} svgMargins = {margin} svgHeight = {height}/>
                    :
                    null}
                {catDomain.map((v,idx) => {
                    let annotationHeight = chartData.annotations[v].totalLength * itemHeight
                    // get y start position svg
                    let yStart = idx===0?offset: offset + _.sum(catDomain.map((annotationName,ii) => ii<idx?chartData.annotations[annotationName].totalLength * itemHeight + marginBetweenAnnotations:0)) 
                    return(
                    <g key={`background-rect-${idx}`} 
                        className={`${mouseOverIdx===undefined?"background-rect-ptm":mouseOverIdx===idx?"background-rect-ptm":"background-rect-ptm-inactive"}`}
                        onMouseLeave={() => setMouseOverIdx(undefined)} 
                        onMouseEnter={() => handleMouseOverAnnotationGroup(idx)}>
                        

                        <rect 
                            x = {margin.left} 
                            y = {yStart} 
                            width = {width - margin.left - margin.right} 
                            height={chartData.annotations[v].totalLength*itemHeight} 
                            fill={"white"}
                            />
                        {/* show individual ptm carrying peptides */}
                            {_.isArray(chartData.annotations[v].positions) && chartData.annotations[v].positions.length > 0? 
                                chartData.annotations[v].positions.map((peptidePositions,idxPeptide)=> {
                                    return(
                                        <MCPTMPeptide 
                                            key={`${v}-${idxPeptide}-peptide`} 
                                            annotationHeader = {v}
                                            handleClick = {handleOnAnnotationClick}
                                            data={peptidePositions} 
                                            xscale={xscale}
                                            yStart={yStart} 
                                            itemHeight= {itemHeight}
                                            fillColor = {mouseOverIdx===undefined?annotationColors[v]:mouseOverIdx===idx?annotationColors[v]:"grey"}
                                            setMouseOverItem = {handleMouseOverItem}
                                            sites = {chartData.sites[peptidePositions.id]}
                                            />
                                    )
                                })
                            :
                            null}
                        <Text x={margin.left} y = {yStart + annotationHeight/2} verticalAnchor="middle" textAnchor="end">{v}</Text>
                    </g>
                )})}

            {
                    mouseOverItem!==undefined && _.isObject(mouseOverItem)?
                    <MCTooltip {...mouseOverItem}/>
                    :
                    null
                }
            </svg>
            : 
            null}
            
        </div>:<div>Loading ...</div>}
        </div>
    )
}


MCPTMView.defaultProps = {
    margin : {left:125,top:30,right:35,bottom:10}
}

export function MCPTMProteinChart (props) {
    //const {ID, chartData} = props

    return(  
        <ParentSize>
            {parent => 
            {
                return(
                    <MCPTMView width={parent.width} height={parent.height} {...props}/>
                )
            }}
        </ParentSize>
    )
}