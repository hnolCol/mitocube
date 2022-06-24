import { useEffect, useState } from "react"
import { MCFilterTagContainer } from "../../utils/components/MCFilterTagButton"
import axios from "axios"
import _ from "lodash"
import { Button, ButtonGroup } from "@blueprintjs/core"
import { MCIconWithTooltip } from "../../utils/components/IconWithTooltip"
import { MCGetFilterFromLocalStorage } from "../../utils/Misc"


export function  MCDataFilter (props) {
    
    const [availableFilter, setAvailableFilter] = useState({})
    const [inactiveItems, setInactiveItems] = useState({})

    const handleInactiveRequest = (filterHeader,filterItem) => {
        if (inactiveItems[filterHeader] !==undefined && _.includes(inactiveItems[filterHeader],filterItem)){
           
                setInactiveItems(prevState => ({
                    ...prevState,
                    [filterHeader]: _.difference(inactiveItems[filterHeader], [filterItem]),
                }))
            }
        else {
            setInactiveItems(prevState => ({
                ...prevState,
                [filterHeader]: inactiveItems[filterHeader]===undefined?[filterItem]:_.union(inactiveItems[filterHeader],[filterItem]),
            }))
        }
    }

    const saveSettingsLocally = () => {
        //remove inactive item tags
        const result = Object.assign(...Object.keys(availableFilter).map(filterHeader => (
            {[filterHeader] : inactiveItems[filterHeader]===undefined?availableFilter[filterHeader]:_.difference(availableFilter[filterHeader], inactiveItems[filterHeader])})));
        localStorage.setItem("mitocube-filter",JSON.stringify(result))
        props.onClose(false)
    }

    useEffect(() => {

        axios.get('/api/data/filter/options').then(response => {
                if (response.data["success"]){
                    setAvailableFilter(response.data["params"])
                    const localFilter = MCGetFilterFromLocalStorage()
                    if (localFilter!==null){
                        const result = Object.assign(...Object.keys(response.data["params"]).map(filterHeader => ({
                            [filterHeader] : localFilter[filterHeader]===undefined?[]:_.difference(response.data["params"][filterHeader],localFilter[filterHeader])
                        })))

                        setInactiveItems(result)
                    }
                    
                    
                }}
                )
          
        
      }, []);
    
    return(
        <div style={{margin:"0 1rem",paddingTop:"0.4rem"}}>
            <p>Click on the filter tags do disable/enable them. Datasets that match any disabled tag will be filtered out. If all tags are disabled of a filter, only the summary card will be shown.</p>
            <div style={{overflowY:"scroll"}}>
            {Object.keys(availableFilter).map(filterHeader => {
                return(
                    <div key = {filterHeader} className="filter-wrapper">
                        <div className="header-div">
                            {filterHeader}
                            {inactiveItems[filterHeader]!==undefined && inactiveItems[filterHeader].length===availableFilter[filterHeader].length?
                                <MCIconWithTooltip icon="warning-sign" intent="danger" tooltipStr="Warning: all tags of a filter disabled. All dataset cards will be filtered out."/>:null}
                        </div>
                        
                        <MCFilterTagContainer  
                            filterItems = {availableFilter[filterHeader]} 
                            inactiveItems={inactiveItems[filterHeader]===undefined?[]:inactiveItems[filterHeader]}
                            handleInactiveRequest = {handleInactiveRequest}
                            filterHeader = {filterHeader}/>
                    </div>
                )
            })}  
            </div>
            <div style={{float:"right"}}>

                <ButtonGroup vertical={false} fill={false}>
                    <Button text="Save" intent="none" onClick={saveSettingsLocally}/>
                    <Button text="Close" intent="danger" onClick={() => props.onClose(false)}/>
                </ButtonGroup>

            </div>
        </div>
    )
}