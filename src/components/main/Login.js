
import { useState } from "react";
import { Link } from "react-router-dom";
import { MCSpinner } from "../spinner/MCSpinner";
import { MCProteinSearchIcon, MCDatasetSearchIcon, MCSubmissionIcon, MCAdministrationIcon, MCNeoNtermiomicsIcon, MCSubmissionIconDash, MCDatasetDashIcon } from "../icon/MCMainIcons";
import { InputGroup, Button, H5 } from "@blueprintjs/core";
import axios from "axios";
import { MCHeader } from "../utils/components/MCHeader";
import { motion } from "framer-motion";
import { useMutation, useQuery } from "react-query";
import _ from "lodash"
import { MCSimpleResponseCheck } from "../utils/ResponseChecks";
import { MCInputFieldDialog } from "../input/MCInputs";

const WelcomeIcons = {
  "submission": MCSubmissionIconDash,
  "dataset" : MCDatasetDashIcon,
}


export function handleBackendError(error) {
  console.log(error.response)
  if (error.response.status >= 500) {return "Internal Server Error. Pease contact the administrator."}
  let e = error.response.data
  var errorString  = ""
  if (_.isObject(e)) {
    if (_.has(e, "detail") && _.isString(e["detail"])) {
      errorString = e.detail
    }
    if (_.isArray(e.detail)) {
      errorString = e.detail.map(field => `Error for loc: ${_.last(field.loc)}  with message : ${field.msg} of type: ${field.type}`)
    }
  }
  console.log(errorString)
  return errorString
}


function MCWelcomeMenuIcon(props) {
  // craete welcome icons 
  const [mouseIn, setMouseIn] = useState(false)

  const { text, icon } = props

  const IconComp = _.has(WelcomeIcons,icon)?WelcomeIcons[icon]:<div></div>
  return (
    
    <motion.div
      className="hor-aligned-center-flex-start white-bg little-m"
      whileHover={{ translateX: 3 }}
      style={{ cursor: "default" }}
      onMouseEnter={e => setMouseIn(true)}
      onMouseLeave={e => setMouseIn(false)}>
        <div>{<IconComp {...{mouseIn}} />}</div>
      <div><MCHeader {...{ text }} fontWeight={300} /></div>
    </motion.div>
  )
}


