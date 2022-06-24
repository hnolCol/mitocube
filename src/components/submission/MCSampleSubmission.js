import { useState, useEffect } from "react"

import axios from "axios";
import { Alert, Button, ButtonGroup, Code, EditableText, InputGroup, NumericInput } from "@blueprintjs/core";
import { MCCombobox } from "../utils/components/MCCombobox";
import { saveSubmission, getSavedSubmission } from "../utils/Misc";
import _, { isObject } from "lodash";
import { MCGroupingTable } from "./MCGroupingTable";


const initDetails = {
        id : undefined,
        time : undefined
}
const initAlert = {isOpen:false,children:null,icon:"notifications"}
const initSubmission = {"id":undefined,"time":undefined,"details":{},"groupingTable":{columnNames:["Run"],data:[]}}

export function MCSampleSubmission (props) {

    //const [submissionID, setsubmissionID] = useState(initDetails)
    const [submission, setSubmission] = useState(initSubmission)
    const [details, setDetails] = useState([])
    const [alertDetails, setAlertDetails] = useState(initAlert)
    //console.log(props)

    useEffect(() => {

        let s = getSavedSubmission()
        if ( s!==null&&s!==undefined&&isObject(s)&&Object.keys(s).includes("id")&&Object.keys(s).includes("time")){
                    
            setSubmission(s)   

        }
        else {
        axios.get('/api/data/submission/id',{params:{token:props.token}}).then(response => {
               // console.log(response)
                if (response.status === 200 & response.data["success"]){
                    // setsubmissionID(prevValues => {
                    //             return { ...prevValues,"id":response.data["id"],"time":response.data["time"]}})
                    
                
                        setSubmission({id:response.data["id"],time:response.data["time"],details:{},groupingTable:initSubmission.groupingTable}) }
                else {
                    console.log("API ERROR")    
                }
            })}
      }, []);

    
    const saveSubmissionValue = (detailName,value,minValue = undefined) => {
        console.log(value,minValue)
        if (minValue !==undefined && value < minValue) value = ""
        let subDetails = submission.details
        subDetails[detailName] = value
        if (detailName === "n_samples"){
            let groupingTable = submission.groupingTable
            if (groupingTable.data.length < value){
                const addNRows = value - groupingTable.data.length
                let newwData = _.concat(groupingTable.data,_.range(addNRows).map((v,ii) => {return({Run:`${submission.time}_HeNo_000_${(groupingTable.data.length+ii+1).toString().padStart(2,"0")}`})}))
                console.log(newwData)
                groupingTable.data = newwData
                setSubmission(prevValues => {
                    return { ...prevValues, "details":subDetails,"groupingTable":groupingTable}})
            }
            else{
                let newwData = groupingTable.data.splice(0,value)
                groupingTable.data = newwData
                setSubmission(prevValues => {
                    return { ...prevValues, "details":subDetails,"groupingTable":groupingTable}})
            }
        }

        else if (detailName === "n_groupings"){
            console.log(detailName,value)
            console.log(submission.groupingTable)
            let groupingTable = submission.groupingTable
            groupingTable.columnNames = _.concat(["Run"],_.range(value).map(v => `Grouping ${v+1}`))
            setSubmission(prevValues => {
                return { ...prevValues, "details":subDetails,"groupingTable":groupingTable}})
        }

        else{
            setSubmission(prevValues => {
                return { ...prevValues, "details":subDetails}})
        }
        

    }

    const resetForm = () => {

        setSubmission(prevValues => {
            return { ...prevValues, "details":{}}})
        saveSubmission(null)
    }

    const saveSubmissionDetailsToLocalStorage = () =>{
       
        saveSubmission(submission)
    }

    const handleDataEditing = (value,rowIndex,columnIndex) => {
       
        let tableData = submission.groupingTable
        tableData.data[rowIndex][tableData.columnNames[columnIndex]] = value
       // console.log(value,rowIndex,columnIndex)
        setSubmission(prevValues => {
            return { ...prevValues, "groupingTable":tableData}})
    }

    const submitExperiment = () => {
        const [ok,msg] = checkDetailInput(submission,details)
        console.log(ok,msg)
        if (!ok){
            setAlertDetails({isOpen:true,children:<div>{msg}</div>,icon:"issue"})
        }
    }

    const closeAlert = (e) => {
        setAlertDetails(initAlert)
    }
   // console.log(submission)

    return(

        <div style={{fontSize:"0.80rem","width":"70%",transform:"translateX(20%)"}}>
            <Alert {...alertDetails} canOutsideClickCancel = {true} intent = {"danger"} onClose = {closeAlert}/>
            <div>
                <h2>Sample submission</h2>
                <h3>{submission.id}</h3> 
                <Code>{submission.time}</Code>
                <p>Please fill out all fields below regarding your proteomics sample submisison.</p>
            </div>
            <MCSubmissionDetails 
                token = {props.token} 
                submission = {submission.details} 
                saveSubmissionValue = {saveSubmissionValue}
                details = {details} 
                setDetails = {setDetails}/>
            <div>
            <MCGroupingTable 
                    data = {submission.groupingTable.data} 
                    columnNames = {submission.groupingTable.columnNames}
                    handleDataEditing = {handleDataEditing}/>
                    <p>{submission.groupingTable.data.length===0?"Adjust number of samples to assign groupings.":"0000 is a placeholder for the facility project id and will be assigned after acceptance of your project. Measured raw files will be named as shown here."}</p>
            </div>
            <ButtonGroup minimal={false}>
                <Button text={""} onClick={resetForm} icon="refresh"/>
                <Button text={""} onClick={saveSubmissionDetailsToLocalStorage} icon="floppy-disk"/>
                <Button text={"Submit"} intent="primary" icon="send-to" onClick={submitExperiment}/>
            </ButtonGroup>
        </div>
    )

}


