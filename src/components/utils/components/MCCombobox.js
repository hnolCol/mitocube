import { Button, MenuItem } from "@blueprintjs/core";
import { Select2 } from "@blueprintjs/select";
import { isFunction } from "lodash";

export function MCCombobox(props) {
    const {items,callback, placeholder, callbackKey, disabled, buttonProps, selectFill} = props

    const renderItems = (item, { handleClick, modifiers, query }) => {

        const selected = placeholder===item
        
        return(
            <MenuItem 
                key = {item} 
                text={item} 
                onClick={handleClick} 
                intent={selected?"primary":"none"} 
                icon={selected?"small-tick":"none"}/>
        )
        
    }

    const onItemSelection = (item) => {
        if (isFunction(callback) && callbackKey ===undefined) callback(item)

        else if (isFunction(callback) && callbackKey !==undefined) callback(callbackKey,item)

    }

    

    return(
        <Select2
            fill={selectFill}
            items = {items}
            filterable ={false}
            itemRenderer={renderItems}
            onItemSelect={onItemSelection}
            disabled={disabled}
            >

            <Button text={placeholder} disabled={disabled} {...buttonProps} fill={selectFill}/> 

        </Select2>
    )
}


MCCombobox.defaultProps = {
    items : ["Item1","item2"],
    selectFill : false,
    placeholder: "Select Grouping",
    buttonProps : {
        minimal : false,
        small : true
    }
}