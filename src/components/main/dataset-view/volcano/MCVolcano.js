import { useEffect, useState, useRef, useMemo } from "react";
import { Button, ButtonGroup, Dialog, FileInput, InputGroup, Menu, MenuItem } from "@blueprintjs/core";
import { Popover2, Popover2InteractionKind } from "@blueprintjs/popover2";
import { useToggle } from "../../../../hooks/useToggle";


import { arrayOfObjectsToTabDel, downloadSVGAsText, downloadTxtFile, findClosestMatch, saveFeatureList } from "../../../utils/Misc";

import { Text } from "@visx/text";
import { scaleLinear } from "@visx/scale";
import { localPoint } from '@visx/event';
import { AxisBottom, AxisLeft } from "@visx/axis";
import { GridRows, GridColumns } from '@visx/grid';
import ParentSize from "@visx/responsive/lib/components/ParentSizeModern";

import { MCSpinner } from "../../../spinner/MCSpinner";
import { MCGroupingSelection } from "../MCDataset";
import MCScatterPoint from "./MCScatterPoint";

import _ from "lodash";
import axios from "axios";
import { MCSimpleResponseCheck } from "../../../utils/ResponseChecks";

function MCCreateList(props) {

    const [loading,setLoading] = useState(false)
    const [list,setList] = useState(undefined)
    const [fileName, setFileName] = useState(undefined)
    const [listName, setListName] = useState("")

    const handleTextInput = (e) => {
        setLoading(true)
        const newFiles = e.target.files;
        const fileNameToLoad = newFiles[0].name;
        const extension = fileNameToLoad.split(".").pop();
        const isSupported = ["txt"].includes(extension);
        
        if (isSupported){
            const reader = new FileReader()
                reader.onload = (e) => {
                const newList = e.target.result.split("\n")
                setList(newList)
                setLoading(false)
                }
            reader.readAsText(newFiles[0])
            setFileName(fileNameToLoad)
            
            }
            
        
        }

    const saveList = (e) => {
        setLoading(true)
        if (listName !== "" && _.isArray(list) && list.length > 0) {
            saveFeatureList(listName,list)
        }
        props.onClose(false)
    }
        
    return(
        <div style={{marginRight:"1rem"}}>
            <div>
            <p>Load txt file containg Gene names or Uniprot IDs</p>
                <FileInput buttonText="..." onInputChange={handleTextInput} text={fileName}/>
            </div>
            {list!==undefined&&_.isArray(list)?
            <div>
                <InputGroup placeholder="List name.." value={listName} onChange={e => setListName(e.target.value)}/>
                <p>{`List loaded. ${list.length} features detected.`}</p>

                </div>:null}
            <ButtonGroup>
            <Button 
                text="Save" 
                loading={loading} 
                intent={list!==undefined&&_.isArray(list)?"success":"none"}
                onClick = {saveList}
                />
            <Button text="Close" onClick={e => props.onClose(false)}/>
            </ButtonGroup>
            
        </div>
    )
}


