
import CsvDownload from "react-json-to-csv";
import { Icon } from "@blueprintjs/core"

export function MCCSVDownload (props) {


    return(
        <div style={{margin:"0.5rem 0.1rem"}}>
            <CsvDownload data={props.data} 
            className="bp3-button bp3-intent-primary" filename={props.fileName}>
                <Icon icon="download"/>
            </CsvDownload>
        </div>
    )
} 

MCCSVDownload.defaultProps = {
    data : [],
    fileName : "download.csv"
}



