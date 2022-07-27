import { Drawer } from "@blueprintjs/core"
import axios from "axios"
import _ from "lodash"
import { useState, useEffect, } from "react"
import { MCCSVDownload } from "../../utils/components/MCCSVDownload"
import { MCSpinner } from "../../spinner/MCSpinner"

export function MCExpInfoDrawer(props) {
    
    const [expInfo,setExpInfo] = useState({isLoading:true,expInfo:[],dataID:undefined,isSummary:false})
    const [currentDiv, setCurrentDiv] = useState("")

    useEffect(() => {
        if (props.isSummary) {
            
            const entryName = props.featureID.Entry
            if (expInfo.dataID === entryName){
                return
            }
            axios.post('/api/features/db/info', {featureIDs:[entryName]}, 
            {headers : {'Content-Type': 'application/json'}}).then(response => { 
                
                if (response.status === 200) {
                    setExpInfo({isLoading:false,expInfo:response.data["params"][entryName],dataID:entryName,isSummary:true})
            }
            else {
                setExpInfo({isLoading:false,expInfo:[{"title":"Error Returned by Server","details":response.data["error"],dataID:undefined}]})
            }
        }
               
            ).catch(error => setExpInfo({isLoading:false,expInfo:[{"title":"Error Returned by Server","details":error,dataID:undefined}]})
            )
            return
        }
        if (props.dataID === null) {
          return;
        }

        if (props.dataID === undefined){
            return;
        }
        if (props.dataID === ""){
            return;
        }
        if (expInfo.dataID === props.dataID){
            return
        }
 
        axios.get('/api/dataset/details/experimentalInfo',{params:{dataID:props.dataID,token:props.token}}).then(response => {
            if ("error" in response.data & response.data["error"] === "Token is not valid."){
                setExpInfo({isLoading:false,expInfo:[{title:"Error",details:"Token is not valid.Please refresh site.",isSummary:false,dataID:undefined}]})
            }
            else if (response.data["success"] && response.status === 200) {
                setExpInfo({isLoading:false,expInfo:response.data["params"],dataID:props.dataID,isSummary:false})
            }
            else {
                setExpInfo({isLoading:false,expInfo:[{title:"Error Returned by Server",details:response.data["error"],isSummary:false,dataID:undefined}]})
            }
          })
      }, [props.dataID, props.isSummary, props.featureID, props.token]);

    return(
        <Drawer 
            isOpen={props.isOpen} 
            isCloseButtonShown={true} 
            title = {`${props.title}`}
            onClose={(e) => props.handleExpInfoRequest(props.dataID,true)}>
        <div style={{margin: "0.2rem 0.15rem",overflowY:"scroll",display:"flex",justifyContent:"flex-start"}}>
        <div>
        {expInfo.isLoading?<MCSpinner/>:
                expInfo.expInfo.map((v,i) => {
                    if (v.details === null) return null
                    return(
                        <div key={`${v.title}-${i}`} className="exp-info-container" onMouseEnter={(e) => setCurrentDiv(v.title)} onMouseLeave={(e) => setCurrentDiv("")}>
                            <div className="header-div-exp" >{v.title}</div>
                            <div className={currentDiv===v.title?"details-div-exp-after-hover":"details-div-exp"}>{v.details}</div>                      
                        </div>
                    )
                    })}
        </div>
        <MCCSVDownload data = {Object.keys(expInfo.expInfo).length>0?expInfo.expInfo:undefined} fileName = {`ExperimentDetails(${props.dataID}).csv`}/>
        </div>
        </Drawer>
    )
}

MCExpInfoDrawer.defaultProps = {
    isOpen : false,
    title : "Experimental Information",
    dataID : ""
}