export function MCVolcanoGrid(props) {

    const {
            groupingNames, 
            groupItems, 
            dataID, 
            token,
            volcanoWindows, 
            setVolcanoWindows,
            volcanoData, 
            setVolcanoData,
            transferPoints, 
            toggleTransfer,
            handleActiveList,
            activeList,
            activeListName,
            savedFeatureLists} = props

    const [crossPoint, setCrossPoint] = useState(undefined)
    const [mouseOverPlot, setMouseOverPlot] = useState(undefined)
    const [createList, setCreateList] = useState(false)

    const handleCrossPoint = (pp) => {
        // handle point ot cross reference
        setCrossPoint(pp)
    }
    const addVolcanoWindow = () => {
        // add volcano window to the current collection
        setVolcanoWindows(_.concat(volcanoWindows,[undefined]))
    }

    return (
        <div>
        <Dialog isOpen={createList} title = {"Create list from file."} onClose={e => setCreateList(false)} children={<MCCreateList onClose = {setCreateList} />}/>
        <Button icon = "add" onClick={addVolcanoWindow} small={true} minimal={true} intent="primary"/>
        <Button icon = "airplane" onClick={toggleTransfer}intent={transferPoints?"success":"none"} small={true} minimal={true}/>
        {/* {Array.isArray(savedFeatureLists) && savedFeatureLists.length > 0? */}
            <Popover2 content={
                <Menu>
                    <MenuItem text="Annotate list" icon="heatmap">
                        {savedFeatureLists.map(v => <MenuItem key =  {v} text={v} onClick={e => handleActiveList(activeList!==v?v:undefined)} icon={v === activeListName?"tick":"none"}/>)}
                        <MenuItem text = "Hide annotations" icon="reset"/>
                    </MenuItem>
                    <MenuItem text = "Create list from file" icon = "add-column-right" onClick={e => setCreateList(true)}/>
                   
                </Menu>
                }>
                
                <Button icon = "menu" intent={"danger"} small={true} minimal={true}/>
            
            </Popover2>
               

            <div className = "volcano-container">
                {_.range(volcanoWindows.length+1).map((v,i) => {
                    const volcanoProps = {
                        transferPoints : transferPoints,
                        mouseOverPlot : mouseOverPlot,
                        transferPointHandler:handleCrossPoint,
                        highlightPoint:transferPoints || mouseOverPlot === `volc-${i}`? crossPoint : undefined,
                        setMouseOverPlot:setMouseOverPlot,
                        setVolcanoData :setVolcanoData,
                        svgID : `volc-${i}`,
                        activeList : activeList
                    }
                    return(
                        <div 
                            className="volcano-box" 
                            key = {`${i}-volcContainer`}>
                                <MCVolcanoCollection 
                                    groupingNames={groupingNames}
                                    groupItems={groupItems}
                                    dataID={dataID}
                                    token={token}
                                    data={volcanoData[i]}
                                    volcanoProps={volcanoProps}
                                    />
                         </div>)
                         }
                       )
                }

            </div>
        </div> )  
}


export function MCVolcanoCollection(props) {
    
    
const {groupingNames, groupItems, dataID, token, data, volcanoProps } = props



const [groupSelection, setGroupSelection] = useState(undefined) 


const handleGroupingSelection = (grouping) => {
    
    setGroupSelection(grouping)

}

    return(
        <div>
            {groupSelection===undefined && data === undefined? //if data are there, dont use groupselection
            <MCGroupingSelection 
                groupingNames={groupingNames} 
                groupItems = {groupItems} 
                callback = {handleGroupingSelection}/>:

            <MCVolcanoLoader 
                dataID = {dataID}
                grouping= {groupSelection} 
                token= {token} 
                data = {data}
                volcanoProps = {volcanoProps}/>}
        </div>
    )
}


export function MCVolcanoLoader(props) {
    
    const {dataID, grouping, token, data, volcanoProps} = props
    //const [data, setData] = useState({})
    const [errorMsg, setErrorMsg] = useState(undefined)

    useEffect(() => {
        if (data!==undefined) return 
        axios.get('/api/data/volcano', { params: { dataID: dataID, grouping: grouping, token: token } }).then(response => {
            console.log(response.data)
                if (response.status === 200 && MCSimpleResponseCheck(response.data)){
                    volcanoProps.setVolcanoData(response.data.params)
                }
                else {
                    setErrorMsg(`There was an error in extracting the data. ${response.data["msg"]}`)
                }
            }).catch(error => {
            
            setErrorMsg(`There was an error returned from the API: ${error}`)
        })
      }, []);

      return (
          <div>
              {data !== undefined && Object.keys(data).length > 0 ?
                  <ParentSize>
                      {parent => (
                        
                          <MCVolcano
                              width = {parent.width}
                              dataID={dataID}
                              {...volcanoProps}
                              {...data} />
                      )}
                    </ParentSize>
                
                :
                errorMsg!==undefined?<p>{errorMsg}</p>:<MCSpinner/>}
          </div>
      )


}



const pointLabelAlignment = (p,turnLabelToLeftXLimit) => {
    return (p[0]>0 && p[0] < turnLabelToLeftXLimit) || (p[0] < -turnLabelToLeftXLimit)?"start":p[0] < -turnLabelToLeftXLimit?"start":"end"
}

const initZoomState = {active:false,x:undefined,y:undefined,width:4,height:4,xDomain:undefined,yDomain:undefined,zoomed:false}


