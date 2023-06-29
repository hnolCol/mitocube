
import { motion, useAnimationControls, useInView } from "framer-motion"
import { useEffect, useRef } from "react"

export function MCSlideInText(props) {
    //motion div sliding from the right to the left.
    const {children} = props 
    const ref = useRef(null)
    const inView = useInView(ref, {once : true, amount : 0.23})
    const ctrls = useAnimationControls()

    useEffect(() => {

        if (inView) ctrls.start("visible")
        else ctrls.start("hidden")

    }, [inView,ctrls])


    const slideInVariants = {
        hidden: {
            x: 200,
            opacity : 0
        },
        visible: {
            x: 0,
            opacity : 1 
        }
    }

    return (
        
        <motion.div ref={ref} transition={{duration: 0.75}} variants={slideInVariants} animate={ctrls} opacity={0}>

            {children}

        </motion.div>
    )
}