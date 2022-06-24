
import { Table2, SelectionModes, Column, Cell, EditableCell2 } from "@blueprintjs/table"
import { calculateNewValue } from "@testing-library/user-event/dist/utils"
import { isArray } from "lodash"



export function MCGroupingTable(props) {

    const {data, columnNames, handleDataEditing} = props

    const renderBodyContextMenu = (r) => {

        console.log(r)

    }

    const cellRenderer = (rowIndex,columnIndex) => {
       
        if (data !== undefined && isArray(data)){
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
            
        // else if (dataSummary.data[rowIndex] === undefined) return <Cell></Cell>
        // else if (dataSummary.data[rowIndex][columnNames[columnIndex]] === null) return <Cell></Cell>
        // else {
        //     return <Cell wrapText={columnNames[columnIndex] === "shortDescription"}>{dataSummary.data[rowIndex][columnNames[columnIndex]]}</Cell>
        // }
        // }

    return(
            <Table2
                            numRows={data.length}
                            numFrozenColumns={1}
                            enableMultipleSelection = {true}
                            forceRerenderOnSelectionChange={true}
                            selectionModes = {SelectionModes.ALL}
                            defaultRowHeight = {20}
                            bodyContextMenuRenderer={renderBodyContextMenu}
                            >
                                {
                                columnNames.map((colName,index) => {
                                    return (<Column key = {`${index}`} name = {colName} cellRenderer = {cellRenderer} />) 
                                     })
                            }
            </Table2>
        )
    }