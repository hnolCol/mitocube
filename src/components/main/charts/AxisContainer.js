

import React from "react"
import { ParentSize } from '@visx/responsive';
import { MinimalPointplot } from './types/MCPointplot';
import { MCMinimalBoxplot } from './types/MCMinimalBoxplot';
import { MCRelativeBar } from './types/MCRelativeBar';
import { Text } from '@visx/text';
import _ from "lodash"
import { useEffect, useRef, useState } from 'react';
import { MCSpinner } from '../../spinner/MCSpinner';
import axios from 'axios';
import { MCCardHeader } from "../protein-view/CardHeader"
import { MCHeatmap } from "./types/MCHeatmap";
const getWidthAndStartForAxis = (numberAxis,axesPerRow,width,height) => {
    
    const gridRows = Math.round(numberAxis / axesPerRow)
    const widthAxis = Math.round(width / axesPerRow)
    const heightAxis =  Math.round(height / gridRows)
    // Math.round(width  * heightWidthRatio > height ? height / gridRows : width  * heightWidthRatio)
    const axisID = _.range(1,numberAxis+1)
    var gridColumn = -1
    var gridRow = 0
    
    return axisID.map(axisID => {
        gridColumn += 1
        const x = widthAxis * gridColumn
        if (x === 0 && axisID > axesPerRow) {
            gridRow += 1
        }
        const y =  gridRow * heightAxis
        if (gridColumn === axesPerRow -1){
            gridColumn = -1
        }
        return(
            {
                id : axisID,
                width : widthAxis,
                height : heightAxis,
                x : x,
                y : y,

            }
    )})
}

const GraphComponents = {
    "barplot" : MCRelativeBar,
    "boxplot" : MCMinimalBoxplot,
    "pointplot" : MinimalPointplot

}

function MCHeatmapFrame(props){
    const svgRef = useRef(null);
    
    return(
        <ParentSize ignoreDimensions={["top","left"]} debounceTime={300} enableDebounceLeadingCall={false}>
        {parent => (
            <svg

                width={parent.width}
                height = {parent.height}
                ref = {svgRef}
                id = {props.id}
            >

                <MCHeatmap {...props.graphData} width={parent.width} height={parent.height}/>

            </svg>
        )}
        </ParentSize>
    )
}

// console.log(getWidthAndStartForAxis(5,3,400,500))

function MCSVGFrame(props){
    const svgRef = useRef(null);
    const numberAxes = Object.keys(props.graphType).length
    
    return(
        <ParentSize>
        {parent => (
            
            <svg

                width={parent.width}
                height = {parent.height}
                ref = {svgRef}
                id = {props.id}
                
            >
                <rect x={0} y={0} width={parent.width} height={parent.height} fill='white' rx={10} ry={10}/>
                {/* <MinimalPointplot xLimits = {[0,27]} yLimits = {[1,-0.05]} xLabel = {"Time (days)"} yLabel = {"Incorporation rate"} 
                values = {[[0,0],[7,0.1],[11,0.4],[14,0.6],[21,0.8],[26,0.82]]} title="Ndufa1" width = {parent.width} height = {parent.height} svgRef={svgRef}/>
                <text x = {20} y={20}>{parent.width}</text> */}
                {parent.width < 200 || parent.height < 100?
                    <Text 
                        x = {parent.width/2} 
                        y={parent.height/2} 
                        textAnchor={"middle"} 
                        verticalAnchor={"middle"}>
                            {props.description}
                    </Text>:
                getWidthAndStartForAxis(numberAxes,parent.width < 400 ?1:numberAxes > 1?2:1,parent.width,parent.height).map(axisProps => {
                    if (!(axisProps.id in props.graphType)) return null 
                    const graphTypeString = props.graphType[axisProps.id]
                    if (!(graphTypeString in GraphComponents)) return null
                    const GraphComponent = GraphComponents[graphTypeString];
                    // return <SpecificStory story={props.story} />;
                    
                    return(
                            <GraphComponent 
                                key = {axisProps.id}
                                x = {axisProps.x} 
                                y ={axisProps.y} 
                                width = {axisProps.width}
                                height = {axisProps.height}
                                svgRef={svgRef}
                                {...props.graphData[axisProps.id]}
                                />
                          
                        
                )})}
            </svg>)}
            </ParentSize>
          
      )
    
}

