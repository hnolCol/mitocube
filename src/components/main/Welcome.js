
import { useState } from "react";
import { Link } from "react-router-dom";
import { MCSpinner } from "../spinner/MCSpinner";
import { MCProteinSearchIcon, MCDatasetSearchIcon, MCSubmissionIcon, MCAdministrationIcon, MCNeoNtermiomicsIcon } from "../icon/MCMainIcons";
import { InputGroup, Button } from "@blueprintjs/core";
import axios from "axios";




export function Welcome(props) {

    const [pw, pwChange] = useState("")
    const [infoObject, setInfoObj] = useState({
            isLoading : false,
            infoText : ""
    })

   const handleKeyPress = (e) => {
    
     if (e.key === "Enter") {

      checkPW(e)
   }
  }

    const checkPW =(e) => {

      e.preventDefault() 
      if (pw.length === 0) {
        setInfoObj({isLoading:false,"infoText":"Please provide password."})
        return
      }
      setInfoObj({isLoading:true,"infoText":"Password is being checked."})
      if (props.setAuthenticationSate !== undefined) {
        axios.post('/api/login' ,
            {pw:pw}, 
            {headers : {'Content-Type': 'application/json'}}).then(response => {
            if (response.status === 200 & "success" in response.data & response.data["success"]) {
                  setInfoObj({isLoading:false,"infoText":""}) //info text is not visible
                  localStorage.setItem("mitocube-token",response.data["token"])
                  props.setAuthenticationSate({isAuth:true,token:response.data["token"]})
              }
            else {
                setInfoObj({isLoading:false,"infoText":"Password is incorrect or API not reached."})
              }
        })
      }
    }
    
    return (
      <div>
      <div className="welcome-content">
       
        {/* <div style={{width:"100px"}}><MCIcon /></div> */}
         <MCSpinner initialText={""} textAnchor="middle" textX = {25}/>
         <div style={{color:"#6e5b7b"}}>
          <h2>Welcome to MitoCube</h2>
         </div>
          
          
          <p>MitoCube offers protein-centric searches to explore the expression of a protein in all acquired proteomic datasets.</p>
          
          {props.isAuthenthicated?
            <div className="tag-container-evenly">

              <Link to="/protein"><MCProteinSearchIcon/></Link>
              <Link to="/nterm"><MCNeoNtermiomicsIcon/></Link>
              <Link to="/dataset"><MCDatasetSearchIcon/></Link>
              <Link to="/submission"><MCSubmissionIcon /></Link>
              <Link to="/admin"><MCAdministrationIcon/></Link>
            </div>
          :
          <div>

            <div className="tag-container-between">
              <InputGroup
                        disabled={false}
                        placeholder="Enter password..."
                        fill={true}
                        type={"password"}
                        onKeyPress={ handleKeyPress}
                        onChange = {e => pwChange(e.target.value)}
                    />
            
              <Button icon="log-in" intent={"primary"} onClick = {checkPW} />
              </div>

            <p>{infoObject.infoText}</p>
          </div>}
          
      
       
        </div>

        
     </div>
    );
  }

Welcome.defaultProps = {
  isAuthenthicated : false,
  token : null
}