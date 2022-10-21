import { Alert, Button, Collapse, InputGroup, Code, ButtonGroup, MenuItem, Menu } from "@blueprintjs/core"
import { useState, useEffect } from "react"
import { Link } from "react-router-dom"

import axios from "axios"
import ReactJson from 'react-json-view'
import { MCCombobox } from "../utils/components/MCCombobox"
import { arrayToTabDel, downloadJSONFile, downloadTxtFile } from "../utils/Misc"
import _, { update } from "lodash"
import { Text } from "@visx/text"
import { MCCreateSampleList } from "./MCCreateSampleList"
import { Popover2, Tooltip2 } from "@blueprintjs/popover2"
import { MCGroupingNameDialog, MCMethodEditingDialog } from "./MCSubmissionDialogs"



function MCSubmissionItem(props) {
    const {dataID, token, handleDataChange, paramsFile, states, setAlertState,openSampleListDialog, openRenameGroupingDialog, isUpdated, setIsUpdated, openMethodEditingDialog} = props
    
    const [isOpen, setIsOpen] = useState(false)
    

    const onEditJsonParams = (params) => {
        //console.log(params)
        
        if (["dataID","SampleNumber"].includes(params.name)){
            setAlertState({isOpen:true,alert:"danger",children:<div>The dataID, groupingNames and sample number cannot be changed.</div>})
            return false
        }
        else if (params.namespace.length > 0 && ["groupingNames"].includes(params.namespace[0])){
            setAlertState({isOpen:true,alert:"danger",children:<div>Please use the groupingNames rename dialog - changes not saved.</div>})
            return false
        } 
        else if (params.namespace.length > 0 && "groupings" === params.namespace[0]){
            setAlertState({
                isOpen:true,
                alert:"warning",
                children:<div>You have changed some grouping which will affect the raw file creation. Please note that you will have to take care that all groupings are changed accordingly e.g. in all groupings.</div>})
                setIsUpdated(dataID,true)
                handleDataChange(dataID,params.updated_src)
                return true
        } 
        else if (params.name === "State" && !states.includes(params.new_value)){
            setAlertState({isOpen:true,children:<div>State must be one of the following: {states.join(", ")}</div>})
            return false
        }
        else {
            setIsUpdated(dataID,true)
            handleDataChange(dataID,params.updated_src)
        }
       
        
    }



    const handleUpdate = (e) =>{

        axios.put('/api/data/submission/details', {token : token, dataID : dataID, paramsFile: paramsFile}).then(response => {
            if (response.data !== undefined && response.data.success){
                setIsUpdated(dataID,false)
                handleDataChange(dataID,response.data.paramsFile)
                
            }
            
            let msgText = response.data.msg !== undefined ? response.data.msg : response.data.error
            setAlertState({isOpen:true,children:<div>{msgText}</div>})
            
        })

    }

    const handleStateChange = (newState) => {
        // handle submission state change.
        if (paramsFile["State"] !== newState && states.includes(newState)) {

            paramsFile["State"] = newState
            handleDataChange(dataID,paramsFile)
            setIsUpdated(dataID,true)
            setAlertState({isOpen:true,children:<div>State of {dataID} changed to : {newState}. Please note that you still have to save/upload the changes.</div>})
        }
        

    }
    const handleDelete = (e) => {

        axios.delete('/api/data/submission/details', {data : {token : token, dataID : dataID}}).then(response => {
            setAlertState({isOpen:true,children:<div>{response.data.msg}</div>})
        })
    }

    return(
        <div>
        
        <MCSubmissionHeader 
                paramsFile = {paramsFile} 
                states = {states} 
                isOpen={isOpen} 
                setIsOpen={setIsOpen} 
                handleDelete={handleDelete} 
                handleStateChange = {handleStateChange} 
                isUpdated={isUpdated}
                handleUpdate = {handleUpdate}
                openSampleListDialog = {openSampleListDialog}
                openRenameGroupingDialog = {openRenameGroupingDialog}
                openMethodEditingDialog = {openMethodEditingDialog}
                />
        
        <Collapse isOpen={isOpen}>
            <div style={{maxHeight:"50vh",overflowY:"scroll"}}>
            <ReactJson  
                // theme={"shapeshifter:inverted"} 
                src = {paramsFile} 
                displayDataTypes={false} 
                style={{fontSize:".75rem"}} name={false} onEdit={onEditJsonParams}/>
            </div>
        </Collapse>

        </div>
    )
}



