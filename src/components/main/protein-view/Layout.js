import { useState, useEffect, useCallback } from "react"
import { Responsive, WidthProvider } from "react-grid-layout";
import axios from "axios";
import { MCAxisHandler } from "../charts/AxisContainer";
import _ from "lodash"

import { Popover2 } from "@blueprintjs/popover2";
import { MCGetFilterFromLocalStorage } from "../../utils/Misc";

const ResponsiveGridLayout = WidthProvider(Responsive);


var lastSavedLayout = {}
var activeFilterLayoutItems = []
var breakpoint = "lg"
const columnNumbers = {lg :10, md: 6, sm:4, xs: 2, xxs: 1 }

export function MCMenuIcon(props) {
  return(
        <div className="shortcut-filter-item">
                  <svg width = {props.size} height={props.size} viewBox="0 0 20 20">
                    {[0.25,0.5,0.75].map(v => {
                      return(
                        <line key = {v} x1 = {0.15*20} x2 = {0.85*20}
                        y1 = {v * 20} y2 = {v * 20} stroke="black" strokeWidth={0.75}/>
                      )
                    })}
                  </svg>
          </div>
  )
}

MCIndicatorCircle.defaultProps = {
  fillColor : "grey",
  size : 35,
  callback : undefined,
  callbackValue : "",
  tooltipStr : ""
}

export function MCIndicatorCircle(props) {
  return(
    <Popover2 content={<div className="tooltip-div">{props.tooltipStr}</div>} minimal={true} interactionKind="hover" hoverCloseDelay={80}>
        <div className="shortcut-filter-item">
                  <svg width = {props.size} height={props.size} viewBox="0 0 20 20">
                    <circle 
                          cx={10} 
                          cy={10} 
                          r = {5} 
                          fill = {props.fillColor} 
                          stroke="black" 
                          strokeWidth={0.5} 
                          onClick={props.callback!==undefined?() => {props.callback(props.callbackValue)}:undefined}/>
                  </svg>
          </div>
    </Popover2>
    
  )
}

MCIndicatorCircle.defaultProps = {
  fillColor : "grey",
  size : 35,
  callback : undefined,
  callbackValue : "",
  tooltipStr : ""
}

