import { MCHeader } from "../utils/components/MCHeader"
import { motion } from "framer-motion"

function MCItemHeader(props) {
    const { text, onHeaderSelection, isSelected } = props
    console.log(isSelected)
    return (
        <motion.div
            whileHover={{transform:"translateX(0.5rem)",baclgroundColor:"darkgrey"}}
            style={{ backgroundColor: "#efefef", padding: "1.2rem", margin: "0.4rem", borderRadius: "0.1rem" }}
            onMouseUp={() => onHeaderSelection(text)}>
            
            <MCHeader text={text} fontWeight={400} fontSize={"1.5rem"} hexColor={isSelected?"#bb1731":"#2F5597"} />
        
        </motion.div>
    )
}

MCItemHeader.defaultProps = {
    header : "Header 1"
}

export function MCItemHeaders(props) {
    const { headers, selectedHeader, ...rest } = props
    console.log(selectedHeader)

    return (
        <div style={{ height: "100%", minWidth: "15rem", maxWidth: "15rem", backgroundColor: "white" }}>
            <MCHeader text="Configuration Items"/>
            <div>
                {headers.map(header => <MCItemHeader text={header} isSelected={selectedHeader === header} {...rest} />)}
            </div>
        </div>)
}