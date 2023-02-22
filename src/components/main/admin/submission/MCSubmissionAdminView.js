import { Alert, Button, Collapse, InputGroup, Code, ButtonGroup, MenuItem, Menu, MenuDivider, Icon } from "@blueprintjs/core"
import { useState, useEffect } from "react"
import { Link } from "react-router-dom"

import axios from "axios"
import ReactJson from 'react-json-view'
import { MCCombobox } from "../../../utils/components/MCCombobox"
import { arrayOfObjectsToTabDel, arrayToTabDel, downloadJSONFile, downloadTxtFile } from "../../../utils/Misc"
import _ from "lodash"
import { Text } from "@visx/text"
import { MCCreateSampleList } from "../../../submission/MCCreateSampleList"
import { Popover2, Tooltip2 } from "@blueprintjs/popover2"
import { MCGroupingNameDialog, MCMethodEditingDialog, MCSubmissionOverviewDialog } from "./MCSubmissionDialogs"
import { MCHeader } from "../../../utils/components/MCHeader"
import { MCSimpleResponseCheck, MCTokenValidCheck } from "../../../utils/ResponseChecks"
import { MCTooltipButton } from "../../../utils/components/MCTooltipButton"
import { readLinesAndColumnNamesFromTxtFile } from "../../../utils/FileReading"
import { extractGroupsByRunNameFromGrouping } from "./MCGroupingExtraction"
import { fromDateToString } from "../../../utils/DateFormatting"


const initRenameGrouping = {isOpen:false,groupingNames:[],dataID:undefined,paramsFile:{}}
const initExperimental = {isOpen:false,dataID:undefined,paramsFile:{}}



