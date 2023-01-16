import { useEffect, useState, useMemo } from "react"
import { Button, Collapse, Icon } from "@blueprintjs/core"
import { motion } from "framer-motion"
import { MCPerformanceChart } from "./charts/MCPerformanceChart"
import { MCAddPerformanceDialog } from "../dialogs/MCAddPerformanceData"
import { MCHeader } from "../utils/components/MCHeader"
import { Link } from "react-router-dom"
import axios from "axios"
import _ from "lodash"
import { MCCombobox } from "../utils/components/MCCombobox"
import { ParentSize } from "@visx/responsive"
import { createEnum, getMonthName, groupby, quantile } from "../utils/Misc"
import { MCSVGFrame } from "../main/protein-view/charts/MCAxisCardHandler"

const allowedPages = createEnum(["Overview","Runs"])
const timeRanges = createEnum(["Max", "2 Month", "3 Month", "1 Year", "YTD"])

const pageComponents = {
    Overview : MCPerformanceOverview,
    Runs : MCPerformanceSpecificRuns
}
function MCPerformancePage(props) {
    const PPage = pageComponents[props.pageType]
    return <div className="performance-tab-container"><PPage {...props}/></div>
}

function MCPerformanceSpecificRuns(props){
    const {selectedRun, setSelectedRun} = props
    
    return (
        <div >
            
            <div className="hor-aligned-center-div-between">
                <MCRunSelection {...props} setSelectedRun = {setSelectedRun}/>
                <MCRunView selectedRun = {selectedRun} {...props}/>
            </div>
        </div>
    )
}


function MCPerformanceMetric(props) {

    const { metricName, selectedRun, runBefore, metricsMedian } = props

    let percentageChangeToLastRun = _.isObject(runBefore)?((selectedRun[metricName] - runBefore[metricName]) / selectedRun[metricName] * 100):undefined
    let metricDown = _.isNumber(percentageChangeToLastRun) ? percentageChangeToLastRun < 0 : false
    
    let percentageChangeToMedian = metricsMedian!==undefined?((selectedRun[metricName] - metricsMedian) / selectedRun[metricName] * 100):undefined

    return (
        <div className="performance-metric-item">
            <div className="performance-metric-absolute-name">
                {metricName}
            </div>
            <div>
                <div className="performance-metric-inner-container">
                    <div className="performance-metric">
                        {selectedRun[metricName]}
                    </div>
        
                    <div style={{color:metricDown?"red":"green",fontSize:"1.1em"}}>
                        
                            <div style={{display:"flex",flexDirection:"column",alignItems:"center"}}>
                            {percentageChangeToLastRun !== undefined ?
                                <div>
                                    ({metricDown?"":"+"}{percentageChangeToLastRun.toFixed(2)} %)
                                </div>
                                : null
                                
                            }
                            {percentageChangeToMedian !== undefined ?
                                <div>
                                    {percentageChangeToMedian.toFixed(2)} %.
                                </div>
                                : null
                            }
                            </div>
                            
                            
                    </div>
                </div>
        </div>
        </div>
    )
}


