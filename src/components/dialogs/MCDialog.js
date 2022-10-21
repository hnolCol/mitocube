import { Dialog } from "@blueprintjs/core";

export function MCDialog (props) {
    
    return (
        <Dialog 
            style={props.style}
            isOpen= {props.isOpen} 
            canOutsideClickClose={true} 
            title={props.title} 
            onClose={props.onClose!==undefined?() => props.onClose(false):undefined}>
                
            {props.children}
        </Dialog>
    )
}

MCDialog.defaultProps = {
    isOpen : true,
    children : <div>hallo</div>,
    title : "Filter Settings",
    onClose : undefined,
    style : {}
}