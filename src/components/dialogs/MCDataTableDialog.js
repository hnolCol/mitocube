
import { Dialog, Classes } from "@blueprintjs/core";
import { Table2, Column, Cell, SelectionModes } from "@blueprintjs/table"
import { MCCSVDownload } from "../utils/components/MCCSVDownload" 

export function MCDataTableDialog (props) {
    const {data, columnNames, numRows} = props
    
    const cellRenderer = (rowIndex,columnIndex) => {
        
        if (data === undefined){
            return <Cell> </Cell>}
        else if (data[rowIndex][columnNames[columnIndex]] === null){
            return <Cell></Cell>
        }
        else if (columnNames[columnIndex] === "p-value (uncorrected)") {
            const pValue = data[rowIndex][columnNames[columnIndex]]
           
            return <Cell style={{backgroundColor:pValue<0.01?"#93ad7f":"transparent"}}>{pValue}</Cell>
        }
        else 
            {return <Cell>{data[rowIndex][columnNames[columnIndex]]}</Cell>}
            
        }

        return (
            <Dialog 
                isOpen= {props.isOpen} 
                canOutsideClickClose={true} 
                title={props.title} 
                style={{minWidth:"70%"}}
                onClose={props.onClose!==undefined?() => props.onClose(false):undefined}>
                    <div className={Classes.DIALOG_BODY}>
                        <Table2
                            numRows = {numRows}
                            enableMultipleSelection = {false}
                            forceRerenderOnSelectionChange={true}
                            selectionModes = {SelectionModes.ROWS_AND_CELLS}
                            defaultRowHeight = {25}
                            > 
                        
                            {
                                columnNames.map((colName,index) => {
                                    return (<Column key = {`${index}`} name = {colName} cellRenderer = {cellRenderer} />) 
                                     })
                            }
                        
                        </Table2>
                    <MCCSVDownload data = {Array.isArray(data) && data.length>0?data:undefined} fileName = {`ANOVA(${props.fileNameID}).csv`}/>
                    <p>{props.infoText}</p>
                    </div>
                
            </Dialog>
    )
}

MCDataTableDialog.defaultProps = {
    isOpen : true,
    fileNameID : "YME1",
    title : "Data",
    onClose : undefined,
    infoText : "Please note that the homogeneity of variances has not been evaluated for this ANOVA result. Np2 represents the Partial eta-square effect sizes. Partial eta squared is the ratio of variance associated with an effect, plus that effect and its associated error variance."
}