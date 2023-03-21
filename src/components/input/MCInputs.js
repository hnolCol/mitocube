import { useState, useEffect } from "react";
import { Alert, Button, ButtonGroup, Dialog, EditableText, Icon, InputGroup, NumericInput } from "@blueprintjs/core";
import { useQuery } from "react-query"
import axios from "axios"
import { MCCombobox } from "../utils/components/MCCombobox";
import { DateInput2 } from "@blueprintjs/datetime2";
import { fromDateToString } from "../utils/DateFormatting";
import _ from "lodash";
import { MCHeader } from "../utils/components/MCHeader";
import { Tooltip2 } from "@blueprintjs/popover2";

const inputFields = {
    text: MCTextInput,
    combo: MCComboInput,
    numeric : MCNumericInput,
    textfield: MCTextFieldInput,
    password : MCPasswordInput,
}

function InputField(props) {
    const { type } = props
    if (_.has(inputFields, type)) {
        const InputField = inputFields[type]
        return <InputField {...props}/>
    }
    
}

export function MCInputFieldDialog(props) {
    const { url, header, token, onClose, ...rest } = props 
    return (
        <Dialog {...rest} title={header} onClose={onClose}>
            <div style={{margin:"1rem"}}>
                <MCInputByFieldsFromBackend {...{ header, url, token }} onClose={onClose} />
            </div>
        </Dialog>
    )
}

MCInputFieldDialog.defaultProps = {
    canEscapeKeyClose: true,
    canOutsideClickClose: true,
    title : "Input fields for item."
}

export function MCInputByFieldsFromBackend(props) {
    const { url, postUrl, token, onClose, submitMode} = props
    const [userInput, setUserInput] = useState({})
    const [alert, setAlert] = useState({isOpen : false, children : <div></div>, intent : "danger", icon:"warning-sign"})

    const getFieldsFromBackend = async () => {
        //fetch input fields from api
        const res = await axios.get(url)
        return res.data

    }

    const { isLoading, isError, data, error } = useQuery(["getFieldInputs", url], getFieldsFromBackend, {
        onSuccess: (data) => {
            console.log(data)
            let filtedDataForDefault = data.filter(inputField => _.has(inputField, "default") && !inputField["optional"])
            let defaultState = Object.fromEntries(filtedDataForDefault.map(userInput => [userInput.name, userInput.default.toString()]))
            setUserInput(prevValues => { return { ...prevValues, ...defaultState } })
        },
        refetchOnWindowFocus : false
    })

    const checkForEmptyNonOptional = (inputName,inputValue) => {
        if (inputValue !== "") return false 
        let inputField = _.filter(data, inputField => inputField.name === inputName)
        return !inputField.optional
    }

    const handleSubmission = () => {
        var userInputCopy = { ...userInput }
        let emptyRequiredUserInput = Object.keys(userInputCopy).filter(inputName => checkForEmptyNonOptional(inputName,userInputCopy[inputName]))
        if (emptyRequiredUserInput.length > 0) {
            setAlert(prevValues => {
                return {
                    ...prevValues,
                    "isOpen": true,
                    "children": <div>The following required inputs are missing: {_.join(emptyRequiredUserInput,", ")}</div>
                }
            })
            return
        }

        const headers = {
            "Content-Type": "application/json",
            "Authorization" : `${token.access_type} ${token.access_token}`
        }

        if (submitMode) {
            axios.post(postUrl, userInput, {headers : headers}).then(
                response => {
                    
                    setAlert(prevValues => {
                        return {
                            ...prevValues,
                            "isOpen": true,
                            "children": <div>The item was added to the database.</div>
                        }
                    })
                }
            ).catch(error => console.log(error.response))
        }
        else {
            axios.put(postUrl,{},{headers : headers}).then(response => console.log(response))
        }
        
    }
    
    const handleUserInput = (inputName, value, inputType) => {
        if (_.startsWith(inputType, "text")) {
            setUserInput(prevValues => { return { ...prevValues, [inputName]: value } })
        }
        if (inputType === "combo") {
            let changedValueInfluencesOtherCombo = data.filter(inputField => _.has(inputField, "items_depend_on") && inputField["items_depend_on"] === inputName)
            if (changedValueInfluencesOtherCombo.length > 0) {
                let fieldsToResetState = Object.fromEntries(changedValueInfluencesOtherCombo.map(inputField => [inputField.name, ""]))
                setUserInput(prevValues => { return { ...prevValues, [inputName]: value, ...fieldsToResetState} })
            }
            else {
                setUserInput(prevValues => { return { ...prevValues, [inputName]: value } })
            }
        }   
        
    }

    return (
        <div>
            <Alert {...alert} onClose={() => setAlert(prevValues => {return{...prevValues,"isOpen":false}})} />
            {/* <MCEditableItem /> */}
            {isLoading ?
                <p>Loading...</p> :
                isError ? <div>
                    <p>Error Status : {error.response.status}</p>
                    {error.response.status===401?"You are not authorized to perform this action or the token expired.":""}
                </div> : 
            <div>
                        {/* <MCHeader text={header} /> */}
                    
            {_.isArray(data) ? data.map((v, idx) => {
                v["onChange"] = handleUserInput 
                v["userInput"] = _.has(userInput, v.name) ? userInput[v.name] : "" 
                if (v.type === "combo"){
                    v["itemKey"] = _.isObject(v.items) && _.has(v,"items_depend_on") && _.has(userInput,v["items_depend_on"])? userInput[v["items_depend_on"]]:undefined
                    if (v["itemKey"] !== undefined && v["userInput"] !== "" && !v.items[v["itemKey"]].includes(v["userInput"])) {
                        //reset the user input
                        v["userInput"] = ""
                    }
                }
                
                return (
                    <div key={`${idx}-${v.type}`}>
                        {InputField(v)}
                    </div>)
                }
                )
                            : null}
            <div className="hor-aligned-div">
                            <Button text={submitMode ? "Submit" : "Update"} onClick={handleSubmission}/>
                <Button text="Cancel" onClick={onClose}/>
            </div>
            </div>
            }
        </div>
    )
}