export function MCProteinLayout(props) {

   
    const [layoutAndCards,setLayoutAndCards] = useState({"cards":[],"layout":[],"activeFilter":[],"filter":[],"filterColors":{},"cardData":{}})
    const [removedItems, setRemovedItems] = useState([""])

    const onLayoutChangeCallback = (layout,al,s) => {

      if (lastSavedLayout[s.Entry] === undefined && s.Entry === props.selectedFeature.Entry){
        lastSavedLayout[s.Entry] = layoutAndCards.layout[props.selectedFeature.Entry]
   
      }
     

      if (layoutAndCards.layout[props.selectedFeature.Entry][breakpoint]!==undefined&&layoutAndCards.layout[props.selectedFeature.Entry][breakpoint].length!== layout.length) {
        const missingLayoutItem = _.differenceWith(lastSavedLayout[s.Entry][breakpoint],layout,_.isEqual)
        activeFilterLayoutItems = _.unionBy(missingLayoutItem,activeFilterLayoutItems,"i")     
      }
  
      lastSavedLayout[s.Entry] = al
      
      const l = layoutAndCards.layout
      l[[props.selectedFeature.Entry]] = al
    
      setLayoutAndCards(
          prevValues => {
            return { ...prevValues,"layout":l}}) 
     
    }

    const handleRemoveRequest = (cardID) => {
      
     setRemovedItems(_.concat(removedItems,[cardID]))
    }
    

    const handleShortcutValue = (filterName) => {
      
      if (_.includes(layoutAndCards.activeFilter,filterName)){
 
        setLayoutAndCards(
          prevValues => {
            return { ...prevValues,"activeFilter":_.difference(prevValues.activeFilter,[filterName])}}) 
      }
      else {
        setLayoutAndCards(
          prevValues => {
            return { ...prevValues,"activeFilter":_.union(prevValues.activeFilter,[filterName])}}) 
      }
    }

    const onBpChange = (bp) => {
      breakpoint = bp
    }
    const resetAuthStatus = useCallback(() => {
      props.setAuthenticationSate({token:null,isAuth:false})
    }, []);

    
    useEffect(() => {
      
      if (props.featureIDItems.length === 0) {
        return;
      }
      if (props.token === null) {
        return 
      }
      
      const featureIDs = _.map(props.featureIDItems, "Entry")
      const layoutEntries = Object.keys(layoutAndCards.layout)
      const layoutKeyLength = Object.keys(layoutAndCards.layout).length
      if (layoutKeyLength > 0  && _.every(featureIDs,function(o){return layoutEntries.includes(o)})) {
        // avoid layoutAndCards.layout change to induce new api call
        return
      }
      
      axios.post('/api/features/cards' ,
            {featureIDs:props.featureIDItems,filter:{},columnNumber:columnNumbers,token:props.token}, 
            {headers : {'Content-Type': 'application/json'}}).then(response => {
              
              if (response.status === 200){
                const responseData = response.data
                if ("error" in responseData & responseData["error"] === "Token is not valid.") {
                  resetAuthStatus()
                }
                else if ("layout" in responseData) {
                  const ll = {...responseData["layout"],...layoutAndCards.layout} //saved layout should overwrite "old" ones
                  responseData["layout"] = ll
                  setLayoutAndCards(responseData)
              }
              }
              
        })
    }, [props.featureIDItems,layoutAndCards.layout,props.token, resetAuthStatus]);
    
    // console.log(layoutAndCards.layout[props.selectedFeature.Entry])
    const dynamicLayout = layoutAndCards.layout[props.selectedFeature.Entry]
    // lastSavedLayout[props.selectedFeature.Entry]===undefined?layoutAndCards.layout[props.selectedFeature.Entry]:lastSavedLayout[props.selectedFeature.Entry]
    
    const localMitoCubeFilter = MCGetFilterFromLocalStorage()
    
      return (
        
        <div style = {{paddingBottom:"50px"}}>
          <div className="shortcut-filter-div">
          {layoutAndCards.filter[props.selectedFeature.Entry]!==undefined?layoutAndCards.filter[props.selectedFeature.Entry].map(filterName => {
            return (
                <MCIndicatorCircle 
                    key={filterName} 
                    fillColor={layoutAndCards.activeFilter.includes(filterName)?"#efefef":layoutAndCards.filterColors[filterName]} 
                    callback={handleShortcutValue}
                    callbackValue={filterName}
                    tooltipStr = {`Click to filter out: ${filterName}`}/>
            )
          }):null}
          </div>
          {
            layoutAndCards.cards.length === 0 || dynamicLayout===undefined || layoutAndCards.cards[props.selectedFeature.Entry] === undefined?null:
              <ResponsiveGridLayout
                onLayoutChange={(l,al) => onLayoutChangeCallback(l,al,props.selectedFeature)} 
                className="layout"
                layouts={dynamicLayout}
                breakpoints={{ lg: 1200 , md: 996, sm: 768, xs: 480, xxs: 0}}
                cols={columnNumbers}
                onBreakpointChange = {onBpChange}
                margin = {[8,8]}
                rowHeight={columnNumbers[breakpoint] < 5 ? 150: 100}
              >

                {Object.keys(layoutAndCards.cards).map(featureKey => {
                  
                  if (featureKey !== props.selectedFeature.Entry){return null} 
                  return(
                    layoutAndCards.cards[featureKey].map(v => {
                      
                      const heightFilter = _.filter(dynamicLayout[breakpoint],["i",v.id])
                      const cardHidden = v.Entry !== props.selectedFeature.Entry || 
                                  layoutAndCards.activeFilter.includes(v.filterName) || 
                                  removedItems.includes(v.id) || 
                                  (v.filterName!=="Summary"&&localMitoCubeFilter!==null&&!localMitoCubeFilter["Type"].includes(v.filterName))
                     
                      return(
                      <div className="card-frame" key={`${v.id}`} style={{visibility:cardHidden?"hidden":"visible"}}>
                      
                      <MCAxisHandler 
                          height = {heightFilter.length === 0?[{"h":1}]:heightFilter} 
                          featureProps = {v} 
                          id = {v.id} 
                          rowHeight = {columnNumbers[breakpoint] < 5 ? 150: 100}
                          indicatorTooltipStr = {v.filterName} 
                          indicatorColor = {v.filterColor} 
                          handleRemoveRequest = {handleRemoveRequest} 
                          dataID = {v.dataID}
                          chartData = {v.chartData}
                          showDataInTable = {props.showDataInTable}
                          setOpenOfDataInTable = {props.setOpenOfDataInTable}
                          handleExpInfoRequest = {props.handleExpInfoRequest}
                          isSummary = {v.filterName === "Summary"}
                          resetAuthStatus = {resetAuthStatus}
                          token = {props.token}
                          label = {props.selectedFeature["Gene names  (primary )"]}/>
                      
                  </div>
                    )})
                  )
                  
                })}
                {/* {layoutAndCards.cards[props.selectedFeature.Entry].map(v => {
                    
                    return(
                          <div className="card-frame" key={v.id} style={
                            {
                            visibility:activeShortcutFilter.includes(v.filterName) || removedItems.includes(v.id)?"hidden":"visible"
                            }}>
                          
                          <MCAxisHandler 
                              height = {_.filter(dynamicLayout[breakpoint],["i",v.id])} featureProps = {v} id = {v.id} 
                                indicatorTooltipStr = {v.filterName} 
                                indicatorColor = {v.filterColor} handleRemoveRequest = {handleRemoveRequest} dataID = {v.dataID}
                                handleExpInfoRequest = {props.handleExpInfoRequest}
                                isSummary = {v.filterName === "Summary"}
                                label = {props.selectedFeature["Gene names  (primary )"]}/>
                          
                      </div>)
                }     
                    )
                }) */}
              </ResponsiveGridLayout>
              }
          
        </div>
      )
}

MCProteinLayout.defaultProps = {
    featureIDs:[]
}