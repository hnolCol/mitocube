import { Button, ButtonGroup, InputGroup } from "@blueprintjs/core";
import axios from "axios";
import { useQuery } from "react-query"
import { useState } from "react";
import { MCHeader } from "../../../utils/components/MCHeader";
import _ from 'lodash'
import { MCDeleteButton } from "../../../utils/components/MCDeleteButton";
import { motion } from "framer-motion";
import { MCAskQuestion } from "../../../dialogs/MCAskQuestion";
import { MCSimpleResponseCheck, MCTokenValidCheck } from "../../../utils/ResponseChecks";
import { Link } from "react-router-dom";


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
            {[date, id, userName].map((buttonText,rowIdx) => <div key={`${buttonText}-${rowIdx}`}><Button {...buttonStyle}>{buttonText}</Button></div>)}
            <div><div style={{float:"right"}}><MCDeleteButton callback = {deleteUser} callbackValue={{userID:id,userName:userName}}/></div></div>
        </motion.div>
        
    )
}
const initAltertState = {isOpen:false,q:"",callback:undefined,callbackValue:undefined}
const initUserInfo = {pw:"",email:"",name:""}
export function MCAdminUserView (props) {
    const {token, superAdmin, logoutAdmin}  = props

    const [userInfo,setUserInfo] = useState(initUserInfo)
    const [APICallback, setAPICallback] = useState({addUser:"",users:[],shareToken:{msg:"",token:undefined}})
    const [APILoading, setAPILoading] = useState({addUser:false,users:false,deleteUser:false,shareToken:false})
    const [alterProps, setAlertProps] = useState(initAltertState)


    const getAdminUsers = async () => {
        const response = await axios.get("/api/admin/users", { params: { token: token } })
        return response.data.users!==undefined?response.data.users:[]
    }
    const { isLoading: userIsLoading } = useQuery("getAdminUsers", getAdminUsers, {
        refetchOnWindowFocus: false,
        onSuccess: (data) => {
            let users = data.users !== undefined ? data.users : []
            setAPICallbackMsg("users",users)
        }
    })
    

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
                    if (MCSimpleResponseCheck(response.data)){
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
                if ("msg" in response.data && MCSimpleResponseCheck(response.data)){
                    setAPICallbackMsg("addUser",response.data["msg"])
                    if ("users" in response.data && _.isArray(response.data["users"])) {
                        setAPICallbackMsg("users",response.data["users"])
                        setUserInfo(initUserInfo)
                    }
                }
                else {
                    setAPICallbackMsg("addUser","Expected data not found.")
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
                if (response.status === 200 && MCSimpleResponseCheck(response.data) && "token" in response.data){
                    setAPICallbackMsg("shareToken",{token:response.data["token"],msg:response.data["msg"]})
                }
                else if (MCTokenValidCheck(response.data) && _.isFunction(logoutAdmin)) {
                    logoutAdmin()
                }
                else {
                    setAPICallbackMsg("shareToken",{token:undefined,msg:response.data["msg"]})
                }
                setAPILoadingState("shareToken",false)
            }).catch(error => {
                setAPICallbackMsg(`shareToken","API call resulted in an error: ${error}`)
            })

    }

    const closeAlert = () => {
        setAlertProps(initAltertState)
    }

    const copyTokenToClipboard = () => {
        // copy the share token to clipboard
        navigator.clipboard.writeText(APICallback["shareToken"].token)
        setAPICallbackMsg("shareToken",{msg:"Token copied to clipboard.",token:APICallback["shareToken"].token})
    }
    
    return(

        <div className="welcome-content">
            <div className="top-right-absolute-container">
                <Link to="/">Home</Link>
            </div>
            <MCAskQuestion {...alterProps} onClose = {closeAlert}/>
            {superAdmin?
            <div>
                <MCHeader text="User Management" hexColor="darkgrey"/>
                    <div className="middle-m">
                    <MCHeader text="Registered Users" fontSize="1.1rem" hexColor="#5b5b59"/>
                    {userIsLoading?<p>Loading ..</p>:
                    
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
               
                <div className="middle-m">
                <MCHeader text="Add user" fontSize="1.1rem" hexColor="#5b5b59"/>
                    
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

                <div className="middle-m">
                    <MCHeader text="Create Share Token" fontSize="1.1rem" hexColor="#5b5b59"/>
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