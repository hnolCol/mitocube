import { motion } from "framer-motion";

export function MCAddButton(props) {
    return(
            
                <div className="fade-out-box-container">
                    <div className={`${props.boxClassName}`}>
                        <motion.svg width={"80%"} height={"80%"} viewBox="0 0 20 20" fill={"red"} onClick={() => props.callback(true)}> 
                            <motion.g stroke={"black"} strokeWidth={0.75} whileHover={{ scale: 1.3 , stroke:"darkgreen"}}>
                                <motion.circle cx={10} cy={10} r={5}  fill={"transparent"}/>
                                <motion.line x1={10} x2={10} y1={7} y2={13} />
                                <motion.line y1={10} y2={10} x1={7} x2={13} />
                            </motion.g>
                        </motion.svg>
                </div>
               
            </div>
    )
}

MCAddButton.defaultProps = {
    boxClassName : "fixed-box"
}