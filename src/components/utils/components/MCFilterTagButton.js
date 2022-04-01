import _ from "lodash"

export function MCFilterTagContainer(props) {
    
    return (
        <div className="filter-tag-container">
            {props.filterItems.map(v => {
                return(
                    <MCFilterTagButton 
                        key={v} 
                        text={v} 
                        filterHeader={props.filterHeader} 
                        handleInactiveRequest={props.handleInactiveRequest}
                        active = {!_.includes(props.inactiveItems,v)}/>
                )
            })}
        </div>
        )
}

MCFilterTagContainer.defaultProps = {
    filterItems : ["Filter1","Filter2"],
    inactiveItems : [],
    filterHeader : "Key",
    handleInactiveRequest : undefined
}


export function MCFilterTagButton (props) {
    
    
    return (
        <div  className={`filter-tag-button-base-container ${props.active?"filter-tag-button-container":"filter-tag-button-container-inactive"}`}
            onClick={props.handleInactiveRequest!==undefined?(e) => {props.handleInactiveRequest(props.filterHeader,props.text)}:undefined}>
            <div>{`${props.text}`}</div>
            
        </div>
    )
}


MCFilterTagButton.defaultProps = {
    active : true, 
    text : "Filter1",
    filterHeader : "Key",
    onDeselect : undefined,
    handleInactiveRequest : undefined
}