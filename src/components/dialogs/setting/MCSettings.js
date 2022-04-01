
import { Button, ButtonGroup } from "@blueprintjs/core"



export function  MCSettings (props) {

    const saveSettingsLocally = () => {
        //remove inactive item tags
        // const result = Object.assign(...Object.keys(availableFilter).map(filterHeader => (
        //     {[filterHeader] : inactiveItems[filterHeader]===undefined?availableFilter[filterHeader]:_.difference(availableFilter[filterHeader], inactiveItems[filterHeader])})));
        // localStorage.setItem("mitocube-filter",JSON.stringify(result))
        props.onClose(false)
    }

    
    return(
        <div style={{margin:"0 1rem"}}>
            <p>Settings</p>
            <div style={{overflowY:"scroll"}}>
             <p>Coming soon.</p>
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