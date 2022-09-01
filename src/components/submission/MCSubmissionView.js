import { Alert, Button, Collapse, Icon, InputGroup, Code, ButtonGroup } from "@blueprintjs/core"
import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { motion } from "framer-motion"
import { MCAnimatedPercentage } from "../utils/components/MCSVGUtils"
import { MCPerformanceChart } from "./charts/MCPerformanceChart"
import axios from "axios"
import { MCCSVDownload } from "../utils/components/MCCSVDownload"
import ReactJson from 'react-json-view'
import { MCCombobox } from "../utils/components/MCCombobox"
import _ from "lodash"
import { Text } from "@visx/text"
const instruments = ["QExactive 1","QExactive 2"]

const instrumentMetrices = [{name:"Identified Peptides",value:0.5},{name:"MS/MS Identification",value:0.88},{name:"Proteins",value:0.94}]


function MCSubmissionItem(props) {
    const {dataID, token, handleDataChange, paramsFile, states, setAlertState} = props
    const [isOpen, setIsOpen] = useState(false)
    const [isUpdated, setIsUpdated] = useState(false)

    const onEditJsonParams = (params) => {
        console.log(params)
        if (["dataID","SampleNumber"].includes(params.name)){
            setAlertState({isOpen:true,children:<div>The dataID and sample number cannot be changed.</div>})
            return false
        }
        else if (params.name === "State" && !states.includes(params.new_value)){
            setAlertState({isOpen:true,children:<div>State must be one of the following: {states.join(", ")}</div>})
            return false
        }
        else {
            setIsUpdated(true)
            handleDataChange(dataID,params.updated_src)
        }
       
        
    }

    const handleUpdate = (e) =>{

        axios.put('/api/data/submission/details', {token : token, dataID : dataID, paramsFile: paramsFile}).then(response => {
            if (response.data !== undefined && response.data.success){
                setIsUpdated(false)
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
            setIsUpdated(true)
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
                handleUpdate = {handleUpdate}/>
        
        <Collapse isOpen={isOpen}>
        
       
            <ReactJson  
                theme={"shapeshifter:inverted"} 
                src = {paramsFile} 
                displayDataTypes={false} 
                style={{fontSize:".75rem"}} name={false} onEdit={onEditJsonParams}/>
        
        </Collapse>

        </div>
    )
}


function MCSubmissionHeader (props) {
    const {paramsFile,states, isOpen, setIsOpen, handleDelete, handleStateChange, isUpdated, handleUpdate}= props
    const [mouseOverDataID,setMouseOverDataID] = useState(false)
    const dateString = `${paramsFile["Creation Date"].substring(0,4)}-${paramsFile["Creation Date"].substring(4,6)}-${paramsFile["Creation Date"].substring(6)}`
    const getDaysSinceSumbission = (dateString) => {

        const d =  new Date(dateString)
        const now = new Date()

        return `${now.getDay()-d.getDay()} days`

    }

    return(
        <div key = {paramsFile.dataID}   className="submission-container" onMouseEnter={e => setMouseOverDataID(paramsFile.dataID)} onMouseLeave={e => setMouseOverDataID(undefined)}>
            <div className="submission-box"
                    >

                        <div style={{color:mouseOverDataID===paramsFile.dataID? "#6e5b7b":"darkgrey", transitionDuration:"1.5s",transitionProperty:"color"}}>
                            <h5>{dateString} ({getDaysSinceSumbission(dateString)} )</h5>
                            <h3>{paramsFile.Title}</h3>
                            {paramsFile.shortDescription}
                        </div>

                        <div className="dataset-tag-box">
                            {["Experimentator","Email","Type","Material","Organism","dataID"].map(k => {
                                return (
                                    <div key={k} className="dataset-prop">
                                    <Code>{paramsFile[k]}</Code>
                                </div>
                                )
                            })}                           
                        </div>
                    <ButtonGroup vertical={false} style={{marginTop:"0.3rem"}}>
                        <Button text="Save" rightIcon="floppy-disk" disabled={!isUpdated} onClick={handleUpdate} intent={!isUpdated?"none":"primary"} minimal={true}/>
                        <Button icon={"edit"} onClick={()=> setIsOpen(!isOpen)} minimal={true} intent={isOpen?"primary":"none"}/>
                        <Button text="" icon="trash"  onClick={handleDelete} intent={"danger"}  minimal={true}/>
                        <MCCombobox 
                                items = {states} 
                                placeholder="State .."
                                callback = {handleStateChange}
                                buttonProps = {{
                                            minimal : true,
                                            small : true,
                                            icon : "tag"
                                        }}/>
                    </ButtonGroup>
                    </div>

                <div className="submission-box" >
                            <p>Submission State</p>
                            < MCSubmissionTimeLine states={states} state={paramsFile.State}/>
                </div>
                </div>
    )
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


export function MCSubmissionAdminView (props) {
    const [submissionDetails, setSubmissions] = useState({submissions:[],states:[],submissionSatesCounts:{},submissionsToShow:[],submissionFilter:"None",searchString:""})
   // const [submissionFilter, setSubmissionFilter] = useState(undefined)
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

    const getStateCounts = (states, submissions) => {

        const stateCounts = Object.fromEntries(states.map(state => [state,0]))
        
        _.forEach(submissions, v => stateCounts[v.paramsFile.State] += 1)
        
        return stateCounts
    }

    const handleFilterSelection = (filterName) => {
        var filteredSubmissions = getStringMatchSubmissions(submissionDetails.searchString)
        // let shownSubmissionDetails = _.filter(submissionDetails.submissions, v => submissionDetails.submissionsToShow.includes(v.dataID))

        const submissionsFiltered = filterName === "None"?_.map(filteredSubmissions, v => v.dataID):_.map(_.filter(filteredSubmissions, v => v.paramsFile.State === filterName),v => v.dataID)
        console.log(filteredSubmissions)
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


    return (
        <div className="submission-admin-view">
             <Alert {...alertState} canEscapeKeyCancel={true} canOutsideClickCancel={true} onClose={e => setAlertState({isOpen:false})}/>
             <h2>Submissions</h2>
            <p>Overveiw of submissions. You can search for projects and also edit the submission. You can also transfer the project from here to the MitoCube public space by uploading the data.</p>
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
                            token={token} 
                            handleDataChange = {handleSubmissionUpdate} 
                            setAlertState = {setAlertState} 
                            states = {submissionDetails.states}
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


export function MCSumissionView(props){
    
    return (
        <div style={{width:"100vw"}}> 
            <Button text="Add performance test" intent="primary" icon="add"/>
            <div style={{width:"70vw",marginLeft:"15vw"}}>
            {instruments.map((v,ii) => <MCInstrumentButton key = {v} title={v}/>)}
            </div>
            
        </div>
    )
}



function MCInstrumentButton (props) {
    const {title} = props
    const [isOpen, setIsOpen] = useState(false)
    const [highlightItem, setHighlightItem] = useState(undefined)
    const [hoverItem, setHoverItem] = useState(undefined)

    const handleButtonClick = () => {
        setIsOpen(!isOpen)
    }

    const handleMetricCircleClick = (metricName) => {
        
        if (highlightItem === metricName) setHighlightItem(undefined)
        
        else{
            setHighlightItem(metricName)
        }
        
    }

    const handleHoverItem = (metricName) => {
        
        if (highlightItem !== metricName)
            {
                setHoverItem(metricName)
            }
    }
    

    return(
        <div >
            <motion.div 
                onClick = {handleButtonClick} 
                whileHover = {{
                    backgroundColor : "#f7f7f7",
                    scale: 1.01
                    
                }}
                style={{
                    display:"flex",
                    flexDirection: "row",
                    alignItems : "center",
                    justifyContent: "space-between",
                    width:"100%",
                    height:"auto",
                    backgroundColor:"#ffffff",
                    marginTop:"1rem"}}>

                <div className="submissonTitle" 
                        style={{
                            fontSize:"1.2rem",
                            marginLeft:"0.5rem",
                            fontWeight:"800"}}>
                <p>{title}</p>
                </div>
                <div>
                {!isOpen?
                <div className="submission-button-container">
                    {instrumentMetrices.map((v,ii) => {
                        return(
                            <div key = {`${v.name}${ii}`}>
                            <MCAnimatedPercentage 
                                    perc={v.value} 
                                    metricName={v.name} 
                                    scale={false}
                                    showValue={false} 
                                    enableHover={false}
                                    backgroundCircleColor = {"#efefef"} 
                                    width={40} 
                                    height={40} 
                                    strokeWidth={4}
                                   />
                            <div style={
                                {fontSize:"0.7rem",
                                float:"right",
                                transform:"translateY(50%)"}}>
                                {v.name}
                            </div>
                            </div>
                        )
                    })}
                    
                  
                </div>:
                    <Icon icon="double-chevron-up"/>}
                </div>
                
            </motion.div >


            <Collapse isOpen={isOpen}>
                <div style={{fontSize:"0.7rem"}}>
                <MCPerformanceTitle title="Recent performance"/>

                    <MCAnimatedPercentage perc={0.89} metricName={"Peptides"}  handleClick = {handleMetricCircleClick} handleHover = {handleHoverItem}/>
                    <MCAnimatedPercentage perc={0.3}/>
                    <MCAnimatedPercentage perc={0.2} metricName={"MS/MS Identification"}  handleClick = {handleMetricCircleClick} handleHover = {handleHoverItem}/>
                    <MCAnimatedPercentage perc={0.6}/>
                <MCPerformanceTitle title="Diagnostics"/>
                <p>Select metrices to display for diagnostics</p>
                <p>Image</p>
                <MCPerformanceTitle title="Performance History"/>
                <p>Main performance metrices</p>
                <p>Time vs peptides</p>
                    <MCPerformanceChart highlightItem = {highlightItem} hoverItem = {hoverItem}/>
                <hr></hr>
                </div>
            </Collapse>
        </div>
    )
}


function MCPerformanceTitle (props) {
    const {title} = props
    return(
        <div className="submissonTitle" 
                        style={{
                            fontSize:"1.2rem",
                            marginLeft:"0.5rem",
                            fontWeight:"800"}}>
                <p>{title}</p>
        </div>
    )

}

MCPerformanceTitle.defaultProps = {
    title : "Tile"
}

   
