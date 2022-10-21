import { Button, ButtonGroup, Checkbox, Dialog, H5, H6, InputGroup, NumericInput, TextArea } from "@blueprintjs/core";
import axios from "axios";
import _, { remove } from "lodash";
import { useEffect, useMemo, useState } from "react";
import { MCCombobox } from "../utils/components/MCCombobox";
import { quantile } from "../utils/Misc";


function MCTextInput(props) {

    const {metricName, header, cb, ...rest} = props 
    return(
        <div style={{minHeight:"3rem",maxHeight:"3rem", width:"100%"}}>
            <div style={{minHeight:"0.8rem",fontSize:"0.6rem"}}>
                {metricName==="Date"?`${metricName} (YYYYMMDD)`:metricName}
            </div>
        <InputGroup {...rest}  fill={true}  onChange={(e) => cb(header,metricName,e.target.value)}/> 
        </div>
    )
}

function MCMetric(props) {

    const {metricName, header, cb, returnString, ...rest} = props 
    return(
        <div style={{minHeight:"3rem",maxHeight:"3rem", width:"100%"}}>
            <div style={{minHeight:"0.8rem",fontSize:"0.6rem"}}>
                {metricName}
            </div>
        <NumericInput {...rest}  fill={true} onValueChange={(value,valueAsString) => cb(header,metricName,returnString?valueAsString:value)} buttonPosition="none"/>
        </div>
    )
}
MCMetric.defaultProps = {
    returnString : false
}

function MCQuantileInput(props) {
    const {distName, values, callback, openQuantileCalc, intent, missingFields} = props
    const qsHeader = [["Min","0"],["25% Quantile","0.25"],["Median","0.5"],["75% Quantile","0.75"],["Max","1"]]
    return(
        <div>
        <H6>{distName}</H6>
        <div className="hor-aligned-div">
            {qsHeader.map(v => {
                let headerName = `${distName}_${v[1]}`
            return(<MCMetric 
                key = {v[0]} 
                header = {headerName}
                intent = {_.isArray(missingFields)?missingFields.includes(headerName)?"danger":"none":"none"}
                metricName={v[0]} 
                cb={callback} 
                returnString={true} 
                value={values[v[1]]===undefined?"":values[v[1]]} 
                allowNumericCharactersOnly={true}/>)})}

            <Button minimal={true} rightIcon="document-open" intent={intent} small={true} onClick={() => openQuantileCalc(distName)}/>
        </div>
        </div>
    )
}

MCQuantileInput.defaultProps = {
    values : {}
}

function MCQuantileDialog (props) {

    const {distName, handleQuantileCalc,...rest} = props
    const [removeOutlier, setRemoveOutlier] = useState(true)
    const [data,setData] = useState({"array":[],"qs":[],"n_removed":0})
    const [nIQR, setNIQRT] = useState(1.8)
    const handleDataChange = (textString) => {

        const array = textString.split("\n").map(v=> parseFloat(v))
        if (array.length > 5) {
            calculateQs(array,nIQR,removeOutlier)
        }
        else {
            setData({"array":[],"qs":[],"n_removed":0})
        }
        
    }

    const calculateQs = (array,nIQR = 1.8,removeOutlier = true) => {
       
        const qsAndNOutlier = quantile(array,[0,0.25,0.5,0.75,1.0],nIQR,removeOutlier)
        
        setData({"array":array,...qsAndNOutlier})
    }

    const handleIQRChange = (header,metricName,value) => {
        setNIQRT(value)
        const valueAsNumber = parseFloat(value)
        if (!_.isNaN(valueAsNumber) && valueAsNumber  < 3 && valueAsNumber  > 0.1 && data.array.length > 0) {

            calculateQs(data.array,valueAsNumber ,removeOutlier)
        }
    }

    const handleOutlierChange = (e) => {
        if (data.array.length > 0) {
            calculateQs(data.array,1.8,!removeOutlier)
        }

        setRemoveOutlier(!removeOutlier)
    }

    return(
        <Dialog {...rest}>
            
            <div style={{margin:"1rem"}}>
            <p>Paste Numeric Data to Calculate Quantiles</p>
                <div className="hor-aligned-center-div-sapce-between">
                    <div>
                    <Checkbox label="Remove Outlier" checked={removeOutlier} onChange={handleOutlierChange}/>
                    </div>
                    <MCMetric metricName="Outlier (n * IQR)" value={nIQR} header = "IQRH" cb={handleIQRChange} returnString={true}/>

                </div>
            <TextArea style={{minHeight:"50vh"}} fill={true} onChange={e => handleDataChange(e.target.value)} growVertically={false}/>
            </div>
            <div style={{margin:"1rem"}}>
            <p>{`In total, ${data["n_removed"]} datapoints were considered as outliers (IRQ * ${nIQR}) and removed prior quantile calculation.`}</p>
            <p>Quantiles: {_.join(data.qs," ")}</p>
            <Button text={`Submit for ${distName}`} minimal={true} intent={data.array.length > 0 ? "primary": "none"} rightIcon={data.qs.length === 5?"tick":undefined} fill={true} onClick={e => handleQuantileCalc(distName,data.qs)}/>
            </div>
        </Dialog>
    )
}

