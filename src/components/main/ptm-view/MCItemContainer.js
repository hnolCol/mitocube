import { MCPTMItem } from "./MCPTMItem"


export function MCItemContainer (props) {

    const {items, handlePinnedChange, categoricalColumns, annotationColors, numberItems, showAllItems, isLoading, token, identifierColumn, titleColumn} = props
    let N = items.length
    return(
       
        
        <div className="ptm-item-container vert-align-div">
            {isLoading?<p>Loading...</p>:null}
            {items.map(item => <MCPTMItem
                key={item[identifierColumn]}
                token={token}
                {...item}
                handlePinnedChange={handlePinnedChange}
                categoricalColumns={categoricalColumns}
                annotationColors={annotationColors}
                identifierColumn={identifierColumn}
                titleColumn={titleColumn} />)}
            {!showAllItems ? <p>Not all items shown ({N}/{numberItems})</p>:null}
        </div>
       
    )
}


MCItemContainer.defaultProps = {
    items : []
}