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
                
                
                <path style={{fill:"#F6F6F6",stroke:"#000000",strokeWidth:0.3,strokeMiterlimit:10}} d="M98.6,88.3H15.7c-2.1,0-3.7-1.7-3.7-3.7V15.4
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



export const MCSubmissionIcon = (props) => {
    const [mouseIn, setMouseIn] = useState(false)


    const opacityValue = mouseIn?0.35:0.85
    return(
        <div style={{width:"100%"}}>
                <motion.svg
                    width={"200px"}
                    viewBox={"0 0 114 100"}
                    xmlns="http://www.w3.org/2000/svg"
                    xmlnsXlink="http://www.w3.org/1999/xlink"
                    onMouseEnter={e => setMouseIn(true)} onMouseLeave = {e => setMouseIn(false)}
                >
                <path style={{fill:"#F6F6F6",stroke:"#000000",strokeWidth:0.3,strokeMiterlimit:10}} d="M98.6,88.3H15.7c-2.1,0-3.7-1.7-3.7-3.7V15.4
                        c0-2.1,1.7-3.7,3.7-3.7h82.9c2.1,0,3.7,1.7,3.7,3.7v69.2C102.3,86.6,100.7,88.3,98.6,88.3z"/>
                <g style={{transform:"translate(5px,8px)"}}>
                    <path style={{fill:"#267886"}} d="M27.3,34.8c0,0-2.1,1.6-3.1,0.6c-0.7-0.7-1.9-1-2.9,0c-0.9,0.9-2.6,0.4-2.9,0c-1-1-1.7-0.6-1.7-0.6
                        v11.9c0,0,0,0.2,0,0.3c0,2.2,2.4,3.9,5.4,3.9s5.4-1.7,5.4-3.9c0-0.1,0-0.3,0-0.3V34.8H27.3z" opacity={opacityValue}/>
                    <path style={{fill:"#267886",stroke:"black",strokeWidth:0.2,strokeMiterlimit:10}} d="M28.3,25.7H15.7c-0.9,0-1.7-0.7-1.7-1.7v-0.2
                    c0-0.9,0.7-1.7,1.7-1.7h12.7c0.9,0,1.7,0.7,1.7,1.7v0.2C30,25,29.3,25.7,28.3,25.7z" opacity={opacityValue}/>
                    <path style={{fill:"none",stroke:"black",strokeWidth:0.2,strokeMiterlimit:10}} d="M27.2,25.7H16.5v21l0,0c0,0,0,0.2,0,0.3
                        c0,2.2,2.4,3.9,5.4,3.9s5.4-1.7,5.4-3.9c0-0.1,0-0.3,0-0.3l0,0V25.7z" opacity={opacityValue}/>
                    <rect x="16.5" y="17.7" style={{fill:"#174F54",stroke:"black",strokeWidth:0.2,strokeMiterlimit:10}} width="11" height="4.5" opacity={opacityValue}/>
                    
                </g>
                
                

                <g style={{transform:"translate(5px,8px)"}}>
                    <path style={{fill:"#615C7C"}} d="M49.3,41.2l-0.1,5.3c0,0,0,0.2,0,0.3c0,2.2-2.4,4-5.3,4s-5.4-1.7-5.4-3.9c0-0.1,0-0.3,0-0.3v-7.3
		                c0,0,0.3-1,2.2,0c0.4,0.2,2,0.9,2.9,0c1-1,2.1-0.8,2.9,0l2.8,1" opacity={opacityValue}/>
                    <path style={{fill:"#615C7C",stroke:"black",strokeWidth:0.2,strokeMiterlimit:10}} d="M50.3,25.5H37.7c-0.9,0-1.7-0.7-1.7-1.7v-0.2
                        c0-0.9,0.7-1.7,1.7-1.7h12.7c0.9,0,1.7,0.7,1.7,1.7v0.2C52,24.7,51.3,25.5,50.3,25.5z" opacity={opacityValue}/>
                    <path style={{fill:"none",stroke:"black",strokeWidth:0.2,strokeMiterlimit:10}} d="M49.2,25.5H38.5v21l0,0c0,0,0,0.2,0,0.3
                        c0,2.2,2.4,3.9,5.4,3.9s5.4-1.7,5.4-3.9c0-0.1,0-0.3,0-0.3l0,0V25.5z" opacity={opacityValue}/>
                    <rect x="38.5" y="17.5" style={{fill:"#6F487C",stroke:"black",strokeWidth:0.2,strokeMiterlimit:10}} width="11" height="4.5" opacity={opacityValue}/>
                </g>

     
                <motion.g fill="#DEDEDE" 
                        strokeWidth={0.3} 
                        stroke="black" 
                        whileHover={{ stroke:"black", fill:"#6e5b7b", transitionDelay:0.1, scale:1.2, translateX:`${114/2-79}px`, translateY:`${100/2-(35+8)}px`}} 
                        transition={ {duration: 0.5} }>
                <motion.circle cx = {79.1} cy={35+8} r = {12} fill={"#efefef"} strokeWidth={0.4} stroke="black" />
                <g style={{transform:"translateY(8px)"}}>
                    <line style={{fill:"none",stroke:"black",strokeMiterlimit:10}} x1="79.1" y1="24.5" x2="79.1" y2="45.5" strokeWidth={mouseIn?0.55:0.4}/>
                    <line style={{fill:"none",stroke:"black",strokeMiterlimit:10}} x1="89.6" y1="35" x2="68.6" y2="35" strokeWidth={mouseIn?0.55:0.4}/>
                </g>
                <motion.rect x={0} y = {0} width={114} height={100} fill={"transparent"} strokeWidth={0}/>
                </motion.g>

                <text x="32" y="80" style={{fontSize:"0.65rem"}}>Submission</text>
                </motion.svg>
               
        </div>
    )
}