export function MCAddPerformanceDialog (props) {

    const {token, onClose, ...rest} = props
    const [performanceDetails, setPerformanceDetails] = useState({})
    const [performanceData, setPerformanceData] = useState({})
    const [quantileCalculator, setQuantileCalculator] = useState({isOpen:false,title:`Quantile Calculator`,isCloseButtonShown:true})
    const [markMissingItems, setMarkMissingItems] = useState({items:[],informationText:"",loading:false})
    const [qcPeptideDialog, setQcPeptideDialig] = useState({isOpen:false,title:`QC Peptide Dialog`,isCloseButtonShown:true})
    


    const metricesFound = ("performanceHeaders" in performanceDetails && _.isArray(performanceDetails["performanceHeaders"]["Metrices"]))
    const distributionsFound = ("performanceHeaders" in performanceDetails && _.isArray(performanceDetails["performanceHeaders"]["Distributions"]))
    const generalInfoFound = ("performanceHeaders" in performanceDetails && _.isArray(performanceDetails["performanceHeaders"]["General"]))
    const propertiesFound = ("performanceHeaders" in performanceDetails && _.isArray(performanceDetails["performanceHeaders"]["Properties"]) && "Properties" in performanceData)
    const peptidesFound = ("performanceHeaders" in performanceDetails && _.isArray(performanceDetails["performanceHeaders"]["QC-Peptides"]))
    
   

    const qcPeptidesNames = peptidesFound?_.uniq(performanceDetails["performanceHeaders"]["QC-Peptides"].map(v => _.split(v,"_")[1])):[]
    const qcPeptidesMetrices = peptidesFound?_.uniq(performanceDetails["performanceHeaders"]["QC-Peptides"].map(v => _.split(v,"_")[0])):[]
    const qcPeptidesMetricesEntered = peptidesFound && _.isObject(performanceData["QC-Peptides"]) && _.compact(Object.values(performanceData["QC-Peptides"])).length > 0
   
    //check if renders every time, useMemo useless? 
    const distrubtionArray = distributionsFound?performanceDetails["performanceHeaders"]["Distributions"]:[]
    const distributionsHeader = useMemo(() => _.uniq(distrubtionArray.map(v=>_.split(v,"_",1)[0])),[distrubtionArray])
    

    useEffect(() => {

        axios.get('/api/admin/performance/details',{token:token}).then(response => {
            if (response.data["success"]) {

                setPerformanceDetails(response.data)
                let phs = Object.keys(response.data["performanceHeaders"])
                let performanceDataBlank = Object.fromEntries(phs.map(ph => [ph,Object.fromEntries(response.data["performanceHeaders"][ph].map(m => [m,undefined]))]))
                
                let distributions = "Distributions" in performanceDataBlank?Object.keys(performanceDataBlank["Distributions"]):[]
                let distBlank = Object.fromEntries(_.flatten(distributions.map(distName => ["0","0.25","0.5","0.75","1"].map(q => [`${distName}_${q}`,undefined]))))
                performanceDataBlank["Distributions"] = distBlank
                
                setPerformanceData(performanceDataBlank)
            }
        })

    },[])

    const saveDataInput = (header,name,value) => {
        
        let copiedHeaderData = performanceData[header]
        copiedHeaderData[name] = value
        
        setPerformanceData(prevValues => {return { ...prevValues,[header] : copiedHeaderData}})

    }

    const propertryCallback = (property,value) => {

        let copiedSelection = {...performanceData["Properties"]}
        copiedSelection[property] = value
        setPerformanceData(prevValues => {return {...prevValues, "Properties" : copiedSelection}})
    }

    const distributionCallback = (header,qsH,value) => {

        let copiedSelection = {...performanceData["Distributions"]}
        copiedSelection[header] = value
        setPerformanceData(prevValues => {return {...prevValues, "Distributions" : copiedSelection}})
    }

    const openQuantileCalculator = (distName) => {

            setQuantileCalculator(prevValues => {return {...prevValues,
                            "isOpen":true,
                            "onClose":closeQuantileCalculator,
                            "title" : `${distName} Quantile Calculator`,
                            "handleQuantileCalc" : handleQuantileCalc,
                            "distName":distName}})
    }
    
    const handleQCPeptideDialog = (e,openDialog=true) => {

        setQcPeptideDialig(prevValues => {return {...prevValues, "isOpen":openDialog}})
    }


    const handleQCPeptideAddition = (qcPeptideByUser) => {

        const qcps = {...performanceData["QC-Peptides"], ...qcPeptideByUser}
        setPerformanceData(prevValues => {return {...prevValues, "QC-Peptides" : qcps}})
    }
    

    const handleQuantileCalc = (distName,qs) => {
      
        closeQuantileCalculator() 
        const qSuffix = ["0","0.25","0.5","0.75","1"]
        let copiedSelection = {...performanceData["Distributions"]}
        _.forEach(qs, (v,i) => copiedSelection[`${distName}_${qSuffix[i]}`] = v)
        setPerformanceData(prevValues => {return {...prevValues, "Distributions" : copiedSelection}})
    }

    const closeQuantileCalculator = () => {

        setQuantileCalculator(prevValues => {return {...prevValues,"isOpen":false}})
    }

    const onSubmit= () => {
        console.log(performanceData)
        setMarkMissingItems({items:[],informationText:"Checking for missing information.",loading:true})
        let mainHeaders = Object.keys(performanceData)
        let missingProps = _.flatten(mainHeaders.map(header => Object.keys(performanceData[header]).map(propHeader => {return({"header" : header,"name" : propHeader, "missing" : performanceData[header][propHeader] === undefined})}))).filter(v => v.missing && v.header !== "QC-Peptides")
        console.log(missingProps)
        if (missingProps.length !== 0){
            setMarkMissingItems({
                    items:missingProps.map(v => v.name),
                    loading : false,
                    informationText:`${missingProps.length} fields missing. Please enter the information/distributions.`})
        }
        else if (peptidesFound&&!qcPeptidesMetricesEntered){
            setMarkMissingItems({items:[],informationText:"No peptide information detected. Please provide information..",loading : false,})
        }
        else {
            setMarkMissingItems({items:[],informationText:"Required information detected. Waiting for API response..",loading : true})
            axios.post('/api/admin/performance',
                {performanceData:performanceData,token:token},
                {headers : {'Content-Type': 'application/json'}}).then(response => {
                    if ("success" in response.data && response.data["success"]) {
                        setMarkMissingItems({
                                items:[],
                                informationText:response.data["msg"],
                                loading : false})
                    }
                    else {
                        setMarkMissingItems({
                            items:[],
                            informationText:response.data["msg"],
                            loading : false})
                    }
                })

        
    }}

    return(

        <Dialog {...rest} isCloseButtonShown={true} onClose={onClose}>
            <MCQuantileDialog {...quantileCalculator}/>
            <MCAddQCPeptideDialog 
                    cb = {handleQCPeptideAddition}
                    metrices={qcPeptidesMetrices} 
                    peptides = {qcPeptidesNames} 
                    onClose={e => handleQCPeptideDialog(e,false)} 
                    {...qcPeptideDialog}/>
            <div style={{margin:"1rem"}}>
                
                <div style={{marginLeft:"1rem",overflowY:"scroll",maxHeight:"80vh",paddingRight:"1.1rem"}}>

                {generalInfoFound?<div>
                    <H5>General Information</H5>
                    <div className= "performance-run-prop-div">
                    {performanceDetails["performanceHeaders"]["General"].map(v => <MCTextInput 
                                            key = {v} 
                                            metricName={v} 
                                            cb = {saveDataInput} 
                                            value = {"General" in performanceData?performanceData["General"][v]===undefined?"":performanceData["General"][v]:""}
                                            header="General"
                                            intent={markMissingItems.items.includes(v) && performanceData["General"][v] === undefined?"danger":"none"}/>)}
                    </div>
                </div>:null}


                {propertiesFound?<div>
                    <H5>Properties</H5>
                    <div className= "performance-run-prop-div">
                    {performanceDetails["performanceHeaders"]["Properties"].map(v => <MCCombobox key={v} items={performanceDetails["uniqueProperties"][v]} 
                                        placeholder = {performanceData["Properties"][v]===undefined?`Select ${v}`:performanceData["Properties"][v]}  
                                        selectFill = {true} 
                                        callback = {propertryCallback} 
                                        callbackKey = {v} 
                                        buttonProps = {{minimal : true,small : true, intent : markMissingItems.items.includes(v) && performanceData["Properties"][v]===undefined?"danger":"none"}}/>)}
                    </div>
                </div>:null}

                {metricesFound?<div>
                    <H5>Metrices</H5>
                        <div className= "performance-run-prop-div">
                        {performanceDetails["performanceHeaders"]["Metrices"].map(v => <MCMetric 
                                            key= {v} 
                                            metricName={v} 
                                            cb = {saveDataInput} 
                                            value = {"Metrices" in performanceData?performanceData["Metrices"][v]===undefined?"":performanceData["Metrices"][v]:""}
                                            header="Metrices" 
                                            intent={markMissingItems.items.includes(v) && performanceData["Metrices"][v] === undefined?"danger":"none"}/>)}
                        </div>
                    </div>:
                    null
                    }

                {distributionsFound?<div>
                    <H5>Distributions</H5>
                    <div className= "performance-run-prop-div">
                    {distributionsHeader.map(distHeader=><div key={distHeader}>
                                <MCQuantileInput 
                                    values={"Distributions" in performanceData ? Object.fromEntries(Object.keys(performanceData["Distributions"]).filter(v => v.split("_",1)[0] === distHeader).map(v => [v.split("_")[1],performanceData["Distributions"][v]])) : {}} 
                                    distName={distHeader} 
                                    intent="success"
                                    missingFields = {markMissingItems.items.filter(v => _.split(v,"_")[0] === distHeader)}
                                    openQuantileCalc = {openQuantileCalculator}
                                    callback={distributionCallback}/> </div>)}
                    </div>
                </div>:null}


                {peptidesFound?<div>
                    <H5>Quality Control Peptides</H5>
                    <div className= "performance-run-prop-div">
                        <p>{qcPeptidesNames.length} peptide sequences detected. {qcPeptidesMetrices.length} metrices found ({_.join(qcPeptidesMetrices, " ")}).</p>
                        <Button text ="Enter QC Peptide Information" 
                                intent={qcPeptidesMetricesEntered?"success":"primary"} 
                                rightIcon={qcPeptidesMetricesEntered?"tick":"none"} 
                                minimal={true} 
                                fill={true} 
                                onClick={handleQCPeptideDialog}/>
                    </div>

                </div>:null}
            </div>
            <p>{markMissingItems.informationText}</p>
            <Button fill={true} text = "Submit" minimal={true} intent="primary" rightIcon="upload" onClick={onSubmit} loading={markMissingItems.loading}/>
            </div>
            
        
        </Dialog>

    )
}


