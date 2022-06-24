import { MCDataset } from "./dataset-view/MCDataset"
import { useParams, Outlet } from "react-router-dom";

export function MCDatasetMainView(props) {
    const params = useParams();
    
    return(
        <div>
            <MCDataset dataID={params.dataID} token={props.token}/>
            {/* <Outlet/> */}
        </div>
    )
}