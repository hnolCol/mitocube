import { useState } from "react"
import { motion } from "framer-motion";


const defaultArea = {fill:"#DEDEDE",stroke:"#000000",strokeWidth:0.4,strokeMiterlimit:10}
const highlightArea = {fill:"#6e5b7b",stroke:"#000000",strokeWidth:0.4,strokeMiterlimit:10}
const defaultTableCell = {fill:"#FFFFFF",stroke:"#000000",strokeWidth:0.3,strokeMiterlimit:10}
const lineStyle = {fill:"none",stroke:"#000000",strokeWidth:0.4,strokeMiterlimit:10}
export const MCProteinSearchIcon = (props) => {
    const [mouseIn, setMouseIn] = useState(false)
    const handleMouseEnter = (e) => {

        setMouseIn(true)

    } 
    return(
        <div style={{width:"100%"}}>
                <motion.svg
                    width={"200px"}
                    viewBox={"0 0 114 100"}
                    xmlns="http://www.w3.org/2000/svg"
                    xmlnsXlink="http://www.w3.org/1999/xlink"
                    onMouseEnter={handleMouseEnter} onMouseLeave = {e => setMouseIn(false)}
                >
                    <g >
                
                
                <path style={{fill:"transparent",stroke:"#000000",strokeWidth:0.3,strokeMiterlimit:10}} d="M98.6,88.3H15.7c-2.1,0-3.7-1.7-3.7-3.7V15.4
                        c0-2.1,1.7-3.7,3.7-3.7h82.9c2.1,0,3.7,1.7,3.7,3.7v69.2C102.3,86.6,100.7,88.3,98.6,88.3z"/>
                 
                
                    <rect x={0} y = {0} width={114} height={100} fill={"transparent"} strokeWidth={0} opacity={mouseIn?0.1:1}/>
                    <path style={defaultArea} opacity={mouseIn?0.1:1} d="M35.9,22.4h-10c-1.7,0-3.1-1.4-3.1-3.1v-2.3
                        c0-1.7,1.4-3.1,3.1-3.1h10c1.7,0,3.1,1.4,3.1,3.1v2.3C39,21,37.6,22.4,35.9,22.4z"/>
                    <polygon style={defaultArea}opacity={mouseIn?0.1:1} points="35.9,51.8 27.3,51.8 23.1,59.1 
                        27.3,66.5 35.9,66.5 40.1,59.1"/>
                    <path style={defaultArea}opacity={mouseIn?0.1:1} d="M89.1,63.4h-10c-1.7,0-3.1-1.4-3.1-3.1v-2.3
                        c0-1.7,1.4-3.1,3.1-3.1h10c1.7,0,3.1,1.4,3.1,3.1v2.3C92.2,62,90.8,63.4,89.1,63.4z"/>
                    <line style={lineStyle}opacity={mouseIn?0.1:1} x1="31.3" y1="28" x2="31.3" y2="46"/>
                    <line style={lineStyle}opacity={mouseIn?0.1:1} x1="70.8" y1="58.9" x2="44.8" y2="58.9"/>
                    <line style={lineStyle} opacity={mouseIn?0.1:1}x1="48.3" y1="28" x2="66.3" y2="46"/>
                    <polygon style={defaultArea}opacity={mouseIn?0.1:1} points="87.3,12.1 80.7,12.1 77.4,17.9 
                        80.7,23.6 87.3,23.6 90.7,17.9 	"/>
                    <line style={lineStyle} opacity={mouseIn?0.1:1}x1="70.8" y1="17.9" x2="44.8" y2="17.9"/>
                    <line style={lineStyle} opacity={mouseIn?0.1:1}x1="84.3" y1="46" x2="84.3" y2="28"/>
                
                
                <motion.g fill="#DEDEDE" 
                        strokeWidth={0.3} 
                        stroke="black" 
                        whileHover={{ stroke:"black", fill:"#6e5b7b", transitionDelay:0.1, scale:2, translateX:"55px", translateY:"55px"}} 
                        transition={ {duration: 0.5} }>
                     <motion.rect x={0} y = {0} width={114} height={100} fill={"transparent"} strokeWidth={0}/>
                     <motion.path d="M35.9,22.4h-10c-1.7,0-3.1-1.4-3.1-3.1v-2.3
                        c0-1.7,1.4-3.1,3.1-3.1h10c1.7,0,3.1,1.4,3.1,3.1v2.3C39,21,37.6,22.4,35.9,22.4z"/>
                 </motion.g>
                </g>
                <text x="23" y="80" style={{fontSize:"0.65rem"}}>Protein Centric</text>
                </motion.svg>
               
        </div>
    )
}



