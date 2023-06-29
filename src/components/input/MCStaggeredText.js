

import { useAnimation, motion, useInView, useAnimationControls } from "framer-motion"
import { useEffect, useMemo, useRef } from "react"
import _ from "lodash"

export function MCAnimatedText({text =  "Welcome", darkMode  = false, fontSize = "1rem"}) {

    const ctrls = useAnimationControls()
    const ref = useRef(null)
    const inView = useInView(ref, { amount : 1,  once : true})
    

    const textCounts = useMemo(() => {
        if (text === undefined) return []
        let words = _.split(text, " ").map(word => {return {s : word, l : word.length}})
        return words
    }, [text])

    const wordAnimation = {
        hidden: {},
        visible: {},
        };

    const characterAnimation = {
        hidden: {
            opacity: 0
        },
        visible: {
            opacity: 1
        },
        transition: {
            duration: 0.3,
            ease: [0.2, 0.65, 0.3, 0.9],
        }
    }

    useEffect(() => {
        if (inView) {
           ctrls.start("visible");
            }
        if (!inView) {
            ctrls.start("hidden");
            }
    }, [ctrls, inView])
    
    return (
        <div style={{
                width : "100%",
                overflowWrap: "break-word",
                display: "flex",
                flexDirection: "row",
                justifyContent: "flex-start",
                alignItems: "center",
                flexWrap: "wrap",
                fontSize: fontSize,
                color: darkMode ? "white" : "black",
                fontWeight: 400
        }}> 
            {_.isArray(textCounts) ? textCounts.map((wordCounts, idx) => {
                return (
                    <motion.div
                        style={{ marginLeft: "1rem"}}
                        ref={ref}
                        animate={ctrls}
                        variants={wordAnimation}
                        key={`${idx}-word`}
                        transition={{ delayChildren: idx * 0.3, staggerChildren: 0.03 }}>
                       <p>
                            {wordCounts.s.split("").map((char, charIdx) => {
                                return (
                                    <motion.span
                                        style={{opacity : 0}}
                                        key={`${charIdx}-char`}
                                        variants={characterAnimation}>
                                        {char}
                                    </motion.span>
                        )
                        })
                            }
                        </p>
                           
                            
                        
                    </motion.div>
                )
                
            }):null}
    </div>
            )
}