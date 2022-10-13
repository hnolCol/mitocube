import { Button, InputGroup } from "@blueprintjs/core";
import axios from "axios";
import { useState, useEffect } from "react";
import { MCHeader } from "../../utils/components/MCHeader";
import _ from 'lodash'


function MCUserItem (props) {
    const {email} = props

    return(

        <div>
            <p>{email}</p>
        </div>
    )
}

export function MCAdminUserView (props) {
    const {token, superAdmin}  = props

    const [userInfo,setUserInfo] = useState({pw:"",email:"",emailDelete:""})
    const [APICallback, setAPICallback] = useState({addUser:"",users:[]})
    const [APILoading, setAPILoading] = useState({addUser:false,users:false,deleteUser:false})

    useEffect(() => {
        
        setAPILoadingState("users",true)
        axios.get("/api/admin/users", {params:{token:props.token}}).then(response => {
            console.log(response.data)
            if (response.status===200 & "success" in response.data & response.data["success"]) {
                let users = response.data.users!==undefined?response.data.users:[]
                setAPICallbackMsg("users",users.length)
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

    const addUser = () => {
        setAPILoadingState("addUser",true)
        axios.post('/api/admin/users', 
            {email:userInfo.email,pw:userInfo.pw,token:token},
            {headers : {'Content-Type': 'application/json'}}).then(response => {
                if ("msg" in response.data){
                    setAPICallbackMsg("addUser",response.data["msg"])
                }
                else {
                    setAPICallbackMsg("addUser","Expected msg data not found.")
                }
            }).catch(error => {
                setAPICallbackMsg("addUser","API call resulted in an error.")
            })
    }
    
    return(

        <div className="welcome-content">
            {superAdmin?
            <div>
                <MCHeader text="User Management" hexColor="darkgrey"/>
                <div>
                    <h3>Registered Users</h3>
                    {APILoading["users"]?<p>Loading ..</p>:
                    
                        <p>{APICallback["users"]} (+1 super admin) users are registered.</p>}
                    

                </div>
                
                
                <div>
                <h3>Add user</h3>
                    
                    <div className="hor-aligned-div">
                        <InputGroup
                            disabled={false}
                            id = "email"
                            placeholder="Enter account email..."
                            value={userInfo.email}
                            fill={true}
                            onChange = {handleInputChange}
                        />
                        <InputGroup
                                disabled={false}
                                id = "pw"
                                placeholder="Enter password..."
                                fill={true}
                                value={userInfo.pw}
                                type={"password"}
                                onChange = {handleInputChange}
                                />
                        
                        <Button icon="log-in" disabled={(userInfo.email.length < 6 || userInfo.pw.length < 6)} intent={"primary"} onClick = {addUser} loading={APILoading["addUser"]}/>
                    </div>
                <p>API Callback: {APICallback["addUser"]}</p>
                        
                </div>

                <div>
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
                </div>
            </div>:<p>You are not allowed to create users. Please contact the main administrator (super-admin).</p>}
        </div>
    )
}