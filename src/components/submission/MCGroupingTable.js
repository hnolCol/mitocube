
import { Button, ButtonGroup, Dialog, FileInput, HotkeysProvider, InputGroup, Menu, MenuDivider, MenuItem, Text } from "@blueprintjs/core"
import { Table2, SelectionModes, Column, Cell, EditableCell2 } from "@blueprintjs/table"
import _, { isArray, template } from "lodash"
import { useState } from "react"
import { arrayToTabDel, downloadTxtFile } from "../utils/Misc"

function MCAddGroupDialog(props) {
    const {isOpen,onClose,grouping,existingGroups,reportGroup,r,columnIndex} = props
    const [groupName, setGroupName] = useState("")
    let groupingNameNotValid = _.isArray(existingGroups)?existingGroups.includes(groupName):false
    const saveGroup = (e) => {
        if (groupingNameNotValid) return 
        reportGroup(groupName,grouping,r.regions,columnIndex)
        onClose()
    }

    return (
        <Dialog isOpen = {isOpen} title="Add Group to Grouping" onClose={onClose}>
            <div style={{width:"70%",transform:"translateX(20%)",marginTop:"1rem"}}>
                <p>{`Enter group name for ${grouping}. Once entered you can access the group from the context menu.`}</p>
                <InputGroup onChange={e => setGroupName(e.target.value)} value={groupName} 
                    onKeyUp={e => {
                        if (e.code === "Enter") {
                          e.preventDefault();
                          saveGroup()
                          ;}}}/>
                <ButtonGroup fill={true}>
                    <Button text="OK" intent="primary" onClick={saveGroup} disabled={groupingNameNotValid}/>
                    <Button text="Cancel" onClick={onClose}/>
                </ButtonGroup>
            </div>
        </Dialog>
    )
}

function MCRenameGrouping(props) {
    const {isOpen, onClose, grouping, exisitingGroupings, reportChange, columnIndex} = props
    const [groupingName, setGroupingName] = useState("")
    const groupingNameNotValid = groupingName===""?true:_.isArray(exisitingGroupings)?exisitingGroupings.includes(groupingName):false


    const saveChange = (e) => {
         //check for duplicates
        if ( groupingNameNotValid) return
        reportChange(groupingName,columnIndex)
        onClose()
    }
    return (
        <Dialog isOpen = {isOpen} title="Rename Grouping" onClose={onClose}>
            <div style={{width:"70%",transform:"translateX(20%)",marginTop:"1rem"}}>
                <p>{`Enter new name for ${grouping}.`}</p>
                <InputGroup 
                    onChange={e => setGroupingName(e.target.value)} 
                    value={groupingName} 
                    placeholder={grouping}
                    onKeyUp={e => {
                        if (e.code === "Enter") {
                          e.preventDefault();
                          saveChange()
                          ;}}}/>
                <ButtonGroup fill={true}>
                    <Button text="OK" intent="primary" onClick={saveChange} disabled={groupingNameNotValid}/>
                    <Button text="Cancel" onClick={onClose}/>
                </ButtonGroup>
            </div>
        </Dialog>
    )
}


function getRowsAsArray(region){
    let rows = _.concat(region.map(v => {
                if (v.rows[0] !== v.rows[1]){
                    return _.range(v.rows[0],v.rows[1]+1)
                }
                else {
                    return [v.rows[0]]
                }
            }))
    return _.flatten(rows)
}


