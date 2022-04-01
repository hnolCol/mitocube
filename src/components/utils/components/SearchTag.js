import { useState } from "react"



function MCSearchTag(props){
    return (
        <div className={`within-tag-container ${props.selected ? "search-tag-selected" : "search-tag"}`}>
            
          
                <div>
                    <svg width={10} height={10} viewBox="0 0 10 10"><circle cx={5} cy={5} r={5} fill={props.circleFillColor}/></svg>
                    {props.text}
                </div>
                
            
            <div>
             x
            </div>
            
        </div>

    )

}

export function MCSerachTagHolder(props) {
    const [selectedTag, setSelectedTag] = useState("")
    return(
    <div className="tag-container">
        {props.tags.map(v => {
            return(
                <div key={v} onClick={() => setSelectedTag(v)}>
                {<MCSearchTag selected={v===selectedTag}/>}
                </div>
            )
        })}
    </div>
    )
}

MCSerachTagHolder.defaultProps = {
    tags : ["s1","s2","ProteinX","porteiny"]
}




MCSearchTag.defaultProps = {
    text : "SerachTag",
    selected : false,
    circleFillColor : "red"
}