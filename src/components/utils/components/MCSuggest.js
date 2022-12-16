import { MenuItem, Button } from "@blueprintjs/core";
import { Select2 } from "@blueprintjs/select";
import _ from "lodash";
import { useState } from "react";

export function MCSuggest (props) {

    const {items, itemKey, searchKeys, handleSelection} = props
    //const [currentItems,setCurrentItems] = useState(items)
    const [selectedItem, setSelectedItem] = useState(undefined)
    //const [query, setQuery] = useState("")

    const itemRender = (item,props) => {
        const selected = selectedItem!==undefined && item.name === selectedItem.name
        return <MenuItem 
            intent={selected?"primary":"none"}
            key={item.name} 
            text = {item.name} 
            onFocus={props.handleFocus} 
            icon={selected?"tick":"none"} 
            onClick={props.handleClick}
            title = {`${item.name} is found in cluster ${item.clusterIndex}`}
            />
    }

    const itemSelection = (item,event) => {
        
        setSelectedItem(item)
        if (_.isFunction(handleSelection)) handleSelection(item)
        

        // setQuery(item.name)
    }

    const filterItemsByQuery = (searchString,e) => {
        const re = new RegExp(_.escapeRegExp(searchString), 'i')
        const isMatch = result => _.filter(searchKeys.map(v => re.test(result[v]))).length > 0
        var filteredItems = _.filter(items, isMatch)
        if (filteredItems.length > 200){
            filteredItems = filteredItems.slice(1,50)
          }
          return(_.sortBy(filteredItems,"name"))
        
        
    }

    
    return(
        <div style={{minWidth:"200px"}}>
        <Select2 
            
            items={items} 
            itemRenderer={itemRender} 
            onItemSelect = {itemSelection}
            itemListPredicate = {filterItemsByQuery}
            noResults = {<MenuItem text="Protein not found in any cluster.."  disabled={true}/>}
            inputProps={{ placeholder: "Search for feature in clusters."}}
            //itemListPredicate = {filterItems}
            inputValueRenderer = {item => item[itemKey]}>
                <Button text = {"Search protein ..."} minimal={true} small={true} fill={true}/>
                
            </Select2>
        </div>
    )
}


MCSuggest.defaultProps = {

    items : [{name : "item1"}, {name : "item2"}],
    itemKey : "name",
    searchKeys : ["name"]
}