function MCRunView(props){

    const { selectedRun, performanceConfig, runs } = props
    let metricNames = performanceConfig["Metrices"]

    let runBefore = useMemo(() => {
        let indexSelectedRun = runs.findIndex(run => run.ID === selectedRun.ID)
        if (indexSelectedRun === 0) return undefined
        return runs[indexSelectedRun-1]
    }, [selectedRun.ID])
   
    let medianByMetricName = useMemo(() => {
        let valuesByMetric = runs.length > 2 ? metricNames.map(metricName => {return([metricName,quantile(runs.map(run => run[metricName]),[0.5],1.7,false).qs[0]])}): {}
        return Object.fromEntries(valuesByMetric)
    }, [selectedRun.ID, metricNames])

    
    return(
        <div style={{width:"100%", maxHeight: "55vh" ,overflowY: "scroll"}}>
            {_.isObject(selectedRun) && Object.keys(selectedRun).length > 0?
            <div style={{marginTop:"0.6rem"}}>
                <div className="performace-specific-run-box">
                <MCHeader text="General Information"/>
                {Object.keys(performanceConfig).includes("General")?
                    performanceConfig["General"].map(generalInfo => {
                        
                        return (
                            <div key={`${generalInfo}-run-header`}>
                            <p>{selectedRun[generalInfo]!==undefined?`${generalInfo}: ${selectedRun[generalInfo]}`:`${generalInfo} not in run.`}</p>
                            </div>
                        )})
                        :
                        <p>General information not detected in the specific performance run config.</p>
                }
                </div>
                <div className="performace-specific-run-box">
                <MCHeader text="Metrices"/>
                {Object.keys(performanceConfig).includes("Metrices")?
                    <div className="performance-metric-container">
                                {performanceConfig["Metrices"].map((metricName, idx) => {
                                    return (
                                        <MCPerformanceMetric key={metricName} metricsMedian = {medianByMetricName[metricName]} {...{ metricName, selectedRun, runBefore }}/>
                            )
                        })}
                    </div>
                    :<p>There were no metrices found in the specific performance run.</p>}
                </div>
                <div className="performace-specific-run-box">
                <MCHeader text="Distributions"/>
                
                {Object.keys(performanceConfig).includes("Distributions")?
                    <div className="perfomance-run-chart-container">
                                {performanceConfig["Distributions"].map(distName => {
                            //move this up - should not recalculate at every render.
                            let boxplotPropParam = ["min","q25","m","q75","max","n"]
                            let distColumnNames = ["0.0","0.25","0.5","0.75","1.0","N"].map(qName => `${distName}_${qName}`)
                            let distValues = Object.fromEntries(distColumnNames.map((distColName, idx) => [boxplotPropParam[idx], selectedRun[distColName]]))
                            if (distValues.q25 === undefined) return null
                            distValues["fillColor"] = "#efefef"
                            let margin = Math.sqrt(distValues.max ** 2 - distValues.min**2) * 0.05
                            
                            return(
                                <div key={distName}>
                                    <div className="performance-run-chart-box">
                                        <MCSVGFrame graphData = {
                                            {1 : {
                                                minValue : distValues.min - margin,
                                                maxValue : distValues.max + margin,
                                                title : "",
                                                legendTitle : distName,
                                                legendItems : ["Total"],
                                                vertical :true,
                                                legend : {"Total":"#efefef"},
                                                values : [
                                                        [distValues]
                                                    ],
                                                featureNames : [""]
                                            }}

                                    } 
                                    graphType={{1 : "boxplot" }}/> 

                                </div>
                                </div>
                            )
                        })}

                    </div> : null}
                    </div>
                    
                    <div className="performace-specific-run-box">
                        <MCHeader text="QC - Peptides"/>
                        {Object.keys(performanceConfig).includes("QC-Peptides")?<div>
                        <p>{performanceConfig["QC-Peptides"].name.length} potential peptides.</p>
                        </div>:<p>No qc peptide information found.</p>}
                    </div>

                    <div className="performace-specific-run-box">
                        <MCHeader text = "Miscs"/> 
                        {Object.keys(performanceConfig).includes("Miscs") ?
                            <div>
                                {performanceConfig["Miscs"].map(miscHeader => {
                                    return (
                                        <div key={miscHeader}>
                                            <p>{miscHeader}</p>
                                            <p>{selectedRun[miscHeader]}</p>
                                        </div>
                                    )
                                })}
                            </div> :
                            <p>No misc information found.</p>}
                </div>
                </div>
                : <p>Select a performance run to view the details.</p>}
        </div>
    ) 
}


