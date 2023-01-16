
import _ from "lodash"

export function readLinesAndColumnNamesFromTxtFile(readEvent, cellSplit = "\t") {
    let lines = readEvent.target.result.replace(/\r\n/g,'\n').split('\n')
    const columnNames = lines[0].split(cellSplit)
    const dataArray = _.range(1, lines.length).map(idx => lines[idx].split("\t")) //skip column names
    return {columnNames, dataArray}
}