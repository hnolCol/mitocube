import { H3 } from "@blueprintjs/core";
import React from "react";
import {useLocation, Link, Outlet} from 'react-router-dom';



export const helpLinks = [
    {
        to : "/help",
        linkName : "Introduction",
        helpID : "overview",
        level : 1
    },
    {
        to : "/help/statistics",
        linkName : "Statistics",
        helpID : "statistics",
        level : 2      
    },
    {
        to : "/help/cards",
        linkName : "Feature Cards",
        helpID : "cards",
        level : 1      
    },
    {
        to : "/help/cards/header",
        linkName : "Card Headers",
        helpID : "cards-header",
        level : 2      
    },
    {
        to : "/help/cards/graph",
        linkName : "Card Graphs",
        helpID : "cards-graph",
        level : 2           
    },
    {
        to : "/help/FAQ",
        linkName : "FAQs",
        helpID : "faqs",
        level : 2           
    },
    {
        to : "/help/config",
        linkName : "API-config",
        helpID : "API-config",
        level : 1           
    }
]


export function MCHelpMainView(props) {
    const loc = useLocation()
   
    return(

        <div className="help-wrapper">
            
            <div className="help-sidebar">
                <H3>MitoCube Help Content</H3>
                {
                    helpLinks.map(v => {
                        return(
                            <div key = {`${v.to}`}>
                                <Link className={`help-link link-level-${v.level} + ${v.to === loc.pathname?'help-activeLink':''}`} to={v.to}>{v.linkName}</Link>
                            </div>
                        )
                    })
                }
                </div>
                <div className="help-dynamic-info">
                <Outlet/>
                </div>

        </div>
    )
}