function MCSubmissionHeader (props) {
    const {paramsFile,states, isOpen, setIsOpen, handleDelete, handleStateChange, isUpdated, handleUpdate, openSampleListDialog, openRenameGroupingDialog, openMethodEditingDialog}= props
    const [mouseOverDataID,setMouseOverDataID] = useState(false)
    const dateString = `${paramsFile["Creation Date"].substring(0,4)}-${paramsFile["Creation Date"].substring(4,6)}-${paramsFile["Creation Date"].substring(6)}`
    const getDaysSinceSumbission = (dateString) => {

        const d =  new Date(dateString)
        const now = new Date()
        
        const diffTime = Math.abs(now - d);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 

        return `${diffDays} days`
    }


    return(
        <div key = {paramsFile.dataID} className="submission-container" onMouseEnter={e => setMouseOverDataID(paramsFile.dataID)} onMouseLeave={e => setMouseOverDataID(undefined)}>
            
           
            <div className="submission-box"
                    >
                        
                        <div style={
                            {
                                color:mouseOverDataID===paramsFile.dataID? "#3f5b66":"#2F5597", 
                                transitionDuration:"1.5s",
                                transitionProperty:"color"
                            }}>
                                <h3>{paramsFile.Title}</h3>
                        </div>

                        <div style={{fontSize:"1em",paddingRight:"5rem"}}>
                            {paramsFile.shortDescription}
                        </div>
                        <div className="dataset-tag-box">
                            {["Experimentator","Email","Type","Material","Organism","dataID"].map(k => {
                                return (
                                    <div key={k} className="submission-prop">
                                    <Code>{paramsFile[k]}</Code>
                                </div>
                                )
                            })}                           
                        </div>

                    <ButtonGroup vertical={false} style={{marginTop:"0.3rem"}}>

                        <Button text="Save" 
                                rightIcon="floppy-disk" 
                                disabled={!isUpdated} 
                                onClick={handleUpdate} 
                                intent={!isUpdated?"none":"primary"} 
                                minimal={true}/>
                        <Popover2 content={
                            <Menu>
                                <MenuItem text="Grouping Names" onClick={() => openRenameGroupingDialog(paramsFile.dataID,paramsFile)}/>
                                <MenuItem text="Digestion / LC-MS Method" onClick={() => openMethodEditingDialog(paramsFile.dataID,paramsFile)}/>
                                <MenuItem 
                                    text={isOpen?"Close params file":"Edit params file"} 
                                    intent = {isOpen?"danger":"none"}
                                    onClick={() => setIsOpen(!isOpen)}/>

                            </Menu>}>
                        <Button icon={"edit"} 
                                minimal={true} 
                                intent={isOpen?"primary":"none"}/>
                        </Popover2>
                        <Tooltip2 content={<div>
                                <p>Create a sample list (Run Name and Plate position + Groupings) for example Xcalibur.</p>
                                <p>It is recommended to scramble the runs.</p>
                                </div>}>
                            <Button 
                                icon="th-list" 
                                onClick={e => openSampleListDialog(paramsFile.dataID)} 
                                minimal={true}/>
                        </Tooltip2>

                        <MCCombobox 
                                items = {states} 
                                placeholder="State .."
                                callback = {handleStateChange}
                                buttonProps = {{
                                            minimal : true,
                                            small : true,
                                            icon : "tag"
                                        }}/>
                        <Tooltip2 content={<p>Download complete paramter file as a json file.</p>}>
                            <Button icon="download" intent="primary" onClick={e => downloadJSONFile(paramsFile,`params-${paramsFile.dataID}`)} minimal={true}/>
                        </Tooltip2>
                        <Tooltip2 content={<p>Download submission summary as tab-delimited text file.</p>}>
                            <Button icon="download" intent="success" onClick={e => downloadTxtFile(arrayToTabDel(extractMainParamsFromJSON(paramsFile),["Parameter","Value"]),`params-${paramsFile.dataID}.txt`)} minimal={true}/>
                        </Tooltip2>
                        <Tooltip2 content={<p>Place project to archive.</p>}>
                        <Button text="" icon="trash"  onClick={handleDelete} intent={"danger"}  minimal={true}/>
                        </Tooltip2>
                        
                    </ButtonGroup>
                    </div>

                <div className="submission-box" >
                            {dateString} ({getDaysSinceSumbission(dateString)} )
                            < MCSubmissionTimeLine states={states} state={paramsFile.State}/>
                </div>
                </div>
    )
}