function MCRunSelection(props) {
    // displays the present performance runs. 
    // 
    const {
        selectedRun, 
        setSelectedRun, 
        yearOpen, 
        setYearOpen, 
        groupRunsByYear} = props

    const [mouseOverID, setMouseOverID] = useState(undefined)
    
    return(
        <div style={{minHeight:"55vh", width:"auto", minWidth:"8rem", overflowY:"scroll"}}>
            <MCHeader text="Runs" hexColor={"#2F5597"}/>
            {Object.keys(groupRunsByYear).map(yearString => {
                let yearRuns = groupRunsByYear[yearString]
                let yearIsOpen = yearOpen[yearString]
                return(
                    <div key={yearString} style={{cursor:"default"}}>
                        <Button 
                            small={true} 
                            minimal={true} 
                            text = {yearIsOpen?`${yearString}`:`${yearString} (${yearRuns.length})`}
                            icon = {yearIsOpen?"caret-down":"caret-right"} 
                            intent={yearIsOpen?"primary":"none"}
                            onClick = {() => setYearOpen(prevValues =>  {return {...prevValues,[yearString]:!yearIsOpen}})}/>
                            {
                               yearIsOpen?yearRuns.map((run,idx) => {
                                    let isSelected = selectedRun!==undefined && _.isObject(selectedRun) && selectedRun.ID === run.ID
                                    let dateWithRemovedYear = run.Date.slice(5)
                                    let monthString = dateWithRemovedYear.slice(0,2)
                                    var showMonth = true
                                    if (idx !== 0) {
                                        let monthStringPrev = yearRuns[idx-1].Date.slice(5,7)
                                        showMonth = !(monthString === monthStringPrev)
                                    }
                                    let month = getMonthName(parseInt(monthString))
                                    let mouseOver = mouseOverID===run.ID
                                    return(
                                        <div key={`run-${run.ID}-${idx}`}
                                            style={{ paddingLeft: "0.4rem" }}>
                                                {showMonth?month:null }
                                                <motion.div 
                                                    key={run.ID} 
                                                    whileHover={{transform:"translateX(0.65rem)"}}
                                                    transition={{duration:0.4}}
                                                    onMouseEnter = {() => setMouseOverID(run.ID)}
                                                    onMouseLeave = {() => setMouseOverID(undefined)}
                                                    onMouseUp = {() => setSelectedRun(run)}
                                                    style={{
                                                        marginLeft:"1rem", 
                                                        width : "50%",
                                                        borderRadius:"0.3rem",
                                                        paddingLeft:"0.4rem",
                                                        backgroundColor:mouseOver?"white":"transparent",
                                                        fontWeight : isSelected?"bold":"normal"
                                                        }
                                                        }>
                                                        
                                                        {dateWithRemovedYear}
                                                        
                                                        {/* {run[metricName]} */}
                                    
                                                </motion.div>
                                        </div>
                                    )
                                }):null
                            }
                        </div>
                    )
                })}

        </div>
    )

}


MCRunSelection.defaultProps = {
    metricName : "Identified Proteins"
}

