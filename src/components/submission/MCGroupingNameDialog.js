
import React from 'react'
import { useState, useEffect } from 'react'
import {InputGroup, Dialog, Button, ButtonGroup} from '@blueprintjs/core'
import _ from "lodash"



function GroupingNameTextInput (props) {
    const {q,cb, detailName, ...rest} = props 
   
    return(
        <div style={{minHeight:"3rem",maxHeight:"3rem"}}>
            <div style={{minHeight:"0.8rem",fontSize:"0.6rem"}}>
                {rest.value!==undefined&rest.value!==""?q:" "}
            </div>
        <InputGroup {...rest} onChange={e => props.cb(props.detailName,e.target.value)}/>
        </div>
    )
}

function MCGroupingNameDialog (props) {

    const {groupingNames,dataID, closeDialog, changeGroupingNames, paramsFile, ...rest} = props
    const [renameDict, setRenameDict] = useState({})
    
    useEffect(()=>{

        const renameDict = Object.fromEntries(groupingNames.map(v=>[v,v]))
        setRenameDict(renameDict)
    
    }, [])


    const handleInputChange = (detailName, value) => {
        
        let renameDictCopy = {...renameDict}        
        renameDictCopy[detailName] = value
        setRenameDict(renameDictCopy)

    }

    const onSubmit = (e) => {

        changeGroupingNames(renameDict,dataID,paramsFile)
    }
    
    
    return(

        <Dialog {...rest} canOutsideClickClose={true} canEscapeKeyClose={true} onClose={closeDialog}>
            <div style={{margin:"0 1rem",paddingTop:"0.4rem"}}>
                <p>Change the name of the grouping names</p>
                {_.isArray(groupingNames)?groupingNames.map(groupingName => {
                    return(
                        <GroupingNameTextInput 
                            key = {groupingName}
                            q = {"New name for "+groupingName} 
                            value={renameDict[groupingName]===undefined ?groupingName:renameDict[groupingName]} 
                            detailName={groupingName} 
                            cb={handleInputChange}/>
                    )
                }):null}

            <ButtonGroup>
                    <Button text="Apply" intent="primary" onClick={onSubmit}/>
                    <Button text = "Close" onClick={closeDialog}/>
            </ButtonGroup>
            </div>
        </Dialog>
    )

}



export default MCGroupingNameDialog