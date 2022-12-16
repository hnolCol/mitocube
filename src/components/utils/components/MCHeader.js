import { H4 } from "@blueprintjs/core"


export function MCHeader(props) {
    return(
        <div style={{
                color:props.hexColor,
                fontSize:"1.1rem",
                fontWeight:"bold",
                marginTop:"0.1rem",
                marginBottom:"0.3rem"}}>
            {props.text}
        </div>
    )
}

MCHeader.defaultProps = {
    text : "Welcome to MitoCube Admin Content",
    hexColor : "#6e5b7b"
}