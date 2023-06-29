
import './App.css';
import { useState } from 'react';
import {
  Link,
  Route,
  Routes,
  useLocation,
  useNavigate
} from "react-router-dom";

import axios from 'axios';
import _ from 'lodash';

import { useQuery } from 'react-query';


import {
  getMitoCubeToken,
  removeMitoCubeToken
} from './components/utils/LocalStorage';


import { MCProtectedRoute} from "./components/utils/components/MCProtectedRoute"
import {Welcome} from "./components/main/Login"
import { ProteinMainView } from './components/main/protein-view/MainView';
import { MCHelpMainView} from "./components/main/help/Help"
import { helpDetails } from "./data/help"
import {helpLinks} from "./components/main/help/Help"
import { MCDatasetMainView } from './components/main/Dataset';


import { MCDatasetSelection } from './components/main/dataset-view/MCDatasetSelection';
import { MCSampleSubmission } from './components/submission/MCSampleSubmission';
import { MCAdminLogin } from './components/main/admin/Login';
import { MCSubmissionAdminView  } from './components/main/admin/submission/MCSubmissionAdminView';
import { MCPerformanceView } from "./components/main/admin/performance/MCPerformanceView"
import { MCAdminUserView } from './components/main/admin/user/User';
import { MCPTMView } from './components/main/ptm-view/MCPTMView';
import { MCInstallationHelp } from './components/main/help/Installation';
import { MCConfigHelp } from './components/main/help/Config';
import { MCAdminDatasets } from './components/main/admin/datasets/MCAdminDatasets';


// import { MCLeftbar } from './components/navigation/Leftbar';
import { MCInputByFieldsFromBackend } from "./components/input/MCInputs"
// import { MCEditableItem } from './components/input/MCEditableItem';
// import { Button } from '@blueprintjs/core';
// import { motion } from 'framer-motion';
// import { MCItemView } from './components/configitems/MCItemView';
import { MCItemConfiguration } from './components/configitems/MCItemConfig';

import { MCLeftbar } from './components/navigation/Leftbar';

import BG from "./assets/bg.png"
import { Button, H3 } from '@blueprintjs/core';
import { MCAnimatedText } from './components/input/MCStaggeredText';
import { MCHeader } from './components/utils/components/MCHeader';
import { MCLink } from './components/navigation/Link';
import { MCButton } from './components/navigation/Button';
import { MCSVGProjectState } from './components/navigation/ProjectState';
import { MCSlideInText } from './components/input/MCSlideInText';




export function MCHelpText(props) {
  return(
    <div className='help-text-div'>
      {props.children}
    </div>
  )
}


MCHelpText.defaultProps = {
  children :  <div>
                  <h4>Statistics</h4>
              </div>
}

const initAuthenticationState = {isAuth:true,token:null, role : 0, verified : true}