function extractMainParamsFromJSON(paramsFile) {

    const extractedParams = Object.keys(paramsFile).map(v => {
        const value = paramsFile[v]
        return({Parameter:v,Value:_.isString(value )?paramsFile[v]:_.isArray(value)&&_.isString(value[0])?_.join(value,","):JSON.stringify(value)})
    })
    return extractedParams 
}



function MCSubmissionTimeLine (props) {
    const {states, state} = props 
    var posText = 0
    return(
        <div style={{marginRight:"1rem"}}>
            <svg width={120} height = {100}>
                <line x1 = {15} x2={10 + (states.length-1)*20} y1={50} y2={50} stroke="black" strokeWidth={0.5}/>
                {_.isArray(states)?_.range(states.length).map(v => {
                    if (states[v] === state) posText += 15+v*20
                    
                    return(
                        <circle key = {v} cx = {15+v*20} cy={50} fill = {states[v] === state?"#53953c":"#efefef"} stroke={"black"} strokeWidth={0.5} r={7}/>
                    )}):null}
                <line x1 = {posText} x2 = {posText} y1 = {60} y2 = {68} stroke={"black"} strokeWidth={0.5}/>
                <Text x = {posText<60?posText-4:posText+4} y= {70} textAnchor={posText<60?"start":"end"} verticalAnchor="start" fill="#828282">{state}</Text>
            </svg>

        </div>

    )
}

