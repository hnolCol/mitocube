import { MCEditableItem } from "../input/MCEditableItem"
import { motion } from "framer-motion"
import { useQuery } from "react-query"
import axios from "axios"
import { MCHeader } from "../utils/components/MCHeader"
import _ from "lodash"
import { MCInputFieldDialog } from "../input/MCInputs"
import { useState } from "react"

function MCAddItem(props) {
    const { width, height, text, onClick} = props
    const centerX  = width/2 
    const centerY = height / 2 
    const r = Math.min(width, height) * 0.7 / 2
    
    return (
        <div className='editable-item-container'>
            <div style={{ height: "100%" }} className='vert-align-div-center'>
                
            <div>
                <motion.svg width={width} height={height}>
                        <motion.g whileHover={{ scale: 1.1 }} onClick={onClick}>
                        <circle cx={centerX} cy={centerY} r={r} fill="#efefef" stroke="none" />
                        <line x1={centerX-width/4} x2={centerX+width/4} y1={centerY} y2={centerY} stroke="#2F5597" strokeWidth={7}/>
                        <line x1={centerX} x2={centerX} y1={centerY-height/4} y2={centerY+height/4} stroke="#2F5597" strokeWidth={7} />
                        </motion.g>
                </motion.svg>
                </div>
                <MCHeader text={text} fontWeight={200} />
        </div>
        </div>
    )
}
MCAddItem.defaultProps = {
    width: 200,
    height: 200,
    text : ""
}

export function MCItemView(props) {
    const [itemDialog, setItemDialog] = useState({isOpen : false})
    const { token, url, urlInputFields, itemName } = props 

    const getItems = async () => {
        const res = await axios.get(
                url, {
                headers: {
                    'Authorization': `${token.access_type} ${token.access_token}`}
        })
        return res.data
    }
    const { data, isLoading, isError, error} = useQuery(["getItems"], getItems)
   
    if (isError) {
        return (
            <div>
                There was an error of status {error.response.data}
                The status {error.response.status}
            </div>
        )
    }
  
    return (
        <div>
            <MCInputFieldDialog
                token={token}
                url={urlInputFields}
                post_url={url}
                header={`Item: ${itemName}`}
                onClose={() => setItemDialog(prevValues => { return { ...prevValues, isOpen: false } })}
                {...itemDialog}/>
            <MCHeader text={itemName} />
            <p>{data!==undefined&&_.isArray(data) ?`${data.length} items found. Please use the plus button to add an item to the database.`:""}</p>
        
            <div style={{ display: "flex", flexDirection: "row", flexWrap: "wrap" }}>

            {isLoading?<p>Loading...</p>:data.map(item => {
                return (
                        <MCEditableItem {...item} />
                )
            
        })}
                <MCAddItem onClick={() => setItemDialog(prevValues => {return {...prevValues, isOpen:true}})} />
        </div> 
        </div>

    )
}

MCItemView.defaultProps = {
    token: {access_type : "Bearer", access_token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoidGV4ZWd2T0pXODFzIiwicm9sZSI6ImFkbWluIiwiZXhwIjoxNjc5NTAxMTIyfQ.dB0VjZOej9EVqX7iGuTMNxtS2T7pU2x5Ik2wIIMFEG4"},
    itemName : "Column",
    url: "/api/v1/instruments/column",
    urlInputFields : "/api/v1/frontend/input_fields/user"
}