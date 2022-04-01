
import './App.css';
import { useEffect, useState } from 'react';
import {
  Route,
  Routes,
} from "react-router-dom";
import { MCProtectedRoute} from "./components/utils/components/MCProtectedRoute"
import {Welcome} from "./components/main/Welcome"
import { ProteinMainView } from './components/main/Protein';
import { MCHelpMainView} from "./components/main/Help"
import { helpDetails } from "./data/help"
import {helpLinks} from "./components/main/Help"
import { getMitoCubeToken } from './components/utils/Misc';
import axios from 'axios';
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
 

  useEffect(() => {

    const tokenString = getMitoCubeToken()
    if (tokenString === undefined && tokenString !== "") setAuthenticationState({isAuth:false,token:null})
    axios.post('/api/token/valid',
          {token:tokenString}, 
          {headers : {'Content-Type': 'application/json'}}).then(response => {
            if (response.status === 200 & response.data) {
              
              setAuthenticationState({isAuth:true,token:tokenString})
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
        <Route path="/dataset" element={
              <MCProtectedRoute isAuthenthicated={isAuthenthicated.isAuth}>
                <div><p>Coming soon.</p></div>
            </MCProtectedRoute>} />
        <Route path="/protein" element={
            <MCProtectedRoute isAuthenthicated={isAuthenthicated.isAuth}>
              <ProteinMainView token={isAuthenthicated.token} setAuthenticationSate={setAuthenticationState}/>
            </MCProtectedRoute>
        
              } />
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
        <Route path="*" element = {<div>Not found.</div>}/>

      </Routes>
      {/* <MCSpinner/> */}
      {/* <MCSerachTagHolder/> */}
      
      
    </div>
  );
}

export default App;