const initRenameGrouping = {isOpen:false,groupingNames:[],dataID:undefined,paramsFile:{}}
const initExperimental = {isOpen:false,dataID:undefined,paramsFile:{}}
export function MCSubmissionAdminView (props) {
    const [submissionDetails, setSubmissions] = useState({submissions:[],states:[],submissionSatesCounts:{},submissionsToShow:[],submissionFilter:"None",searchString:""})
    const [groupingRenameDetails, setGroupingRenameDetails] = useState(initRenameGrouping)
    const [experimentalDetails, setExperimentalDetails] = useState(initExperimental)
    const [sampleListDialog, setSampleListDialog] = useState({isOpen:false})
    const [updatedDataIDs, setUpdatedDataIDs] = useState({})
    const [alertState, setAlertState] = useState({isOpen:false,children:<div>Warning!</div>})
    const {token} = props    

    useEffect(() => {
        axios.get("/api/admin/submissions", {params:{token:token}}).then(response => {
            if (response.status===200 & "success" in response.data & response.data["success"]) {
               const stateCounts = getStateCounts(response.data.states,response.data.submissions,)
               setSubmissions(
                    {
                        submissions:response.data.submissions, 
                        states : response.data.states, 
                        submissionSatesCounts : stateCounts,
                        submissionsToShow :response.data.submissions.map(v => v.dataID),
                        submissionFilter : "None",
                        searchString : ""
                    })
              }
        })
          
        }, []);


    const openRenameGroupingDialog = (dataID,paramsFile) => {
        
        setGroupingRenameDetails({isOpen:true,dataID:dataID,paramsFile:paramsFile,groupingNames:paramsFile.groupingNames})

    }

    const openMethodEditingDialog = (dataID,paramsFile) => {

        console.log(dataID)
        setExperimentalDetails({isOpen:true,dataID:dataID,paramsFile:paramsFile})
        setUpdatedState(dataID,true)
    }

    const closeMethodEditingDialog = () => {
        setExperimentalDetails(initExperimental)
    }

    const handleRenameGrouping = (renameDict,dataID,paramsFile) =>{

        const groupingNamesToRename = Object.keys(renameDict)
     
        const originalGroupingNames = paramsFile.groupingNames
        const updatedGroupingNames = originalGroupingNames.map(groupingName => groupingNamesToRename.includes(groupingName)?renameDict[groupingName]:groupingName)
        
        var updated_src = {...paramsFile}
        updated_src["groupingNames"] = updatedGroupingNames
        var groupings = updated_src["groupings"]

        const updatedGroupings = Object.fromEntries(Object.keys(groupings).map(v => [groupingNamesToRename.includes(v)?renameDict[v]:v,groupings[v]]))
        updated_src["groupings"] = updatedGroupings
     
        handleSubmissionUpdate(dataID,updated_src)
        setUpdatedState(dataID,true)
        closeRenameGroupingDialog()
        

    }

    const closeRenameGroupingDialog = () => {
        setGroupingRenameDetails(initRenameGrouping)
    }

    const getStateCounts = (states, submissions) => {

        const stateCounts = Object.fromEntries(states.map(state => [state,0]))
        
        _.forEach(submissions, v => stateCounts[v.paramsFile.State] += 1)
        
        return stateCounts
    }

    const handleFilterSelection = (filterName) => {
        var filteredSubmissions = getStringMatchSubmissions(submissionDetails.searchString)
        // let shownSubmissionDetails = _.filter(submissionDetails.submissions, v => submissionDetails.submissionsToShow.includes(v.dataID))

        const submissionsFiltered = filterName === "None"?_.map(filteredSubmissions, v => v.dataID):_.map(_.filter(filteredSubmissions, v => v.paramsFile.State === filterName),v => v.dataID)
        //console.log(filteredSubmissions)
        setSubmissions(prevValues => {
            return { ...prevValues, "submissionsToShow":submissionsFiltered, "submissionFilter":filterName}})

    }

    const getStringMatchSubmissions = (searchString) => {
        if (searchString === "") return submissionDetails.submissions
        const re = new RegExp(_.escapeRegExp(searchString), 'i')
        const searchColumns = ["shortDescription","Material","Organism","dataID","Title","Email","Type","Experimentator"]
        const isMatch = result => _.filter(searchColumns.map(v => re.test(result.paramsFile[v]))).length > 0
        //const isMatch = result => re.test(result.shortDescription) | re.test(result.Material) | re.test(result.Organism) | re.test(result.dataID) | re.test(result.Title) | re.test(result.Email)  | re.test(result.Email)
        var filteredSubmissions = _.filter(submissionDetails.submissions, isMatch)
        return filteredSubmissions
    }

    const handleSearchInput = (e) => {
        const searchString =  e.target.value 
        //const isMatch = result => re.test(result.shortDescription) | re.test(result.Material) | re.test(result.Organism) | re.test(result.dataID) | re.test(result.Title) | re.test(result.Email)  | re.test(result.Email)
        var filteredSubmissions = getStringMatchSubmissions(searchString)

        if (submissionDetails.submissionFilter !== undefined && submissionDetails.submissionFilter !== "None") {
            filteredSubmissions = _.map(filteredSubmissions,v => v.paramsFile.State === submissionDetails.submissionFilter)
        }
        var filteredDataIDSubmissions  = filteredSubmissions.map(v => v.dataID)
        
        setSubmissions(prevValues => {
            return { ...prevValues, "submissionsToShow":filteredDataIDSubmissions,"searchString" : searchString}})

    }

    const openSampleListDialog = (dataID) => {

        setSampleListDialog({isOpen:true,dataID:dataID})
    }

    

    const handleSubmissionUpdate = (dataID,updated_src) => {
        
        let s = submissionDetails.submissions.map(v => {
            if (v.dataID === dataID){
                v.paramsFile = updated_src
                return v
            }
            else {
                return v
            }
        })

        // to show only the ones that were selected before

        setSubmissions(prevValues => {
            return { ...prevValues, "submissions":s, "submissionSatesCounts":getStateCounts(submissionDetails.states,s)}})
    }


    const setUpdatedState = (dataID,state=true) => {
        var copiedState = {...updatedDataIDs}
        copiedState[dataID] = state
        setUpdatedDataIDs(copiedState)
        // if (Object.keys(copiedState).includesdataID){
        //     let newState = !copiedState[dataID]
        //     copiedState[dataID] = newState
        // }
        // else {
           
        // }
        
    }


    
    return (
        <div className="submission-admin-view">
             <Alert {...alertState} canEscapeKeyCancel={true} canOutsideClickCancel={true} onClose={e => setAlertState({isOpen:false})}/>
             <MCCreateSampleList {...sampleListDialog} onClose = {setSampleListDialog} token={token} handleDataChange = {handleSubmissionUpdate}/>
             <MCMethodEditingDialog 
                {...experimentalDetails}
                handleDataChange = {handleSubmissionUpdate}
                onClose = {closeMethodEditingDialog}/>

             <MCGroupingNameDialog 
                {...groupingRenameDetails}
                closeDialog = {closeRenameGroupingDialog} 
                changeGroupingNames = {handleRenameGrouping}/>

             <h2>Submissions</h2>
             <Link to="/admin/">Back</Link>
            {/* <p>Overveiw of submissions. You can search for projects and also edit the submission. You can also transfer the project from here to the MitoCube public space by uploading the data.</p> */}
            <div style={{height:"60px"}}>
            <InputGroup 
                        leftIcon={"filter"} 
                        onChange={handleSearchInput}
                        placeholder="Filter submissions .." 
                        small={true} 
                        rightElement={
                        <div style={{marginRight:"0.5rem"}}>
                            <p>
                                {`${submissionDetails.submissionsToShow.length}/${submissionDetails.submissions.length}`}
                            </p>
                        </div>}
                        />
                
                <div className="hor-aligned-center-div-between">
                <div className="hor-aligned-div">
                    {submissionDetails.states.map(state => {
                        return(
                            <div key={`${state}`} style={{margin:"0.3rem"}}>
                            <p>{state} : {submissionDetails.submissionSatesCounts[state]}</p>
                            </div>
                        )})
                        }
                </div>
                    <div>
                        <MCCombobox 
                        items={_.concat(["None"],submissionDetails.states)} 
                        placeholder = {submissionDetails.submissionFilter!==undefined?submissionDetails.submissionFilter:"Filter .."} 
                        callback = {handleFilterSelection}
                        buttonProps = {{
                            minimal : false,
                            small : true,
                            intent : "primary"}
                            
                        }/>
                    </div>
                </div>
            
            </div>
            <div className="submission-details-item-container">
                {_.isArray(submissionDetails.submissions)?submissionDetails.submissions.map(v => {

                    if (submissionDetails.submissionsToShow.includes(v.dataID)){
                        return(
                        <MCSubmissionItem 
                            key = {v.dataID} 
                            token= {token} 
                            handleDataChange = {handleSubmissionUpdate} 
                            openSampleListDialog = {openSampleListDialog}
                            openRenameGroupingDialog = {openRenameGroupingDialog}
                            openMethodEditingDialog = {openMethodEditingDialog}
                            setAlertState = {setAlertState} 
                            states = {submissionDetails.states}
                            isUpdated = {Object.keys(updatedDataIDs).includes(v.dataID)?updatedDataIDs[v.dataID]:false}
                            setIsUpdated = {setUpdatedState}
                            {...v}/>)
                    }
                    else {
                        return null
                    }

                }):null}
            </div>
        </div>
    )
}


   
