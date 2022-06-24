import React from "react";
import { useState } from "react";
import { Column, Table, Cell, TableLoadingOption, RegionCardinality, SelectionModes, Regions, Table2, ColumnHeaderCell, RowHeaderCell, } from "@blueprintjs/table";
import {Checkbox, MenuItem, Menu, Button,Icon, IconSize} from "@blueprintjs/core"

import { SketchPicker, BlockPicker, ChromePicker } from 'react-color'
import _ from "lodash"

function selectedRegionTransform(e) {

    return {
        rows: e.rows
    }
}


function ColorPicker(props) {
    const {reportColorBack, initialColor} = props
    const [color, setColor] = useState(initialColor);  

    const changeAndReportColor = (color) => {
        setColor(color)
        reportColorBack(color)

    }
    return(
        <ChromePicker color={color} onChange={changeAndReportColor} disableAlpha={true}/>
    )
}


export function SelectableDataTable(props) {

    // const columnNames = //["","Abc","cd"]
    // const data = props.data//[{"Abc":1,"cd":2},{"Abc":1,"cd":2}]
    const {numRows, columnNames, data, loading, onSelection, onKeyDown, showSelectionInTable, selectedItems, adjustColorInData, showOnlySelection, filterIdx} = props

    const [rowIdx,setRowIdx] = useState(undefined)
    const [rowNumber, setRowNumber] = useState(undefined)

    var displayData = data.slice()
    // if (showOnlySelection){

    //     if (filterIdx.length !==0){
    //         const selectedFilterIdx = _.filter(selectedItems,item => filterIdx.includes(item))
    //         displayData = _.filter(data.slice(), item => selectedFilterIdx.includes(item.idx))
    //     }
    //     else {

    //         displayData = _.filter(data.slice(), item => selectedItems.includes(item.idx))
    //     }
    // }
    // else if (filterIdx.length !==0){
    //     displayData = _.filter(data.slice(), item => filterIdx.includes(item.idx))
    // }
    // else {
    //     displayData = data.slice()
    // }
    
    const onColorChange = (c) => {
       
        adjustColorInData(c,rowIdx)
    }

    const contextMenuRender = () => {
        
        return(
            <ColorPicker reportColorBack = {onColorChange} initialColor = {data[rowNumber]["color"]}/>
        )
    }
    

    const onRowSelection = (selection) => {
        
        if (selection.length===0) {return}
        
        }
            

    const rowHeaderRenderer = (rowIndex) => {
        
        return <RowHeaderCell name={displayData[rowIndex]["idx"]}/>
    }
    const columnRenderer = (columnIndex) => {
        
        return <ColumnHeaderCell name = {columnNames[columnIndex]}/>

    } 
    const cellRenderer = (rowIndex,columnIndex) => {
        
        if (displayData === undefined){
            return <Cell> </Cell>
        }
        else if (columnIndex === 0) {
            
            return <Cell><Checkbox indeterminate={false} checked = {selectedItems.includes(displayData[rowIndex]["idx"])} /></Cell>
        }
        else{
            return <Cell>{displayData[rowIndex][columnNames[columnIndex]]}</Cell>
        }}





        
        return (
        
        <Table2
           numRows = {numRows}
           enableMultipleSelection = {false}
           rowHeaderCellRenderer = {rowHeaderRenderer}
           forceRerenderOnSelectionChange={true}
            onSelection = {onRowSelection}
            selectionModes = {SelectionModes.ALL}
            defaultRowHeight = {25}
           bodyContextMenuRenderer={contextMenuRender}
           > 
           
           {columnNames.map((colName,index) => {
                            return (<Column key = {`${index}`} name = {colName} cellRenderer = {cellRenderer} columnHeaderCellRenderer={columnRenderer}/>)
                        })}
        
        </Table2>
        )
    }




export function MCSelectableTable(props) {
    const [checkedItems, setCheckedItems] = useState([])

    const {cellHeight,data,columnHeader,columnWidhts} = props
    console.log(columnHeader)


    const handleSelection = (rowIndex) => {
        
        if (checkedItems.includes(rowIndex)) {
            
            setCheckedItems(_.difference(checkedItems,[rowIndex]))
        }
        else {
            setCheckedItems(_.concat(checkedItems, [rowIndex]))
        }
   
    }
        

    const cellRenderer = (rowIndex,columnIndex) => {
       
        if (columnIndex === 0){
            return <Cell><Checkbox indeterminate={false} checked={checkedItems.includes(rowIndex)} onClick = {e => handleSelection(rowIndex)}/></Cell>
        }
        else {
            return(

                    <Cell>
                        {data[rowIndex].value}
                    </Cell>
                )
            }
    }

    return (
        
        <Table2 
            numRows={data.length}
            forceRerenderOnSelectionChange={true}
            defaultRowHeight = {cellHeight}
            enableRowHeader = {false}
            columnWidths = {columnWidhts}
            selectionModes = {SelectionModes.ROWS_AND_CELLS}
            >
                {columnHeader.map((headerName,index) => {
                    return(<Column key = {`${index}`} name = {headerName} cellRenderer = {cellRenderer}/>)
                })}
                    
            </Table2>
    )
}


MCSelectableTable.defaultProps = {
    data : [{"idx":0,"value":"Abc1"},{"idx":1,"value":"Abc2"},{"idx":2,"value":"Abc3"}],
    selectedItems : [1],
    cellHeight : 20,
    columnHeader : [" ","Feature Name"],
    columnWidhts : [40,200]
}


