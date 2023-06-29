import { Text } from "@visx/text"
import { motion } from "framer-motion"
import { Link } from "react-router-dom"



export function MCButton(props) {
    const { width, children, fontSize, padding} = props
    return (
        
        <motion.a href="/"
            whileHover={{ backgroundColor: "#000000", color: "#ffffff"}}
            transition = {{duration : 0.2, ease : "easeIn"}}
            style={{
                display: "flex",
                height: "2.3rem",
                textDecoration: "none",
                backgroundColor: "#ffffff",
                color : "#000000",
                alignItems: "center",
                border: "1px solid",
                justifyContent: "center", padding,
                fontSize, borderRadius: "0.1rem"
        }}>
            {children}
        </motion.a>
        
    )
}

MCButton.defaultProps = {
    width: "5rem",
    fontSize: "1.3rem",
    padding : "0.6rem",
    children : <div><span>↖</span><span style={{marginLeft : "0.2rem"}}>Web Application Login</span></div>
}

