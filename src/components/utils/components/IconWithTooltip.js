import { Button } from "@blueprintjs/core";
import { Popover2 } from "@blueprintjs/popover2";

export function MCIconWithTooltip(props) {

    const {tooltipStr, ...rest} = props
    
    return (
        <Popover2 interactionKind="hover" content = {<div className="tooltip-div">{tooltipStr}</div>} minimal={true} enforceFocus={false} inheritDarkTheme={false}>
            <Button {...rest} />
        </Popover2>
    )
}

MCIconWithTooltip.defaultProps = {
    tooltipStr : "Tooltip",
    icon : "search",
    minimal : true
}