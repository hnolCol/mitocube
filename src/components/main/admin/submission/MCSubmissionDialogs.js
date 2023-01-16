
import React from 'react'
import { useState, useEffect } from 'react'
import {InputGroup, Dialog, Button, ButtonGroup, Menu, MenuItem, TextArea, H6, H5} from '@blueprintjs/core'
import _ from "lodash"
import { Popover2 } from '@blueprintjs/popover2'


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


export function MCMethodEditingDialog (props) {
    const {dataID, paramsFile, onClose, handleDataChange, ...rest} = props
    const [textDetails, setText] = useState({"sections": {}, "infoText" : ""})
    const[newHeader,setNewHeader] = useState("")
    //const[infoText,setInfoText] = useState("")

    useEffect(() => {
        if ("Experimental Info" in paramsFile){
            let experimentalInfo = paramsFile["Experimental Info"]
            const textDetailsExtracted = Object.fromEntries(experimentalInfo.map(v => [v.title,v.details]))
            setText(prevValues => {return {...prevValues, "sections":textDetailsExtracted}})
        }
    },[paramsFile])

    const onTextChange = (header,value, infoText = "") => {
        let textDetailSections = textDetails.sections
        textDetailSections[header] = value
        setText(prevValues => { 
            return {...prevValues, "sections":textDetailSections,"infoText" : infoText}}
            )
               
    }

    const addHeader = () => {
        setText(prevValues => { 
            return {...prevValues, "infoText":""}}
            )
        if (newHeader !== undefined && _.isString(newHeader) && newHeader !== "" && !Object.keys(textDetails.sections).includes(newHeader)) {
        
           onTextChange(newHeader,"",`Section ${newHeader} created.`)
           
            
        }
        else{
            setText(prevValues => { 
                return {...prevValues, "infoText":"Section name missing or existed already."}}
                )
        }
        
    }


    const submitChanges = () => {

        var updated_src = {...paramsFile}
        let updatedExperimentalDetails = Object.keys(textDetails.sections).map(v=> {return( {title:v,details:textDetails.sections[v]} )})
        updated_src["Experimental Info"] = updatedExperimentalDetails
        if (_.isFunction(handleDataChange)) {
            handleDataChange(dataID,updated_src)
        }
        onClose()

    }

    
    return(
        <Dialog {...rest} canOutsideClickClose={true} canEscapeKeyClose={true} onClose={onClose} style={{minWidth:"85vw"}} isCloseButtonShown={true} title="Edit Experimental Info ">
            
            <div style={{padding:"0.70rem"}}>
            
                <div style={{fontSize:"0.6rem"}}>
                    <H6>{paramsFile.Title}({dataID})</H6>
                    <p>Researcher: {paramsFile["Experimentator"]}</p>
                    <p>Please note that you have to save changes after editing the params file in the main view.</p>
                </div>

                <div className='hor-aligned-center-div-sapce-between'>
                <InputGroup 
                    small={true} 
                    fill={true} 
                    placeholder="Enter new section name .." 
                    value={newHeader} 
                    onChange={e => setNewHeader(e.target.value)}
                    onKeyUp={e => {
                        if (e.code === "Enter") {
                          e.preventDefault();
                          addHeader()
                          // tried all this stuff, but nothing stops the future OK button from handling the event!
                          ;}}}
                    />
                
                <Popover2 content={
                        <Menu>
                            {["Protein Digestion","Liquid Chromatography & Mass Spectrometry","Data Analysis"].map(v =>{
                                return(
                                    <MenuItem key={v} text={v} onClick={e => setNewHeader(v)}/>
                                )
                            })}
                        </Menu>}>
                <Button icon={"chevron-down"} minimal={true}/>
                </Popover2>
                <Button icon="add" minimal={true} onClick={addHeader}/>
                </div>
            
                <div style={{fontSize:"0.65rem"}}>
                    <p>{textDetails.infoText}</p>
                </div>
                <div style={{height:"auto",maxHeight:"60vh",overflowY:"scroll",paddingRight:"1.5rem",paddingBottom:"1rem",marginTop:"0.5rem"}}>
                {Object.keys(textDetails.sections).map(v => {
                    return(
                        <div key={v} style={{marginTop:"0.5rem"}}>
                        <H5>{v}</H5>
                        <TextArea onChange={e => onTextChange(v,e.target.value)} fill={true} value={textDetails.sections[v]}/>
                        </div>
                    )
                })}
                </div>
                
                <ButtonGroup >
                    <Button text="Edit" onClick={submitChanges} intent="primary"/>
                   
                    <Button text="Cancel" intent="none" onClick={onClose}/>
                </ButtonGroup>
            </div>
        </Dialog>
    )
    
}

MCMethodEditingDialog.defaultProps = {
    experimentalDetailHeaders : ["Research Aim","Additional Information","Sample Preparation"]
}

export function MCGroupingNameDialog (props) {

    const {groupingNames,dataID, closeDialog, changeGroupingNames, paramsFile, ...rest} = props
    const [renameDict, setRenameDict] = useState({})
    
    useEffect(()=>{

        const renameDict = Object.fromEntries(groupingNames.map(v=>[v,v]))
        setRenameDict(renameDict)
    
    }, [groupingNames])


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



