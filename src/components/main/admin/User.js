import { Button, InputGroup } from "@blueprintjs/core";
import axios from "axios";
import { useState } from "react";


export function MCAdminUserView (props) {
    const {token, superAdmin}  = props
    console.log(superAdmin)
    const [userInfo,setUserInfo] = useState({pw:"",email:""})
    const handleInputChange = (e) => {
        //pw and email input
        const id = e.target.id 
        setUserInfo(
            prevValues => {
            return { ...prevValues, [id] : e.target.value}})
        }
      
    const addUser = () => {

        axios.post('/api/admin/users', 
            {email:userInfo.email,pw:userInfo.pw,token:token},
            {headers : {'Content-Type': 'application/json'}}).then(response => {
                console.log(response.data)
            })
    }

    return(

        <div>
            {superAdmin?<div>
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
                    
                    <Button icon="log-in" disabled={(userInfo.email.length < 6 || userInfo.pw.length < 6)} intent={"primary"} onClick = {addUser}/>
                </div>:<p>You are not allowed to crate users. Please contact the main administrator.</p>}
        </div>
    )
}