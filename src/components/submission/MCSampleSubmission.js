import { useState, useEffect } from "react"

import axios from "axios";
import { Alert, Button, ButtonGroup, Code, EditableText, InputGroup, NumericInput, Position } from "@blueprintjs/core";
import { MCCombobox } from "../utils/components/MCCombobox";
import { saveSubmission, getSavedSubmission, extractNamePrefix } from "../utils/Misc";
import _, { isObject } from "lodash";
import { MCGroupingTable } from "./MCGroupingTable";
import { DateInput2 } from "@blueprintjs/datetime2";


const initAlert = {
    isOpen:false,
    children:null,
    icon:"notifications",
    intent:"danger"
}
const initSubmission = {
    id:undefined,
    time:undefined,
    details:{},
    groupingTable:{columnNames:["Run","Replicate"],
    data:[],
    rerender : 0} // rerender - sets random number to inititate rendereing of table once data change but the shape does not.
}


function buildRunName (time,researcher,nrows,index) {
    return `${time}_${extractNamePrefix(researcher)}_000_${(nrows+index+1).toString().padStart(2,"0")}`
}

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
                    // setsubmissionID(Values => {prev
                    //             return { ...prevValues,"id":response.data["id"],"time":response.data["time"]}})
                    
                
                        setSubmission({id:response.data["id"],time:response.data["time"],details:{},groupingTable:initSubmission.groupingTable}) }
                else {
                    console.log("API ERROR")    
                }
            })}
      }, []);

    
    const saveSubmissionValue = (detailName,value,minValue = undefined) => {
     
        if (minValue !==undefined && value < minValue) value = ""
        let subDetails = submission.details
        subDetails[detailName] = value

        if (detailName === "n_samples"){
            let groupingTable = submission.groupingTable
            if (groupingTable.data.length < value){
                const addNRows = value - groupingTable.data.length
                let newwData = _.concat(groupingTable.data,_.range(addNRows).map((v,ii) => {return({Run:buildRunName(submission.time,submission.details["Researcher"],groupingTable.data.length,ii)})}))
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
        else if (detailName === "Researcher"){
            let groupingTable = submission.groupingTable
            _.range(0,groupingTable.data.length).forEach((v,ii) => groupingTable.data[v]["Run"] = buildRunName(submission.time,submission.details["Researcher"],0,ii))

            setSubmission(prevValues => {
                return { ...prevValues, "details":subDetails,"groupingTable":groupingTable}})
            
        }
        else if (detailName === "n_groupings"){

            let groupingTable = submission.groupingTable
            groupingTable.columnNames = _.concat(["Run","Replicate"],_.range(value).map(v => `Grouping ${v+1}`))
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
            return { ...prevValues, "details":{}, "groupingTable":initSubmission["groupingTable"]}})
        saveSubmission(null)
    }

    const saveSubmissionDetailsToLocalStorage = () =>{
       
        saveSubmission(submission)
    }

    const handleDataEditing = (value,rowIndex,columnIndex) => {
       
        let tableData = submission.groupingTable
        if (_.isArray(rowIndex)){
            rowIndex.forEach(v => tableData.data[v][tableData.columnNames[columnIndex]] = value)
        }
        else {
            tableData.data[rowIndex][tableData.columnNames[columnIndex]] = value
        }
        
       // console.log(value,rowIndex,columnIndex)
        setSubmission(prevValues => {
            return { ...prevValues, "groupingTable":tableData,"rerender":Math.random()}})
    }

    const handleColumnNameEditing = (value,columnIndex) => {
        let tableData = submission.groupingTable
        var columnNames = tableData.columnNames
        columnNames[columnIndex]  = value 
        tableData.columnNames = columnNames
        setSubmission(prevValues => {
            return { ...prevValues, "groupingTable":tableData}})
    }

    const submitExperiment = () => {
        const [ok,msg] = checkDetailInput(submission,details)
        
        if (false && !ok){
            setAlertDetails({isOpen:true,children:<div>{msg}</div>,icon:"issue"})
        }
        else {
            const jsonData = JSON.stringify({token:props.token,submission:submission})
            axios.post('/api/data/submission/details',
                jsonData, {headers: {
                // Overwrite Axios's automatically set Content-Type
                'Content-Type': 'application/json'
                }}, 
            ).then(response => {
                
                    if (!response.data.success) {
                        setAlertDetails(prevValues => {
                            return { ...prevValues, "isOpen":true,"children":<div>{response.data.msg}</div>,"icon":"issue"}})
                    }
                    else {
                        setAlertDetails(prevValues => {
                            return { ...prevValues, "isOpen":true,"children":<div>Submission complete. You will receive a confirmation email.</div>,"icon":"tick","intent":"success"}})
                    }
                }
                )
        }
    }

    const closeAlert = (e) => {
        setAlertDetails(initAlert)
    }

    const handleTemplateInput = (columnNames,dataTable,nReplicates,nSamples) => {
        // handle templete input (e.g. loaded from a txt file)
        
        let tableData = {columnNames:columnNames,data:dataTable}
        let subDetails = submission.details
        subDetails["n_samples"] = nSamples
        subDetails["n_replicates"] = nReplicates

        //update
        setSubmission(prevValues => {
            return { ...prevValues, "groupingTable":tableData}})  
    }
 


    return(

        <div style={{fontSize:"0.80rem","width":"70%",transform:"translateX(20%)"}}>
            <Alert {...alertDetails} canOutsideClickCancel = {true} onClose = {closeAlert}/>
            <div>
                <h2>Sample submission</h2>
                <h3>{submission.id}</h3> 
                <Code>{submission.time}</Code>
                <p>Please fill out all fields below regarding your proteomics sample submisison.</p>
            </div>

            <MCSubmissionDetails 
                token = {props.token} 
                submission = {submission.details} 
                date = {submission.time}
                saveSubmissionValue = {saveSubmissionValue}
                details = {details} 
                setDetails = {setDetails}/>
            <div>
            <MCGroupingTable 
                    data = {submission.groupingTable.data} 
                    rerender = {submission.rerender}
                    columnNames = {submission.groupingTable.columnNames}
                    numReplicates = {submission.details["n_replicates"]!==undefined?submission.details["n_replicates"]:1}
                    handleDataEditing = {handleDataEditing}
                    handleTemplateInput = {handleTemplateInput}
                    handleColumnNameEditing  = {handleColumnNameEditing }/>
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
    const {submission,saveSubmissionValue, details, setDetails, date} = props
    
   
    
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
                    else if (v.field === "date-input"){
                       
                        return(
                            <MCDateInput key = {v.name} detailName = {v.name} initValue = {date}/>
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


function MCDateInput(props) {
    const {q,field, detailName, cb, initValue, ...rest} = props 
    const [dateValue, setDateValue] = useState()

    const valueToShow = dateValue === undefined && initValue !== undefined && initValue.length === 8? `${initValue.substring(0,4)}-${initValue.substring(4,6)}-${initValue.substring(6)}` :dateValue

    return(
        <div style={{width:"100%",minHeight:"2.5rem",maxHeight:"2.5rem",paddingTop:"0.5rem"}}>
        <DateInput2 
                                parseDate={str => str.split(" ")[0].replace("-","").replace("-","")}
                                onChange = {date => setDateValue(date)}
                                placeholder="YYYYMMDD" 
                                formatDate={date => `${date.getFullYear()}-${date.getMonth()+1>9?"":"0"}${date.getMonth()+1}-${date.getDate()+1>9?"":"0"}${date.getDate()}`} 
                                closeOnSelection={true} 
                                fill={true}
                                value = {valueToShow}/>
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