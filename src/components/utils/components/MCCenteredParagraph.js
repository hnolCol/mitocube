import _ from "lodash"
export function MCCenteredP(props) {

    return(
        <div className="vert-align-div-center little-m">
            <div>{_.isString(props.text)?props.text:""}</div>   
        </div>
    )
}


MCCenteredP.defaultProps = {
    text : "ID"
}