MCInputByFieldsFromBackend.defaultProps = {
    submitMode : true,
    header : "Create New User",
    url : "/api/v1/frontend/input_fields/user"
}

function MCPasswordInput(props) {
    //Default password manager to handle passwords
    const [pws, setPasswords] = useState({"1" : "", "2" : ""})
    const [rightElements, setRightElements] = useState({"1" : undefined, "2" : undefined})
    const { name, type, hint, style, onChange, min_length, userInput, ...rest } = props 

    const handleValueChange = (pwString, inputFieldId) => {

        setPasswords(prevValues => { return { ...prevValues, [inputFieldId]: pwString } })  
    }

    useEffect(() => {
       
        let firstPWExists = _.isString(pws["1"]) && pws["1"].length > 0 
        let secondPWExists = _.isString(pws["2"]) && pws["2"].length > 0

        const lengthWarning = (
                    <Tooltip2 content={"The password length must be at least 8."}>
                        <Button icon="warning-sign" intent="danger" minimal={true} /> 
                    </Tooltip2>)

        let rightElements = { "1": undefined, "2": undefined }
        let pwString = ""
        if (firstPWExists && secondPWExists)
        {
            if (pws["1"].length < min_length - 1) {
                rightElements["1"] = lengthWarning
            }
            else if (pws["1"] !== pws["2"]) {
                rightElements["2"] = <Button icon="not-equal-to" minimal={true} />
            }
            else {
                rightElements["1"] = <Button icon="tick" intent="primary" minimal={true} /> 
                rightElements["2"] = <Button icon="tick" intent="primary" minimal={true} /> 
                //only asing pw to pwString if all looks good.
                pwString=pws["1"]
            }
        }
        else if ((firstPWExists && !secondPWExists) || (!firstPWExists && secondPWExists)) {
            //handle length issue when user types in any of the Inputs.
            if (firstPWExists && pws["1"].length < min_length) {
                rightElements["1"] = lengthWarning
            }
            else if (secondPWExists && pws["2"].length < min_length ) {
                rightElements["2"] = lengthWarning
            }
        }
        setRightElements(rightElements)
        //reset pw string in parent 
        onChange(name, pwString, "text")
        
    },[pws["1"], pws["2"], min_length])


    return (
        <div style={{ width: "100%",paddingTop: "0.5rem" }}>
            <div style={{minHeight:"0.8rem",fontSize:"0.8rem"}}>
                {hint}
            </div>
            {["1", "2"].map(pwKey =>
            {
                rest["placeholder"] = pwKey === "2" ? "Please repeat password." : rest["placeholder"] 
                return (
                    <div style={{ fontSize: "0px", paddingTop: pwKey === "2" ? "0.2rem" : "0rem" }}>
                    <InputGroup
                        {...rest}
                        {...style}
                        onChange={(e) => handleValueChange(e.target.value, pwKey)}
                            rightElement={rightElements[pwKey]} />
                    </div>)
                
            })}
           
        </div>
    )

}


