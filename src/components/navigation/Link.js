import { Text } from "@visx/text";
import { motion, useAnimationControls } from "framer-motion";
import { useEffect, useState } from "react";



export function MCLink(props) {
    const [mouseOver, setMouseOver] = useState( )
    const ctrls = useAnimationControls()

    const lineAnimation = {
        hidden: {
            pathLength: 0
        },
        visible: {
            pathLength: 1
        },
        transition: {
            duration: 4,
            ease: [0.2, 0.65, 0.3, 0.9],
        }
    }


    useEffect(() => {
        if (mouseOver) {
            ctrls.start("visible")
        }
        else {
            ctrls.start("hidden")
        }
    }, [mouseOver, ctrls])
    

    return (
        
        <div>
            <motion.svg width={120} height={40} onMouseEnter={() => setMouseOver(true)} onMouseLeave={() => setMouseOver(false)} style={{ cursor: "pointer" }}>
                {/* <motion.rect x={0} y={0} width={120} height={40} stroke="black" fill="transparent"/> */}
                <motion.line
                    
                    animate={ctrls}
                    pathLength = {0}
                    variants={lineAnimation}
                    x1={2} x2={23} y1={6} y2={6} stroke="black" strokeWidth={1} />
                <Text x={2} y={20} verticalAnchor={"middle"} textAnchor={"start"} fontSize={18} fill={mouseOver?"black":"darkgrey"}>Login</Text>
             
            </motion.svg>

        </div>
    )
}