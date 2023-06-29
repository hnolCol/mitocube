

export function MCHeader(props) {
    const {hexColor, fontSize, fontWeight, darkMode} = props
    return(
        <div style={{
                color:darkMode?"white":hexColor,
                fontSize:fontSize,
            fontWeight: fontWeight,
            fontFamily: "sans-serif",
                marginTop:"0.1rem",
                marginBottom: "0.3rem",
                transitionDuration: "1.5s",
                transitionProperty: "color",
                cursor:"default"}}>
            {props.text}
        </div>
    )
}

MCHeader.defaultProps = {
    text : "Welcome to MitoCube Admin Content",
    hexColor: "#2F5597",
    fontSize: "1.1rem",
    fontWeight: "bold",
    darkMode : false
}