export function Welcome(props) {

  const { setAuthenticationSate, isAuthenthicated, isVerified, isDarkMode, token} = props
  const [userInput, setUserInput] = useState({ username: "", password: "", verificationCode: "" })
  const [registrationDialog, setRegistrationDialog] = useState({isOpen : false})
  const [infoMsg, setInfoMsg] = useState({msg : ""})
  

  const saveTokenAndSetAuthenticationStates = (data) => {
    if (!_.has(data, "token")) return 
    if (!_.has(data, "role")) return 

    localStorage.setItem("mitocube-token", data["token"])
    setAuthenticationSate(prevValues => {
      return {
        ...prevValues,
        "token": data["token"],
        "role" : data["role"],
        isAuth: data["success"],
        verified: _.has(data, "verified") ? data["verified"] : false
      }
    })
  }

  const checkLogin = async () => {
    //send login data to api
    var bodyFromData = new FormData()
    bodyFromData.append('username' , userInput.username)
    bodyFromData.append('password',  userInput.password)
    let res = await axios.post('/api/v1/auth/token',
      bodyFromData,
      {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
    
    return res.data
  }
  
  const { isLoading : loginIsLoading, isFetching : loginIsFetching, refetch : handleLogin } = useQuery("handleLogin", checkLogin, {
    onSuccess: (data) => {
      if (data.success) {
        saveTokenAndSetAuthenticationStates(data)
        }
      else if (_.has(data, "success") && !data["success"] && _.has(data, "msg")){
        setInfoMsg(data.msg)
      }
    },
    onError: (error) => { setInfoMsg({ msg: handleBackendError(error) } )}, //simply reset the info
    enabled: false,
    retry: false,
    refetchOnWindowFocus : false
  })
  
  const checkVerificationCode = async () => {
    const headers = {
      "Content-Type": "application/json",
      'Authorization':  `Bearer ${token}`
    }
    const validationCode = {validation_code: userInput.verificationCode}
    const res = await axios.post(
      "/api/v1/auth/token/validate",
      validationCode,
      { headers: headers })
      return res.data 
  }


  const {
    isLoading: verificationIsLoading,
    isFetching: verificationIsFetching,
    refetch: handleVerification } = useQuery("handleVerification",
      checkVerificationCode, {
        onSuccess: (data) => {
          if (MCSimpleResponseCheck(data)) {
            console.log("verification!!")
            console.log(data)
            saveTokenAndSetAuthenticationStates(data)
          }
          else if (_.has(data, "success") && _.has(data, "msg")){
            setInfoMsg(data.msg)
          }
              },
        onError: (error) => { setInfoMsg({ msg: handleBackendError(error) } )}, 
        enabled: false,
        refetchOnWindowFocus: false,
        retry : false
            })
  
  
  
   const handleKeyPress = (e) => {
    
     if (e.key === "Enter") {

      handleLogin()
   }
   }
  
  const toggleUserRegistrationDialog = (e) => {
    console.log("hey")
    setRegistrationDialog(prevValues => { return { ...prevValues, isOpen: !prevValues.isOpen } })

  }
  

    return (
    
      <div style={{display : "flex", flexDirection : "column", alignItems:"center"}}>
        {/* <div style={{width:"100px"}}><MCIcon /></div> */}
        <MCSpinner initialText={""} textAnchor="middle" textX={25} />
        <MCHeader text={"Welcome - Please login"} darkMode={isDarkMode} />
        <MCInputFieldDialog
            token={token}
            url={"/api/v1/frontend/input_fields/user"}
            postUrl={"/api/v1/users"}
            tokenRequired={false}
                header={"Register new User"}
                onClose={toggleUserRegistrationDialog}
                {...registrationDialog} />
          {/* {websiteTextLoading? <div>Loading ...</div> : websiteTextError ? <div>Server not reached..</div> : 
            <div>
              <MCHeader text={`Welcome to ${welcomeText["appName"]}`} fontSize="1.6rem" />
              <p>{welcomeText["welcomeText"]}</p>
            </div> */}
  
          {/* {[
            { text: "Protein Centric", icon: "submission", link: "/protein" },
            { text: "Sample Submission", icon: "submission", link: "/submission" },
            { text: "Dataset Centric", icon: "dataset", link: "/dataset"}].map(welcomeIcon => {
            
            const {link, ...rest} = welcomeIcon
            return (
              <Link to={link} style={{textDecoration:"none"}}><MCWelcomeMenuIcon key={welcomeIcon.text} {...rest} /></Link>
            )
          })}  */}
          
        
          
          {!isAuthenthicated?
          <div>
            <div className="tag-container-between">
                <InputGroup
                  disabled={false}
                  placeholder="Username"
                  fill={true}
                  value={userInput.username}
                  onChange = {e => setUserInput(prevValues => {return {...prevValues,"username" : e.target.value}})}
                    />
                  <InputGroup
                    disabled={false}
                    placeholder="Enter password..."
                    fill={true}
                    value={userInput.password}
                    type={"password"}
                    onKeyPress={ handleKeyPress}
                    onChange = {e => setUserInput(prevValues => {return {...prevValues,"password" : e.target.value}})}
                    />
                <Button icon="log-in" intent={"primary"} onClick={handleLogin} loading= {loginIsLoading || loginIsFetching } />
              </div>
            <Button text="Register" minimal={true} small={true} intent="primary" onClick={toggleUserRegistrationDialog}/> 
            
            <H5>{_.isString(infoMsg.msg) ? infoMsg.msg : _.map(infoMsg.msg, errorMessage => <p>{errorMessage}</p>)}</H5>
          </div> : 
          !isVerified ?
            <div><div className="tag-container-between">

                <InputGroup
                  disabled={false}
                  placeholder="Verification Code"
                  fill={true}
                  value={userInput.verificationCode}
                  onChange = {e => setUserInput(prevValues => {return {...prevValues,"verificationCode": e.target.value}})}
                  />
                <Button
                  icon="log-in"
                  intent={"success"}
                  loading={verificationIsLoading || verificationIsFetching}
              onClick={handleVerification} />
            

            </div>
              
              <H5>{verificationIsLoading || verificationIsFetching?null:_.isString(infoMsg.msg) ? infoMsg.msg : _.map(infoMsg.msg, errorMessage => <p>{errorMessage}</p>)}</H5>
            </div>: 
          <div className="tag-container-evenly">
          {[
            {
              to: "/protein",
              icon: <MCProteinSearchIcon />,
              pageName: "protein"
            },
            {
              to: "/ptm",
              icon: <MCNeoNtermiomicsIcon />,
              pageName: "ptm"
            },
            {
              to: "/dataset",
              icon: <MCDatasetSearchIcon/>,
              pageName: "dataset"
            },
            {
              to: "/submission",
              icon: <MCSubmissionIcon />,
              pageName: "submission"
            },
            {
              to: "/admin",
              icon: <MCAdministrationIcon/>,
              pageName: "admin"
            }
          ].map(linkPage => {
            return(
              <Link key={linkPage.to} to={linkPage.to}>{linkPage.icon}</Link>
            )
          })}
          {/* <Link to="/protein"><MCProteinSearchIcon/></Link>
          <Link to="/ptm"><MCNeoNtermiomicsIcon/></Link>
          <Link to="/dataset"><MCDatasetSearchIcon/></Link>
          <Link to="/submission"><MCSubmissionIcon /></Link>
          <Link to="/admin"><MCAdministrationIcon/></Link> */}
        </div>
          
        
        }

        </div>
    );
  }

Welcome.defaultProps = {
  isAuthenthicated : false,
  token : null
}