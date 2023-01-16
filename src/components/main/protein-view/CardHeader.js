import { Button, ButtonGroup, Menu, MenuItem } from "@blueprintjs/core";
import { Popover2 } from "@blueprintjs/popover2";
import { MCIndicatorCircle, MCMenuIcon } from "./Layout";
import { downloadTxtFile, arrayOfObjectsToTabDel, downloadSVGAsText } from "../../utils/Misc";
import { Link } from "react-router-dom";
const saveSvgAsPng = require('save-svg-as-png')
const imageOptions = {
    backgroundColor: 'white',
}

export function MCCardHeader(props){
    const {
        dataID,
        label, 
        isSummary,
        handleExpInfoRequest,
        handleRemoveRequest,
        statsData,
        showDataInTable,
        correlationShown,
        indicatorColor,
        indicatorTooltipStr,
        requestCorrelatedFeatures } = props //isSummary indicates that it is a summary card instead an experiment shown
    const statResults = statsData === undefined?[{Data:"No Stats Data Found."}]:JSON.parse(statsData)
    const columnNames = statsData === undefined ? ["Data"] : Object.keys(statResults[0])

    return(

        <div className="card-header">
            <div>
                {props.description}
            </div>
            <div>
            <ButtonGroup vertical={false} minimal={true} >
            <MCIndicatorCircle size = {20} fillColor={indicatorColor} tooltipStr={`${indicatorTooltipStr} Card`}/>
                <Popover2 content={
                        <Menu>
                            {isSummary?<MenuItem text="Protein Info" icon={"info-sign"} onClick={() => handleExpInfoRequest("",false,true)}/>:null}
                            
                            {dataID !== null && !isSummary?
                            <MenuItem text="Experiment info" icon={"info-sign"} onClick={() => handleExpInfoRequest(dataID,false)}/>:null}
                            {!isSummary & dataID !== null?<MenuItem
                                icon = {"calculator"} 
                                text = {"ANOVA Statistics"}
                                intent="success"
                                minimal = {"true"}
                                onClick = {() => showDataInTable(statResults,columnNames,"ANOVA Statistic",`(${label}-${dataID})`)}/>:null}
                            
                            {!isSummary & dataID !== null?
                            <MenuItem 
                                icon={correlationShown?"stacked-chart":"heat-grid"} 
                                text = {correlationShown?"Boxplot View":"Top20 correlation"}
                                intent="primary" 
                                minimal = {"true"}
                                onClick = {() => requestCorrelatedFeatures(dataID,props.featureID)}
                                />:null}
                            {dataID !== null?
                            <Link style={{ textDecoration: 'none' }} to={`/dataset/${dataID}?type=summary`} target="_blank" rel="noopener noreferrer"> 
                                <Button fill={true} icon={"satellite"} minimal={"true"} intent={"danger"} text = {"Explore dataset"}/> 
                            </Link>:null}
                            <MenuItem text="Save image" icon={"graph"} onClick={() => {
                                            saveSvgAsPng.saveSvgAsPng(document.getElementById(`${props.id}`), `MitoCubeImg(${label}-${dataID}).png`, imageOptions)}}/>
                            
                            <MenuItem text="Save svg" icon={"graph"} onClick={() => {
                                            downloadSVGAsText(document.getElementById(`${props.id}`),`MitoCube(${label}-${dataID}).svg`)}}/>
                            <MenuItem 
                                text="Download data"
                                icon={"download"} 
                                onClick={() => downloadTxtFile(arrayOfObjectsToTabDel(Array.isArray(props.downloadData) ? props.downloadData : JSON.parse(props.downloadData), []),
                                    `${label}-MitoCube-(${dataID}).txt`)} />

                            <MenuItem text="Remove" icon={"remove"} intent="danger" onClick={(e) => handleRemoveRequest(props.id)}/>
                        </Menu>}
                    >
                        <MCMenuIcon size={20}/>
                </Popover2>
                
            </ButtonGroup>
            </div>
        </div>
    )
}

MCCardHeader.defaultProps = {
    indicatorColor : "red",
    isSummary : false,
    indicatorTooltipStr : "None",
    dataID : undefined,
    label : "Gene 1",
}