MCSVGFrame.defaultProps = {
    graphData : 
        {1: {
            values : [0.5,0.8,0.7],
            labelValues : ["24","35","21"],
            featureNames : ["Gene1","as","Gene2"] ,
            minValue : 0,
            maxValue : 22,
            title:"Quantified in N Tissues1"
        },
        2: {
            minValue : 1,
            maxValue : 22,
            title : "Half-life distribution",
            values : [
                        {q25:4,m:6,q75:9,min:3,max:11},
                        {q25:4,m:6,q75:9,min:3,max:11},
                        {q25:4,m:8,q75:9,min:3,max:11}],
            featureNames : ["Gene1","as","Gene2"]
        },
        3 : {
        xLimits : [-2,27],
        yLimits : [1,-0.05],
        xLabel : "Time (days)",
        yLabel : "Incorporation rate",
        values : [
            [[0,0],[7,0.1],[11,0.4],[14,0.6],[21,0.8],[26,0.82]],
            [[0,0],[7,0.15],[11,0.7],[14,0.8],[21,0.9],[26,0.89]]
        ],
        title:"Ndufa1"
        }
    },
    graphType : {1 : "barplot", 2 : "boxplot", 3 : "pointplot"}
}

export const MCAxisHandler = (props) => {
    const [correlatedFeatures,setCorrelatedFeature] = useState({success:false,isLoading:false,correlationData:[],show:false})
    const axisKeys = _.range(props.numberAixs)
    
    const findCorrelatedFeatures = (dataID,featureID) => {
        
        if (Object.keys(correlatedFeatures.correlationData).length > 0){
            setCorrelatedFeature(
                prevValues => {
                return { ...prevValues,"show": !prevValues.show}})
        }
        
        else {
            
            setCorrelatedFeature(
                prevValues => {
                return { ...prevValues,"isLoading": true}})
            
            axios.post('/api/features/cards/data/correlation',
                {"dataID" : dataID, "featureIDs":[featureID], "token" : props.token},
                {headers : {'Content-Type': 'application/json'}}).then(response => {
                    
                    if ("error" in response.data & response.data["error"] === "Token is not valid.") {
                        props.resetAuthStatus()
                        return 
                    }
                    setCorrelatedFeature(
                        {isLoading:false,success:response.data["success"],correlationData:response.data["correlationData"],show:true})
            }).catch(
                error => {
                        setCorrelatedFeature(
                        {isLoading:false,success:false,correlationData:["error"],show:true})}
            )
        }
    }
    return (

        <div>
            {(props.chartData === null || Object.keys(props.chartData).length === 0) && !props.isSummary?null:
            props.height[0]===undefined?null:correlatedFeatures.isLoading?<MCSpinner />:
            <div>
                    <MCCardHeader 
                        indicatorTooltipStr = {props.indicatorTooltipStr} 
                        indicatorColor = {props.indicatorColor} handleRemoveRequest = {props.handleRemoveRequest} id = {props.id} dataID = {props.dataID}
                        handleExpInfoRequest = {props.handleExpInfoRequest}
                        isSummary = {props.isSummary}
                        description = {props.featureProps.shortDescription}
                        label = {props.label}
                        correlationShown = {correlatedFeatures.show}
                        featureID = {props.featureProps.Entry}
                        statsData = {props.chartData.statsData}
                        showDataInTable = {props.showDataInTable}
                        setOpenOfDataInTable = {props.setOpenOfDataInTable}
                        downloadData = {correlatedFeatures.show?correlatedFeatures.correlationData.downloadData:props.chartData.download}
                        requestCorrelatedFeatures = {props.isSummary?undefined:findCorrelatedFeatures}
                    />
                    <div className='axis-container'>
                        {axisKeys.map(k => {return(
                            <div className='axis-div' key={k} style={{height:`${props.height[0]["h"]*props.rowHeight-40}px`}}>
                                {
                                    correlatedFeatures.success && correlatedFeatures.show? 
                                    <MCHeatmapFrame id = {props.id} graphData = {correlatedFeatures.correlationData}/>: 
                                        correlatedFeatures.show?<p>There was an unexpected error return from the API.</p>:
                                    props.chartData.success?
                                    <MCSVGFrame 
                                        id = {props.id} 
                                        graphType = {props.chartData.chart.graphType} 
                                        graphData={props.chartData.chart.graphData}
                                        description = {props.featureProps.shortDescription}/>: 
                                    <p>The API responded with an error</p>
                                }
                            </div>
                        )})}
                    </div>
                </div>}
    </div>
    )
}
MCAxisHandler.defaultProps = {
    numberAixs : 1,
    rowHeight : 100,
    chartData : {},
    APIsuccess : false
}


