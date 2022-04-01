import { motion } from "framer-motion"

export function MCDeleteButton(props) {

    const handleCallback = (e) => {
        
        if (props.callback!==undefined){
            e.stopPropagation()
            props.callback(props.callbackValue)
        }
    }


    return(
            <div className="fixed-box">
               
                <motion.svg width={"80%"} height={"80%"} viewBox="0 0 20 20" 
                    > 
                    <motion.g 
                            stroke={"black"} 
                            strokeWidth={0.75} 
                            whileHover={{ scale: 1.4 , stroke:"darkred"}} 
                            onClick={handleCallback}
                            >
                        <motion.circle cx={10} cy={10} r={5}  fill={"transparent"} stroke={"transparent"}/>
                        <motion.line x1={7} x2={13} y1={7} y2={13} />
                        <motion.line x1={7} x2={13} y1={13} y2={7} />
                    </motion.g>
                </motion.svg>
                </div>
               
      
    )
}

MCDeleteButton.defaultProps = {
    callback : undefined,
    callbackValue : null,
}