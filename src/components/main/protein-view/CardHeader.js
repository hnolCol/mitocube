import { ButtonGroup, Menu, MenuItem } from "@blueprintjs/core";
import { Popover2 } from "@blueprintjs/popover2";
import { MCIndicatorCircle, MCMenuIcon } from "./Layout";
import { downloadTxtFile, arrayOfObjectsToTabDel, downloadSVGAsText } from "../../utils/Misc";
import { Link } from "react-router-dom";
const saveSvgAsPng = require('save-svg-as-png')
const imageOptions = {
    backgroundColor: 'white',
}

export function MCCardHeader(props){
    
    const statsData = props.statsData === undefined?[{Data:"No Stats Data Found."}]:JSON.parse(props.statsData)
    const columnNames = props.statsData === undefined?["Data"]:Object.keys(statsData[0])
    // console.log(arrayOfObjectsToCSV(props.downloadData))

    return(

        <div className="card-header">
            <div>
                {props.description}
            </div>
            <div>
            <ButtonGroup vertical={false} minimal={true} >
            <MCIndicatorCircle size = {20} fillColor={props.indicatorColor} tooltipStr={`${props.indicatorTooltipStr} Card`}/>
                <Popover2 content={
                        <Menu>
                            {props.isSummary?<MenuItem text="Protein Info" icon={"info-sign"} onClick={(e) => props.handleExpInfoRequest("",false,true)}/>:null}
                            
                            {props.dataID !== null?
                            <MenuItem text="Experiment info" icon={"info-sign"} onClick={(e) => props.handleExpInfoRequest(props.dataID,false)}/>:null}
                            {!props.isSummary & props.dataID !== null?<MenuItem
                                icon = {"calculator"} 
                                text = {"ANOVA Statistics"}
                                intent="success"
                                minimal = {"true"}
                                onClick = {() => props.showDataInTable(statsData,columnNames,"ANOVA Statistic",`(${props.label}-${props.dataID})`)}/>:null}
                            
                            {!props.isSummary & props.dataID !== null?
                            <MenuItem 
                                icon={props.correlationShown?"stacked-chart":"heat-grid"} 
                                text = {props.correlationShown?"Boxplot View":"Top20 correlation"}
                                intent="primary" 
                                minimal = {"true"}
                                // tooltipStr="Toggle between boxplot and correlated features (heatmap)."
                                onClick = {() => props.requestCorrelatedFeatures(props.dataID,props.featureID)}
                                />:null}
                            {props.dataID !== null?
                            <Link style={{ textDecoration: 'none' }} to={`/dataset/${props.dataID}`} target="_blank" rel="noopener noreferrer"> 
                                <MenuItem icon={"satellite"} minimal={"true"} intent={"danger"} text = {"Explore dataset"}/> 
                            </Link>:null}
                            <MenuItem text="Save image" icon={"graph"} onClick={() => {
                                            saveSvgAsPng.saveSvgAsPng(document.getElementById(`${props.id}`), `MitoCubeImg(${props.label}-${props.dataID}).png`, imageOptions)}}/>
                            
                            <MenuItem text="Save svg" icon={"graph"} onClick={() => {
                                            downloadSVGAsText(document.getElementById(`${props.id}`),`MitoCube(${props.label}-${props.dataID}).svg`)}}/>
                            
                            <MenuItem 
                                text="Download data"
                                icon={"download"} 
                                onClick={e => downloadTxtFile(arrayOfObjectsToTabDel(Array.isArray(props.downloadData)?props.downloadData:JSON.parse(props.downloadData)),`${props.label}-MitoCube-(${props.dataID}).txt`)}/>

                            <MenuItem text="Remove" icon={"remove"} intent="danger" onClick={(e) => props.handleRemoveRequest(props.id)}/>
                        </Menu>}>
                        <MCMenuIcon size={20}/>
                    {/* <Button icon={<Icon icon="menu" iconSize={12}/>} minimal={true} /> */}
                </Popover2>
                
            </ButtonGroup>
            </div>
        </div>
    )
}

MCCardHeader.defaultProps = {
    indicatorColor : "red",
    isSummary : false,
    id : "none",
    indicatorTooltipStr : "None",
    dataID : undefined,
    label : "Gene 1",
    // plotIcon : "heat-grid"
}