function MCDateInput(props) {
    const {detailName, cb, initValue } = props 
    const [dateValue, setDateValue] = useState()

    const valueToShow = dateValue === undefined && initValue !== undefined && initValue.length === 8? `${initValue.substring(0,4)}-${initValue.substring(4,6)}-${initValue.substring(6)}` :dateValue

    useEffect(()=>{
        // save default 
        if (initValue !== "" && _.isFunction(cb)) {
            // save default 
            cb(props.detailName,valueToShow)
           
        }
    
    }, [])

    const handleDateChange = (date) => {

        setDateValue(date)
        
        cb(detailName,date)

    }

    
    return(
        <div style={{ width: "100%", minHeight: "2.5rem", maxHeight: "2.5rem", paddingTop: "0.5rem" }}>
        
        <DateInput2 
            parseDate={str => str.split(" ")[0].replace("-","").replace("-","")}
            onChange = {handleDateChange}
            placeholder="YYYYMMDD" 
            formatDate={date => fromDateToString(date)} 
            closeOnSelection={true} 
            fill={true}
            value = {valueToShow}/>
        </div>
    )
}

function MCComboInput(props) {
    // Combobox Input field. Items can either be a dict or a list.
    // If a dict, itemKey must match. This allows for a dynamic selection based on another state.
    const { name, type, hint, style, items, onChange, userInput, itemKey, optional, ...rest } = props 
    const handleValueChange = (selectedItem) => {
        onChange(name, selectedItem, "combo")
    }
    return(
        <div style={{ width: "100%", minHeight: "3.5rem", maxHeight: "3.5rem", paddingTop: "0.5rem" }}>
            <div className="hint-div">
                {optional?"Optional":""}{hint}
            </div>
            <MCCombobox
                items={_.isArray(items) ? items : _.isObject(items) && _.isString(itemKey) && _.has(items,itemKey)?items[itemKey]:[]}
                placeholder={_.isString(userInput) && userInput.length > 0 ? userInput : "Please select."}
                selectFill={true}
                callback={handleValueChange}
                buttonProps = {{}}
                {...rest }/>
        </div>
    )
}

function MCTextFieldInput(props) {
    const {name,type,hint,style, onChange, min_length, userInput, optional, ...rest} = props 
    
    return (
            <div style={{ width: "100%", paddingTop: "0.5rem"}}>
            <div className="hint-div">
                {optional?"Optional : ": ""}{`${hint} ${min_length !== undefined?`(min. ${min_length} characters)`:""}`}
            </div>
            <div style={{ overflowY: "scroll", backgroundColor: "white", overflowX: "hidden", marginTop: "0.5rem"}}>
            <EditableText {...rest} onChange={value => onChange(name, value, "text")} multiline={true} minLines={4}/>
            </div>

            </div>
    )
}

function MCTextInput(props) {
    //Textinput when props are derived from backend.
    const {name,type,hint,style, onChange, min_length, userInput, optional, ...rest} = props 
   
    if (_.isString(userInput) && userInput.length > 0 && _.isInteger(min_length)) {
        style["intent"] = _.isString(userInput) && userInput.length > 0 && _.isInteger(min_length) ? userInput.length < min_length - 1  ? "danger" : "success" : "none"
    }
    else if (_.isInteger(min_length)) {
        style["intent"] = "none"
    }

    const handleValueChange = (e) => {
        onChange(name, e.target.value, "text")
    }
    
    return(
        <div style={{ width: "100%",paddingTop: "0.5rem" }}>
            <div className="hint-div">
                {optional?"Optional : ": ""}{`${hint} ${min_length !== undefined?`(min. ${min_length} characters)`:""}`}
            </div>
            <div style={{ fontSize: "0px" }}>
                <InputGroup value={userInput} {...rest} {...style} onChange={handleValueChange} />
            </div>
            
        </div>
    )
}


function MCNumericInput(props) {
    //Numeric input when props are derived from backend.
    const {name,type,hint,style, onChange, userInput, optional, ...rest} = props 
    return (
        <div style={{width:"100%",paddingTop: "0.5rem"}}>
            <div className="hint-div">
                {optional?"Optional":""}{hint}
            </div>
            <div style={{ fontSize: "0px" }}>
                <NumericInput
                    value={userInput} {...rest}
                    onValueChange={(value, valueAsString) => onChange(name, valueAsString, "text")}
                    fill={true} />
            </div>
        </div>
    )
}

MCNumericInput.defaultProps = {

}