import { Button } from "@blueprintjs/core"
import { MCHeader } from "../utils/components/MCHeader"
import { motion } from "framer-motion"
import _ from "lodash"


export function MCEditableItem(props) {

    const { name, buttonProps, idx,totalItems, onClick, ...rest } = props 
    return (
        <motion.div
            initial="hidden"
            animate="visible"
            variants={{
                hidden: (i) => ({ opacity: 0 }),
                visible: (i) => ({ opacity: 1, transition: { delay: i * 0.15 } })
            }}
            custom={idx}
            whileHover={{ boxShadow: "0 0 4px #ccc" }}
            className="editable-item-container">
            
                    <div className="hor-aligned-center-div-between">
                        <MCHeader text={name} />

                        <div className="hor-aligned-div">
                            <Button icon="edit" {...buttonProps} />
                            <Button icon="trash" {...buttonProps} />
                        </div>
                    </div>
                    <div style={{ fontSize: "0.95rem", borderBottom: "0.4px solid darkgrey", marginBottom: "0.3rem" }}>Properties</div>
                    <table className="property-table">
                        <tbody>
                            {Object.keys(rest).map(attrName => {
                                return (

                                    <tr className="property-table-cell" key={attrName}>
                                        <td className="property-table-cell-left">{attrName} :</td>
                                        <td className="property-table-cell-right">{rest[attrName] !== null && rest[attrName] !== undefined && _.isString(rest[attrName]) && rest[attrName].startsWith("http") ?
                                            <a href={rest[attrName]} target="_blank" rel="noopener noreferrer">Link</a> :
                                            _.isBoolean(rest[attrName]) ? rest[attrName] ? "True" : "False" :
                                                rest[attrName]}</td>
                                    </tr>)
                            })
                            }
                        </tbody>
                    </table>
            </motion.div>
        )

}



MCEditableItem.defaultProps = {
    name : "Item name.",
    buttonProps: { small: true, minimal: true }
}