function MCSubmissionItem(props) {
    const {dataID, token, handleDataChange, paramsFile, states, setAlertState,openSampleListDialog, openRenameGroupingDialog, isUpdated, setIsUpdated, openMethodEditingDialog, tagNames, openSubmissionOverviewDialog} = props
    
    const [isOpen, setIsOpen] = useState(false)
    const [alertDetails, setAlertDetails] = useState({
        isOpen: false,
        children: <div><p>Alert</p></div>,
        intent: "none",
        loading : false,
        onConfirm: undefined,
        onCancel: undefined,
        cancelButtonText : undefined
    })
    

    const onEditJsonParams = (params) => {
        
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
        else if (params.name === "Creation Date" && params.new_value instanceof Date) {
            // this must actually be converted to string
            let dateString = fromDateToString(params.new_value)
            params.updated_src["Creation Date"] = dateString
            
        }
        else if (params.name === "Creation Date" && _.isNumber(params.new_value)) {
            // this must actually be converted to string
            params.updated_src["Creation Date"] = `${params.new_value}`
            
        }

        setIsUpdated(dataID,true)
        handleDataChange(dataID,params.updated_src)
         
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
    const handleDelete = () => {
        // handle delete of submission (actually putting to archive)
        axios.delete('/api/data/submission/details', {data : {token : token, dataID : dataID}}).then(response => {
            setAlertState({isOpen:true,children:<div>{response.data.msg}</div>})
        })
    }


    const resetAlert = () => {
        setAlertDetails(prevValues => {
            return { ...prevValues, isOpen: false, children: <div></div> }
        })

    }

    const alterAlertChildren = (children, isString = true, intent = "none", icon = "none", cancelButtonText = undefined, onConfirm = resetAlert, onCancel = undefined) => {
        if (isString) {
            setAlertDetails(prevValues => {
                return {
                    ...prevValues,
                    children: <div><p>{children}</p></div>,
                    intent,
                    icon,
                    cancelButtonText,
                    "onConfirm": onConfirm,
                    "onCancel": onCancel
                }
            })
        }
        else {
            setAlertDetails(prevValues => {
                return {
                    ...prevValues, children, intent, icon, cancelButtonText,
                    "onConfirm": onConfirm, "onCancel": onCancel
                }
            })
        }
    }

    const uploadFile = (columnNames, dataArray, paramsFile) => {
        
        setAlertDetails(prevValues => { return { ...prevValues, loading: true } })
        const postData = { columnNames, values: dataArray, paramsFile, token, dataID }
        let commonAlertStateChange = {loading: false, "onConfirm" : resetAlert, cancelButtonText : undefined}
        
        axios.post('/api/dataset',
            postData, {
            headers: { 'Content-Type': 'application/json' }
        }).then(response => {
            
            if (MCSimpleResponseCheck(response.data)){
                let children = <div><p>Data successfully added to the MitoCube database.</p></div>
                setAlertDetails(prevValues => {
                    return {
                        ...prevValues,
                        children, ...commonAlertStateChange
                    }
                })
            }
            else {
                let children = <div><p>There was an error: {response.data["msg"]}.</p></div>
                setAlertDetails(prevValues => {
                    return {
                        ...prevValues,
                        icon : "error",
                        intent : "danger",
                        children, ...commonAlertStateChange
                    }
                })
            }
        }).catch((error) => {
            let children = <div><p>The API returned an unspecified error. {error}</p></div>
            setAlertDetails(prevValues => {
                return {
                    ...prevValues,
                    intent: "danger",
                    icon : "error",
                    children, ...commonAlertStateChange
                }
            })
        })

    }

    const handleFileUpload = (e, paramsFile) => {
        setAlertDetails(prevValues => {return {...prevValues,isOpen:true,children:<div><p>File reading started...</p></div>}})
        const fileList = e.target.files
        if (fileList.length === 1) {
            let file = fileList[0] //first item in files, we just want a single file
            if (file.type === "text/plain") {
                alterAlertChildren("Text file found...")
                const reader = new FileReader()
                reader.onload = (readEvent) => {
                    let {columnNames, dataArray} = readLinesAndColumnNamesFromTxtFile(readEvent)
                    let { success, expressionColumns } = getExpressionColumnsFromParamFile(paramsFile)
                    let allExpressionColumnsFound = checkForAllItemsInArray(columnNames,expressionColumns)
                    if (!success) {
                        alterAlertChildren("Only plain txt files are allowed.",true,"danger")
                    }
                    if (!columnNames.includes("Key")) {
                        alterAlertChildren("File column names (first row) must contain the column name 'Key'",true,"danger","error")
                    }
                    if (allExpressionColumnsFound) {
                        alterAlertChildren(`File checked. ${dataArray.length} data rows / features detected. Click okay to upload file to MitoCube database.`,
                            true, "success", "tick", "Cancel",() => uploadFile(columnNames,dataArray,paramsFile),resetAlert)
                    }
                    else {
                        let missingColumns = _.filter(expressionColumns, columnName => !columnNames.includes(columnName))
                        let children = <div>
                            <p>
                                Not all expression columns were found!<br></br><span style={{ fontWeight: "bold" }}>{missingColumns.length} of {expressionColumns.length}</span> specified could not be detected.
                                <br></br>Please ensure that the file contains all sample names specified in the paramsFile's groupings.
                            </p>
                            <div className="little-m" style={{maxHeight:"10rem",overflowY:"scroll",minWidth:"100%",paddingRight:"1rem"}}>
                                <p>The following files could not be found in the submitted data file.:</p>
                                <div className="vert-align-div">
                                    {missingColumns.map((missingColumnName, idx) => <div className="middle-m white-bg" style={{width:"100%"}} key={missingColumnName}>{idx} : {missingColumnName}</div>)}
                                </div>
                            </div>
                        
                        </div>
                        alterAlertChildren(children,false,"danger","error")
                    }
                    
                }
                reader.readAsText(file)
            }
            else {
                alterAlertChildren("Only plain txt files are allowed.",true,"danger","error")   
            }
        }
        else {
            alterAlertChildren("Please select a single file.",true,"danger","error")
        }
    }


    return(
        <div>
            <Alert style={{minWidth:"50vw"}} {...{ ...alertDetails, canEscapeKeyCancel: false, canOutsideClickCancel: false }}
                />
        <MCSubmissionHeader 
                paramsFile = {paramsFile} 
               // states = {states} 
                //isOpen={isOpen} 
                setIsOpen={setIsOpen} 
                handleDelete={handleDelete} 
                //handleStateChange = {handleStateChange} 
                //isUpdated={isUpdated}
                handleUpdate={handleUpdate}
                //handleFileUpload={handleFileUpload}
                // tagNames={tagNames}
                {...{isUpdated, isOpen,  states, handleStateChange, openSampleListDialog,openRenameGroupingDialog, openMethodEditingDialog, tagNames, handleFileUpload, openSubmissionOverviewDialog}}
                //openSubmissionOverviewDialog={ }
               // openSampleListDialog = {openSampleListDialog}
                //openRenameGroupingDialog = {openRenameGroupingDialog}
                openMethodEditingDialog = {openMethodEditingDialog}
                />
        
        <Collapse isOpen={isOpen}>
            <div style={{maxHeight:"50vh",overflowY:"scroll"}}>
            <ReactJson  
                // theme={"shapeshifter:inverted"} 
                        src = {paramsFile} 
                        displayDataTypes={false} 
                        style={{ fontSize: ".75rem" }}
                        name={false} onEdit={onEditJsonParams} />
            </div>
        </Collapse>

        </div>
    )
}


// function readLinesAndColumnNamesFromTxtFile(readEvent, cellSplit = "\t") {
//     let lines = readEvent.target.result.replace(/\r\n/g,'\n').split('\n')
//     const columnNames = lines[0].split(cellSplit)
//     const dataArray = _.range(1, lines.length).map(idx => lines[idx].split("\t")) //skip column names
//     return {columnNames, dataArray}
// }

function getExpressionColumnsFromParamFile(paramsFile) {
    if (_.has(paramsFile, "groupingNames")) {
        let groupingNames = paramsFile["groupingNames"]

        if (_.isArray(groupingNames) && groupingNames.length > 0) {
            let groupingName = groupingNames[0]

            if (_.has(paramsFile["groupings"], groupingName)) {

                let grouping  = paramsFile["groupings"][groupingName]
               
                let expressionColumns = _.flatten(Object.values(grouping))
          
                return { success: true, expressionColumns }
            }
        
    }
    }
    return { success: false, expressionColumns : [] }
    
}

function checkForAllItemsInArray(array, items) {
    return _.every(items,(item) => array.includes(item))
}
function checkForKeysInObject(object, keys) {
    let objectKeys = Object.keys(object)
    return _.every(keys,(key) => objectKeys.includes(key))
}

function MCSubmissionHeader (props) {
    const {paramsFile, states, isOpen, setIsOpen, handleDelete, handleStateChange, isUpdated, handleUpdate, handleFileUpload, openSampleListDialog, openRenameGroupingDialog, openMethodEditingDialog, tagNames, openSubmissionOverviewDialog}= props
    const [mouseOverDataID, setMouseOverDataID] = useState(false)
    //const [uploadFileName, setUploadFileName] = useState("")

    const dateString =  `${paramsFile["Creation Date"].substring(0,4)}-${paramsFile["Creation Date"].substring(4,6)}-${paramsFile["Creation Date"].substring(6)}`
    
    const getDaysSinceSumbission = (dateString) => {

        const d =  new Date(dateString)
        const now = new Date()
        
        const diffTime = Math.abs(now - d);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 

        return `${diffDays} days`
    }

    const getResearchAimFromParamsFile = (paramsFile) => {
        if (paramsFile.shortDescription !== undefined && _.isString(paramsFile.shortDescription)) {
            return paramsFile.shortDescription //older naming
        }
        else {
            if (_.has(paramsFile, "Experimental Info") && _.isArray(paramsFile["Experimental Info"])) {
                let researchAim = _.filter(paramsFile["Experimental Info"], expInfo => expInfo.title === "Research Aim")
                if (researchAim.length > 0) {
                    return researchAim[0].details
                }
                return ""
            }
        }
    }
   

    return(
        <div key = {paramsFile.dataID} className="submission-container" onMouseEnter={e => setMouseOverDataID(paramsFile.dataID)} onMouseLeave={e => setMouseOverDataID(undefined)}>
            
           
            <div className="submission-box">
                        <div style={
                            {
                                color:mouseOverDataID===paramsFile.dataID? "#3f5b66":"#2F5597", 
                                transitionDuration:"1.5s",
                                transitionProperty:"color"
                            }}>
                                <h3>{paramsFile.Title}</h3>
                        </div>

                        <div style={{fontSize:"1em",paddingRight:"5rem"}}>
                            {getResearchAimFromParamsFile(paramsFile)}
                        </div>
                        <div className="dataset-tag-box">
                            {tagNames.map(k => {
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
                    
                    <MCTooltipButton
                        content={<div><p>Open Submission Overview</p></div>}
                        icon="eye-open"
                        onClick={() => openSubmissionOverviewDialog(paramsFile.dataID,paramsFile)} />
                    
                    <MCTooltipButton
                        content={<div>
                            <p>Create a sample list (Run Name and Plate position + Groupings) for example Xcalibur.</p>
                            <p>It is recommended to scramble the runs.</p>
                            </div>}
                        icon="th-list"
                        onClick={() => openSampleListDialog(paramsFile.dataID)}/>

                        <MCCombobox 
                                items = {states} 
                                placeholder="State .."
                                callback = {handleStateChange}
                                buttonProps = {{
                                            minimal : true,
                                            small : true,
                                            icon : "tag"
                        }} />
                    
                    <Tooltip2 content={<div><p>Upload file (quantitative matrix) for submission and transfer to MitoCube database for direct accessment.</p></div>}>
                        <label style={{outline:"none"}}>
                            <input className="bp4-file-input" type="file" multiple={false} onChange={(e) => handleFileUpload(e, paramsFile)} disabled={true} />
                            
                            <div style={{ marginTop: "2px" }} className="bp4-button bp4-minimal">
                                <div className="hor-aligned-div">
                                    <div style={{minWidth:"1rem"}}><Icon icon="upload" /></div>
                                    <div>Upload</div>
                                </div>
                            </div>
                        </label>
                    </Tooltip2>

                    <div style={{minWidth:"4rem"}}></div>
                    <MCTooltipButton
                        content={<p>Download complete paramter file as a json file.</p>}
                        icon="download"
                        intent="primary"
                        onClick={() => downloadJSONFile(paramsFile, `params-${paramsFile.dataID}`)}/>
                    
                    <MCTooltipButton
                        content={<p>Download submission summary as tab-delimited text file.</p>}
                        icon="download"
                        intent="success"
                        onClick={() => downloadTxtFile(arrayToTabDel(extractMainParamsFromJSON({ ...paramsFile, ...extractGroupsByRunNameFromGrouping(paramsFile)}),["Parameter","Value"]),`params-${paramsFile.dataID}.txt`)}/>
                    
                    <MCTooltipButton
                        content={<p>Place project to archive.</p>}
                        icon="trash"
                        intent="danger"
                        onClick={handleDelete}/>
                                     
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
        return({Parameter:v,Value:_.isString(value)?_.replace(paramsFile[v],/\n/g,""):_.isArray(value)&&_.isString(value[0])?_.join(value,"\t"):JSON.stringify(value)})
    })
    
    return extractedParams 
}



function MCSubmissionTimeLine (props) {
    const {states, state} = props 
    var posText = 0
    const xStart = 10
    const svgWidth = 10 + (states.length-1)*20 + 10
    return(
        <div style={{marginRight:"1rem"}}>
            <svg width={svgWidth } height = {100}>
                <line x1 = {xStart} x2={10 + (states.length-1)*20} y1={50} y2={50} stroke="black" strokeWidth={0.5}/>
                {_.isArray(states)?_.range(states.length).map(v => {
                    if (states[v] === state) posText += xStart+v*20
                    
                    return(
                        <circle key = {v} cx = {xStart+v*20} cy={50} fill = {states[v] === state?"#2F5597":"#efefef"} stroke={"black"} strokeWidth={0.5} r={7}/>
                    )}):null}
                <line x1 = {posText} x2 = {posText} y1 = {60} y2 = {68} stroke={"black"} strokeWidth={0.5}/>
                <Text x = {posText<60?posText-4:posText+4} y= {70} textAnchor={posText<60?"start":"end"} verticalAnchor="start" fill="#828282">{state}</Text>
            </svg>

        </div>

    )
}


export function MCSubmissionAdminView(props) {

    const { token, logoutAdmin } = props    
    const [submissionDetails, setSubmissions] = useState({
        submissions: [],
        states: [],
        tagNames : [],
        searchColumns : [],
        submissionSatesCounts: {},
        submissionsToShow: [],
        submissionFilter: "None",
        searchString: "",
        submissionSummaryParams: []
    })
    const [groupingRenameDetails, setGroupingRenameDetails] = useState(initRenameGrouping)
    const [experimentalDetails, setExperimentalDetails] = useState(initExperimental)
    const [sampleListDialog, setSampleListDialog] = useState({ isOpen: false })
    const [subissionOverviewDialog, setSubissionOverviewDialog] = useState({ isOpen: false, dataID: undefined, paramsFile: {} })
    const [updatedDataIDs, setUpdatedDataIDs] = useState({})
    const [alertState, setAlertState] = useState({isOpen:false,children:<div>Warning!</div>})
    
    

    useEffect(() => {
        // use react query. 
        axios.get("/api/admin/submissions", { params: { token: token } }).then(response => {
            
            if (response.status===200 & MCSimpleResponseCheck(response.data)) {
                const stateCounts = getStateCounts(response.data.states, response.data.submissions)
                let responseData = response.data
               setSubmissions(
                    {
                        submissions:responseData.submissions, 
                        states: responseData.states, 
                        tagNames : responseData.tagNames,
                        searchColumns : responseData.searchColumns,
                        submissionSummaryParams : responseData.submissionSummaryParams,
                        submissionSatesCounts : stateCounts,
                        submissionsToShow :responseData.submissions.map(v => v.dataID),
                        submissionFilter : "None",
                        searchString : ""
                    })
            }
            else if (!MCTokenValidCheck(response.data) && _.isFunction(logoutAdmin)) {
                //loguout from admin section if token is not valid.
                logoutAdmin()
            }
        })
          
        }, []);


    const openRenameGroupingDialog = (dataID,paramsFile) => {
        
        setGroupingRenameDetails({isOpen:true,dataID:dataID,paramsFile:paramsFile,groupingNames:paramsFile.groupingNames})

    }

    const openMethodEditingDialog = (dataID,paramsFile) => {

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

        const submissionsFiltered = filterName === "None"?_.map(filteredSubmissions, v => v.dataID):_.map(_.filter(filteredSubmissions, v => v.paramsFile.State === filterName),v => v.dataID)
        setSubmissions(prevValues => {
            return { ...prevValues, "submissionsToShow":submissionsFiltered, "submissionFilter":filterName}})

    }

    const getStringMatchSubmissions = (searchString) => {
        if (searchString === "") return submissionDetails.submissions
        const re = new RegExp(_.escapeRegExp(searchString), 'i')
        // search columns should be provided by API!
        const searchColumns = submissionDetails.searchColumns.slice() // ["shortDescription","Material","Organism","dataID","Title","Email","Type","Experimentator"]
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
    }


    const downloadProjectSummary = (event, notThisState = undefined) => {

        let submissions = submissionDetails.submissions
        if (submissions.length > 0) {
            let summaryColumns = submissionDetails.submissionSummaryParams
            if (_.isArray(summaryColumns) && summaryColumns.length > 0){ 
                let filteredSubmission = notThisState!==undefined?_.filter(submissions, v => v.paramsFile.State !== notThisState):submissions.slice()
                let submissionSummary = filteredSubmission.map(submission => Object.fromEntries(summaryColumns.map(sumColumn => [sumColumn, submission.paramsFile[sumColumn]])))
                downloadTxtFile(arrayOfObjectsToTabDel(submissionSummary,summaryColumns),`ProjectSummary(${notThisState===undefined?"allStates":"allStatesBut"+notThisState}).txt`)
            }
        }
    }

    const downloadNotLastStateProjects = (event) => {
        
        let notThisState = submissionDetails.states.slice(-1)[0]
        if (notThisState !== undefined) {
            downloadProjectSummary(undefined, notThisState)
        }
    }

    const openSubmissionOverviewDialog = (dataID, paramsFile) => {
        setSubissionOverviewDialog(prevValues => {return {...prevValues,isOpen : true, dataID : dataID, paramsFile: paramsFile}})
    }

    
    return (
        <div className="submission-admin-view">
            
            <Alert {...alertState} canEscapeKeyCancel={true} canOutsideClickCancel={true} onClose={e => setAlertState({ isOpen: false })} />
            <MCSubmissionOverviewDialog
                {...subissionOverviewDialog}
                canEscapeKeyCancel={true}
                canOutsideClickCancel={true}
                paramNames={submissionDetails.submissionSummaryParams}
                onClose={() => setSubissionOverviewDialog(prevValues => { return { ...prevValues, isOpen: false } })} />
            
             <MCCreateSampleList {...sampleListDialog} onClose = {setSampleListDialog} token={token} handleDataChange = {handleSubmissionUpdate}/>
             <MCMethodEditingDialog 
                {...experimentalDetails}
                handleDataChange = {handleSubmissionUpdate}
                onClose = {closeMethodEditingDialog}/>

             <MCGroupingNameDialog 
                {...groupingRenameDetails}
                closeDialog = {closeRenameGroupingDialog} 
                changeGroupingNames = {handleRenameGrouping}/>

            <MCHeader text={"Submissions"}/>
            <div className="top-right-absolute-container">
                <div className="hor-aligned-div">
                    <Link to="/admin">
                        <Button minimal={true} small={true} icon="arrow-left" />
                    </Link>
                    <Link to="/">
                        <Button minimal={true} small={true} icon="home" />
                    </Link>
                </div>
            </div>
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
                    <ButtonGroup>
                        <Tooltip2 content={
                                <div>
                                <p>Download project summary of runs not equal to '{submissionDetails.states.slice(-1)[0]}'</p>
                                <p>as a txt tab delimted file.</p>
                                </div>}>
                        <Button
                            intent="success"
                            minimal={ true}
                            onClick={downloadNotLastStateProjects}
                                rightIcon={"download"} />
                        </Tooltip2>
                        
                        <Tooltip2 content={
                                <div>
                                <p>Download project summary of all projects in the database.</p>
                                </div>}>
                            <Button 
                                intent="warning"
                                minimal={true}
                                rightIcon={"download"}
                                onClick={downloadProjectSummary} />
                        </Tooltip2>
                        <MenuDivider/>
                        <Button text={"Filter : "} minimal={true} small={true} />
                        <MCCombobox 
                        items={_.concat(["None"],submissionDetails.states)} 
                        placeholder = {submissionDetails.submissionFilter!==undefined?submissionDetails.submissionFilter:"Filter .."} 
                        callback = {handleFilterSelection}
                        buttonProps = {{
                            minimal : true,
                            small : true,
                            intent : "primary"}
                            
                        }/>
                    </ButtonGroup>
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
                                openMethodEditingDialog={openMethodEditingDialog}
                                openSubmissionOverviewDialog={openSubmissionOverviewDialog}
                            setAlertState = {setAlertState} 
                            states={submissionDetails.states}
                            tagNames={submissionDetails.tagNames}
                            
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


   
