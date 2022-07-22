import { LinearGradient } from "@visx/gradient"
import { Text } from "@visx/text"
import _ from "lodash"
import { motion } from "framer-motion"



export function MCPathwayItems(props) {

    const {x0,y0,width,height,selectedItems, setItemSelection, setItemHover,  pathwayItems} = props
    return(
        pathwayItems["COQ"].map(v =>{
            let itemSelected = selectedItems.includes(v.name)
            return(
                <motion.g key={v.name} whileHover={{scale:1.25}} onClick={e=>setItemSelection(v.name)} onHoverStart={e => setItemHover(v.name)} onHoverEnd={e => setItemHover()}>
                    <motion.ellipse 
                        cx={x0+width*v.cx} 
                        cy={y0+height*v.cy} 
                        rx = {v.rx} 
                        ry = {v.ry} 
                        fill={itemSelected?"#cad7ef":"white"} 
                        stroke="black"/>
                    <Text 
                        x= {x0+width*v.cx} 
                        y= {y0+height*v.cy}
                        textAnchor="middle" 
                        verticalAnchor="middle" 
                        fontSize={11} 
                        cursor="default">
                            {v.name}
                    </Text>
                </motion.g>
            )

            })
    )
}

export function MCSVGBackgroundGradient (props) {
    
    const {x0,y0,width,height} = props

    return (
        <g>
             <linearGradient id="SVGID_1_" gradientUnits="userSpaceOnUse" x1={x0} y1={y0+height} x2={x0} y2={y0}>
                <stop  offset="0" stopColor="#FFFFFF"/>
                <stop  offset="0.7474" stopColor="#E3F0DC"/>
                <stop  offset="1" stopColor="#D9EACF"/>
            </linearGradient>
            <rect  fill="url(#SVGID_1_)" x = {x0} y={y0} width={width} height={height}/>
        </g>)
        
}

export function MCDoubleMembrane(props){
    
    const {x0,y0,width} = props
    const membraneItemWidth = 10
    const N = width/membraneItemWidth

    return(
        <g>
        
        <rect x={x0} y={y0-5} width={width} height={43} fill="#efefef"/>
        {_.range(N).map(nn => {
            return (<MCMembrane key ={`${nn}-d`} cx = {x0+nn*membraneItemWidth} cy={y0} direction="down"/>)
            })}

        {_.range(N).map(nn => {
            return (<MCMembrane key ={`${nn}-u`} cx = {x0+nn*membraneItemWidth} cy={y0+33} />)
            })} 
        
        
        </g>
        )
}

export function MCMembrane (props) {
    const {cx,cy, lipidLength, headRadius, direction} = props
    const xstart = cx+headRadius
return(
    <g transform={direction==="up"?"":`rotate(180,${xstart},${cy})`} style={direction==="up"?{}:{transform:`translateX(20)`}}>
		<line stroke={"#1D1D1C"} strokeWidth={0.5} strokeMiterlimit={10}  x1={xstart-2.4} y1={cy-lipidLength} x2={xstart-2.4} y2={cy-2}/>
		<line stroke={"#1D1D1C"} strokeWidth={0.5} strokeMiterlimit={10}  x1={xstart+2.4} y1={cy-lipidLength} x2={xstart+2.4} y2={cy-2}/>
		<circle stroke = {"#000000"} strokeWidth={0.5} strokeMiterlimit={10} fill={"#FFFFFF"} cx={xstart} cy={cy} r={headRadius}/>
	</g>
)
}

MCMembrane.defaultProps = {
    cx : 20,
    cy : 20,
    lipidLength: 15,
    headRadius : 5,
    direction : "up"
}







// <g>
// 	<ellipse style="fill:#FFFFFF;stroke:#000000;stroke-width:0.5;stroke-miterlimit:10;" cx="412.3" cy="102.8" rx="21.5" ry="17.5"/>
// 	<text transform="matrix(1 0 0 1 399.1167 106.3362)" style="font-family:'MyriadPro-Regular'; font-size:12px;">Coq8</text>
// </g>
// <g>
// 	<ellipse style="fill:#FFFFFF;stroke:#000000;stroke-width:0.5;stroke-miterlimit:10;" cx="255.1" cy="103.2" rx="21.5" ry="17.5"/>
// 	<text transform="matrix(1 0 0 1 251.0854 106.6162)" style="font-family:'MyriadPro-Regular'; font-size:12px;">6</text>
// </g>
// <g>
// 	<ellipse style="fill:#FFFFFF;stroke:#000000;stroke-width:0.5;stroke-miterlimit:10;" cx="281.6" cy="100.1" rx="17" ry="14.6"/>
// 	<text transform="matrix(1 0 0 1 278.8867 101.1602)" style="font-family:'MyriadPro-Regular'; font-size:12px;">3</text>
// </g>
// <g>
// 	<ellipse style="fill:#FFFFFF;stroke:#000000;stroke-width:0.5;stroke-miterlimit:10;" cx="311.7" cy="99.7" rx="17" ry="14.6"/>
// 	<text transform="matrix(1 0 0 1 308.6139 103.2542)" style="font-family:'MyriadPro-Regular'; font-size:12px;">5</text>
// </g>
// <g>
// 	<ellipse style="fill:#FFFFFF;stroke:#000000;stroke-width:0.5;stroke-miterlimit:10;" cx="331.8" cy="97.1" rx="10.1" ry="8.6"/>
// 	<text transform="matrix(1 0 0 1 328.6883 100.5957)" style="font-family:'MyriadPro-Regular'; font-size:12px;">7</text>
// </g>
// <g>
// 	<ellipse style="fill:#FFFFFF;stroke:#000000;stroke-width:0.5;stroke-miterlimit:10;" cx="338.2" cy="112.7" rx="14.2" ry="12.2"/>
// 	<text transform="matrix(1 0 0 1 335.1301 116.191)" style="font-family:'MyriadPro-Regular'; font-size:12px;">9</text>
// </g>
// <path style="fill:none;stroke:#1D1D1C;stroke-width:0.5;stroke-miterlimit:10;" d="M134.1,128.6"/>
// <text transform="matrix(1 0 0 1 23.4399 36.834)" style="font-family:'MyriadPro-Regular'; font-size:12px;">IMS</text>
// <g>
// 	<path style="fill:#FFFFFF;stroke:#1E1E1C;stroke-width:0.5;stroke-miterlimit:10;" d="M135.7,86.7h-20.8c-0.9,0-1.6,0.8-1.4,1.7
// 		L119,118c0.1,0.7,0.7,1.2,1.4,1.2h30.2c0.7,0,1.2-0.5,1.3-1.1l5.5-29.7c0.2-0.9-0.5-1.7-1.4-1.7h-19.8H135.7z"/>
// 	<text transform="matrix(1 0 0 1 122.273 106.4219)" style="font-family:'MyriadPro-Regular'; font-size:12px;">Coq1</text>
// </g>

// <text transform="matrix(1 0 0 1 52.5742 17.1348)" style="font-family:'MyriadPro-Regular'; font-size:12px;">CoQ biosynthesis</text>
// <rect x="52.1" y="25.2" style="fill:none;stroke:#000000;stroke-width:0.5;stroke-miterlimit:10;" width="466.5" height="172.5"/>
// </svg>