import { useEffect, useState } from "react"

import axios from "axios"
import _ from "lodash"
import { Button, ButtonGroup } from "@blueprintjs/core"
import { Table2, SelectionModes, Column, Cell } from "@blueprintjs/table"
import { MCSpinner } from "../../spinner/MCSpinner"
import { MCCSVDownload } from  "../../utils/components/MCCSVDownload" 

export function  MCDataSummary (props) {
    
    const [dataSummary, setDataSummary] = useState({isLoading:true,data:[],columnNames:[],infoText:""})
    
    const cellRenderer = (rowIndex,columnIndex) => {
        const columnNames = dataSummary.columnNames
        if (dataSummary.data === undefined){
            return <Cell> </Cell>}
        else if (dataSummary.data[rowIndex] === undefined) return <Cell></Cell>
        else if (dataSummary.data[rowIndex][columnNames[columnIndex]] === null) return <Cell></Cell>
        else {
            return <Cell wrapText={columnNames[columnIndex] === "shortDescription"}>{dataSummary.data[rowIndex][columnNames[columnIndex]]}</Cell>
        }
        }


    useEffect(() => {

        axios.get('/api/data/summary',{params:{token:props.token}}).then(response => {
            
                if (response.status === 200 & response.data["success"]){
                    const dataSummary = JSON.parse(response.data["data"])
                    
                    if (dataSummary.length > 0)
                    {
                        const columnNames = Object.keys(dataSummary[0])
                        setDataSummary({
                            data:dataSummary,
                            columnNames:columnNames,
                            infoText:"MitoCube data summary loaded."})
                    }
                }
                else {
                    const infoText = response.data["error"]===undefined?"Unknwon API error":response.data["error"]
                    setDataSummary({data:[],infoText:infoText})
                }
            }
                )
          
        
      }, [props.token]);
    
    


    return(
        <div style={{margin:"0 1rem"}}> 
            <MCCSVDownload data = {Array.isArray(dataSummary.data) && dataSummary.data.length>0?dataSummary.data:undefined} fileName = {`dataSummary-mitocube.csv`}/>
            <div style={{overflowY:"scroll"}}>
               {dataSummary.isLoading?<MCSpinner/>:
                    dataSummary.data.length > 0?
                        <Table2
                            numRows={dataSummary.data.length+1}
                            enableMultipleSelection = {false}
                            forceRerenderOnSelectionChange={true}
                            selectionModes = {SelectionModes.ROWS_AND_CELLS}
                            defaultRowHeight = {40}
                            >
                                {
                                dataSummary.columnNames.map((colName,index) => {
                                    return (<Column key = {`${index}`} name = {colName} cellRenderer = {cellRenderer} />) 
                                     })
                            }
                        </Table2>
                    :<p>There seem to be now data.</p>}
            </div>
            <p>{dataSummary.infoText}</p>
            <div style={{float:"right"}}>
                <ButtonGroup vertical={false} fill={false}>
                    <Button text="Close" intent="danger" onClick={() => props.onClose(false)}/>
                </ButtonGroup>
            </div>
        </div>
    )
}



MCDataSummary.defaultProps = {
    token : ""
}