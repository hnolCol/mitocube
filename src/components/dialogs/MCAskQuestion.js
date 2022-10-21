import { Alert } from "@blueprintjs/core";
import _ from "lodash";


export function MCAskQuestion (props) {

    const {q,onClose, callback, callbackValue, ...rest} = props

    const onAccept = () => {
        if (callback!==undefined && _.isFunction(callback)) {
            callback(callbackValue)
        }
        onClose() 
    }

    return (
        <Alert 
                canEscapeKeyCancel={true} 
                onClose={onClose} 
                confirmButtonText={"Yes"} 
                cancelButtonText={"No"} 
                onConfirm={onAccept} {...rest}> 

            <p>{q}</p>

        </Alert>
    )
}