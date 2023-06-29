import { ButtonGroup, Checkbox, InputGroup } from "@blueprintjs/core";
import _ from "lodash";
import { useEffect } from "react";
import { MCCombobox } from "../../utils/components/MCCombobox"


export function MCPTMSearch(props) {
    
    const {species, 
            handleSearchStringChange, 
            categoricalColumns, 
            comboboxItems, 
            searchString, 
            handleFilterChange, 
            filter, 
            showPinnedOnly, 
            handlePinnedOnlyChange, 
            totalNumberOfItems, 
            numberPinnedItems,
            itemsShown} = props
    
    useEffect(()=>{},[])

    const handleTextInput = (e) => {
        // handle text input change (e.g. search string)
        if (!_.isFunction(handleSearchStringChange)) return
        let string = e.target.value
        handleSearchStringChange(string)
    }

    const handleSpeciesChange = (newValue,categoricalColumn) => {
        //handle species change..
        if (species === newValue) return
        handleFilterChange(categoricalColumn,newValue,newValue==="None")
    }

    return(
        <div className="hor-aligned-center-flex-start" style={{width:"100%"}}>
            <InputGroup 
                placeholder="Search ..." 
                value={searchString} 
                    onChange={handleTextInput} 
                    fill={true}
                small={true}/>
            <div>
                ({itemsShown} / {totalNumberOfItems})
            </div>
    
                {/* {categoricalColumns.map(categoricalColumn => {
               
                return(
                    <div key = {categoricalColumn}>
                    <MCCombobox 
                        placeholder = {filter[categoricalColumn]===undefined?`Filter ${categoricalColumn}...`:filter[categoricalColumn]}
                        items={comboboxItems[categoricalColumn]===undefined?[]:comboboxItems[categoricalColumn]}
                        callback = {(newValue) => handleSpeciesChange(newValue,categoricalColumn,)}
                        />
                    </div>
                )
                })}
        <Checkbox disabled={ !numberPinnedItems > 0} checked={showPinnedOnly} label={`Show pinned items ${numberPinnedItems} only`} onChange={handlePinnedOnlyChange} large={false}/> */}
        </div>
    )
}