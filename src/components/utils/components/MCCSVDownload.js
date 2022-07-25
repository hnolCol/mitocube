
import CsvDownload from "react-json-to-csv";
import { Icon } from "@blueprintjs/core"

export function MCCSVDownload (props) {


    return(
        <div style={props.buttonMargin?{margin:"0.5rem 0.1rem"}:{}}>
            <CsvDownload data={props.data} 
            className={props.primary?"bp4-button bp4-intent-primary":"bp4-button bp4-minimal"} filename={props.fileName}>
                <Icon icon="download"/>
            </CsvDownload>
        </div>
    )
} 

MCCSVDownload.defaultProps = {
    data : [],
    buttonMargin : true,
    primary : true,
    fileName : "download.csv"
}



