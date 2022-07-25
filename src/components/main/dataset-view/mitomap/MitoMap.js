import { Button } from "@blueprintjs/core";
import { Text } from "@visx/text";
import axios from "axios";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { MCCSVDownload } from "../../../utils/components/MCCSVDownload";
import { MCAnimatedPercentage } from "../../../utils/components/MCSVGUtils";
import { MCDoubleMembrane, MCPathwayItems, MCSVGBackgroundGradient } from "./utils";


export function MCMitoMap(props) {

    const {token, dataID} = props
    const [mitomapPathways, setMitomap] = useState({main:{},second:{},pathwayIDMatch:{}})
    const [pathwayDetails, setPathwayDetails] = useState({title:undefined,items:[],metricName:""})

    useEffect(() => {
       
        axios.get('/api/data/mitomap', {params:{dataID:dataID,token:token,}}).then(response => {
            //console.log(response.data.data)
                setMitomap({
                        main:response.data.data.pathwaySignificantIDs,
                        second:response.data.data.secondPathwaySignificantIDs,
                        pathwayIDMatch : response.data.data.pathwayIDMatch
                    })
           
            }
        )
      }, [token,dataID]);

    const handleClickOnPathway = (metricName) => {

        
        const matchedPathways = Object.keys(mitomapPathways.pathwayIDMatch).filter(v => v.endsWith(metricName))
        if (matchedPathways.length > 0){
            const pathwayName = matchedPathways[0]
            const pathwayItems = mitomapPathways.pathwayIDMatch[pathwayName]
            setPathwayDetails({title:pathwayName,items:pathwayItems,metricName:metricName})
        }
        
    }

    return(
        <div style={{paddingLeft:"3rem",paddingTop:"2rem"}}>

            {pathwayDetails.items.length!==0?
                    <div className="mitomap-extra-view">
                        <div style={{position:"relative"}}>
                                <div style={{position:"absolute",right:0,top:0,display:"flex",maxHeight:"30px"}}>
                                <MCCSVDownload data = {pathwayDetails.items} fileName = {`MitoMap(${dataID}-${pathwayDetails.title}).csv`} primary={false} buttonMargin={false}/>
                                <Button text="" onClick={e => setPathwayDetails({title:undefined,items:[]})} minimal={true} icon="cross" />
                                </div>
                            <div style={{paddingRight:"3.2rem"}}>
                            <p>{pathwayDetails.title}</p>
                            </div>
                            <div className="mitomap-item-container">
                            {pathwayDetails.items.map(v => 
                                <motion.div whileHover={{scale:1.05}} key={v.name} className={v.sig?"mitomap-item-sig":"mitomap-item"}>
                                    {v.name}{` (${v.idx})`}
                                </motion.div>)}

                            
                            </div>
                        </div>
                    </div>
                    :
                null}

            <p>Overview of regulations of the MitoCarta pathways. The value presents the percentage of proteins of the pathway that was found to be significantly changed. A value of 100 indicates that all proteins are significantly changed of the specific pathway. In the future you will be able to select the circles to view the underyling proteins and direction.</p>
            {
            Object.keys(mitomapPathways.main).map(topPath => {
                const mitopathway = mitomapPathways.main[topPath]
                
                return(
                    <div style={{coloar:"red"}}>
                    <h4>{topPath}</h4>
                    {mitopathway.map(pathwayData => {
                        const {frac, name, N, N_sig} = pathwayData
                        return(
                            <MCAnimatedPercentage key={name} perc = {frac} extraText = {`${N_sig}/${N}`} metricName = {name} clicked = {pathwayDetails.metricName === name} fontSizeMetric={9} width={95} height={110} handleClick = {handleClickOnPathway}/>
                        )
                    })}

                    {
                        topPath in mitomapPathways.second?
                        Object.keys(mitomapPathways.second[topPath]).map(secondHeaderData => {
                           
                            return(
                                <div style={{paddingLeft:"100px"}} key={secondHeaderData}>
                                    <p>{secondHeaderData}</p>
                                {mitomapPathways.second[topPath][secondHeaderData].map(pathwayData => {
                                    const {frac, name, N, N_sig} = pathwayData
                                    return(
                                        <MCAnimatedPercentage wd
                                            key={name} 
                                            clicked = {pathwayDetails.metricName === name}
                                            extraText = {`${N_sig}/${N}`}
                                            perc = {frac} 
                                            metricName = {name} 
                                            fontSizeMetric={9} 
                                            width={95} 
                                            height={110} 
                                            handleClick = {handleClickOnPathway}/>
                                    )
                                })}
                                </div>
                            )
                        })
                        :null
                    }

                    </div>
                )
            })
        }
        </div>
    )
}














