
import { useState } from "react";
import { Link } from "react-router-dom";
import { MCSpinner } from "../spinner/MCSpinner";
import { MCProteinSearchIcon, MCDatasetSearchIcon, MCSubmissionIcon, MCAdministrationIcon, MCNeoNtermiomicsIcon, MCSubmissionIconDash, MCDatasetDashIcon } from "../icon/MCMainIcons";
import { InputGroup, Button, } from "@blueprintjs/core";
import axios from "axios";
import { MCHeader } from "../utils/components/MCHeader";
import { motion } from "framer-motion";
import { useMutation, useQuery } from "react-query";
import _ from "lodash"

const WelcomeIcons = {
  "submission": MCSubmissionIconDash,
  "dataset" : MCDatasetDashIcon,
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

  const { setAuthenticationSate, isAuthenthicated, pages } = props
  const [pw, pwChange] = useState("")
  const [infoText, setInfoText] = useState("")
  
  const checkWebsitePW = async () => {
    let res = await axios.post('/api/login',{pw:pw}, {headers : {'Content-Type': 'application/json'}})
    return res.data
  }
  
  const { isLoading, isFetching, isError, error, refetch } = useQuery("webSitePWCheck", checkWebsitePW, {
    onSuccess: (data) => {
      if (_.has(data, "token") && _.has(data, "success") && _.isString(data["token"]) && data["success"]) {
        localStorage.setItem("mitocube-token", data["token"])
        if (_.isFunction(setAuthenticationSate)) {
          setAuthenticationSate(prevValues => { return { ...prevValues, "token": data["token"], isAuth: true, pages : data["pages"]} })
          setInfoText("")
        }
      }
      else if (_.has(data, "success") && !data["success"]) {
        setInfoText("Incorrect password. Please try again.")
      }
    },
    onError: () => {setInfoText("")}, //simply reset the info
    enabled: false,
    retry: false,
    refetchOnWindowFocus : false
  })
  
  
   const handleKeyPress = (e) => {
    
     if (e.key === "Enter") {

      refetch()
   }
  }
    return (
      <div>
      <div className="welcome-content">
       
        {/* <div style={{width:"100px"}}><MCIcon /></div> */}
          <MCSpinner initialText={""} textAnchor="middle" textX={25} />
          <MCHeader text="Welcome to MitoCube" fontSize="1.6rem"/>
        
          <p>MitoCube offers protein-centric searches to explore the expression of a protein in all acquired proteomic datasets.</p>
          {/* {[
            { text: "Protein Centric", icon: "submission", link: "/protein" },
            { text: "Sample Submission", icon: "submission", link: "/submission" },
            { text: "Dataset Centric", icon: "dataset", link: "/dataset"}].map(welcomeIcon => {
            
            const {link, ...rest} = welcomeIcon
            return (
              <Link to={link} style={{textDecoration:"none"}}><MCWelcomeMenuIcon key={welcomeIcon.text} {...rest} /></Link>
            )
          })} 
           */}
        
          
          {isAuthenthicated?
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
                },
              ].map(linkPage => {
                return(
                  _.has(pages, linkPage.pageName) && pages[linkPage.pageName] === 1 ? <Link key={linkPage.to} to={linkPage.to}>{linkPage.icon}</Link> : null
                )
              })}
              {/* <Link to="/protein"><MCProteinSearchIcon/></Link>
              <Link to="/ptm"><MCNeoNtermiomicsIcon/></Link>
              <Link to="/dataset"><MCDatasetSearchIcon/></Link>
              <Link to="/submission"><MCSubmissionIcon /></Link>
              <Link to="/admin"><MCAdministrationIcon/></Link> */}
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
            
                <Button icon="log-in" intent={"primary"} onClick={refetch} loading= {isLoading || isFetching } />
              </div>

            <p>{isLoading || isFetching ? "Loading..." : isError ? `API returned an error of status: (${error.response.status})` : infoText}</p>
          </div>}
          
      
       
        </div>

        
     </div>
    );
  }

Welcome.defaultProps = {
  isAuthenthicated : false,
  token : null
}