MCAddPerformanceDialog.defaultProps = {

    title : "Submit Performance Run"
}



const initPeptideInfo = {txt:"",matrix:[],infoText:""}


function MCAddQCPeptideDialog (props) {

    const {metrices,peptides, cb, onClose, ...rest} = props 

    const [extractedPeptideInfo, setExtractedPeptideInfo] = useState(initPeptideInfo) 

    const handleTextChange = (e) => {
        const txtString  = e.target.value
        if (txtString !== undefined && txtString !== ""){

            const lines = txtString.split("\n")
            const matrix = lines.map(line => line.split("\t").map((v,i) => i>0?parseFloat(v):v))
            
            const filteredMatrix = matrix.filter(v=> peptides.includes(v[0]))

            if (filteredMatrix[0].length !== metrices.length+1) {
                console.log("Missing metrices...")
            }
            else {

                console.log(filteredMatrix)
                setExtractedPeptideInfo({
                    infoText:`${filteredMatrix.length}/${peptides.length} peptides detected.`,
                    matrix : filteredMatrix,
                    txt : txtString
                    })
                } 
         }
        else {
            setExtractedPeptideInfo(initPeptideInfo)
        }


    }

    const onSubmit = () => {
        if (extractedPeptideInfo.matrix!== undefined && extractedPeptideInfo.matrix.length > 0) {
            const qcPeptideObject = Object.fromEntries(_.flatten(extractedPeptideInfo.matrix.map(vv => metrices.map((metricName, idx) => [`${metricName}_${vv[0]}`,vv[idx+1]]))))
            cb(qcPeptideObject)
            onClose()
        }
    }

    return(
        <Dialog {...rest} onClose = {onClose}>

            <div style={{margin:"1.5rem"}}>
                <p>Please copy the details with/without headers (Sequence, {_.join(metrices)}) using tab delimited text. Please keep the order of metrices.</p>
                <p>Missing peptides will be considered as not detected and will be shown in the performance summary.</p>
                <div>
                <TextArea style={{minHeight:"50vh",maxHeight:"50vh"}} 
                    fill={true} 
                    onChange = {handleTextChange} 
                    growVertically={true} 
                    value = {extractedPeptideInfo.txt}
                    placeholder={`Sequence    ${_.join(metrices,"    ")}`}/>
                </div>
                <p>{extractedPeptideInfo.infoText}</p>
            <Button fill={true} text="Save" rightIcon="floppy-disk" onClick={onSubmit} minimal={true} intent="primary"/>
            </div>
        </Dialog>
    )
}