export const MCDatasetSearchIcon = (props) => {
    
    return(
        <div style={{width:"100%"}}>
                <svg
                    width={"200px"}
                    viewBox={"0 0 114 100"}
                    xmlns="http://www.w3.org/2000/svg"
                    xmlnsXlink="http://www.w3.org/1999/xlink"
                >
                <g>
                    <path style={{fill:"#F6F6F6",stroke:"#000000",strokeWidth:0.3,strokeMiterlimit:10}} d="M98.6,88.3H15.7c-2.1,0-3.7-1.7-3.7-3.7V15.4
                        c0-2.1,1.7-3.7,3.7-3.7h82.9c2.1,0,3.7,1.7,3.7,3.7v69.2C102.3,86.6,100.7,88.3,98.6,88.3z"/>
                    <text x="19" y="80"  style={{fontSize:"0.65rem"}}>Specific Dataset</text>
                    <g>
                        
                            <rect x="34.3" y="24.6" style={defaultTableCell} width="45.6" height="38.7"/>
                        <line style={defaultTableCell} x1="34.3" y1="34.3" x2="80" y2="34.3"/>
                        <line style={defaultTableCell} x1="34.3" y1="36.9" x2="80" y2="36.9"/>
                        <line style={defaultTableCell} x1="34.3" y1="39.6" x2="80" y2="39.6"/>
                        <line style={defaultTableCell} x1="34.3" y1="42.2" x2="80" y2="42.2"/>
                        <line style={defaultTableCell} x1="34.3" y1="44.9" x2="80" y2="44.9"/>
                        <line style={defaultTableCell} x1="34.3" y1="47.5" x2="80" y2="47.5"/>
                        <line style={defaultTableCell} x1="34.3" y1="50.2" x2="80" y2="50.2"/>
                        <line style={defaultTableCell} x1="34.3" y1="52.8" x2="80" y2="52.8"/>
                        <line style={defaultTableCell} x1="34.3" y1="55.5" x2="80" y2="55.5"/>
                        <line style={defaultTableCell} x1="34.3" y1="58.1" x2="80" y2="58.1"/>
                        <line style={defaultTableCell} x1="34.3" y1="60.8" x2="80" y2="60.8"/>
                        <line style={defaultTableCell} x1="34.3" y1="63.4" x2="80" y2="63.4"/>
                        <line style={defaultTableCell} x1="80" y1="24.7" x2="80" y2="63.1"/>
                        <rect x="34.3" y="24.7" style={{fill:"#D2BE8D",stroke:"#000000",strokeWidth:0.3,strokeMiterlimit:10}} width="45.6" height="6.9"/>
                        <line style={{fill:"none",stroke:"#000000",strokeWidth:0.3,strokeMiterlimit:10}} x1="34.3" y1="31.6" x2="80" y2="31.6"/>
                        <line style={defaultTableCell} x1="72.5" y1="24.7" x2="72.5" y2="63.1"/>
                        <line style={defaultTableCell} x1="64.9" y1="24.7" x2="64.9" y2="63.1"/>
                        <line style={defaultTableCell} x1="57.4" y1="24.7" x2="57.4" y2="63.1"/>
                        <line style={defaultTableCell} x1="49.9" y1="24.7" x2="49.9" y2="63.1"/>
                        <line style={defaultTableCell} x1="42.4" y1="24.7" x2="42.4" y2="63.1"/>
                    </g>
                </g>
                </svg>
               
        </div>
    )
}