const initMouseCoord = {x:undefined,y:undefined}
function MCPerformanceOverview(props){
    const {
            movingAveragePeriod,
            setAvgPeriod,
            timeFrame, 
            setTimeFrame, 
            runs, 
            performanceConfig, 
            metricColors,
            selectedRun,
            setSelectedRun} = props
    
    const [mouseCoord, setMouseCoord] = useState(initMouseCoord)


    const getPointsForMetric = (metricName) => {
        

        if (_.isString(metricName) && performanceConfig["Metrices"].includes(metricName) && _.isArray(runs) && runs.length > 0) {
            let points = runs.map(v => {
                return({...v, "x": new Date(v["Date"]) ,"y":v[metricName]})
            
            })
            return {[metricName]:points}
        }
        else if (_.isArray(metricName) && _.isArray(runs) && runs.length > 0) {

            return Object.fromEntries(metricName.map(mName => {
                return( 
                    [
                        mName, 
                        runs.map(v => {
                            return(
                                {...v, "x":new Date(v["Date"]) ,"y":v[mName]}
                            )
                        }
                        )
                    ]
                )
            }))
            } 
        }
    return(
        <div style={{maxHeight: "55vh",overflowY:"scroll"}}>
            <MCHeader text = "Metrices over time" hexColor={"#2F5597"}/>
            <div className="hor-aligned-div">
            
            <Button icon="history" minimal={true} small={true} intent="success"/>
                <MCCombobox 
                    items = {Object.values(timeRanges)} 
                    callback = {setTimeFrame} 
                    placeholder = {timeFrame} 
                    buttonProps = {{minimal:true,small:true}}/>

                    
                    <Button icon={"step-chart"} minimal={true} small={true} intent="primary"/>
                    <MCCombobox 
                    items = {["3","6","8","10","15","20","25"]} 
                    callback = {setAvgPeriod} 
                    placeholder = {movingAveragePeriod} 
                    buttonProps = {{minimal:true,small:true}}/>
            </div>
            
            <div className="perfomance-chart-container">
                {_.isArray(runs) && runs.length > 0?
                        performanceConfig["Metrices"].map(metricName => {
                            return(
                        <div key={metricName} className="performance-chart-box">
                            <ParentSize>{
                                        parent => (
                                            <MCPerformanceChart 
                                                width={parent.width} 
                                                mouseCoords = {mouseCoord}
                                                setMouseCoords = {setMouseCoord}
                                                timeFrame = {timeFrame}
                                                selectedRun = {selectedRun}
                                                setSelectedRun = {setSelectedRun}
                                                movingAvgPeriod = {parseInt(movingAveragePeriod)}
                                                height={parent.height} points = {getPointsForMetric(metricName)} itemColors = {metricColors}/>)}
                        </ParentSize>
                        </div>
                        )})
                        :
                        null}
            </div>
        </div>

    )
}


export function MCPerformanceView(props){

    const {logoutAdmin, token } = props
    const [perfromanceDialog, setPerformanceDialog] = useState({isOpen:false})
    const [performanceData, setPerformanceData] = useState({data:{},infoText:""})

    useEffect(() => {
        axios.get('/api/admin/performance', {params:{token:token}}).then(response => {
            console.log(response)
            if ("success" in response.data && response.data["success"]) {

                setPerformanceData(prevValue => {return {...prevValue,...response.data}})
            }
            else if ("msg" in response.data) {
                setPerformanceData(prevValue => {return {...prevValue, "infoText" : response.data["msg"]}})
            }
            else {
                setPerformanceData(prevValue => {return {...prevValue, "infoText" : "API returned unexpected data."}})
            }
        })
    },[token])

    const closePerformanceDialog = () => {

        setPerformanceDialog(prevValue => {return {...prevValue,"isOpen":false}})
    }

    return (
        <div style={{margin:"2rem"}}> 
            <div style={{fontSize:"0.85rem", transform:"translateX(50%)"}}>
                <MCHeader text="Performance Overview" fontSize={10}/>
            </div>
            <div style={{position:"absolute", right:"0",top:"0",margin:"0.5rem"}}>
                
                <Button text="" intent="primary" icon="add" minimal={true} onClick={e => setPerformanceDialog(prevValue => {return {...prevValue,"isOpen":true}})}/>
                <Link to="/"><Button icon="home" minimal={true}/></Link>
                <Button icon="log-out" minimal={true} onClick={e => logoutAdmin()}/>
                
            </div>
            <MCAddPerformanceDialog {...perfromanceDialog} onClose={closePerformanceDialog} canEscapeKeyClose={false} canOutsideClickClose={false}/>
            
            <div style={{width:"95vw",fontSize:"0.8rem"}}>
                {performanceData.infoText}
                <p>Performance runs are grouped by Instrument below. The performance overview display the deviation from the median (50%) within the property group of the recent performance run.</p>

                <div className="instrument-container">
                    {performanceData.mainGroup!==undefined && _.isArray(performanceData[performanceData.mainGroup])?
                    performanceData[performanceData.mainGroup].map(v => {
                        return(
                            <MCInstrumentButton 
                                key = {v} 
                                title={v} 
                                performanceData = {performanceData.performanceData}
                                performanceConfig = {performanceData.performanceConfig}
                                mainGroup  = {performanceData.mainGroup}
                                metricColors = {performanceData.metricColors}
                                propertyGroups={_.filter(performanceData.groupDetails, groupCombo => groupCombo[performanceData.mainGroup] === v)}/>
                        ) 
                    }):null}
                    

                </div>
            
            </div>
            
        </div>
    )
}



