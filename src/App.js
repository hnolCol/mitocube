
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
import { ProteinMainView } from './components/main/Protein';
import { MCHelpMainView} from "./components/main/Help"
import { helpDetails } from "./data/help"
import {helpLinks} from "./components/main/Help"
import { MCDatasetMainView } from './components/main/Dataset';
import { getMitoCubeToken } from './components/utils/Misc';

import axios from 'axios';
import { MCDataSummary } from './components/dialogs/data/DataSummary';
import { MCDatasetSelection } from './components/main/dataset-view/MCDatasetSelection';
import { MCHeatmapWrapper } from './components/main/dataset-view/MCScaledHeatmap';
import { MCVolcano, MCVolcanoWrapper } from './components/main/dataset-view/MCVolcano';
import { MCSampleSubmission } from './components/submission/MCSampleSubmission';


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
          {/* <Route  exact path="/dataset/:dataID/volcano" element={
            <MCProtectedRoute isAuthenthicated={isAuthenthicated.isAuth}>
              <div><MCVolcanoWrapper/></div>
            </MCProtectedRoute>} />  */}
          {/* <Route  exact path="/dataset/:dataID/heatmap" element={
            <MCProtectedRoute isAuthenthicated={isAuthenthicated.isAuth}>
              <div>
                <MCHeatmapWrapper/>
                </div>
            </MCProtectedRoute>} />  */}

          <Route  exact path="/dataset/:dataID/table" element={
            <MCProtectedRoute isAuthenthicated={isAuthenthicated.isAuth}>
              <div>Table View</div>
            </MCProtectedRoute>} /> 
          </Route>

        

        <Route path="/dataset" element={
              <MCProtectedRoute isAuthenthicated={isAuthenthicated.isAuth}>
                <MCDatasetSelection token={isAuthenthicated.token}/>
              </MCProtectedRoute>} />

        <Route path="/protein" element={
            <MCProtectedRoute isAuthenthicated={isAuthenthicated.isAuth}>
              <ProteinMainView token={isAuthenthicated.token} setAuthenticationSate={setAuthenticationState}/>
            </MCProtectedRoute>
        
              } />

        <Route path="/submission" element={
          <MCProtectedRoute isAuthenthicated={isAuthenthicated.isAuth}>
            <MCSampleSubmission token={isAuthenthicated.token}/>
          </MCProtectedRoute>
        }/>

          
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
