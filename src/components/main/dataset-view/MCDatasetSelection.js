import { Code, InputGroup } from "@blueprintjs/core";
import axios from "axios";
import { useEffect, useState } from "react";
import { Button } from "@blueprintjs/core"
import _, { filter } from "lodash";
import { Link } from "react-router-dom";

export function MCDatasetSelection (props) {

    const [dataSummary, setDataSummary] = useState({raw:[],filtered:[],"searchString":""})
    const [mouseOverDataID, setMouseOverDataID] = useState(undefined)
    
    useEffect(() => {
        axios.get("/api/data/summary", {params:{token:props.token}}).then(response => {
            
            if (response.status===200 & "success" in response.data & response.data["success"]) {

                setDataSummary(
                    {raw: JSON.parse(response.data["data"]),
                    filtered:[],
                    searchString:""}
                    )
  
            }
            else {
                
            } 
        })
          
        }, [props.token]);

    const onInputChange = (e) => {
        const searchString = e.target.value
        const re = new RegExp(_.escapeRegExp(searchString), 'i')
    
        const isMatch = result => re.test(result.shortDescription) | re.test(result.Material) | re.test(result.Organism) | re.test(result.dataID)
        var filteredItems = _.filter(dataSummary.raw, isMatch)
        
        setDataSummary(prevValues => {
            return { ...prevValues,"filtered": filteredItems,"searchString":searchString}
          })
    }
    
    

    const datasetsToShow = dataSummary.searchString === ""?dataSummary.raw:dataSummary.filtered

    return(
        <div className="dataset-selection-content">
            <div style={{color:"#6e5b7b"}}>
                <h2>Dataset Selection</h2>
            </div>
            <InputGroup 
                        leftIcon={"filter"} 
                        placeholder="Filter data sets" 
                        small={true} onChange={onInputChange} 
                        rightElement={<div style={{marginRight:"0.5rem"}}><p>{`${datasetsToShow.length}/${dataSummary.raw.length}`}</p></div>}
                        />
            <div className="dataset-selection-container">
            {datasetsToShow.length>0?datasetsToShow.map(dataset => {
               
                return (
                    <div key = {dataset.dataID} className="dataset-selection-box"
                    onMouseLeave = {(e) => {setMouseOverDataID(undefined)}}
                    onMouseEnter = {(e) => {setMouseOverDataID(dataset.dataID)}}>

                        <div style={{color:mouseOverDataID===dataset.dataID? "#6e5b7b":mouseOverDataID!==undefined?"darkgrey":"#6e5b7b", transitionDuration:"1.5s",transitionProperty:"color"}}>
                            
                            <h3>{dataset.shortDescription}</h3>
                            
                        </div>

                        <div className="dataset-tag-box">
                            {["Type","Material","Organism","dataID"].map(k => {
                                return (
                                    <div key={k} className="dataset-prop">
                                    <Code>{dataset[k]}</Code>
                                </div>
                                )
                            })}
                           
                           
                        </div>
                        {mouseOverDataID===dataset.dataID?
                            <div style={{position:"absolute",right:10,top:10}}>
                                <Link to={`/dataset/${dataset.dataID}`}><Button text="Explore" intent="primary" small={true} minimal={true} rightIcon={"chevron-right"}/></Link>
                            </div>
                            :
                            null}
                    </div>
                )
            }):<div><p>No dataset found.</p></div>}
            </div>


         </div>
    )

}