export function MCGroupingTable(props) {

    const {data, columnNames, handleDataEditing, numReplicates, handleColumnNameEditing, handleTemplateInput, rerender} = props
    const [groupings,setGroupings] = useState({})
    const [addGroup,setAddGroup] = useState({})
    const [editGrouping,setEditGrouping] = useState({})
    const [templateFile, setTemplateFile] = useState("")
    const selectionRegion =(e)=>{
        
        return {
            rows: e.rows,
            cols: [e.cols[0],e.cols[0]]
        }
    }

    const editGroupsOfGrouping = (r,grouping,columnIndex) => {
        setAddGroup({
                isOpen:true,
                r : r,
                columnIndex : columnIndex,
                grouping:grouping,
                existingGroups:groupings[grouping]!==undefined&&_.isArray(Object.keys(groupings[grouping]))?Object.keys(groupings[grouping]):[]})
    }


    const editGroupingNames = (grouping,columnIndex) => {
  
        setEditGrouping({
            isOpen:true,
            grouping:grouping,
            exisitingGroupings:columnNames.filter(columnName => columnName!==grouping),
            columnIndex:columnIndex
        })
    }

    const closeEditGrouping = (e) => {
        setEditGrouping({isOpen:false,grouping:"",exisitingGroupings:[]})
    }

    const saveGrouping = (value,columnIndex) => {

        handleColumnNameEditing(value,columnIndex)
    }

    const addGroupToGrouping = (groupName,groupingName,region,columnIndex) => {
        if (Object.keys(groupings).includes(groupingName)) {

            let grouping = groupings[groupingName]
            grouping[groupName] = []
            groupings[groupingName] = grouping
            setGroupings(groupings)

        }
        else{
            let groupingsCopy = groupings
            groupingsCopy[groupingName] = {[groupName]:[]}
            setGroupings(groupingsCopy)
        }

       
        handleDataEditing(groupName,getRowsAsArray(region),columnIndex)

    }

    const handleReplicateChange = (v,r,columnIndex) => {
        // report replicate addition back
        handleDataEditing(v+1,getRowsAsArray(r.regions),columnIndex)
    }

    const closeDialog = () => {
        setAddGroup({isOpen:false})
    }

    const renderBodyContextMenu = (r) => {

        let columnIndex = r.target.cols[0]
       
        if (r!==undefined&&columnIndex === 0){
            return(
                <Menu>
                    <MenuItem text="Select Grouping Column" disabled={true}/>
                </Menu>
            )
        }
        if (r!==undefined&&columnIndex === 1){
            
            return(
                <Menu>
                    <MenuItem text="Replicate" disabled={true}/>
                    <MenuDivider />
                    {_.range(numReplicates).map(v => <MenuItem key = {v} text={v+1} onClick={e => handleReplicateChange(v,r,columnIndex)}/>)}
                </Menu>
            )
        }
        if (r!==undefined&&r.selectedRegions.length > 0)
            {
                let grouping = columnNames[columnIndex]
                let groupNames = groupings[grouping]!==undefined?Object.keys(groupings[grouping]):[]
                
                return (
                    <Menu>
                        <MenuItem text = {grouping} disabled={true}/>
                         
                        {groupNames!==undefined&&groupNames.length > 0?<MenuDivider/>:null}
                         {groupNames!==undefined?groupNames.map(groupName => <MenuItem key = {groupName} text={groupName} onClick={e => handleDataEditing(groupName,getRowsAsArray(r.regions),columnIndex)}/>):null}
                         <MenuDivider/>
                         <MenuItem icon={"add-column-left"} text={"Add Group"} onClick={e => editGroupsOfGrouping(r,grouping,columnIndex)}/>
                         <MenuDivider/>
                         <MenuItem text = {`Rename ${grouping}`} onClick={e => editGroupingNames(grouping,columnIndex)}/>
                    </Menu>
                )
            }
    }

    const cellRenderer = (rowIndex,columnIndex) => {
       
        if (data !== undefined && isArray(data)){
            if (data[rowIndex] === undefined){
                return (
                    <EditableCell2 
                        value = {""} 
                        rowIndex={rowIndex} 
                        columnIndex={columnIndex}
                        //onChange={(newValue, rowIndex, columnIndex)  => console.log(newValue, rowIndex, columnIndex)}
                        onConfirm={handleDataEditing}/>
                )}
            if (columnIndex !== 0) {
                
                return (
                    <EditableCell2 
                            value = {data[rowIndex][columnNames[columnIndex]]} 
                            rowIndex={rowIndex} 
                            columnIndex={columnIndex}
                            //onChange={(newValue, rowIndex, columnIndex)  => console.log(newValue, rowIndex, columnIndex)}
                            onConfirm={handleDataEditing}/>
                        )            
                    }
            else {
                
                return <Cell>{data[rowIndex][columnNames[columnIndex]]}</Cell>
            }
        }
    }

    const handleTextInput = (e) => {
        // handles text file input 
        const newFiles = e.target.files;
        const fileName = newFiles[0].name;
        const extension = fileName.split(".").pop();
        const isSupported = ["txt"].includes(extension);
       
        if (isSupported){
            const reader = new FileReader()
            reader.onload = (e) => {
                const text = e.target.result.split("\n")
                const columnNames = text[0].split("\t")
                if (columnNames.includes("Replicate") && columnNames.includes("Run")){
                    const data = _.range(1,text.length).map(idx => text[idx].split("\t"))
                    const numSamples = data.length
                    const replicates = _.uniq(data.map(v => v[_.indexOf(columnNames,"Replicate")]))
                    const dataTable = data.map(rowData => Object.fromEntries(rowData.map((v,i) => [columnNames[i],v])))
                    const numberOfGroupings = columnNames.length - 2 // Run and Replicate must be the in the file
                    handleTemplateInput(columnNames,dataTable,replicates.length,numSamples,numberOfGroupings)

                }
                else {
                    alert("File must contain Replicate and Run as column names.")
                }
            }
            reader.readAsText(e.target.files[0])
            setTemplateFile(fileName)

        
        }
        else {
            alert ("Wrong file extension. Requires tab delimted txt.")
        }
        
        
    }
 

    return(
      
        <div style={{paddingTop:"1rem",paddingBottom:"1rem",height:"500px",overflowY:"hidden"}}>
            <MCAddGroupDialog {...addGroup} reportGroup = {addGroupToGrouping} onClose={closeDialog}/>
            <MCRenameGrouping {...editGrouping} onClose={closeEditGrouping} reportChange = {saveGrouping}/>
            <ButtonGroup fill={ true } style={{paddingBottom:"0.5rem"}}>
                <FileInput
                    buttonText="..."
                    onInputChange={handleTextInput}
                   // inputProps={{ onChange: (e) => console.log(e.target.files)}}
                    text={templateFile}
                    fill={true}
                    hasSelection={templateFile !== ""} />
                
                <Button text = "Template" rightIcon="download" onClick={e => downloadTxtFile(arrayToTabDel(data,columnNames),`templateForSampleSubmission.txt`)}/>
            </ButtonGroup>
            {data!==undefined?
            <HotkeysProvider>
                <Table2
                                numRows={data.length+2}
                                numFrozenColumns={1}
                                enableMultipleSelection = {true}
                                forceRerenderOnSelectionChange={true}
                                selectionModes = {SelectionModes.CELLS}
                                selectedRegionTransform={selectionRegion}
                                defaultRowHeight = {20}
                                bodyContextMenuRenderer={renderBodyContextMenu}
                                cellRendererDependencies={[rerender]}
                                //columnWidths = {_.concat([180,80],_.range(columnNames.length-2).map(v => 100))}
                                >
                                    {
                                    columnNames.map((colName,index) => {
                                        return (<Column key = {`${index}`} name = {colName} cellRenderer = {cellRenderer}/>) 
                                        })
                                }
                </Table2>
            </HotkeysProvider>:null}
            </div>
       
        )
    }