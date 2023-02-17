import { Button, Collapse, H5 } from "@blueprintjs/core"
import axios from "axios"
import _ from "lodash"
import { useState } from "react"
import { MCCenteredP } from "../../utils/components/MCCenteredParagraph"
import { downloadSVGAsText } from "../../utils/Misc"
import { MCPTMProteinChart } from "./MCPTMProteinChart"


export function MCPTMItem (props) {
    const {pinned, handlePinnedChange, titleColumn, data, categoricalColumns, annotationColors, token, identifierColumn,  ...rest} = props
    const ID = rest[identifierColumn]
    const title = rest[titleColumn]
   
    const [chartIsOpen, setChartIsOpen] = useState(false)
    const [chartDetails,setChartData] = useState({
                isLoading : false, 
                chartData : {}, 
                itemHeight : 25, 
                marginBetweenAnnotations: 5,
                svgID:undefined,
                selectedAnnotationID : undefined,
                selectedAnnotationHeader : undefined
            })
    
    let svgID = `${title}${ID}`

    const loadChartData = () => {
        //load data from API
        setChartData(prevValues => {return { ...prevValues,"isLoading" : true}})
        axios.get("/api/ptm", {
            params:
            {
                token: token,
                featureID: ID
            }
            
            }).then(response => {
                if (response.data["success"]){
                    //console.log(response.data)
                    setChartData(prevValues => {
                            return {...prevValues,"isLoading" : false, length : response.data.length, chartData: response.data,"svgID" : svgID}})
                }
                else {

                    setChartData(prevValues => {return { ...prevValues,"isLoading" : false}})
                }
        })
    }

    const handleOpen = (e) => {
        // load data if none available otherwise just open.
        if (chartIsOpen) setChartIsOpen(false)
        else if (!chartIsOpen) {
            if (Object.keys(chartDetails.chartData).length === 0){
                // if no data loaded -> call api
                loadChartData()
                setChartIsOpen(true)
            }
            else {
                setChartIsOpen(true)
            }
        }
    }

    const saveSVG = (e) => {
        //save graph to SVG file. 
        if (chartDetails.svgID === undefined) return 
        downloadSVGAsText(document.getElementById(`${chartDetails.svgID}`),`MitoCubePTMView${title}.svg`)
    }

    const getSVGHeight = () => {
        //returns the height in px of the svg (depends on the number of ptm peptides)
        if (chartDetails.isLoading) return 20
        let chartData = chartDetails.chartData
        if (chartDetails.chartData.annotations === undefined) return 20
        let proteinAnnotations = Object.keys(chartDetails.chartData.annotations)
        if (proteinAnnotations.length === 0) return 20
        let svgHeight = _.sum(proteinAnnotations.map(annotationName => chartData.annotations[annotationName].totalLength * chartDetails.itemHeight + chartDetails.marginBetweenAnnotations))
        
        return svgHeight + 40 //marings
    }

    const handleOnAnnotationClick = (e,itemID,header) => {
        setChartData(prevValues => {return {
            ...prevValues,
            "selectedAnnotationID":itemID,
            "selectedAnnotationHeader":header}
        })
    }
    //let ptmNames = Object.keys(data)
   
    const getNumberAnnotations = () => {
        // calculates the number of annotations to be displayed in the header.
        if (chartDetails.isLoading) return {}
        if (chartDetails.chartData.annotations === undefined) return {}
        let proteinAnnotations = Object.keys(chartDetails.chartData.annotations)
        return Object.fromEntries(proteinAnnotations.map(annotationHeader => [annotationHeader,chartDetails.chartData.annotations[annotationHeader]["n"]]))
    }

    const pinnedClicked = (e) => {
        // stop propagation to prevent opening
        e.stopPropagation()
        handlePinnedChange(ID)
    }   


    let annotationStatistic = getNumberAnnotations()

    return(
        <div className="ptm-item" onClick = {chartIsOpen?undefined:handleOpen}>
            <div className="hor-aligned-div">
                
                <Button 
                    minimal={true} 
                    icon={pinned?"tick-circle":"pin"} 
                    intent={pinned?"primary":"none"} 
                    onClick={pinnedClicked}/>
                <MCCenteredP text = {`${ID}`}/>
                <MCCenteredP text = {title}/>
                
                {categoricalColumns.map(categoricalColumn => <MCCenteredP key={categoricalColumn} text={rest[categoricalColumn]}/>)}
                
                {chartIsOpen?<Button 
                    onClick={handleOpen} 
                    rightIcon={"minimize"}
                    minimal={true} 
                    intent={"danger"}/>:null}
            </div>
           
            <Collapse isOpen={chartIsOpen} >
                <div className="hor-aligned-div">
                {_.isObject(annotationStatistic)?
                    Object.keys(annotationStatistic).map(annotationHeader => {
                        return(
                            <MCCenteredP
                                    key={annotationHeader}
                                    text={`${annotationHeader} : ${annotationStatistic[annotationHeader]}`} />
                            )
                    })
                    :
                    null}
                <div>
                    <Button text="" onClick={saveSVG} icon="floppy-disk" minimal={true} intent="primary"/>
                </div>
                </div>
                <div style={{height:`${getSVGHeight()}px`}}>
                <MCPTMProteinChart 
                    {...chartDetails}
                    annotationColors={annotationColors} 
                    handleOnAnnotationClick = {handleOnAnnotationClick}/>
                </div>

                <H5>Peptide Details</H5>
                <div>
                    <p>The peptide was identified as significantly regulated in {2} datasets which are summarized below.</p>
                    {chartDetails.selectedAnnotationID}
                    {chartDetails.selectedAnnotationHeader}
                </div>
            </Collapse> 
            
           

        </div>
    )
}


MCPTMItem.defaultProps = {
    pinned : false
}