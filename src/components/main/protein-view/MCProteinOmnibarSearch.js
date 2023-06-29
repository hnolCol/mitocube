
import { Omnibar } from "@blueprintjs/select";
import { MenuDivider, MenuItem } from "@blueprintjs/core";
// import { OmnibarItem } from "./OmnibarItem";
import axios from "axios";
import _ from "lodash"
import { useState, useEffect } from "react";
import useDebounce from "../../../hooks/useDebounce";
import { filterArrayBySearchString } from "../../utils/Filter";
import { MCSimpleResponseCheck } from "../../utils/ResponseChecks";
import { useQuery } from "react-query"
import { getFeatureDetails } from "../../../requests/MCFeatureRequests";
import { useNavigate, Link, Navigate } from "react-router-dom"

// if (!_.isEqual(prevProps.filter,this.props.filter)){
//     this._asyncDataFetch()
//   }
// }

// _asyncDataFetch() {

//     axios.post("/api/features/details", 
//     {filter:this.props.filter}, 
//     {headers : {'Content-Type': 'application/json'}})
//         .then(response => {


    export function OmnibarItem(props) {
        
        const { item, onSelect, featureLabels, handleClose } = props
        const redirect = useNavigate()
        
        const handleSelectAndClose = (e) => {
            // 
            //redirect(`/protein/${item.Entry}`)
            onSelect(item)
            handleClose( )
                
            }
    
        return (
            
            <div key={item["Entry"]} onClick={handleSelectAndClose} style={{padding:"0em 0.3em", maxWidth:"90vh"}}>
            <div className={"omnibar-search-item"} >
    
            <div style={{margin:"3px"}}>
            <div style={{float:"left",color:"#286FA4"}}>
            <p>{item[featureLabels["main"]]}</p>
            </div>
            <div style={{float:"right",paddingRight:"3px",paddingTop:"4px",color:"#737373"}}>
                <p>{item[featureLabels["id"]]}</p>
            </div>
            </div>
            <div style={{fontSize:"10px",marginTop:"2px",marginLeft:"10px",paddingBottom:"4px",clear: "both", wordWrap:"break-word"}}>
                <p>{`Synonyms: ${item[featureLabels["sub-main"]]}`}</p>
                        <p className="item-organism">{item[featureLabels["bold-sub-text"]]}</p>
                <div style={{maxWidth:"100$"}}>
                <p>{item[featureLabels["info"]]}</p>
                </div>
            </div>
    
            </div>
    
            <MenuDivider/>
    
        </div>)
    }


export function MCProteinSearch(props) {
    // handle search for proteins in the protein centric view.
    const { isOpen, onClose, token, filter, onItemSelect} = props
    const [featureDeatails, setFeatureDetails] = useState({items : [], featureLabels : {}, itemsToShow : [], searchString : "", sortBy : ""})
    const debounceSearchString = useDebounce(featureDeatails.searchString, 400)
    console.log(debounceSearchString)
    const getFeatureDetails = async () => {
        //fetch data from api
        const res = await axios.post("/api/features/details",
                        { filter: filter, token: token }, 
                        { headers: { 'Content-Type': 'application/json' } })
        return res.data
    }
    const { isLoading, isFetching } = useQuery(["getFeatureDetails", filter],
        getFeatureDetails, {
            onSuccess: (data) => {
                console.log(data,MCSimpleResponseCheck(data))
                if (MCSimpleResponseCheck(data)) {
                    setFeatureDetails(prevValues => {
                        return {
                            ...prevValues,
                            "items": _.isArray(data.features)?data.features:[],
                            "featureLabels": data.featureLabels,
                            "sortBy" : data.sortBy,
                        }
                    })
                }
            },
            refetchOnWindowFocus: false,
            enabled: isOpen
    })

    useEffect(() => { 
        if (isLoading) return 
        if (isFetching) return
        //search in all entries of an item object
        if (!_.isArray(featureDeatails.items)) return 
        if (featureDeatails.items.length === 0) return 
        // search for string in all available columns, search is debounced (e.g. runs only if unchanged for some ms)
        let filteredItems = filterArrayBySearchString(debounceSearchString, featureDeatails.items.slice(), Object.keys(featureDeatails.items[0]))
        if (filteredItems.length > 200) {
            // if too many items, just show the first 50.
            filteredItems = filteredItems.slice(1,50)
        }
        if (Object.keys(featureDeatails.items[0]).includes(featureDeatails.sortBy)) {
            filteredItems = _.sortBy(filteredItems, featureDeatails.sortBy)
        }
        
        setFeatureDetails(prevValues => {
            return {
                ...prevValues,
                "itemsToShow": filteredItems,
            }
        })
    },
        [debounceSearchString,featureDeatails.sortBy])
    
    useEffect(() => {setSearchString("")},[isOpen])
    
    const setSearchString = (searchString) => {
        // sets state for search string. 
        setFeatureDetails(prevValues => {
            return {
                ...prevValues,
                "searchString": searchString,
            }
        })
    }

    const renderItem = (item, { handleClick, modifiers, query }) => {
            if (!modifiers.matchesPredicate) {
              return null;
            }
        return (
            <OmnibarItem
                key={item.Entry}
                item={item}
                handleClose={onClose}
                onSelect={onItemSelect}
                featureLabels={featureDeatails.featureLabels} />
               
            );
          }
    if (featureDeatails.items === undefined) return <div>No features</div>
    return (

        <Omnibar
            itemRenderer={renderItem}
            // itemListPredicate={filterItems}
            query={featureDeatails.searchString}
            resetOnSelect={true}
            onQueryChange={setSearchString}
            inputProps={{ placeholder: _.isArray(featureDeatails.items) && featureDeatails.items.length===0?'No feature items available. API is loading or filtering excluded all features.':`Search in ${featureDeatails.items.length} items.. (example: Yme1l1, Uniprot ID) `}}
            style={{ position: "absolute", left: "50%"}}
            {...{ isOpen, onClose, items : featureDeatails.itemsToShow}} />
    )

}