function MCInstrumentButton (props) {
    const {title, propertyGroups, performanceData, mainGroup, performanceConfig, metricColors} = props
    const [isOpen, setIsOpen] = useState(false)
    const [timeFrame, setTimeFrame] = useState("Max")
    const [movingAveragePeriod, setAvgPeriod] = useState("6")
    const [selectedPage, setSelectedPage] = useState(Object.values(allowedPages)[0])
    //const [highlightItem, setHighlightItem] = useState(undefined)
    //const [hoverItem, setHoverItem] = useState(undefined)
    const [groupSelection, setGroupSelection] = useState(undefined)
    const [selectedRun, setSelectedRun] = useState({})
    const [yearOpen, setYearOpen] = useState({})

    useEffect (() => {
        if (_.isArray(propertyGroups) && propertyGroups.length > 0){
            let maxSizeGroup = _.sortBy(propertyGroups,"size")[0]
            setGroupSelection(maxSizeGroup.name)
        }
        
    },[propertyGroups])



    const performanceRunGroup = groupSelection!==undefined && propertyGroups !== undefined?propertyGroups.filter(v => v.name === groupSelection)[0]:[]
    const runs = performanceData!==undefined && _.isObject(performanceData) && groupSelection !== undefined && performanceRunGroup.key in performanceData? performanceData[performanceRunGroup.key] : []
    
    const mainGroupTotalRuns = _.flatten(Object.values(performanceData)).filter(v => v[mainGroup] === title)
    

    const groupRunsByYear = useMemo(
        () => {
            if (performanceData[performanceRunGroup.key]=== undefined) return {}
            if (performanceData[performanceRunGroup.key].length === 0) return {}
            return groupby(performanceData[performanceRunGroup.key], run => _.split(run.Date,"-")[0])
        },[performanceData, performanceRunGroup.key])
    
    
    useEffect(() => {
          
        let uniqueYears = Object.keys(groupRunsByYear)
        if (uniqueYears.length === 0) return 
        let yearOpenState = Object.fromEntries(uniqueYears.map((yearString, idx) => [yearString, idx === uniqueYears.length-1]))
        setYearOpen(yearOpenState)

    },[groupRunsByYear])

    return(
        <div >
            <motion.div 
                onClick = {() => setIsOpen(!isOpen)} 
                whileHover = {{
                    backgroundColor : "#f7f7f7",
                    scale: 1.01,
                    transition: { duration: 0.6, repeat : 1, repeatType: "reverse"},
                }}

                style={{
                    display:"flex",
                    flexDirection: "row",
                    alignItems : "center",
                    justifyContent: "space-between",
                    width:"100%",
                    height:"3rem",
                    backgroundColor:"#ffffff",
                    marginTop:"1rem",
                    marginBottom: "0.3rem"}}>

                <div className="submissonTitle" 
                        style={{
                            fontSize:"1.2rem",
                            marginLeft:"0.5rem",
                            fontWeight:"800",
                            color:"#2F5597",}}>
                <p>{title}</p>
                </div>
                <div>
                {!isOpen?
                <div className="submission-button-container">
                    {/* {instrumentMetrices.map((v,ii) => {
                        return(
                            <div key = {`${v.name}${ii}`}>
                            <MCAnimatedPercentage 
                                    perc={v.value} 
                                    metricName={v.name} 
                                    scale={false}
                                    showValue={false} 
                                    enableHover={false}
                                    backgroundCircleColor = {"#efefef"} 
                                    width={40} 
                                    height={40} 
                                    strokeWidth={4}
                                   />
                            <div style={
                                {fontSize:"0.7rem",
                                float:"right",
                                transform:"translateY(50%)"}}>
                                {v.name}
                            </div>
                            </div>
                        )
                    })} */}
                </div>:
                    <Icon icon="double-chevron-up"/>}
                </div>
                
            </motion.div >

            <Collapse isOpen={isOpen}>

                <div style= {{backgroundColor:"white",paddingLeft:"0.75rem", paddingRight:"0.75rem",paddingBottom:"1rem"}}>
                {mainGroupTotalRuns.length > 0?
                <div style={{fontSize:"0.7rem",padding:"1.4rem"}}>
                    <div style={{position:"absolute",top:0,right:0,width:"60%",paddingRight:"1rem"}}>
                        <div className="hor-aligned-center-div-sapce-between">

                            <Button minimal={true} fill={false} disabled={true}>Performance Group:</Button>
                    
                        <div>
                            {_.isArray(propertyGroups) && propertyGroups.length > 0?
                            <MCCombobox
                                placeholder = {groupSelection} 
                                items = {propertyGroups.map(v => v.name)} 
                                    callback={setGroupSelection}  
                                    selectFill = {true}
                                    buttonProps = {
                                                {
                                                    minimal : true,
                                                    small : false,
                                                    intent : "primary"
                                                }
                                        }/> : null }
                        </div>
                    </div>
                    <div style={{float:"right"}}>
                    <p>{Object.keys(performanceConfig).includes("Properties")?_.join(performanceConfig["Properties"], ", "):null} :: {runs.length} / {mainGroupTotalRuns.length} runs.</p>
                    </div>
                    </div>
                </div> : 
                    <div style={{fontSize:"0.7rem",backgroundColor:"white",padding:"1.4rem"}}>
                        <p>No performance run for this main group {title} found.</p>
                    </div>
                                
                }

                <div  className="hor-aligned-div" style={{backgroundColor:"#efefef",marginTop:"1rem"}}>
                    {Object.keys(allowedPages).map(v => {
                        return(
                            <div 
                                key = {v} 
                                style={{
                                    backgroundColor : selectedPage === v?"darkgrey":"#efefef",
                            }}>
                                <Button text={v} onClick={() => setSelectedPage(v)} minimal={true} />
                            </div>
                        )
                    })}
                </div>
                <MCPerformancePage 
                        pageType={selectedPage} 
                        movingAveragePeriod = {movingAveragePeriod}
                        setAvgPeriod = {setAvgPeriod}
                        timeFrame = {timeFrame} 
                        setTimeFrame = {setTimeFrame}
                        runs = {runs} 
                        performanceRunGroup  = {performanceRunGroup}
                        performanceConfig = {performanceConfig}
                        metricColors = {metricColors}
                        performanceData = {performanceData}
                        setSelectedRun = {setSelectedRun}
                        selectedRun = {selectedRun}
                        yearOpen = {yearOpen} 
                        setYearOpen = {setYearOpen}
                        groupRunsByYear = {groupRunsByYear}/>
            </div>
            </Collapse>
        </div>
    )
}


function MCPerformanceTitle (props) {
    const {title} = props
    return(
        <div className="submissonTitle" 
                        style={{
                            fontSize:"1.2rem",
                            marginLeft:"0.5rem",
                            fontWeight:"800"}}>
                <p>{title}</p>
        </div>
    )

}

MCPerformanceTitle.defaultProps = {
    title : "Tile"
}
