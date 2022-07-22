import { Button, Collapse, Icon } from "@blueprintjs/core"
import { useState } from "react"
import { Link } from "react-router-dom"
import { motion } from "framer-motion"
import { MCAnimatedPercentage } from "../utils/components/MCSVGUtils"
import { MCPerformanceChart } from "./charts/MCPerformanceChart"

const instruments = ["QExactive 1","QExactive 2"]

const instrumentMetrices = [{name:"Identified Peptides",value:0.5},{name:"MS/MS Identification",value:0.88},{name:"Proteins",value:0.94}]


export function MCSumissionView(props){

    return (
        <div style={{width:"100vw"}}> 
            <Button text="Add performance test" intent="primary" icon="add"/>
            <div style={{width:"70vw",marginLeft:"15vw"}}>
            {instruments.map((v,ii) => <MCInstrumentButton key = {v} title={v}/>)}
            </div>
            
        </div>
    )
}




function MCInstrumentButton (props) {
    const {title} = props
    const [isOpen, setIsOpen] = useState(false)
    const [highlightItem, setHighlightItem] = useState(undefined)
    const [hoverItem, setHoverItem] = useState(undefined)

    const handleButtonClick = () => {
        setIsOpen(!isOpen)
    }

    const handleMetricCircleClick = (metricName) => {
        
        if (highlightItem === metricName) setHighlightItem(undefined)
        
        else{
            setHighlightItem(metricName)
        }
        
    }

    const handleHoverItem = (metricName) => {
        
        if (highlightItem !== metricName)
            {
                setHoverItem(metricName)
            }
    }
    

    return(
        <div >
            <motion.div 
                onClick = {handleButtonClick} 
                whileHover = {{
                    backgroundColor : "#f7f7f7",
                    scale: 1.01
                    
                }}
                style={{
                    display:"flex",
                    flexDirection: "row",
                    alignItems : "center",
                    justifyContent: "space-between",
                    width:"100%",
                    height:"auto",
                    backgroundColor:"#ffffff",
                    marginTop:"1rem"}}>

                <div className="submissonTitle" 
                        style={{
                            fontSize:"1.2rem",
                            marginLeft:"0.5rem",
                            fontWeight:"800"}}>
                <p>{title}</p>
                </div>
                <div>
                {!isOpen?
                <div className="submission-button-container">
                    {instrumentMetrices.map((v,ii) => {
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
                    })}
                    
                  
                </div>:
                    <Icon icon="double-chevron-up"/>}
                </div>
                
            </motion.div >


            <Collapse isOpen={isOpen}>
                <div style={{fontSize:"0.7rem"}}>
                <MCPerformanceTitle title="Recent performance"/>

                    <MCAnimatedPercentage perc={0.89} metricName={"Peptides"}  handleClick = {handleMetricCircleClick} handleHover = {handleHoverItem}/>
                    <MCAnimatedPercentage perc={0.3}/>
                    <MCAnimatedPercentage perc={0.2} metricName={"MS/MS Identification"}  handleClick = {handleMetricCircleClick} handleHover = {handleHoverItem}/>
                    <MCAnimatedPercentage perc={0.6}/>
                <MCPerformanceTitle title="Diagnostics"/>
                <p>Select metrices to display for diagnostics</p>
                <p>Image</p>
                <MCPerformanceTitle title="Performance History"/>
                <p>Main performance metrices</p>
                <p>Time vs peptides</p>
                    <MCPerformanceChart highlightItem = {highlightItem} hoverItem = {hoverItem}/>
                <hr></hr>
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

   
