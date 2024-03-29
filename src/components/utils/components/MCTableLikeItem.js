import { Intent, Tag } from "@blueprintjs/core";
import _ from "lodash"
import { areAllValuesArrays } from "../Misc";

const INTENTS = [Intent.NONE, Intent.PRIMARY, Intent.SUCCESS, Intent.DANGER, Intent.WARNING];

function isStringOrNumber(attr) {
    return (_.isString(attr) || _.isNumber(attr))
}

export function MCListAsTags(props) {
    const {array} = props
    return (
        <div className="hor-aligned-center-flex-start">{array.map((attrTag, tagIdx) =>
            <div className="little-m" key={`${attrTag}${tagIdx}`}>
                <Tag intent={INTENTS[tagIdx % INTENTS.length]}>{attrTag}</Tag>
            </div>)}
        </div>
    )
}

export function MCTableLikeItem(props) {
    const {attrName, attr} = props
   
        
    if (isStringOrNumber(attr)) {
        return (
            <div key={attrName} className="hor-aligned-center-flex-start little-m white-bg ">
                <div className="dataset-attr-name">{attrName} :</div>
                <div>{attr}</div>
            </div>)
    }
    if (_.isArrayLike(attr) && isStringOrNumber(attr[0])) { //assumes that whole array is of one type, danger? 
        return (
            <div key={attrName} className="hor-aligned-center-flex-start little-m white-bg ">
                <div className="dataset-attr-name">{attrName} :</div>
                <div><MCListAsTags array={attr} /></div>
            </div>)
    }

    if (_.isArrayLike(attr) && _.isObject(attr[0])) { //assumes that whole array is of one type, danger? 
        return (
            <div key={attrName} className="little-m white-bg">
                <div className="dataset-attr-name">{attrName} :</div>
                <div className="vert-algin-div">
                    {attr.map(attrDetails => { //requires keys title and details, documentation!
                        return (
                            <div key={attrDetails.title} className="hor-aligned-center-flex-start little-m">
                                <div className="dataset-attr-name">{attrDetails.title} :</div>
                                <div>{attrDetails.details}</div>
                            </div>
                        )
                    })}
                </div>
                    
                    
            </div>)
    }

    if (_.isObject(attr)) {
        return (
            <div key={attrName} className="hor-aligned-center-flex-start little-m white-bg">

                <div className="dataset-attr-name">{attrName}:</div>
                <div className="vert-algin-div">
                    {Object.keys(attr).map(attrKey => {
                        let value = attr[attrKey]
                        if (_.isObject(value)) {
                            if (!areAllValuesArrays(value)) return null 
                            let objectKeyValueLengthAsString = Object.keys(value).map(key => `${key} : ${value[key].length}`)
                            let combinedString = _.join(objectKeyValueLengthAsString, " ")
                            return (
                                <div key={attrKey} className="hor-aligned-center-flex-start little-m">
                                <div className="dataset-attr-name">{attrKey} :</div>
                                <div> {combinedString } </div>
                            </div>
                            )
                        }
                        
                        return (
                            <div key={attrKey} className="hor-aligned-center-flex-start little-m">
                                <div className="dataset-attr-name">{attrKey} :</div>
                                <div>{_.isString(value) ? value : _.isArray(value) ?
                                    <MCListAsTags array={attr[attrKey]} />
                                    : value}</div>
                            </div>
                        )
                    })}
                </div>
                    
                    
            </div>)

    }


    else {
        return null
    }
}