export const MCAdministrationIcon = (props) => {
    const [mouseIn, setMouseIn] = useState(false)

    const opacityValue = mouseIn?0.35:0.85
    return(
        <div style={{width:"100%"}}>
                <motion.svg
                    width={"200px"}
                    viewBox={"0 0 114 100"}
                    xmlns="http://www.w3.org/2000/svg"
                    xmlnsXlink="http://www.w3.org/1999/xlink"
                    onMouseEnter={e => setMouseIn(true)} onMouseLeave = {e => setMouseIn(false)}
                >

                <path style={{fill:"#F6F6F6"}} d="M98.7,90.9h-83c-2,0-3.7-1.6-3.7-3.7V17.9
                    c0-2,1.6-3.7,3.7-3.7h83c2,0,3.7,1.6,3.7,3.7v69.2C102.3,89.2,100.8,90.9,98.7,90.9z" stroke="black"  strokeWidth={0.3}/>
                <motion.g 
                    animate={mouseIn?{ rotate: 360 }:null}
                    transition={mouseIn?{ ease: "linear", duration: 4, repeat: Infinity,repeatType: "mirror"}:null}>

                    <path style={{fill:"#FF5A2A"}} stroke="black" strokeWidth={0.3} d="M75.8,41.6c-0.4-3.1-1.7-6-3.6-8.4l2.9-3.7
                        L74,28.4l-1.4-1.4l-3.8,3c-2.3-1.6-4.9-2.7-7.8-3.1l-0.5-3.9h-1.6h-2l-0.5,3.9c-3.4,0.5-6.5,1.9-9,4L43.7,28l-1.2,1.2l-1.4,1.4
                        l3,3.8c-1.4,2.1-2.4,4.6-2.7,7.2l-4.5,0.6v1.6v2l4.5,0.6c0.4,3.2,1.7,6,3.6,8.4L42,58.6l1.2,1.2l1.4,1.4l3.8-3
                        c2.2,1.6,4.9,2.7,7.7,3.1l0.6,4.5h1.6h2l0.6-4.5c2.9-0.4,5.7-1.5,7.9-3.2l3.9,3.1L74,60l1.4-1.4l-3-3.9c1.8-2.3,3-5.1,3.4-8.1
                        l4.8-0.6v-1.6v-2L75.8,41.6z M58.7,57.6c-7.3,0-13.2-5.9-13.2-13.2s5.9-13.2,13.2-13.2s13.2,5.9,13.2,13.2S66,57.6,58.7,57.6z"/>
                    <circle style={{fill:"#D6D6D6"}} stroke="black" strokeWidth={0.3} cx="58.7" cy="44.4" r="7.6"/>
                </motion.g>
                
                <text x = "25" y="80" style={{fontSize:"0.65rem"}}>Administration</text>
                
                </motion.svg>
               
        </div>
    )
}







