import axios from "axios";
import _ from "lodash";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { MCHeader } from "../../utils/components/MCHeader";
import { MCItemContainer } from "./MCItemContainer";
import { MCPTMSearch } from "./MCPTMSearch";
import useDebounce from "../../../hooks/useDebounce";
import {filterArrayBySearchString} from "../../utils/Filter"
import { MCSimpleResponseCheck } from "../../utils/ResponseChecks";


// ,
//                     {
//                         ID:"145",Species:"Mus musculus",title:"Timm330", 
//                         data : {
//                             Phosphorylation : [{pos : 150, seq : "ASADK", start : [130], end : [160]},{pos : 30, seq : "ASADKa", start : [25], end : [45]}, {pos :35, seq : "ASADKa", start : [31], end : [45]}],
//                             Acetylation : [{pos : 20, seq : "ASAEGFDR", start : [19], end : [22]}],
//                             NeoN : [{pos : 180, seq : "ASAEGFDR", start : [150], end : [182]}]
//                     }}

export function MCPTMView(props) {
    const {token} = props
    const [search, setSearch] = useState ({
                searchString : "", 
                loadingItems : false,
                showPinnedOnly : false,
                categoricalColumns : ["Species"], 
                searchColumnsInPTMItems : ["ID"], 
                itemsFilteredByText : [],
                items : [
                    ], 
                comboboxItems : {},
                itemsToShow : [], 
                pinnedItems : [],
                annotationColors : {"Phosphorylation":"#0066e7","Acetlyation":"#ff0000","Glocylsation":"#53a200"},
                filter : {}}
                )
    
    const debounceSearchString = useDebounce(search.searchString,300)

    useEffect(() => {
        // use react-query!! 
        setSearch(prevValues => {return {...prevValues,"isLoading" : true}})
        axios.get('api/ptm/items', {params:{token:token}}).then(response => {
            // collect items from API
            if (MCSimpleResponseCheck(response.data))
            {
                    console.log(response.data)
                    //items are List of objects
                    let searchItems = response.data.searchItems
                    //get all colum headers from the first item
                    let items = searchItems.items
                    let searchColumnsInPTMItems = items.length > 0? Object.keys(items[0]): []
                    // get available items filters.
                    let comboboxItems = Object.fromEntries(searchItems.categoricalColumns.map(categoricalColumn => [categoricalColumn, _.concat(["None"], _.uniq(items.map(item => item[categoricalColumn])))]))
               
                    setSearch(
                        prevValues => {
                            return {...prevValues,
                                "isLoading": false,
                                "identifierColumn": searchItems.identifierColumn,
                                "titleColumn" : searchItems.titleColumn,
                                "searchColumnsInPTMItems" : searchColumnsInPTMItems,
                                "itemsToShow": items,
                                "categoricalColumns" : searchItems.categoricalColumns,
                                "items": items.slice(),
                                "annotationColors" : searchItems.annotationColors,
                                "comboboxItems":comboboxItems}
                            })
                }
            else{
                setSearch(prevValues => {return {...prevValues,"isLoading" : false}})
            }
        })
        //get unique values for categorical columns to be selectable using the combobox
        
        
    },[token])

    const handlePinnedChange = (ID) => {
        // Changed pinned status of items using the ID
       
        if (ID === undefined) return
        const idColumn = search.identifierColumn
        let items = search.items.map(item => {return {...item, "pinned" : item[idColumn] === ID?item.pinned?false:true:item.pinned}})
        let filteredItems = filterArrayBySearchString(search.searchStringearchString,items,search.searchColumnsInPTMItems)
        //very bad solution - change
        let pinnedItems = _.filter(items,["pinned" , true])
        let itemsToShow = search.itemsToShow.map(item => {return {...item, "pinned" : item[idColumn] === ID?item.pinned?false:true:item.pinned}})
        setSearch(prevValues => {return {...prevValues,"items" : items, "itemsToShow" : itemsToShow, "pinnedItems" : pinnedItems,"itemsFilteredByText":filteredItems}})
    }

    const handleFilterChange = (category, newValue, inactive=false) => {
        //handle any change of a category.
        console.log(category,newValue)
        var filterValues = search.filter
        if (inactive && Object.keys(filterValues).includes(category)) {
            delete filterValues[category]
        }
        else {
            filterValues[category] = newValue
        }

        var itemsToShow = getItems (filterValues)
        
        itemsToShow = addPinnedItems(itemsToShow,true)
       
        setSearch(prevValues => {return {...prevValues, "itemsToShow":itemsToShow,"filter" : filterValues}})
    }

    const getItems = (filterValues, useOriginalItems = false) => {
        var arr = []
        if (search.searchString !== "" && !useOriginalItems){
            arr  = _.filter(search.itemsFilteredByText,filterValues)
        }
        else {
            arr  = _.filter(search.items,filterValues)
        }
        return arr 
    }

    const addPinnedItems = (itemsToShow, pinnedFirst = false) => {
        // add pinned items
        if (search.pinnedItems.length > 0){
            if (pinnedFirst) {
                itemsToShow = _.union(search.pinnedItems,itemsToShow)
            }
            else {
                itemsToShow = _.union(itemsToShow,search.pinnedItems)
            }
        }
        return itemsToShow
        
    }

    const handlePinnedOnlyChange = (checked) => {
        let itemsToShow = search.showPinnedOnly?getItems(search.filter,true):search.pinnedItems.slice()
        setSearch(prevValues => {return {...prevValues,showPinnedOnly:!prevValues.showPinnedOnly,"itemsToShow":itemsToShow }})
    }

    const handleSearchStringChange = (newSearchString) => {
        //handle search string change
        // find items that match search string
        
        setSearch(prevValues => {return {...prevValues,"searchString":newSearchString}})
    }

    useEffect(() => {
        
        let filteredItems = filterArrayBySearchString(debounceSearchString,search.items.slice(),search.searchColumnsInPTMItems)
        var itemsToShow = _.filter(filteredItems,search.filter)
        itemsToShow = addPinnedItems(itemsToShow)
        
        setSearch(prevValues => {return {...prevValues,
                "itemsToShow" : itemsToShow, 
                "itemsFilteredByText" : filteredItems}})
         
    },[debounceSearchString]) //better solution to put other filters in another useEffect?




    let showAllItems = search.itemsToShow.length<=50
    return(
        <div>
            <div className="top-right-absolute-container">
            <Link to="/">Home</Link>
            </div>
        <div className="ptm-view vert-align-div">
            
                <MCHeader text={"Post translational modification (PTM) View"} />
                <p>Under construction. </p>
            <MCPTMSearch 
                filter = {search.filter} 
                categoricalColumns = {search.categoricalColumns}
                comboboxItems = {search.comboboxItems}
                searchString = {search.searchString} 
                handleSearchStringChange = {handleSearchStringChange} 
                handleFilterChange = {handleFilterChange}
                handlePinnedOnlyChange = {handlePinnedOnlyChange}
                itemsShown = {search.itemsToShow.length}
                totalNumberOfItems = {search.items.length}
                showPinnedOnly = {search.showPinnedOnly}
                numberPinnedItems = {search.pinnedItems.length}/>
            
                <MCItemContainer 
                token={ token}
                items = {showAllItems?search.itemsToShow:search.itemsToShow.slice(0,50)}  
                numberItems = {search.items.length}
                showAllItems={showAllItems}
                isLoading={search.isLoading}
                identifierColumn={search.identifierColumn}
                titleColumn={search.titleColumn}
                annotationColors = {search.annotationColors}
                handlePinnedChange = {handlePinnedChange} 
                categoricalColumns={search.categoricalColumns}/>
        </div>
        </div>
    )
}