import { useState } from "react"
import { motion } from "framer-motion";


const defaultArea = {fill:"#DEDEDE",stroke:"#000000",strokeWidth:0.4,strokeMiterlimit:10}
//const highlightArea = {fill:"#6e5b7b",stroke:"#000000",strokeWidth:0.4,strokeMiterlimit:10}
const defaultTableCell = {fill:"#FFFFFF",stroke:"#000000",strokeWidth:0.3,strokeMiterlimit:10}
const lineStyle = {fill:"none",stroke:"#000000",strokeWidth:0.4,strokeMiterlimit:10}


export function MCSubmissionIconDash(props) {
    const {mouseIn, setMouseIn} = props
    

    const st0Style = {fill : mouseIn?"#D03900":"#2F5598"}
    const st1Style = {fill: "none", stroke: "#020203", strokeWidth: 0.2, strokeMiterlimit: 10}
    const st2Style = {fill: "#D4D4D4", stroke: "#000000", strokeWidth: 0.2, strokeMiterlimit: 10}
    const st3Style = {fill : "#277886"}
    return (
        
        <motion.svg
            width={"32px"}
            height={"32px"}
            viewBox={"0 0 32 32"}
            xmlns="http://www.w3.org/2000/svg"
            xmlnsXlink="http://www.w3.org/1999/xlink"
            >
        
            <g>
                
            <g>
                    <path
                        className="icon-transition"
                        style={st0Style}
                        d="M12.2,16.4c0,0-1.6,1.2-2.3,0.4c-0.5-0.5-1.4-0.7-2.2,0c-0.7,0.7-1.9,0.3-2.2,0c-0.7-0.7-1.3-0.4-1.3-0.4v8.9
                    c0,0,0,0.1,0,0.2c0,1.6,1.8,2.9,4,2.9s4-1.3,4-2.9c0-0.1,0-0.2,0-0.2v-8.9H12.2z"/>
            </g>
            <path style={st1Style} d="M12.3,9.6h-8v15.6l0,0c0,0,0,0.1,0,0.2c0,1.6,1.8,2.9,4,2.9s4-1.3,4-2.9c0-0.1,0-0.2,0-0.2l0,0L12.3,9.6
                L12.3,9.6z"/>
                <rect x="4.9" y="3.7" style={st2Style} width="6.9" height="3.3"/>
            <g>
                <path style={st0Style} className="icon-transition" d="M27.7,21.2l-0.1,3.9c0,0,0,0.1,0,0.2c0,1.6-1.8,3-3.9,3s-4-1.3-4-2.9c0-0.1,0-0.2,0-0.2v-5.4
                    c0,0,0.2-0.7,1.6,0c0.3,0.1,1.5,0.7,2.2,0c0.7-0.7,1.6-0.6,2.2,0l2.1,0.7"/>
            </g>
            <g>
                <path style={st1Style} d="M27.6,9.5h-8v15.6l0,0c0,0,0,0.1,0,0.2c0,1.6,1.8,2.9,4,2.9s4-1.3,4-2.9c0-0.1,0-0.2,0-0.2l0,0L27.6,9.5
                    L27.6,9.5z"/>
                    <rect x="20.3" y="3.7" style={st2Style} width="6.9" height="3.3"/>
                <path style={st2Style} d="M28.3,9.5H19c-0.7,0-1.3-0.5-1.3-1.3V8.1c0-0.7,0.5-1.3,1.3-1.3h9.5c0.7,0,1.3,0.5,1.3,1.3v0.1
                    C29.6,8.9,29.1,9.5,28.3,9.5z"/>
            </g>
            <path style={st3Style} d="M23.8,20.4"/>
                <path style={st2Style} d="M13,9.6H3.6c-0.7,0-1.3-0.5-1.3-1.3V8.2C2.3,7.6,2.8,7,3.6,7H13c0.7,0,1.3,0.5,1.3,1.3v0.1
                C14.2,9.1,13.7,9.6,13,9.6z"/>
        </g>
            
        </motion.svg>
    )
}



export function MCDatasetDashIcon(){


    const st0Style = {fill:"none",stroke:"#000000",strokeWidth:0.5,strokeMiterlimit:10}
	const st1Style ={fill:"#B7B6B6",stroke:"#000000",strokeWidth:0.5,strokeMiterlimit:10} //#2F5598
    const st2Style = { fill: "#E3E3E3", stroke: "#000000", strokeWidth: 0.8, strokeMiterlimit: 10 }
        
    
    return (
        
        <svg
            width={"32px"}
            height={"32px"}
            viewBox={"0 0 32 32"}
            xmlns="http://www.w3.org/2000/svg"
            xmlnsXlink="http://www.w3.org/1999/xlink"
        >
            <g>
            <line style={{...st0Style}} x1="4.4" y1="7.8" x2="27.7" y2="7.8"/>
            <line style={{...st0Style}} x1="4.4" y1="4.1" x2="4.4" y2="28"/>
            <line style={{...st0Style}} x1="27.7" y1="4.1" x2="27.7" y2="28"/>
            <path style={{...st0Style}} d="M27.7,11.4"/>
            <path style={{...st0Style}} d="M4.4,11.4"/>
            <path style={{...st0Style}} d="M27.7,14.9"/>
            <path style={{...st0Style}} d="M4.4,14.9"/>
            <path style={{...st0Style}} d="M27.7,18.5"/>
            <path style={{...st0Style}} d="M4.4,18.5"/>
            <path style={{...st0Style}} d="M27.7,22"/>
            <path style={{...st0Style}} d="M4.4,22"/>
            <line style={{...st0Style}} x1="4.4" y1="28" x2="27.7" y2="28"/>
            <rect x="4.4" y="4" style={{...st1Style}} width="23.3" height="3.8"/>
            <path style={{...st0Style}} d="M13.1,28"/>
            <path style={{...st0Style}} d="M13.1,4.1"/>
            <path style={{...st0Style}} d="M18.9,28"/>
            <path style={{...st0Style}} d="M18.9,4.1"/>
            <path style={{...st0Style}} d="M7.3,28"/>
            <path style={{...st0Style}} d="M7.3,4.1"/>
            <path style={{...st0Style}} d="M24.8,28"/>
            <path style={{...st0Style}} d="M24.8,4.1"/>
            <rect x="4.4" y="10.8" style={{...st2Style}} width="23.3" height="2.9"/>
            <rect x="4.4" y="16.5" style={{...st2Style}} width="23.3" height="2.9"/>
            <rect x="4.4" y="22.3" style={{...st2Style}} width="23.3" height="2.9"/>
            <line style={{...st0Style}} x1="10.2" y1="4.1" x2="10.2" y2="28"/>
            <line style={{...st0Style}} x1="16" y1="4.1" x2="16" y2="28"/>
            <line style={{...st0Style}} x1="21.8" y1="4.1" x2="21.8" y2="28"/>
            </g>
        </svg>
    )
}

