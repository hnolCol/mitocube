import { MCDataset } from "./dataset-view/MCDataset"
import { useParams } from "react-router-dom";

export function MCDatasetMainView(props) {
    const params = useParams();
    
    return(
        <div>
            <MCDataset dataID={params.dataID} token={props.token}/>
            
        </div>
    )
}