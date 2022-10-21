import { useEffect, useState } from "react"
import { Button, Collapse, H4, Icon} from "@blueprintjs/core"
import { motion } from "framer-motion"
import { MCAnimatedPercentage } from "../utils/components/MCSVGUtils"
import { MCPerformanceChart } from "./charts/MCPerformanceChart"
import { MCAddPerformanceDialog } from "../dialogs/MCAddPerformanceData"
import { MCHeader } from "../utils/components/MCHeader"
import { Link } from "react-router-dom"
import axios from "axios"

const instrumentMetrices = [{name:"Identified Peptides",value:0.5},{name:"MS/MS Identification",value:0.88},{name:"Proteins",value:0.94}]


export function MCPerformanceView(props){
    const {logoutAdmin, token } = props
    console.log(token)
    const [perfromanceDialog, setPerformanceDialog] = useState({isOpen:false})

    useEffect(() => {
        axios.get('/api/admin/performance', {params:{token:token}}).then(response => console.log(response))
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
            
            <div style={{width:"70vw"}}>
                <H4>Instruments</H4>
                
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