function checkDetailInput(submission,details) {
    const detailNames = details.map(v=>v.name)
    const detailNamesInSubmission = Object.keys(submission.details)

    const missingDetails = detailNames.filter(v => !detailNamesInSubmission.includes(v))
    if  (missingDetails.length !== 0){
        return ([false, "The following parameters are missing: " + _.join(missingDetails,", ")])
    }
    
    if (submission.details["Research Aim"] !== undefined && submission.details["Research Aim"].length < 100){
        return ([false, "The 'Research Aim' is too short (< 100 characters). Please provide more information."])
    }
    if (submission.details["n_samples"] < submission.details["n_replicates"]){
        return ([false, "Number of replicates is bigger than the number of samples."])
    }

    return ([true,"Submitting."])

}


function MCSubmissionDetails (props) {
    const {submission,saveSubmissionValue, details, setDetails} = props
    
    
    
    useEffect(() => {
        axios.get('/api/data/submission/details',{params:{token:props.token}}).then(response => {
                if (response.status === 200 & response.data["success"]){
                    setDetails(response.data.details)
                }
                else {
                    console.log("API ERROR")    
                }
            })
      }, []);


    
    //console.log(submission)

    return(

        <div style={{display:"flex",flexDirection:"column",justifyItems:"center",justifyContent:"center"}}>
            {details.map(v => 

                {   
                    if (v.field === "numeric-input"){
                        v["value"] = submission[v.name]!==undefined?submission[v.name]:""
                        return (
                            <MCNumericInput key = {v.name} detailName = {v.name} cb = {saveSubmissionValue} {...v}/>
                        )
                    }
                    else if (v.field === "text-input") {
                        v["value"] = submission[v.name]!==undefined?submission[v.name]:""
                        return(
                            <MCTextInput key = {v.name} detailName = {v.name} cb = {saveSubmissionValue} {...v}/>
                        )
                    }
                    else if (v.field === "textfield-input") {
                        v["value"] = submission[v.name]!==undefined?submission[v.name]:""
                        return(
                        <MCTextFieldInput key = {v.name} detailName = {v.name} cb = {saveSubmissionValue} {...v} />
                        )
                    }
                    else if (v.field === "combo-input") {
                        v["placeholder"] = submission[v.name]!==undefined?submission[v.name]:v["text"]
                        
                        return(
                            <MCComboInput key = {v.name} {...v} detailName = {v.name} cb = {saveSubmissionValue}/>
                        )
                    }
                    return null

                })}
            </div>
    )
}


function MCComboInput(props) {
    const {q,field, detailName, cb, ...rest} = props 
    return(
        <div style={{width:"100%",minHeight:"2.5rem",maxHeight:"2.5rem",paddingTop:"0.5rem"}}>
            <MCCombobox callback = {cb} callbackKey = {detailName} selectFill = {true} {...rest}/>
        </div>
    )
    
}


function MCTextFieldInput(props) {
    const {q,field, detailName, cb, title, ...rest} = props 
    return (
        <div style={{width:"100%",minHeight:"7rem",maxHeight:"7rem",marginTop:"10px",backgroundColor:"white"}}>
            {title!==undefined?<div style={{fontSize:"0.85rem",fontWeight:"bold"}}>{title}</div>:null}
            <div style={{overflowY:"hidden",overflowX:"hidden",height:"5rem",marginTop:"2px",marginRight:"2px"}}>
            <EditableText {...rest} onChange={value => props.cb(props.detailName,value)} multiline={true} minLines={6}/>
            </div>
        </div> 
    )
}

function MCTextInput (props) {
    const {q,field, detailName, cb, ...rest} = props 
   
    return(
        <div style={{minHeight:"3rem",maxHeight:"3rem"}}>
            <div style={{minHeight:"0.8rem",fontSize:"0.6rem"}}>
                {rest.value!==undefined&rest.value!==""?q:" "}
            </div>
        <InputGroup {...rest} onChange={e => props.cb(props.detailName,e.target.value)}/>
        </div>
    )
}


function MCNumericInput(props) {
    
    const {q,field, detailName, cb, ...rest} = props 
    return (
        <div style={{minHeight:"3rem",maxHeight:"3rem", width:"100%"}}>
            <div style={{minHeight:"0.8rem",fontSize:"0.6rem"}}>
                {rest.value!==undefined&rest.value!==""?q:""}
            </div>
        <NumericInput {...rest} onValueChange={(value,valueAsString) => cb(detailName,value,rest["min"])} fill={true}/>
        </div>
    )
}

MCNumericInput.defaultProps = {

}