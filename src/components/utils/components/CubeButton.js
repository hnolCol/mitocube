import { motion } from "framer-motion";


export const MCCubeButton = (props) => {
    
    return(
        <div>
            <motion.svg viewBox="0 0 50 40" width={props.width} height={props.height} xmlns="http://www.w3.org/2000/svg">
                <text x={10} y= {37}
                    style = {{fontFamily:" -apple-system", 
                                        fontSize:"7px",
                                        fill: "white",
                                        fontWeight:"300",
                                        lineHeight:"1.5",
                                        }}>
                                        {props.text}                   
                </text>
            </motion.svg>
        </div>
    )

} 

MCCubeButton.defaultProps = {
        width : "100px",
        height : "100px",
        text : "ButtonText",
        fillColor : "#F6F9FB"
}
