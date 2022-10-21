import { Button, ButtonGroup, InputGroup } from "@blueprintjs/core";
import axios from "axios";
import { useState, useEffect } from "react";
import { MCHeader } from "../../utils/components/MCHeader";
import _ from 'lodash'
import { MCDeleteButton } from "../../utils/components/MCDeleteButton";
import { motion } from "framer-motion";
import { MCAskQuestion } from "../../dialogs/MCAskQuestion";


function MCUserItem (props) {
    const {id, userName, date, deleteUser} = props
    const buttonStyle = {minimal:true,small:true}
    return(
        <motion.div 
                whileHover={{backgroundColor:"#e3e3e3"}} 
                className="user-items-container" 
                style={
                        {backgroundColor:"#efefef",
                        borderRadius:"5px",
                        padding:"0.1rem",
                        margin:"0.2rem"}}>

            <div ><Button {...buttonStyle}>{date}</Button></div>
            <div ><Button {...buttonStyle}>{id}</Button></div>
            <div><Button {...buttonStyle}>{userName}</Button></div>
            <div><div style={{float:"right"}}><MCDeleteButton callback = {deleteUser} callbackValue={{userID:id,userName:userName}}/></div></div>
        </motion.div>
        
    )
}
const initAltertState = {isOpen:false,q:"",callback:undefined,callbackValue:undefined}
const initUserInfo = {pw:"",email:"",name:""}
export function MCAdminUserView (props) {
    const {token, superAdmin}  = props

    const [userInfo,setUserInfo] = useState(initUserInfo)
    const [APICallback, setAPICallback] = useState({addUser:"",users:[],shareToken:{msg:"",token:undefined}})
    const [APILoading, setAPILoading] = useState({addUser:false,users:false,deleteUser:false,shareToken:false})
    const [alterProps, setAlertProps] = useState(initAltertState)
    useEffect(() => {
        // handle user list 
        setAPILoadingState("users",true)
        axios.get("/api/admin/users", {params:{token:props.token}}).then(response => {
            if (response.status===200 & "success" in response.data & response.data["success"]) {
                let users = response.data.users!==undefined?response.data.users:[]

                setAPICallbackMsg("users",users)
                setAPILoadingState("users",false)
              }
            else {
                setAPICallbackMsg("users","API call returned an error.")
                setAPILoadingState("users",false)
              } 
        })
          
        }, []);

    const handleInputChange = (e) => {
        //pw and email input
        const id = e.target.id 
        setUserInfo(
            prevValues => {
            return { ...prevValues, [id] : e.target.value}})
        }

    const setAPICallbackMsg = (name,msg) => {

        let copiedCallbacks = {...APICallback}
        copiedCallbacks[name] = msg
        setAPICallback(copiedCallbacks)
    }

    const setAPILoadingState = (name,isLoading) => {

        setAPILoading(prevValues => {
            return { ...prevValues, [name] :isLoading}})
    }

    const handleDeleteRequest = ({userID, userName}) => {
        
        setAlertProps(prevValues => {
            return { ...prevValues, 
                    "q" :`Delete user ${userName} (${userID})?`, 
                    "isOpen" : true,
                    "icon" : "trash",
                    "intent" : "primary",
                    "callback": deleteUser, 
                    "callbackValue" : userID}})
    }

    const deleteUser = (userID) => {
        // removes a user by userID

        axios.delete('/api/admin/users',
            {data : 
                {userID:userID,token:token,
            headers : 
            {'Content-Type': 'application/json'}}
        }).then(
                response => {
                    if ("success" in response.data && response.data["success"]){
                        setAPICallbackMsg("users",response.data["users"])
                    }
                }
            )
    }


    const addUser = () => {
        // add users
        setAPILoadingState("addUser",true)
        axios.post('/api/admin/users', 
            {email:userInfo.email,pw:userInfo.pw,token:token,name:userInfo.name},
            {headers : {'Content-Type': 'application/json'}}).then(response => {
                if ("msg" in response.data && "success" in response.data){
                    setAPICallbackMsg("addUser",response.data["msg"])
                    if ("users" in response.data && response.data["success"]) {
                        setAPICallbackMsg("users",response.data["users"])
                        setUserInfo(initUserInfo)
                    }
                }
                else {
                    setAPICallbackMsg("addUser","Expected msg data not found.")
                }
                
                setAPILoadingState("addUser",false)
            
            }).catch(error => {
                setAPICallbackMsg("addUser","API call resulted in an error.")
                setAPILoadingState("addUser",false)
            })
    }


    const getShareToken = () => {
        // get share token 
        setAPILoadingState("shareToken",true)
        axios.post('/api/admin/shareToken', {token:token},
            {headers : {'Content-Type': 'application/json'}}).then(response => {
                if (response.status === 200 & "token" in response.data){
                    console.log(response.data)
                    setAPICallbackMsg("shareToken",{token:response.data["token"],msg:response.data["msg"]})
                }
                else {
                    setAPICallbackMsg("shareToken",{token:undefined,msg:response.data["msg"]})
                }
                setAPILoadingState("shareToken",false)
            }).catch(error => {
                setAPICallbackMsg("shareToken","API call resulted in an error.")
            })

    }

    const closeAlert = () => {
        setAlertProps(initAltertState)
    }

    const copyTokenToClipboard = () => {
        // copy the share token to clipboard
        navigator.clipboard.writeText(APICallback["shareToken"].token)
        setAPICallbackMsg("shareToken",{msg:"Token copied to clipboard",token:APICallback["shareToken"].token})
    }
    
    return(

        <div className="welcome-content">
            <MCAskQuestion {...alterProps} onClose = {closeAlert}/>
            {superAdmin?
            <div>
                <MCHeader text="User Management" hexColor="darkgrey"/>
                <div>
                    <h3>Registered Users</h3>
                    {APILoading["users"]?<p>Loading ..</p>:
                    
                        <div>
                        
                        {_.isArray(APICallback["users"])?
                        <div>
                            <div style={{paddingBottom:"3rem",backgroundColor:"white",padding:"0.5rem",borderRadius:"5px"}}>
                            
                            
                            <div 
                                className="user-items-container" 
                                style={{paddingBottom:"2px",marginBottom:"5px", borderBottom:"0.5px solid"}}>
                                            {
                                            ["Date","ID","User Name","Delete"].map(v => {
                                                return(
                                                    <div key={v} ><Button  minimal={true} small={true}>{v}</Button></div>
                                                )
                                            })}
                            </div>
                            <div style={{maxHeight:"30%",overflowY:"scroll",minHeight:"120px"}}>
                            {APICallback["users"].map(userDetails => {
                                return(
                                    <div key={userDetails.id}>
                                    <MCUserItem 
                                    deleteUser = {handleDeleteRequest}
                                        {...userDetails}/>
                                    </div>
                                    
                                )
                            })}
                            </div>
                            
                            </div>
                            <p>{APICallback["users"].length} (+1 super admin) users are registered.</p>
                            </div>:
                            null}
                        
                        </div>
                        }
                
                </div>
               
                <div>
                <h3>Add user</h3>
                    
                    <div className="hor-aligned-div">
                        <InputGroup
                            disabled={false}
                            id = "name"
                            placeholder="Account name ..."
                            value={userInfo.name}
                            fill={true}
                            onChange = {handleInputChange}
                        />
                        <InputGroup
                            disabled={false}
                            id = "email"
                            placeholder="Account email ..."
                            value={userInfo.email}
                            fill={true}
                            onChange = {handleInputChange}
                        />
                        <InputGroup
                                disabled={false}
                                id = "pw"
                                placeholder="Enter password ..."
                                fill={true}
                                value={userInfo.pw}
                                type={"password"}
                                onChange = {handleInputChange}
                                />
                        
                        <Button 
                                icon="log-in" 
                                disabled={(userInfo.email.length < 6 || userInfo.pw.length < 6 || userInfo.name.length < 2)} 
                                intent={"primary"} 
                                onClick = {addUser} 
                                loading={APILoading["addUser"]}/>
                    </div>
                <p>API Callback: {APICallback["addUser"]}</p>
                        
                </div>
                {/* <div>
                <h3>Archive user</h3>
                <div className="hor-aligned-div">
                <InputGroup
                        disabled={false}
                        id = "emailDelete"
                        placeholder="Enter account email..."
                        value={userInfo.email}
                        fill={true}
                        onChange = {handleInputChange}
                        />
                <Button icon="log-in" disabled={userInfo.emailDelete.length < 6} intent={"primary"} onClick = {addUser} loading={APILoading["deleteUser"]}/>
                </div>
                <p>API Callback: {APICallback["deleteUser"]}</p>
                </div> */}

                <div>
                <h3>Create Share Token</h3>
                <p>Creates a share token that can be used to upload instrument performance data to MitoCube via the API. The token is valid for 3 months.</p>
                <div className="hor-aligned-div">
                <ButtonGroup fill={true}>
                <Button  
                    text="Create" 
                    intent="primary"
                    rightIcon = "tractor"
                    onClick = {getShareToken} 
                    loading={APILoading["shareToken"]}/>
                <Button 
                    text = "Copy to clipboard." 
                    rightIcon="clipboard" 
                    disabled={APICallback["shareToken"].token === undefined}
                    onClick={copyTokenToClipboard}/>
                </ButtonGroup>
                </div>
                <p>Info: {APICallback["shareToken"]["msg"]}</p>
                </div>
            </div>:<p>You are not allowed to create users. Please contact the main administrator (super-admin).</p>}
        </div>
    )
}