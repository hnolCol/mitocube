import { Button } from "@blueprintjs/core";
import { Tooltip2 } from "@blueprintjs/popover2";




export function MCTooltipButton(props) {
    const {content, ...rest} = props
    return (
        <Tooltip2 content={content} disabled={content===undefined}>
            <Button {...rest} minimal={true}/>
        </Tooltip2>
        
    )
}