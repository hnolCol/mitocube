
import './App.css';
import { useEffect, useState } from 'react';
import {
  Link,
  Route,
  Routes,
  useLocation,
  useNavigate
} from "react-router-dom";
import { MCProtectedRoute} from "./components/utils/components/MCProtectedRoute"
import {Welcome} from "./components/main/Welcome"
import { ProteinMainView } from './components/main/protein-view/MainView';
import { MCHelpMainView} from "./components/main/help/Help"
import { helpDetails } from "./data/help"
import {helpLinks} from "./components/main/help/Help"
import { MCDatasetMainView } from './components/main/Dataset';
import { getMitoCubeToken } from './components/utils/Misc';

import axios from 'axios';

import { MCDatasetSelection } from './components/main/dataset-view/MCDatasetSelection';
import { MCSampleSubmission } from './components/submission/MCSampleSubmission';
import { MCAdminLogin } from './components/main/admin/Login';
import { getMitoCubeAdminToken } from './components/utils/Misc';
import { MCSubmissionAdminView  } from './components/main/admin/submission/MCSubmissionAdminView';
import { MCPerformanceView } from "./components/performance/MCPerformanceView"
import { MCAdminUserView } from './components/main/admin/user/User';
import { removeMitoCubeAdminToken } from "./components/utils/Misc"
import { MCPTMView } from './components/main/ptm-view/MCPTMView';
import { MCInstallationHelp } from './components/main/help/Installation';
import { MCConfigHelp } from './components/main/help/Config';



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

  
// useEffect

// const tokenString = localStorage.getItem("mitocube-token")
// console.log(tokenString,"here?")
// if (tokenString===undefined) return {isAuth:false,token:null}
// let res = axios.post('/api/token/valid' ,
//           {token:tokenString}, 
//           {headers : {'Content-Type': 'application/json'}})
// if (res.status === 200 & res.data){
//   return {isAuth:true,token:tokenString}
// }
// return {isAuth:false,token:null}
// }


