import { Tag, Intent } from "@blueprintjs/core"
import _ from "lodash"

const INTENTS = [Intent.NONE, Intent.PRIMARY, Intent.SUCCESS, Intent.DANGER, Intent.WARNING];

export function MCTagContainer(props) {
    const {searchTags, handleRemove} = props
    return (
        <div className="hor-aligned-div">

        {_.isArray(searchTags) ? searchTags.map((searchTag,tagIdx) => {
            return (
                <div key={searchTag} className="little-m">
                    <Tag
                        intent={INTENTS[tagIdx % INTENTS.length]}
                        onRemove={() => handleRemove(searchTag)}
                        interactive={true}>
                        {`${searchTag}`}
                    </Tag>
                </div>)
            
        }): null}
    </div>
        )

}