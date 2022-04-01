

import React from 'react';
import {useState, useMemo} from 'react';
import { useNavigate , useLocation} from "react-router-dom";
import { MenuDivider, Text} from '@blueprintjs/core';

const QueryParam = () => {
    const { search } = useLocation();
    return useMemo(() => new URLSearchParams(search), [search]);
  }


export function OmnibarItem(props) {
    
    const item = props.item
    const text = item["Gene names  (primary )"];
    const onSelect = props.onSelect
    const { search } = useLocation();
    const qs = new URLSearchParams(search).get("q")

    const navigate = useNavigate()
    var qValues = [props.item["Entry"]]
    
    const sendGraphID =function(e) {
            if (qs !== null) {
                qValues  = qs.split(";")
                if (!qValues.includes(item["Entry"])){
                    qValues.push(props.item["Entry"])
                }
            }

            
            // console.log(qs)
            onSelect(props.item)
            props.handleClose()
            //navigate(`/protein/?s=${item["Entry"]}&q=${qValues.join(";")}`)

        }

    return(
        <div key={item["Entry"]} onClick={sendGraphID} style={{padding:"0em 0.3em"}}>
        <div className={"omnibar-search-item"} >

        <div style={{margin:"3px"}}>
        <div style={{float:"left",color:"#286FA4"}}>
        <p>{text}</p>
        </div>
        <div style={{float:"right",paddingRight:"3px",paddingTop:"4px",color:"#737373"}}>
            <p>{item.Entry}</p>
        </div>
        </div>
        {/* //active={modifiers.active}
        disabled={modifiers.disabled}
        label={item[this.props.labelKw]}
        key={item["graphID"]}
        onClick={handleClick}
        text={text} 
        onMouseOver = {(e) => (e.stopPropagation())}
        /> */}
        <div style={{fontSize:"10px",marginTop:"3px",marginLeft:"10px",paddingBottom:"10px",clear: "both", wordWrap:"break-word"}}>
            <p className="item-organism">{item["Organism"]}</p>
            <p>{item["Protein names"]}</p>
        </div>

        </div>

        <MenuDivider/>

    </div>)
}