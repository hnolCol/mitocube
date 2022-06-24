import { Button, NumericInput, Radio, RadioGroup, Slider } from "@blueprintjs/core";
import { useState } from "react";

const groupingNames = ["Treat","Time"]


export function MCHeatmapFilter(props) {
    const [pValueValue, setSliderValue] = useState(0.01)
    const [groupingName, setGroupingName] = useState("")
    return (

        <div>

            <RadioGroup label="Grouping"
                onChange={e => setGroupingName(e.target.value)}
                selectedValue={groupingName}>
                
                {groupingNames.map(v => {
                    return(
                        <Radio key={`${v}`} label={v} value={v}/>
                    )
                })}

            </RadioGroup>
                <Slider vertical = {true} 
                    fill={false} 
                    value={pValueValue} 
                    max={0.1} 
                    min={0} 
                    stepSize={0.01} 
                    onChange={setSliderValue} 
                    labelValues={[0,0.01,0.05,0.1,0.2]}
                />

            <Button text="Update" rightIcon="updated" small={true} intent={"primary"}/>
        </div>
    )
}