export const MCNeoNtermiomicsIcon = (props) => {
    const [mouseIn, setMouseIn] = useState(false)

    
    return (
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
        <g>
            <path style={{fill:"#3AA58C",stroke:"#000000",strokeWidth:0.4,strokeMiterlimit:10}} 
                d="M37.9,19.2c-1.4,0-2.6,1.1-2.6,2.6v2c0,1.4,1.1,2.6,2.6,2.6h11.7v-7.1H37.9z"/>
            <path style={{fill:"#DEDEDE",stroke:"#000000",strokeWidth:0.4,strokeMiterlimit:10}} 
                d="M79.3,19.2H49.6v7.1h29.7c1.4,0,2.6-1.1,2.6-2.6v-2C81.8,20.3,80.7,19.2,79.3,19.2z"/>
        </g>
        <path style={{fill:"#DEDEDE",stroke:"#000000",strokeWidth:0.4,strokeMiterlimit:10}} 
            d="M92.8,54.9H63.2V62h29.7c1.4,0,2.6-1.1,2.6-2.6v-2C95.4,56,94.2,54.9,92.8,54.9z"/>
        
        <line style={{strokeWidth:0.4,stroke:"#000000"}} x1="58.6" y1="33.6" x2="58.6" y2="48.4"/>
        <path style={{fill:"#3AA58C",stroke:"#000000",strokeWidth:0.4,strokeMiterlimit:10}} 
            d="M37.9,54.9c-1.4,0-2.6,1.1-2.6,2.6v2c0,1.4,1.1,2.6,2.6,2.6h11.7v-7.1H37.9z"/>

        {/* <circle style={{stroke:"#000000",strokeWidth:0.4,strokeMiterlimit:10}} fill={"#C3931C"} cx="54.5" cy="16.6" r="3.3" opacity={mouseIn?1:0.3}/> */}
        <circle style={{stroke:"#000000",strokeWidth:0.4,strokeMiterlimit:10}} fill={"#C3931C"} cx="70.9" cy="53.2" r={"3.3"} opacity={mouseIn?1:0.0}/>
        <polygon style={{fill:"#C3341C",stroke:"#000000",strokeWidth:0.4,strokeMiterlimit:10}} points="70.1,31.8 68.2,28.4 70.1,25 74.1,25 76.1,28.4 74.1,31.8 " opacity={mouseIn?1:0.0}/>
        {/* //<polygon style={{fill:"#C3341C",stroke:"#000000",strokeWidth:0.4,strokeMiterlimit:10}} points="83.8,67.8 81.8,64.3 83.8,60.9 87.8,60.9 89.7,64.3 87.8,67.8 "opacity={mouseIn?1:0.3}/> */}
        <motion.g fill="#DEDEDE" 
                        strokeWidth={0.3} 
                        stroke="black" 
                        whileHover={{ stroke:"black", fill:"#6e5b7b", transitionDelay:0.1, scale:1.4, translateY:"5px"}} 
                        transition={ {duration: 0.5} }>

            <motion.rect x={0} y = {0} width={114} height={100} fill={"transparent"} strokeWidth={0}/>
            <path style={{stroke:"#000000",strokeWidth:0.4,strokeMiterlimit:10}} 
                        d="M53.2,37.4c-1.1-1.5-3-2.4-5-2.2c-3,0.3-5.1,3-4.7,5.9s3,5.1,5.9,4.7c1.7-0.2,3.1-1.1,3.9-2.5l-4.5-2.9
                            L53.2,37.4z"/>
        </motion.g>
        
        <text x="45" y="80" style={{fontSize:"0.65rem"}}>PTMs</text>
        </motion.svg>
        </div>
    )

}


export const MCProteinSearchIcon = (props) => {
    const [mouseIn, setMouseIn] = useState(false)

    return(
        <div style={{width:"100%"}}>
                <motion.svg
                    width={"200px"}
                    viewBox={"0 0 114 100"}
                    xmlns="http://www.w3.org/2000/svg"
                    xmlnsXlink="http://www.w3.org/1999/xlink"
                    onMouseEnter={e => setMouseIn(true)} onMouseLeave = {e => setMouseIn(false)}
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
                <motion.g 
                    animate={mouseIn ? { rotate: 360 } : {rotate : 0}}
                    transition={mouseIn ? { ease: "linear", duration: 4, repeat: Infinity, repeatType: "mirror" } : {}}>

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







