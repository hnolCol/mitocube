

export function MCHeader(props) {
    return(
        <div style={{color:props.hexColor}}>
            <h2>{props.text}</h2>
        </div>
    )
}

MCHeader.defaultProps = {
    text : "Welcome to MitoCube Admin Content",
    hexColor : "#6e5b7b"
}