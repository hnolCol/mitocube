import { useState } from "react";
import React from "react";
import { Link, } from "react-router-dom";
import { Button } from "@blueprintjs/core";
import { MCIconWithTooltip } from "../utils/components/IconWithTooltip";
import { MCTagButton } from "../utils/components/MCTagButton";
import { MCAddButton } from "../utils/components/MCAddButton";
import OmnibarSearch from "../utils/components/OmnibarSearch"
import _ from "lodash"
import { MCProteinLayout } from "./protein-view/Layout"
import { MCDataFilter } from "../dialogs/filter/DataFilter"
import { MCDialog } from "../dialogs/MCDialog"
import { MCDataTableDialog } from "../dialogs/MCDataTableDialog";
import { MCGetFilterFromLocalStorage, QueryParam } from "../utils/Misc";
import { MCSpinner } from "../spinner/MCSpinner"
import { MCExpInfoDrawer } from "./protein-view/ExperimentInfo"
import { MCSettings } from "../dialogs/setting/MCSettings"
import { MCDataSummary } from "../dialogs/data/DataSummary";

function allObjectsPresent(inArray = [],comArray = []){
  const foundInCom = inArray.map((o) => {
    return _.some(comArray,o)
  })
  return foundInCom
}



export function ProteinMainView(props) {
    // const [loading, setLoading] = useState(false)
    const [filterDialogOpen, setFilterDialogOpen] = useState(false)
    const [settingDialogOpen, setSettingDialogOpen] = useState(false)
    const [dataSummaryDialogOpen, setDataSummaryDialogOpen] = useState(false)
    const [searchOpen, setSearchOpen] = useState(false)
    const [featureIDs, setfeatureIDs] = useState({items:[],selected:"",invisible:[]}) 
    const [experimentInfo, setExperimentInfo] = useState({isOpen:false,"dataID":undefined,isSummary:false})
    const [dataForTable , setDataForTable] = useState({isOpen:false,data:null,columnNames:[],title:"Data View",fileNameID:"download"})
    //console.log(QueryParam().get("q"))
    // experimental info request (e.g. opening drwaer)




    const handleExpInfoRequest = (dataID,shoudlClose,isSummary=false) => {
      if (shoudlClose){
          setExperimentInfo({isOpen:false,dataID:dataID,isSummary:isSummary})}
      else {
        setExperimentInfo({isOpen:true,dataID:dataID,isSummary:isSummary})
      }
    }


    const onItemClick = (id) => {
      if (_.isEqual(featureIDs["selected"],id)) {
        return
      }
      // on tag item click
      if (_.some(featureIDs["items"],id)){
       
        setfeatureIDs(
          prevValues => {
            return { ...prevValues,"selected": id}
          })
      }
    }

    const setOpenOfDataInTable = (isOpen) => {

        setDataForTable(prevValues => {
          return { ...prevValues,"isOpen": isOpen}
        })
    } 

    const showDataInTable = (data,columnNames,title,fileNameID) => {
      
      setDataForTable({isOpen:true,data:data,columnNames:columnNames,title:title,fileNameID:fileNameID})

    }

    const onItemSelect = (id) => {
      // on search item select
      if (featureIDs["items"].length === 0){
        setfeatureIDs({"items":[id],"selected":id,"invisible":[]})
      }
      else{
        const items = _.unionBy(featureIDs["items"],[id],"Entry")
        const invisibleItems =  _.differenceWith(featureIDs["invisible"], [id], _.isEqual)
        if (!_.isEqual(items,featureIDs["items"])  || !_.isEqual(invisibleItems,featureIDs["invisible"])) {
          setfeatureIDs(
            prevValues => {
              return { ...prevValues,"items": items,
                  "invisible":invisibleItems}})
        }
        
      }
    }

    const onItemRemove = (id) => {

      const newFeatures = _.differenceWith(featureIDs["items"], [id], _.isEqual)
      const newInvisibleFeatures = _.unionBy(featureIDs["invisible"],[id])

      if (newFeatures.length === 0){
        setfeatureIDs({"items":[],"selected":"",invisible:newInvisibleFeatures})
      }
      else if (_.some(newFeatures,featureIDs["selected"])){
        setfeatureIDs(
          prevValues => {
            return { ...prevValues,"invisible": newInvisibleFeatures}})
      }
      else {
        setfeatureIDs({"items":newFeatures,"selected":newFeatures[0],"invisible":newInvisibleFeatures}) 
      }
    }


    
    const allItemsHidden = allObjectsPresent(featureIDs["items"],featureIDs["invisible"]).every((v) => v)
    
    return (
      <div style={{width:"100%", height: "100vh"}}>
      <div className="leftbar-fixed">
          <Link to="/"><Button icon={"home"} minimal={true}/></Link> 
          <MCIconWithTooltip icon={"cog"} tooltipStr={"Opens settings dialog."} onClick = {() => setSettingDialogOpen(true)}/>
          <Button icon={"filter"} 
            minimal={true} 
            intent={"danger"}
            onClick = {() => setFilterDialogOpen(true)}/>
          <Button 
            icon={"database"} 
            minimal={true} 
            intent={"primary"}
            onClick = {() => setDataSummaryDialogOpen(true)}/>
        <hr/>
        {/* Open link in new tab for help */}
        <Link to="/help" target="_blank" rel="noopener noreferrer"> 
          <Button icon={"help"} minimal={true} intent={"success"}/> 
        </Link>
              
      </div>

        <div className="topbar-fixed">

        {featureIDs["items"].map(v =>{
          
          return(
            _.includes(featureIDs["invisible"],v)?null:
            <MCTagButton 
                  text={v["Gene names  (primary )"]} 
                  key={v.Entry} 
                  highlighted = {v.Entry===featureIDs["selected"].Entry}
                  handleDelete = {onItemRemove} 
                  handleClick = {onItemClick}
                  id = {v}/>
          )
        })}
        
        <MCAddButton callback={setSearchOpen}/> 
        </div>

        
    <div style={{marginLeft:"40px",marginTop:"40px",overflowY:"scroll",height:"100%"}}>
      <OmnibarSearch isOpen={searchOpen} setOpenState = {setSearchOpen} onItemSelect={onItemSelect} filter = {MCGetFilterFromLocalStorage()}/>
      <MCDataTableDialog 
                isOpen={dataForTable.isOpen} 
                title={dataForTable.title}  
                data={dataForTable.data} 
                numRows = {Array.isArray(dataForTable.data)?dataForTable.data.length:0}
                columnNames={dataForTable.columnNames}
                fileNameID = {dataForTable.fileNameID}
                onClose={setOpenOfDataInTable}/>

      <MCExpInfoDrawer 
                isOpen={experimentInfo.isOpen} 
                dataID={experimentInfo.dataID} 
                handleExpInfoRequest = {handleExpInfoRequest} 
                isSummary={experimentInfo.isSummary} 
                featureID={featureIDs["selected"]}
                title={experimentInfo.isSummary?"Protein Summary":"Experimental Information"}
                token = {props.token}/>

      <MCDialog children={<MCDataFilter onClose = {setFilterDialogOpen}/>} isOpen={filterDialogOpen} onClose = {setFilterDialogOpen}/>
      <MCDialog children={<MCSettings  onClose = {setSettingDialogOpen}/>} isOpen = {settingDialogOpen} onClose = {setSettingDialogOpen} title="MitoCube Settings"/>
      <MCDialog children={<MCDataSummary onClose={setDataSummaryDialogOpen} token={props.token}/>} isOpen={dataSummaryDialogOpen} onClose={setDataSummaryDialogOpen} title="Data Summary" style = {{minWidth:"90%"}}/>
      {!allItemsHidden?

        <MCProteinLayout 
            featureIDItems = {featureIDs["items"]} 
            selectedFeature = {featureIDs["selected"]} 
            handleExpInfoRequest = {handleExpInfoRequest} 
            showDataInTable = {showDataInTable}
            setOpenOfDataInTable = {setOpenOfDataInTable}
            token = {props.token}
            setAuthenticationSate = {props.setAuthenticationSate}/>:
      
        <div style={{marginTop:"40vh"}}>
          <div className="vert-align-div">
            <MCSpinner initialText={"Start exploring"} textAnchor="middle" textX = {25}/>
            <MCAddButton callback={setSearchOpen} boxClassName="fixed-box-big"/>
          </div>
        </div>}

  </div>
  </div>
    );
  }