const pathway = {

    "COQ" : [
        {
            "cx"    : 0.2,
            "cy"    : 1,
            "rx"    : 21,
            "ry"    : 21,
            "name": "Coq1"    
        },
        {
            "cx"    : 0.3,
            "cy"    : 0.6,
            "rx"    : 21,
            "ry"    : 21,
            "name": "Coq2",
            "extra" : "4-hydroxybenzoate polyprenyltransferase, mitochondrial"  
        },
        {
            "cx"    : 0.4,
            "cy"    : 0.9,
            "rx"    : 21,
            "ry"    : 21,
            "name": "Coq6",
            "extra" : "Ubiquinone biosynthesis monooxygenase COQ6, mitochondrial"   
        },
        {
            "cx"    : 0.465,
            "cy"    : 0.8,
            "rx"    : 17,
            "ry"    : 17,
            "name": "Coq3"    
        },
        {
            "cx"    : 0.53,
            "cy"    : 0.85,
            "rx"    : 17,
            "ry"    : 17,
            "name": "5"    
        },
        {
            "cx"    : 0.635,
            "cy"    : 0.9,
            "rx"    : 18,
            "ry"    : 18,
            "name": "4"    
        },
        {
            "cx"    : 0.58,
            "cy"    : 0.85,
            "rx"    : 12,
            "ry"    : 12,
            "name": "7"    
        },
        {
            "cx"    : 0.60,
            "cy"    : 1.50,
            "rx"    : 14,
            "ry"    : 14,
            "name": "9"    
        },


        {
            "cx"    : 0.75,
            "cy"    : 1,
            "rx"    : 21,
            "ry"    : 21,
            "name": "Coq8a"    
        },

        {
            "cx"    : 0.825,
            "cy"    : 1.5,
            "rx"    : 21,
            "ry"    : 21,
            "name": "Coq8b"    
        }

    ]

}

export function MCMitoMapSVG(props){
    const {width, height, margin} = props
    const [selectedItems, setSelectedItems] = useState([])
    const [mouseOverItems, setMouseOverItems] = useState([])

    const handleMouseSelection = (itemID) => {
        setSelectedItems([itemID])
    }


    const handleHoverStart = (itemID) => {
        setMouseOverItems([itemID])
    }

    const getHoverInformation = () => {
        const extraInfo = pathway["COQ"].filter(v => mouseOverItems.includes(v.name))
        if (extraInfo.length === 0) return ""
        return extraInfo[0].extra
    }


    return(
        <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
            <rect x = {0} y={0} width={width} height={height} stroke={"black"} fill={"white"}/>

            <rect x = {5} y={5} width={width-margin} height={height*0.33} fill={"#F5F5F5"}/>
            <MCSVGBackgroundGradient x0={5} y0={height*0.33+38} width={width-margin} height={80} />
            <MCDoubleMembrane x0 = {5} y0={height*0.33} width = {width-margin} />
            <MCPathwayItems 
                    x0 = {5} 
                    y0={height*0.33} 
                    height = {30} 
                    width={width} 
                    pathwayItems = {pathway}
                    selectedItems = {selectedItems} 
                    setItemSelection={handleMouseSelection}
                    setItemHover = {handleHoverStart}
                />
            <Text x = {10} y={10} verticalAnchor={"start"}>COQ Biosynthesis</Text>
            <Text x = {10}  y = {height-margin} verticalAnchor="end" textAnchor="start">{getHoverInformation(mouseOverItems)}</Text>
        </svg>
    )
}

MCMitoMapSVG.defaultProps = {
    width : 700,
    height : 200,
    margin : 10
}