import { Button, Dialog, InputGroup } from "@blueprintjs/core"
import axios from "axios"
import _, { sample } from "lodash"
import { useState } from "react"
import { MCCombobox } from "../utils/components/MCCombobox"
import { arrayOfObjectsToTabDel, downloadJSONFile, downloadTxtFile } from "../utils/Misc"



const comboboxProps = [
        {callbackKey:"direction",items:["Rows","Columns"],title:"Sample direction:"},
        {callbackKey:"startRow",items:["A","B","C","D","E","F","G","H"],title:"Start Row:"},
        {callbackKey:"startColumn",items:_.range(1,13),title:"Start Column:"},
        {callbackKey:"scramble",items:["True","False"],title:"Scramble:"},
    ]

export function MCCreateSampleList(props) {
    const {dataID, token, onClose, handleDataChange, ...rest} = props
    const [input, setInput] = useState({direction : "Rows", startRow : "A", startColumn : "1", scramble: "True",internalID:""})
    const [sampleList, setSampleList] = useState([])
    const [isLoading,setIsLoading] = useState({loading:false,msg:""})
    const handleInput = (id,value) => {

        setInput(prevValues => {
            return { ...prevValues, [id]:value}}
            )
        }

    const createSampleList = ( ) => {
        setIsLoading({loading:true,msg:"Request send to API."})
        axios.get('/api/admin/samplelist', {params:{token:token,dataID:dataID, ...input}}).then(response => 
            
            {
                console.log(response.data)
                if (response.data["success"] && Object.keys(response.data).includes("paramsFile")){
                    
                    handleDataChange(dataID,response.data["paramsFile"])
                    setSampleList(JSON.parse(response.data["sampleList"]))
                    setIsLoading({loading:false,msg:"Sample list created and ready for download."})

                }
                else {
                    setIsLoading({loading:false,msg:"The API returned an error. " + response.data["msg"]})
                    setSampleList([])
                }
            }
        )
            
    }

    return(
        <Dialog {...rest} onClose={e => onClose({isOpen:false})}>
        <div style={{margin:"2rem"}}>
            <p>Creates a sample list for measurement of desired project. Please select first if samples follow 1-N in direction of rows (A1, A2, A3) or columns (A1, B1, C1) in a 96 well plate.</p>
            
            {comboboxProps.map(v => {
                const {title, ...rest} = v
                return(
                    <div key = {v.title} className="hor-aligned-div">
                        <div style={{minWidth:"160px"}}>
                            <Button small={true} minimal={true}>
                                {title}
                            </Button>
                        </div>
                        <MCCombobox 
                            {...rest}
                            callback = {handleInput} 
                            placeholder = {input[rest.callbackKey]}
                            />
                    </div>
                )
            })}

                <div className="hor-aligned-div">
                        <div style={{minWidth:"160px"}}>
                            <Button small={true} minimal={true}>
                                Internal ID:
                            </Button>
                        </div>
                        <InputGroup 
                            value={input["internalID"]} 
                            placeholder = {"Internal project identifier"} 
                            onChange={e => handleInput("internalID",e.target.value)}/> 
                    </div>

            <div className="hor-aligned-center-div-between" style={{marginTop:"1rem"}}>
                <div>
                <Button text = "Create" intent="none" onClick={createSampleList} loading={isLoading.loading}/>
                <Button text ="Download" intent="primary" disabled={sampleList.length === 0} onClick={e => downloadTxtFile(arrayOfObjectsToTabDel(sampleList,Object.keys(sampleList[0])),`sample-list-${dataID}.txt`)}/>
                </div>
                <div>
                <Button text = "Close" intent="danger" onClick={e => onClose({isOpen:false})}/>
                </div>

            </div>
            <p>{isLoading.msg}</p>
        </div>
        </Dialog>
    )
}

MCCreateSampleList.defaultProps = {
    isOpen : true,
    title : "Create Sample List"
}