export function MCVolcano(props) {

    const [filterIndex, setFilterIndex] = useState(undefined)
    const [highlightIndex, setHighlightIndex] = useState([undefined])
    const [zoomActive, setZoomActive] = useState(initZoomState)
    const [labels, setLabels] = useState([])
    const [search, setSearch] = useState(undefined)
    const [grid, toggleGrid] = useToggle(false)
    
    const {
            margin, 
            width, 
            height, 
            points, 
            circleProps, 
            defaultCircleFill,defaultRadius, 
            highlightRadius,xDomain,yDomain, 
            xlabel, ylabel, filterColumns, 
            pointColumnNames,fontProps, 
            highlightFeatures,
            transferPointHandler,
            highlightPoint,
            mouseOverPlot,
            setMouseOverPlot,
            transferPoints, svgID,
            activeList} = props 
    
    //const svgID = xlabel
    const svgRef = useRef(null);

  
    var minDistanceX = (xDomain[1] - xDomain[0])*0.01
    var minDistanceY = (yDomain[0] - yDomain[1])*0.01
    const turnLabelToLeftXLimit = 0.80 * xDomain[1]
    
    // init scales
    const xscale = useMemo(() => scaleLinear({
        domain : zoomActive.xDomain!==undefined?zoomActive.xDomain:xDomain,
        range : [0+margin.left,width-margin.right],
       
    }),[margin.left,width,margin.right,xDomain,zoomActive.xDomain])

    const yscale = useMemo(() => scaleLinear({
        domain : zoomActive.yDomain!==undefined?zoomActive.yDomain:yDomain,
        range : [0+margin.top,height-margin.bottom],
        }),[margin.top,height,margin.bottom,yDomain,zoomActive.yDomain])

    // filter points to show based on some values
    var pointsToShow = useMemo(() => {
        var pps = []
            if (zoomActive.xDomain!==undefined){
                pps = _.filter(points, o => o[0] > zoomActive.xDomain[0] && o[0] < zoomActive.xDomain[1] && o[1] > zoomActive.yDomain[1] && o[1] < zoomActive.yDomain[0])
            }
            else {
                pps = zoomActive.active?zoomActive.filteredPoints:points
            }
            //filter the points that are in zoom
            if (filterIndex !== undefined){
                pps = _.filter(pps, o => o[filterIndex] !== "-")   
            }
            if (highlightIndex.length > 1 && highlightIndex[1].length > 1) {
                pps = _.concat(_.filter(pps, x => !highlightIndex[1].includes(x[3])),_.filter(pps, x => highlightIndex[1].includes(x[3])))
            }
        return pps
            
        },[zoomActive.xDomain,
            zoomActive.yDomain,
            zoomActive.active,
            filterIndex,
            highlightIndex[0]])
    
    if (zoomActive.xDomain!==undefined) {
        minDistanceX = (zoomActive.xDomain[1] - zoomActive.xDomain[0])*0.01
        minDistanceY = (zoomActive.yDomain[0] - zoomActive.yDomain[1])*0.01
    }

    const searchWordActive = search!==undefined
    const regExpMatchingPoints = useMemo(() => {
        const searchWordActive = search!==undefined
        const re = new RegExp(_.escapeRegExp(search), 'i')
        const isMatch = result => [3,4].map(testIndex => re.test(result[testIndex])).some(a => a) // a===true if at least one index matches
        return searchWordActive?_.filter(pointsToShow, isMatch):[]
    }, [search ,pointsToShow])

    
    // const re = new RegExp(_.escapeRegExp(search), 'i')
    // const isMatch = result => [3,4].map(testIndex => re.test(result[testIndex])).some(a => a) // a===true if at least one index matches
    
    //const regExpMatchingPoints = searchWordActive?_.filter(pointsToShow, isMatch):[]
    const regExpSignificant = searchWordActive?regExpMatchingPoints.filter(p => p[2]).length : 0
    const regExpSignificant_up = searchWordActive?regExpMatchingPoints.filter(p => p[2] && p[0] > 0).length: 0
        // pointsToShow = _.filter(pointsToShow, isMatch)
    // }

    const activeFilterColumn = filterColumns.filter(filterColumnNameAndIndex => filterColumnNameAndIndex[1]===filterIndex)
    const n_significant = pointsToShow.filter(p => p[2]).length
    const n_significant_up = pointsToShow.filter(p => p[2] && p[0] > 0).length
    
    const labelsToShow = _.intersection(labels,pointsToShow)
    const highlightPointIsValid = highlightPoint !==undefined && highlightPoint[0]!==undefined
    const transferPoint = mouseOverPlot===undefined?false:mouseOverPlot !== svgID && transferPoints
    const activeListPoints = activeList.length === 0?[]:pointsToShow.filter(p => activeList.includes(p[3])  ||  activeList.includes(p[4]))

    
    const handleMouseDown = (e) => {
        const mouseCoord = localPoint(e)
       
        if (highlightPointIsValid){
           
            if (labels.some(item => item[4] === highlightPoint[0][4])){
        
                setLabels(_.filter(labels,item =>  item[4] !== highlightPoint[0][4]))

            }
            else {
                if (labels.length === 0){
                    setLabels([highlightPoint[0]])
                }
                else {
                    setLabels(_.concat(labels,[highlightPoint[0]]))
                }
                
            }
            
        }
        else{
            setZoomActive(
                prevValues => {
                  return { 
                        ...prevValues,
                        "active":true,
                        "x":mouseCoord.x,
                        "y":mouseCoord.y,
                        "width":0.1,
                        "height":0.1,
                        "origin":mouseCoord,
                        filteredPoints:_.sampleSize(points,0.3*points.length)}}) //faster zoom function
        }
    }




    const handleMouseUp = (e) => {
        
        if (zoomActive.active === false & zoomActive.x===undefined) {
            return
        }
        if (zoomActive.width < 20) {
            setZoomActive(initZoomState) 
            return
        }
        const xDomain = [
                xscale.invert(zoomActive.x),
                xscale.invert(zoomActive.x+zoomActive.width)]
        const yDomain = [
                yscale.invert(zoomActive.y),
                yscale.invert(zoomActive.y+zoomActive.height)]
        
        setZoomActive(
            prevValues => {
              return { ...prevValues,"active":false,"x":undefined,"y":undefined,"xDomain":xDomain,"yDomain":yDomain,"zoomed":true}}) 
    }


    const handleHighlightSelection = (catName, highlightPointIndices) => {
     
        if (highlightIndex.length > 0 && highlightIndex[0] === catName){
            setHighlightIndex([undefined])
        }
        else {
            setHighlightIndex([catName,highlightPointIndices])
        }
        
    }

    const handleFilterRequest = (dataIndex) => {
  
        if (dataIndex !== undefined && dataIndex !== filterIndex) {
            setFilterIndex(dataIndex)
        }
        else {
            setFilterIndex(undefined)
        }
    } 

    const handleReset = (e)  => {
        setZoomActive(initZoomState)
        if (filterIndex!==undefined) setFilterIndex(undefined)
        if (highlightIndex.length > 1) setHighlightIndex([undefined])
        if (search!==undefined) setSearch(undefined)
        if (labels.length > 0)setLabels([])

    }


    const handleSearch = (e) => {
        
        const seachString = e.target.value 
        if (seachString.length > 2) {
            setSearch(seachString)  
        }  
        else {
            setSearch(undefined)
        }
    }

    const handleMouseHover = (e) => {
    
        const mouseCoord = localPoint(svgRef.current,e)
        const point = [xscale.invert(mouseCoord.x),yscale.invert(mouseCoord.y)]
        

        if (zoomActive.active) {
    
            const origin = zoomActive.origin
            var x = zoomActive.x
            var y = zoomActive.y 
            var dx = mouseCoord.x  - origin.x
            var dy =  mouseCoord.y  - origin.y


            if (dx < 0 & dy > 0) {
                x = mouseCoord.x
                y = origin.y
                dx = origin.x - mouseCoord.x 
            }

            else if (dx > 0 && dy < 0){
                x = origin.x 
                y = mouseCoord.y 
                dy = origin.y - mouseCoord.y

            }
            else if (dx < 0 && dy < 0){
                x = mouseCoord.x 
                y = mouseCoord.y 
                dy = origin.y - mouseCoord.y
                dx = origin.x - mouseCoord.x 

            }
           
            
            setZoomActive(
                prevValues => {
                  return { ...prevValues,"width":dx,"height":dy,"x":x,"y":y}}) 

        }
        else {
            const pointsToSearch = searchWordActive?regExpMatchingPoints:pointsToShow
            const idxMin = findClosestMatch(point, pointsToSearch,0,1,minDistanceX,minDistanceY)
            const pp =idxMin===undefined?undefined:pointsToSearch[idxMin]
            
            if (highlightPoint===undefined && pp === undefined){
                return
            }
            else if (highlightPoint===undefined && pp !== undefined){
                transferPointHandler([pp,svgID,transferPoints])
            }
            else if (Array.isArray(highlightPoint) && pp !== highlightPoint[0])
                {
                    transferPointHandler([pp,svgID,transferPoints])
                    // setHighlightPoint(pp)
                }
        } 
    }

    if (width < 0) return <div></div>

    return (
        <div>
        <div className="hor-aligned-div" style={{marginLeft:"0.2rem"}}>
        <InputGroup placeholder="Search ..." onChange={handleSearch} large={false}/>
        <div style={{marignRight:"4px"}}>
        <Button text="" intent={zoomActive.zoomed?"danger":"none"} onClick={e => setZoomActive(initZoomState)} icon={zoomActive.zoomed?"zoom-out":"zoom-in"} minimal={true}/>
        
        <Popover2 content=
                {<Menu large={false}>
                    <MenuItem text="Grid" onClick={toggleGrid} icon={"grid"} intent={grid?"success":"none"}/>
                </Menu>}>
            <Button icon="style" minimal={true}/>
        </Popover2>

        <Popover2 content=
                {<Menu large={false}>
                    
                    {Object.keys(highlightFeatures).map(highlightColumn => {

                        const highlightIndexCatName = highlightIndex.length > 1?highlightIndex[0]:undefined

                        
                            return (
                                <MenuItem
                                    key={highlightColumn}
                                    text = {highlightColumn}
                                    popoverProps={{
                                    interactionKind: Popover2InteractionKind.HOVER,
                                    popoverClassName: "my-tall-menu"
                                    }}
                                >
                                
                                    {Object.keys(highlightFeatures[highlightColumn]).map(catName => {
                                        let currentlyHighlighted = highlightIndexCatName===catName
                                        return (
                                            <MenuItem
                                                key = {catName} 
                                                text = {catName} 
                                                onClick = {e => handleHighlightSelection(catName,highlightFeatures[highlightColumn][catName])} 
                                                intent={currentlyHighlighted ?"success":"none"}
                                                icon = {currentlyHighlighted ? "tick":"none"}/>
                                        )
                                        }
                                    )
                                }
                                </MenuItem>
                            )
                    })}
                </Menu>}>
            <Button icon={"heatmap"} minimal={true}/>
        </Popover2>  

        <Popover2 content=
                {<Menu large={false}>
                    {filterColumns.map(filterColumnNameAndIndex => 
                        <MenuItem 
                            key = {filterColumnNameAndIndex[0]} 
                            text={filterColumnNameAndIndex[0]} 
                            intent = {filterColumnNameAndIndex[1]===filterIndex?"success":"None"}
                            icon = {filterColumnNameAndIndex[1]===filterIndex?"tick-circle":"none"}
                            onClick={e => handleFilterRequest(filterColumnNameAndIndex[1])}/>)}
                    
                </Menu>}>
            <Button icon="filter" intent = {filterIndex!==undefined?"primary":"none"} minimal={true}/>
        </Popover2>
        <Popover2 content=
                {<Menu large={false}>

                    <MenuItem 
                        text="Save as svg" 
                        onClick = {e => downloadSVGAsText(document.getElementById(`${svgID}`),`Volcano(${props.dataID})-${xlabel}`)} 
                        icon={"graph"}/>
                    
                    <MenuItem text="Save data" onClick = {e =>  downloadTxtFile(arrayOfObjectsToTabDel(pointsToShow,pointColumnNames),`Data(${props.dataID})-${xlabel}.txt`)} icon={"th"}/>
                </Menu>}>
            <Button icon="arrow-down" minimal={true}/>
        </Popover2>
        {/* <Button icon="tractor" minimal={true} onClick={toggleTransfer} intent={transferPoints?"primary":"danger"}/> */}
        <Button icon="refresh" intent="danger" minimal={true} onClick={handleReset}/>
        
        </div>
        
        </div>
            
        <svg 
            width={width} 
            height={height} 
            viewBox={`0 0 ${width} ${height}`}  
            onMouseMove={handleMouseHover} 
            onMouseDown={handleMouseDown} 
            onMouseUp={handleMouseUp} 
            id = {svgID}
            ref={svgRef}>
            
           
            {grid?
                <g>
                    <GridRows scale={yscale} left={margin.left} width={width-margin.left-margin.right} height={height} stroke="#e0e0e0" />
                    <GridColumns scale={xscale} top={margin.top} width={width-margin.left-margin.right} height={height-margin.bottom-margin.top} stroke="#e0e0e0" />
                </g>:null
            }
            
            <g className="unselectable-text">
           
                    <AxisBottom left={0} top={height - margin.bottom} scale={xscale} numTicks={4} label={xlabel} strokeWidth={1} labelProps={{fontSize : 14, textAnchor : "middle"}} />
                    <AxisLeft left={margin.left} scale={yscale} numTicks={4} label={ylabel} strokeWidth={1} labelOffset={22} labelProps={{fontSize : 14, textAnchor : "middle"}}/>

            <Text x = {margin.left+4} y = {margin.top} verticalAnchor="start" fontSize={12} {...fontProps}>
                {`
                n = ${pointsToShow.length}${activeFilterColumn.length === 1?` / ${points.length}`:""}
                ${activeFilterColumn.length === 1?`(filter=${activeFilterColumn[0][0]})`:""} 
                ${searchWordActive?`(${regExpMatchingPoints.length} matching '${search}')`:""} 
                ${zoomActive.xDomain!==undefined?"zoom active":""}`}</Text>
            <Text x = {margin.left+4} y = {margin.top + 12 } verticalAnchor="start" fontSize={12} {...fontProps}>
                {`# sig = ${n_significant} 
                ${searchWordActive?`(${regExpSignificant})`:""}`}
            </Text>
            <Text x = {margin.left+4} y = {margin.top + 26} verticalAnchor="start" fontSize={12} {...fontProps}>
                
                {`${n_significant-n_significant_up} ${searchWordActive?`(${regExpSignificant-regExpSignificant_up})`:""}↓ - ${n_significant_up} ${searchWordActive?`(${regExpSignificant_up})`:""} ↑ `}
            </Text>
            </g>


        {pointsToShow.map((p,idx) =>{
            const highlightIndexActive = highlightIndex.length > 1 &&highlightIndex[1].includes(p[3])
            const addToRadius = highlightIndexActive?highlightRadius-defaultRadius:0
            const o = transferPoint? 0.1:searchWordActive?0.1:0.75
            
            return( 
                <MCScatterPoint 
                    key={`${idx}-pp`}  
                    xscale = {xscale}
                    yscale= {yscale}
                    p = {p}
                    r = {highlightPointIsValid && p[3]===highlightPoint[0][3]?defaultRadius+4:defaultRadius+addToRadius}
                    idx = {idx}
                    defaultCircleFill = {defaultCircleFill}
                    circleProps = {circleProps}
                    defaultRadius = {defaultRadius}
                    addToRadius = {addToRadius}
                    highlightPointIsValid = {highlightPointIsValid}
                    highlightPoint = {highlightPoint}
                    opacity = {o}/>
                // <circle 
                //     key={`${idx}-pp`} 
                //     cx={xscale(p[0])} 
                //     cy={yscale(p[1])} 
                //     r = {(highlightPointIsValid && p[3]===highlightPoint[0][3]?defaultRadius+4:defaultRadius+addToRadius)} 
                //     fill={p[2]?p[0]>0?"#ea563c":"#7894a2":defaultCircleFill} 
                //     opacity={o}
                //     {...circleProps}/>
            )
        })}
        
        {highlightPointIsValid&&svgID===highlightPoint[1]?
            <Text 
                style={{cursor:"default"}}
                x={xscale(highlightPoint[0][0])} 
                y={yscale(highlightPoint[0][1])} 
                textAnchor={pointLabelAlignment(highlightPoint[0],turnLabelToLeftXLimit)}
                fontSize={13} 
                dx={highlightPoint[0][0]>0?9:-9} 
                dy={-3} {...fontProps}>
                    {highlightPoint[0][4]}
                </Text>:
            null}
        {
            zoomActive.active?<rect 
                x = {zoomActive.x} 
                y ={zoomActive.y} 
                width={zoomActive.width}
                 height={zoomActive.height}
                 stroke="black" 
                 strokeWidth={0.5} 
                 fill={"transparent"}/>:null
        }
        


        {highlightIndex.length>1?
            <g>
                <Text x = {width-margin.right-highlightRadius-2} y={margin.top} verticalAnchor="start" textAnchor="end">
                    {`${highlightIndex[0]}(${highlightIndex[1].length})`}
                </Text>
                <circle cx={width-margin.right} cy={margin.top+4} r={highlightRadius} {...circleProps} fill={defaultCircleFill}/>
            </g>:
            null}
        
        {searchWordActive&&regExpMatchingPoints.length>0?
            regExpMatchingPoints.map((p,i) => {
                return(
                    <circle
                        key={`reg-match-pp${i}`} 
                        cx={xscale(p[0])} 
                        cy={yscale(p[1])} 
                        r = {defaultRadius} 
                        fill={p[2]?p[0]>0?"#ea563c":"#7894a2":defaultCircleFill} 
                        opacity={0.75}
                        {...circleProps}/>
            )}):null
        }
        

        {activeListPoints.map((p,i) => {
            return (
                <circle
                        key={`active-list-pp${i}`} 
                        cx={xscale(p[0])} 
                        cy={yscale(p[1])} 
                        r = {defaultRadius+3} 
                        fill={"darkorange"}  //p[2]?p[0]>0?"#ea563c":"#7894a2":defaultCircleFill
                        opacity={1}
                        {...circleProps}/>
            )
        })}

        {
            labelsToShow.map((labelPoints,ip) => {
                return(
                    <Text 
                        key = {`labelPoint ${ip}}`}
                        style={{cursor:"default"}}
                        x={xscale(labelPoints[0])} 
                        y={yscale(labelPoints[1])} 
                        textAnchor={pointLabelAlignment(labelPoints,turnLabelToLeftXLimit)}
                        fontSize={13} 
                        dx={labelPoints[0]>0?9:-9} 
                        dy={-3} {...fontProps}>
                            {labelPoints[4]}
                    </Text>
                )
            })
        }

        {transferPoint&&highlightPointIsValid&&highlightPoint[2]?pointsToShow.filter(p => p[3] === highlightPoint[0][3]).map(p => {
            return(
                <g key={`transfer-pp labelPoint ${p[4]}}`}>
                    <Text 
                        style={{cursor:"default"}}
                        x={xscale(p[0])} 
                        y={yscale(p[1])} 
                        textAnchor={pointLabelAlignment(p,turnLabelToLeftXLimit)}
                        fontSize={13} 
                        dx={p[0]>0?9:-9} 
                        dy={-3} {...fontProps}>
                            {p[4]}
                    </Text>
                    
                    <circle  cx={xscale(p[0])} cy={yscale(p[1])} 
                        r = {defaultRadius} 
                        fill={p[2]?p[0]>0?"#ea563c":"#7894a2":defaultCircleFill} 
                        opacity={0.75}
                        {...circleProps}/>
                </g>
            )
        }):null}

        {/* `(${regExpMatchingPoints.length} matching '${search}')`:""} } */}
        {width - margin.left > 0 ?
            <rect
                x={margin.left} 
                y = {margin.top} 
                width={width-margin.left-margin.right} 
                height={height-margin.top-margin.bottom} 
                fill="transparent"
                opacity={0}
                onMouseLeave={e => setMouseOverPlot(undefined)} 
                onMouseEnter={e => setMouseOverPlot(svgID)} />
            : null}
         

        </svg>
        </div>
    )
}


MCVolcano.defaultProps = {
    points : [[40,50],[30,80],[40,80]],
    width : 450,
    height: 450, 
    defaultCircleFill : "white",
    defaultRadius : 4,
    highlightRadius : 8,
    margin : {left:45,bottom:50,right:25,top:15},
    circleProps : {stroke:"black",strokeWidth:0.4},
    fontProps : {fontFamily :"Arial"}
}