function App() {

  const [isAuthenthicated, setAuthenticationState] = useState({isAuth:false,token:null})
  const [isAdminAuthenthicated, setAdminAuthenticationState] = useState({isAuth:false,token:null,superAdmin:false})
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    
    const tokenString = getMitoCubeToken()
    if (tokenString === undefined && tokenString !== "") setAuthenticationState({isAuth:false,token:null})
    axios.post('/api/token/valid',
          {token:tokenString}, 
          {headers : {'Content-Type': 'application/json'}}).then(response => {
            if (response.status === 200 & response.data) {
                setAuthenticationState({isAuth:true,token:tokenString})
                navigate(location)
            }
            else {
              setAuthenticationState({isAuth:false,token:null})
            }
      })
  },[]);


  useEffect(() => {
    
    const tokenString = getMitoCubeAdminToken()
    if (tokenString === undefined) setAdminAuthenticationState({isAuth:false,token:"",superAdmin:false})
   
    axios.post('/api/token/admin/valid',
          {token:tokenString}, 
          {headers : {'Content-Type': 'application/json'}}).then(response => {
            if (response.status === 200 && response.data.success) {
                setAdminAuthenticationState({isAuth:response.data.valid,token:tokenString,superAdmin:response.data.superAdmin})
                navigate(location)
            }
            else {
              //setAuthenticationState({isAuth:false,token:null})
              setAdminAuthenticationState({isAuth:false,token:"",superAdmin:false})

            }
      })
  },[]);


  const loggingAdminOut = () => {
    //log admin out
    removeMitoCubeAdminToken()
    setAdminAuthenticationState({isAuth:false,token:null,superAdmin:false})
  }

  return (
    <div className='App-header'>
      {/* < MCIcon width = {"200px"}/> */}
      <Routes>
        <Route path="/" element={<Welcome isAuthenthicated = {isAuthenthicated.isAuth} setAuthenticationSate = {setAuthenticationState}/>} />
        {/* <Route path="/h" element={<MCCubeButton/>} /> */}
        <Route path="/dataset/:dataID" element={
            <MCProtectedRoute isAuthenthicated={isAuthenthicated.isAuth}>
              <MCDatasetMainView token={isAuthenthicated.token}/>
            </MCProtectedRoute>}> 

          <Route  exact path="/dataset/:dataID/table" element={
            <MCProtectedRoute isAuthenthicated={isAuthenthicated.isAuth}>
              <div>Table View</div>
            </MCProtectedRoute>} /> 
          </Route>
  
        <Route path="/dataset" element={
              <MCProtectedRoute isAuthenthicated={isAuthenthicated.isAuth}>
                <MCDatasetSelection token={isAuthenthicated.token} setAuthenticationSate={setAuthenticationState}/>
              </MCProtectedRoute>} />

        <Route path="/protein" element={
            <MCProtectedRoute isAuthenthicated={isAuthenthicated.isAuth}>
              <ProteinMainView token={isAuthenthicated.token} setAuthenticationSate={setAuthenticationState}/>
            </MCProtectedRoute>
              } />
        
        <Route path="/nterm" element={
            <MCProtectedRoute isAuthenthicated={isAuthenthicated.isAuth}>
              <MCPTMView token={isAuthenthicated.token} setAuthenticationSate={setAuthenticationState}/> 
            </MCProtectedRoute>
              } />

        <Route path="/submission" element={
          <MCProtectedRoute isAuthenthicated={isAuthenthicated.isAuth}>
            <MCSampleSubmission token={isAuthenthicated.token}/>
          </MCProtectedRoute>
        }/>

      <Route path="/admin" element={
          <MCProtectedRoute isAuthenthicated={isAuthenthicated.isAuth}>
            <MCAdminLogin 
                    isAuthenthicated={isAuthenthicated.isAuth} 
                    token={isAuthenthicated.token}
                    setAuthenticationSate={setAuthenticationState}
                    isAdminAuthenthicated = {isAdminAuthenthicated.isAuth}
                    setAdminAuthenticationState = {setAdminAuthenticationState}/>
           
          </MCProtectedRoute>
        }/>

      {/* <Route path="/admin/performance" element = {
        <MCProtectedRoute isAuthenthicated={isAdminAuthenthicated.isAuth}>
            <div>
              <h3>performance</h3>
            </div>
        </MCProtectedRoute>
      }
      /> */}

      <Route path="/admin/performance" element = {
        <MCProtectedRoute isAuthenthicated={isAdminAuthenthicated.isAuth}>
            <div style = {{maxHeight:"100vh",height:"100vh",overflowY:"hidden"}}>
              <MCPerformanceView token={isAdminAuthenthicated.token} logoutAdmin = {loggingAdminOut}/>
            </div>
        </MCProtectedRoute>
      }
      />

      <Route path="/admin/submissions" element = {
        <MCProtectedRoute isAuthenthicated={isAdminAuthenthicated.isAuth}> 
            <div>
              <MCSubmissionAdminView token={isAdminAuthenthicated.token} logoutAdmin = {loggingAdminOut}/>
            </div>
        </MCProtectedRoute>
      }
      />

      <Route path="/admin/settings" element = {
        <MCProtectedRoute isAuthenthicated={isAdminAuthenthicated.isAuth}>
            <div>
              <h3>Settings</h3>
            </div>
        </MCProtectedRoute>
      }
      />

      <Route path="/admin/users" element = {
        <MCProtectedRoute isAuthenthicated={isAdminAuthenthicated.isAuth}>
            <div>
              <MCAdminUserView token={isAdminAuthenthicated.token} superAdmin = {isAdminAuthenthicated.superAdmin} logoutAdmin = {loggingAdminOut}/>
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
      {/* <MCSpinner/> */}
      {/* <MCSerachTagHolder/> */}
      
      
    </div>
  );
}

export default App;
