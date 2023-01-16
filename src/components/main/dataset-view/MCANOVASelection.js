

import { useState } from "react";
import { Button, NumericInput } from "@blueprintjs/core";
import { MCCombobox } from "../../utils/components/MCCombobox";
import _ from "lodash";

function MCAnovaLabel(props) {

    const {text} = props
    return (
        <div className="anova-selection-label">
            <div>{text}</div>
        </div>
    )
}

export function MCClusterANOVASelection(props) {

    const {groupingNames, setANOVASettings, buttonText,  askForNumberClusters } = props 
    const [anovaType,setANOVAType] = useState("1-way ANOVA")
    const [groupingSelection, setGroupingSelection] = useState({pvalue: 0.001, ncluster: 12})
    const oneWayANOVA = anovaType === "1-way ANOVA" || groupingNames.length === 1

    const saveGroupingSelection = (groupingKey,groupingValue) => {
        setGroupingSelection(
            prevValues => {
              return { ...prevValues,[groupingKey]:groupingValue}}) 
    }

    const submitANOVAsettings = (e) => {
        const groupingSettings = groupingSelection
        groupingSettings["anovaType"] = anovaType
        setANOVASettings(groupingSelection)
    }
    
    return (
        <div style={{transform:"translateX(50%)",width:"50%"}}>
            <h3>ANOVA Selection</h3>

                <div className="hor-aligned-div middle-m white-bg ">
                <MCAnovaLabel text="Analysis of variance:"/>
                <MCCombobox  
                    items = {groupingNames.length === 1?["1-way ANOVA"]:["1-way ANOVA","2-way ANOVA"]} placeholder={anovaType} callback={setANOVAType}
                    buttonProps ={{minimal : false,
                                    small : true,
                                    intent : "primary"
                                    }}/>
                                    
                </div>
                <div className="hor-aligned-div middle-m white-bg" >
                    <MCAnovaLabel text="Grouping 1:"/>
                    <MCCombobox  
                        items = {groupingNames}
                        placeholder = {groupingSelection.grouping1}
                        callbackKey = "grouping1"
                        callback = {saveGroupingSelection}
                        buttonProps ={{minimal : false,
                                        small : true,
                                        intent : "none"
                                        }}/>
                </div>

                <div className="hor-aligned-div middle-m white-bg" >
                    <MCAnovaLabel text="Grouping 2:"/>
                    <MCCombobox  
                        items = {groupingNames}
                        placeholder = {groupingSelection.grouping2}
                        callbackKey = "grouping2"
                        callback = {saveGroupingSelection}
                        buttonProps ={{minimal : false,
                                        small : true,
                                        intent : "none",
                                        disabled : oneWayANOVA
                                        }}/>
            </div>
            
                <div className="hor-aligned-div middle-m white-bg" >
                <MCAnovaLabel text="Significance:"/>
                <div>
                <MCCombobox  
                    items = {oneWayANOVA?["Grouping p-value"]:_.concat(_.map(groupingNames, v=> `p-value ${v}`),["p-value Interaction"])}
                    callbackKey = "pvalueType"
                    placeholder = {oneWayANOVA?"Grouping p-value":groupingSelection.pvalueType===undefined?"Select p-value":groupingSelection.pvalueType}
                    callback = {saveGroupingSelection}
                    buttonProps ={{minimal : false,
                                    small : true,
                                    intent : "none",
                                    disabled : oneWayANOVA
                                    }}/>
                                    
                <NumericInput 
                        min={1e-12} 
                        max={0.5} 
                        fill={true}
                        value={groupingSelection.pvalue} 
                        onValueChange = {value => saveGroupingSelection("pvalue",value)} 
                        placeholder={"p-value cutoff"} 
                        stepSize={0.000001} 
                        minorStepSize={0.000001} />
                </div>
            </div>
            
            {askForNumberClusters ?
                //ask for number of clusters (important for hierarchical clustering)
                <div className="hor-aligned-div middle-m white-bg" >
                        <MCAnovaLabel text="Number of clusters:"/>
                    <div>
                        <NumericInput 
                            min={2} 
                            fill={true}
                            max={25} 
                            value={groupingSelection.ncluster} 
                            onValueChange = {value => saveGroupingSelection("ncluster",value)} 
                            placeholder={"Number of clusters."} 
                            stepSize={1} 
                            minorStepSize={1} />
                    </div>
                </div>
                    : null
            }

            <Button
                text={buttonText}
                small={true}
                minimal={false}
                intent={"primary"}
                onClick={submitANOVAsettings} />

                

        </div>
    ) 
}

MCClusterANOVASelection.defaultProps = {
    groupingNames : ["A","B"],
    buttonText: "Show Heatmap",
    askForNumberClusters : true

}