
import SingleCube from "./utils/SingleCube"

export const MCIcon = (props) => {
    
    return(
        <div style={{width:"100%",height:"100%"}}>
                <svg
                    width={props.width}
                    viewBox={props.viewBox}
                    xmlns="http://www.w3.org/2000/svg"
                    xmlnsXlink="http://www.w3.org/1999/xlink"
                    
                >
                    <SingleCube darkMode={props.darkMode}/> 
                </svg>
        </div>
    )
}

MCIcon.defaultProps = {
    darkMode : true,
    width : "100%",
    viewBox : "0 0 70 65"
} 