function App() {

  const [isAuthenthicated, setAuthenticationState] = useState(initAuthenticationState )
  const [inspected, setInspected] = useState({})
  const [darkMode, setDarkMode] = useState(false)

  const location = useLocation();
  const navigate = useNavigate();

  const validateQuery = async () => {
    //get tokenString from localStorage 
    const tokenString = getMitoCubeToken()
    let res = await axios.post('/api/v1/auth/token/valid',
                  {token:tokenString}, 
      {
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${tokenString}`
        }
      })
    return ([res.data, tokenString])
  }
  //check token from local Storage
  useQuery("validate-token",
      validateQuery, {
        onSuccess: ([data, tokenString]) => {
          setAuthenticationState(prevValues => { return { ...prevValues, isAuth: data["success"], token: tokenString, role : data["role"], verified : data["verified"]} })
          navigate(location) //move to link
        },
        onError: (error) => {
          //independent of the error -> logout. 
          console.log(error.response)
          setAuthenticationState(prevValues => {return {...prevValues,isAuth:false,token:null}})
        },
        enabled : _.isString(getMitoCubeToken()) && !_.isString(isAuthenthicated.token) && !isAuthenthicated.isAuth,
        retry: false,
        refetchOnWindowFocus : false
    })
 
  // useEffect(() => {
    
  //   const tokenString = getMitoCubeToken()
  //   console.log(tokenString)

  //   if (tokenString === undefined && tokenString !== "") setAuthenticationState(prevValues => {return {...prevValues,isAuth:false,token:null}})
  //   axios.post('/api/v1/auth/token/valid',
  //         {token:tokenString}, 
  //     { headers: { 'Content-Type': 'application/json', "Authorization" : `Bearer ${tokenString}`} }).then(response => {
  //       let responseData = response.data
  //         console.log(responseData)
  //           if (response.status === 200 && _.has(responseData,"success") && responseData["success"] && _.has(responseData,"pages")) {
  //               setAuthenticationState(prevValues => {return {...prevValues,isAuth:responseData["success"],token:tokenString, pages : responseData["pages"]}})
  //               navigate(location)
  //           }
  //           else {
  //             setAuthenticationState(prevValues => {return {...prevValues,isAuth:false,token:null}})
  //           }
  //     })
  // },[]);


  // useEffect(() => {
    
  //   const tokenString = getMitoCubeAdminToken()
  //   if (tokenString === undefined) setAdminAuthenticationState({isAuth:false,token:"",superAdmin:false})
   
  //   axios.post('/api/token/admin/valid',
  //         {token:tokenString}, 
  //         {headers : {'Content-Type': 'application/json'}}).then(response => {
  //           if (response.status === 200 && response.data.success) {
  //               setAdminAuthenticationState({isAuth:response.data.valid,token:tokenString,superAdmin:response.data.superAdmin})
  //               navigate(location)
  //           }
  //           else {
  //             //setAuthenticationState({isAuth:false,token:null})
  //             setAdminAuthenticationState({isAuth:false,token:"",superAdmin:false})

  //           }
  //     })
  // },[]);

  const handleDatasetInspection = (linkInfo) => {
    let insp = { ...inspected }
    let datasetLinks = []
    if (_.has(insp, "Datasets")) {
      datasetLinks = _.unionBy(_.concat(insp["Datasets"],[linkInfo]),"name")
      
    }
    else {
      datasetLinks = [linkInfo]
    }
    insp["Datasets"] = datasetLinks
    setInspected(insp)
  }

  const logout = () => {
    //log admin out
    console.log("called")
    removeMitoCubeToken()
    setAuthenticationState(initAuthenticationState)
  }
  document.body.className = darkMode?"bp4-dark":"bp4-body"
  return (
    <div className={`App-header ${darkMode ? "bp4-dark" : "bp4-body"}`}>
      
      
      {/* <div className='app-grid'>
        <div className='top-row-in-grid'>  
          <p>MitoCube</p>
          <button>Contact</button>
          <button>API</button>
          <button>Login</button>
        </div>
        <div className='left-column-in-grid '>
        <MCLeftbar />
        </div> */}
{/* 
        <div className='top-row-in-grid' style={{backgroundColor:"#efefef"}}>
          <p>Halloe</p>
        </div> */}

      
      {/* < MCIcon width = {"200px"}/> */}
      {/* <MCItemConfiguration /> */}
     
      {/* <MCInputByFieldsFromBackend /> */}
      {/* <div style={{ display: "flex", flexDirection:"row", flexWrap : "wrap" }}>
        <MCEditableItem /> 
        <MCEditableItem /> 
        <MCEditableItem /> 
        <MCEditableItem /> 
        <MCEditableItem />  
        <div className='editable-item-container'>
          <div style={{height : "100%"} } className='vert-align-div-center'>
            <div>
              <motion.svg width={"200px"} height={"200px"}>
                <motion.g whileHover={{scale:1.1}}>
                  <circle cx={100} cy={100} r={70} fill="#efefef" stroke="none" />
                  <line x1={50} x2={150} y1={100} y2={100} stroke="#2F5597" strokeWidth={7}/>
                  <line x1={100} x2={100} y1={50} y2={150} stroke="#2F5597" strokeWidth={7} />
                </motion.g>
              </motion.svg>
            </div>
          </div>
            
        </div>

      </div> */}
      <div>
      
      <Routes>
        <Route path="/"
          element={
             <div className='app-grid'>
              <div className='top-row-in-grid'>
                <div style={{display: "flex", flexDirection: "row", justifyContent : "space-between", width : "100%"}}>
                
                  <div><MCHeader text="MitoCube" /></div>
                  <div style={{ display: "flex", flexDirection: "row", justifyContent: "flex-end" }}>
                    
                    <Link className="header-link" to="/login"><MCLink /></Link>
                    <MCButton />
                  </div>
                
                </div>
                
                    
              
              </div>
              <div className='fill-grid'>

              <div style={{ height : "100%", overflowY : "scroll"}}>
                  <div style={{ height: "100vh", marginBottom: "2rem", borderBottom: "1px solid black", marginLeft:"2rem", marginRight:"2rem"}}>
                    <MCAnimatedText text="MitoCube : From submission to data analysis" {...{ darkMode }} /></div>
                  <div style={{ height: "100vh" }}>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <div style={{ minWidth: "40rem" }}><MCAnimatedText text="Track state of projects" {...{ darkMode }} />
                        <MCSVGProjectState /></div>
                        <div style={{ width: "100%", display : "flex", overflowX : 'hidden',marginRight : "2rem"}}>
                        <MCSlideInText children={<p>For more than a decade, we’ve embedded alongside our customers to build Foundry backwards, starting from the most critical operational decisions. We’ve encoded this tradecraft into our product.
Today, some of the world’s most important institutions use Foundry to build safer cars, secure global supply chains, accelerate cancer research, and more.</p>} />
                        </div>
                      {/* <div style={{ width: "100%", backgroundColor: "white" }}>
                        <p>For more than a decade, we’ve embedded alongside our customers to build Foundry backwards, starting from the most critical operational decisions. We’ve encoded this tradecraft into our product.
Today, some of the world’s most important institutions use Foundry to build safer cars, secure global supply chains, accelerate cancer research, and more.</p>
                      </div> */}
                            </div>
                    </div>
                  <div style={{height:"100vh"}}><MCAnimatedText text="Build collaborations" {...{darkMode}} /></div>
  
              
            </div>

              </div>
              
            </div>}
           />
          <Route path="/login"
            element={
              <div className='app-grid'>
              <div className='center-in-grid'>
                <Welcome
                  isDarkMode={darkMode}
                  token={isAuthenthicated.token}
                  isAuthenthicated={isAuthenthicated.isAuth}
                  isVerified={isAuthenthicated.verified}
                  setAuthenticationSate={setAuthenticationState}
                  pages={isAuthenthicated.pages}
                />
              </div>
            </div>}
            />
        
        <Route path="/dataset/:dataID" element={
          <MCProtectedRoute isAuthenthicated={isAuthenthicated.isAuth}>
            

                <div className='app-grid'>
                <MCDatasetMainView token={isAuthenthicated.token} />
                </div>
        
            </MCProtectedRoute>} /> 

          {/* <Route  exact path="/dataset/:dataID/table" element={
            <MCProtectedRoute isAuthenthicated={isAuthenthicated.isAuth}>
              <div>Table View</div>
            </MCProtectedRoute>} /> 
          </Route>
   */}
        <Route path="/dataset" element={
              <MCProtectedRoute isAuthenthicated={isAuthenthicated.isAuth}>
            <MCDatasetSelection token={isAuthenthicated.token} setAuthenticationSate={setAuthenticationState} setInspected={handleDatasetInspection} />
            </MCProtectedRoute>} />
          
        <Route path="/protein" exact element={
            <MCProtectedRoute
              isAuthenthicated={isAuthenthicated.isAuth}>
                <ProteinMainView
                  token={isAuthenthicated.token}
                  setAuthenticationSate={setAuthenticationState} />
            </MCProtectedRoute>}
             
          />   
        <Route path="/protein/:proteinID"  element={
            <MCProtectedRoute
              isAuthenthicated={isAuthenthicated.isAuth}>
                <ProteinMainView
                  token={isAuthenthicated.token}
                  setAuthenticationSate={setAuthenticationState} />
            </MCProtectedRoute>}
             
          />
        
        <Route path="/ptm" element={
            <MCProtectedRoute isAuthenthicated={isAuthenthicated.isAuth}>
              <MCPTMView token={isAuthenthicated.token} setAuthenticationSate={setAuthenticationState}/> 
            </MCProtectedRoute>
              } />

        <Route path="/submission" element={
          <MCProtectedRoute isAuthenthicated={isAuthenthicated.isAuth}>
            <MCSampleSubmission token={isAuthenthicated.token} darkMode={darkMode} />
          </MCProtectedRoute>
        }/>

      <Route path="/admin" element={
          <MCProtectedRoute isAuthenthicated={isAuthenthicated.isAuth}>
            <MCAdminLogin 
                    isAuthenthicated={isAuthenthicated.isAuth} 
                    token={isAuthenthicated.token}
                    setAuthenticationSate={setAuthenticationState}
                isAdminAuthenthicated={isAuthenthicated.role}
                logout = {logout}
                    />
           
          </MCProtectedRoute>
        }/>

      
      <Route path="/admin/datasets" element = {
        <MCProtectedRoute isAuthenthicated={isAuthenthicated.role >= 2}>
            <div style = {{maxHeight:"100vh",height:"100vh",overflowY:"hidden"}}>
              <MCAdminDatasets token={isAuthenthicated.token} logoutAdmin = {logout}/>
            </div>
        </MCProtectedRoute>
      }
      />

      <Route path="/admin/performance" element = {
        <MCProtectedRoute isAuthenthicated={isAuthenthicated.role >= 2}>
            <div style = {{maxHeight:"100vh",height:"100vh",overflowY:"hidden"}}>
              <MCPerformanceView token={isAuthenthicated.token} logoutAdmin = {logout}/>
            </div>
        </MCProtectedRoute>
      }
      />

      <Route path="/admin/submissions" element = {
        <MCProtectedRoute isAuthenthicated={isAuthenthicated.role >= 2}> 
            <div>
              <MCSubmissionAdminView token={isAuthenthicated.token} logoutAdmin = {logout}/>
            </div>
        </MCProtectedRoute>
      }
      />

      {/* <Route path="/admin/settings" element = {
        <MCProtectedRoute isAuthenthicated={isAdminAuthenthicated.isAuth}>
            <div>
              <h3>Settings</h3>
            </div>
        </MCProtectedRoute>
      }
      /> */}

      <Route path="/admin/users" element = {
        <MCProtectedRoute isAuthenthicated={isAuthenthicated.role >= 2}>
            <div>
              <MCAdminUserView token={isAuthenthicated.token} superAdmin = {isAuthenthicated.role === 3} logoutAdmin = {logout}/>
            </div>
        </MCProtectedRoute>
      }
      />

        <Route path="/help/installation" element={<MCInstallationHelp />}/>

        <Route path="help/config" element={<MCConfigHelp />}/>

        <Route path="/help" element={<MCHelpMainView/>}> 
            {helpLinks.map((v,i) => {
              
                if (v.helpID  in helpDetails) {
                  return(<Route key = {i} path = {v.to} element={<MCHelpText children={helpDetails[v.helpID]}/>}/>)
                }
                else {
                  return <Route key = {i} path = {v.to} element={<MCHelpText children={<div><p>Route not found in help details</p></div>}/>}/>
                }
                
            })
            }
          
        </Route>
        
        

        <Route path="*" element = {<div>Page not found. Return to <Link to="/">main page.</Link></div>}/>

        </Routes>
        </div>
      {/* <MCSpinner/> */}
      {/* <MCSerachTagHolder/> */}
      {/* <Route path="/admin/performance" element = {
        <MCProtectedRoute isAuthenthicated={isAdminAuthenthicated.isAuth}>
            <div>
              <h3>performance</h3>
            </div>
        </MCProtectedRoute>
      }
      /> */}
        
    </div>
  );
}

export default App;
