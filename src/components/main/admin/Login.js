

import { MCSpinner } from "../../spinner/MCSpinner"
import { InputGroup, Button } from "@blueprintjs/core"
import { useState } from "react"
import axios from "axios"
import { MCHeader } from "../../utils/components/MCHeader"
import { Link } from "react-router-dom"
import { MCAdminSideNavigation } from "./navbar/SideNavigation"


export function MCAdminLogin(props) {

    const {isAuthenthicated,isAdminAuthenthicated, token, setAdminAuthenticationState, logout} = props
    const [loginInfo,setLoginInfo] = useState({pw:"",email:"",validationCode:""})
    const [adminTokenDetails,setAdminToken] = useState({adminToken:undefined,superAdmin:false,validated:false})
    const [infoText, setInfoText] = useState("")
    
    const handleInputChange = (e) => {
        //pw and email input
        const id = e.target.id 
        setLoginInfo(
            prevValues => {
            return { ...prevValues, [id] : e.target.value}})
        }
      
    

    const validateCode = (e) => {
      //validate input code to get access to admin functions
      if (loginInfo.validationCode.length < 6) return 
      if (adminTokenDetails.adminToken === undefined) return
      axios.post('api/login/admin/validate' , 
        {adminToken:adminTokenDetails.adminToken,validationCode:loginInfo.validationCode,token:token},
        {headers : {'Content-Type': 'application/json'}}).then(response => {
          if (response.status === 200 & "success" in response.data & response.data["success"]){
      
            setAdminAuthenticationState({
                            isAuth:response.data["success"],
                            token:adminTokenDetails.adminToken,
                            superAdmin:adminTokenDetails.superAdmin,
                            validateCode:loginInfo.validationCode
                        })
            // setMitoCubeAdminToken(adminTokenDetails.adminToken)
          }
        })
    }

    const loginAttempt = (e) => {
      // login using email and password.
      setInfoText("")
      if (loginInfo.email.length < 4 && loginInfo.pw.length < 4) {
        setInfoText("Login information does not meet min requirement.")
        return 
      }
      
      axios.post('/api/login/admin', {email:loginInfo.email,pw:loginInfo.pw,token:token},
                {headers : {'Content-Type': 'application/json'}}).then(response => {
                if (response.status === 200 & "success" in response.data & response.data["success"] & "token" in response.data) {
                      
                      setAdminToken({adminToken:response.data.token,superAdmin:response.data.superAdmin})
                }
        
        else {
          
          setInfoText(response.data["msg"])
          
          }
      }) 
      }

    return (
      <div>
        {/* <MCAdminSideNavigation /> */}
        <div className="welcome-content">
            {isAuthenthicated && isAdminAuthenthicated?
              
            <div style={{ width: "100%", minWidth: "150px" }}>
              
                <div style={{position:"absolute",right:0,top:0,width:"100px"}}>
                  <div className="hor-aligned-div">
                  <Button text="Logout" minimal={true} small={true} onClick={logout}/>
                  <Link to="/"><Button text="Home" minimal={true} small={true}/></Link>
                  </div>
                </div>
                <MCHeader text="Admin Content" hexColor="darkgrey"/>
                <p>Welcome to the Admin Restricted Site of MitoCube. View instrument performance, edit and export submissions and add users.</p>
                <div className="admin-nav-container">
                  
                  {["Performance","Submissions","Datasets","Users"].map(v => { //"Settings"
                    return (
                      <div key={v} className="admin-nav-box">
                          <Link style={{textDecoration:"none", color:"#2F5597", fontWeight:"bold", fontSize:"1.3rem"}} to = {`/admin/${v.toLowerCase()}`}>
                            {v}
                          </Link>
                      </div>
                    )
                  })}
                </div>
              </div>
            :
            <div>
              <div style={{position:"absolute",right:0,top:0,width:"100px"}}>
                  <Link to="/"><Button text="Home" minimal={true} small={true} onClick={logout}/></Link>
                  
              </div>
               <MCSpinner initialText={""} textAnchor="middle" textX = {25}/>
                <MCHeader text="Welcome to MitoCube Admin Content" fontSize="1.6rem"/>
               <p>This content offers administrative actions and overviews. You cannot create an account, please contact the site administrator to get access.</p>
            
              {adminTokenDetails.adminToken===undefined?
                <div className="tag-container-between">
                  
                  <InputGroup
                            disabled={false}
                            id = "email"
                            placeholder="Enter account email..."
                            value={loginInfo.email}
                            fill={true}
                            onChange = {handleInputChange}
                        />
                  <InputGroup
                          disabled={false}
                          id = "pw"
                          placeholder="Enter admin password..."
                          fill={true}
                          value={loginInfo.pw}
                          type={"password"}
                          onChange = {handleInputChange}
                          onKeyUp={e => {
                            
                            if (e.code === "Enter") {
                              e.preventDefault();
                              loginAttempt()
                              ;}}}
                          />
                
                
                  <Button icon="log-in" disabled={(loginInfo.email.length < 6 || loginInfo.pw.length < 6)} intent={"primary"} onClick = {loginAttempt}/>
                  </div>
                  :
                  <div className="tag-container-between">
                    <InputGroup
                            disabled={false}
                            id = "validationCode"
                            placeholder="Enter verificaion code.."
                            fill={true}
                            value={loginInfo.validationCode}
                            onChange = {handleInputChange}
                            onKeyUp={e => {
                              if (e.code === "Enter") {
                                e.preventDefault();
                                validateCode()
                                // tried all this stuff, but nothing stops the future OK button from handling the event!
                                ;}}}
                        />
                      <Button icon="log-in" intent={"success"} onClick = {validateCode}/>
                  </div>}
              <div style={{fontSize:"0.75rem"}}>
                <p>{adminTokenDetails.adminToken===undefined?"Please enter admin password and email. A verification code will be sent to your email.":"Please enter verificaion code."}</p>
                <p>{infoText}</p>
              </div>
            </div>}
            
        
         
          </div>
  
          
       </div>
    )
}

MCAdminLogin.defaultProps = {
    isAuthenthicated : false,
    isAdminAuthenthicated : false
}