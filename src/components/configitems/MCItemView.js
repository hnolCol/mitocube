import { MCEditableItem } from "../input/MCEditableItem"
import { motion } from "framer-motion"
import { useQuery } from "react-query"
import axios from "axios"
import { MCHeader } from "../utils/components/MCHeader"
import _ from "lodash"
import { MCInputFieldDialog } from "../input/MCInputs"
import { useEffect, useState } from "react"
import { InputGroup } from "@blueprintjs/core"
import { MCTagContainer } from "../utils/components/MCTagContainer"
import useDebounce from "../../hooks/useDebounce"
import { filterArrayBySearchString, handleSearchTagBasedFiltering, handleSearchTagFiltering } from "../utils/Filter"


function MCTagSearch(props) {
    const { searchDetails, setSearchDetails} = props
    
    const handleKeyUp = (e) => {
        // just add the tag upon enter
        if (e.code === "Enter") {
            handleSearchTag(searchDetails.searchString)
        }
    }

    const removeSearchTag = (searchTag) => {
        handleSearchTag(searchTag,true) //true = removeFromTags
    }

    const handleSearchTag = (searchString, removeFromTags = false) => {
        let updatedSearchTags = []
        if (_.isString(searchString) && !removeFromTags && searchString !== "" && !searchDetails.searchTags.includes(searchString)) {
            updatedSearchTags = _.concat(searchDetails.searchTags, [searchString]) //create new array
            
        }
        else if (removeFromTags && searchDetails.searchTags.includes(searchString)) {
            updatedSearchTags = _.without(searchDetails.searchTags, searchString) //create new array
        }
        else {
            //just return, eg. deleting must explicitly called (removeFromTags)
            return
        }
        
        setSearchDetails(prevValues => { return { ...prevValues, searchTags: updatedSearchTags, searchString: "" } })
    }    
    


    return (
        <div>
            <InputGroup
                placeholder="Search by tags.."
                value={searchDetails.searchString}
                onChange={(e) => setSearchDetails(prevValues => { return { ...prevValues, "searchString": e.target.value } })}
                onKeyUp={handleKeyUp}
            />
            <MCTagContainer searchTags={searchDetails.searchTags} handleRemove={removeSearchTag} />
        </div>
    )
}

function MCAddItem(props) {
    const { width, height, text, onClick} = props
    const centerX  = width/2 
    const centerY = height / 2 
    const r = Math.min(width, height) * 0.7 / 2
    
    return (
        <div className='editable-item-container'>
            <div style={{ height: "100%" }} className='vert-align-div-center'>
                
            <div>
                <motion.svg width={width} height={height}>
                        <motion.g whileHover={{ scale: 1.1 }} onClick={onClick}>
                        <circle cx={centerX} cy={centerY} r={r} fill="#efefef" stroke="none" />
                        <line x1={centerX-width/4} x2={centerX+width/4} y1={centerY} y2={centerY} stroke="#2F5597" strokeWidth={7}/>
                        <line x1={centerX} x2={centerX} y1={centerY-height/4} y2={centerY+height/4} stroke="#2F5597" strokeWidth={7} />
                        </motion.g>
                </motion.svg>
                </div>
                <MCHeader text={text} fontWeight={200} />
        </div>
        </div>
    )
}
MCAddItem.defaultProps = {
    width: 200,
    height: 200,
    text : ""
}

export function MCItemView(props) {
    const [itemDialog, setItemDialog] = useState({ isOpen: false })
    const [searchDetails, setSearchDetails] = useState({searchTags : [], searchString : "", itemsToShow : [], items : []})
    const { token, url, urlInputFields, itemHeader } = props 
    const debouncedSearchString = useDebounce(searchDetails.searchString, 150)


    useEffect(() => { 
        let filteredArray = []
        
        if (debouncedSearchString === "" && _.isArray(searchDetails.searchTags) && searchDetails.searchTags.length > 0) {
            filteredArray = handleSearchTagFiltering(searchDetails.items, searchDetails.searchTags, Object.keys(searchDetails.items[0]))
        }
        else if (debouncedSearchString !== "") {
            
            filteredArray = filterArrayBySearchString(debouncedSearchString, searchDetails.itemsToShow, Object.keys(searchDetails.items[0]))
        }
        else {
            filteredArray = searchDetails.items.slice()
        }
        setSearchDetails(prevValues => { return { ...prevValues, "itemsToShow": filteredArray } })
        
    },[debouncedSearchString])

    const getItems = async () => {

        const res = await axios.get(
                url, {
                headers: {
                    'Authorization': `${token.token_type} ${token.access_token}`}
        })
        return res.data
    }
    const { data, isLoading, isError, error, refetch } = useQuery(["getItems", url], getItems, {
        onSuccess : (data) => setSearchDetails(prevValues => {return{...prevValues,"items" : data, "itemsToShow" : data.slice()}}), retry: false})
        
    console.log(data)
    
    if (isError) {
        return (
            <div>
                There was an error of status {JSON.stringify(error.response.data)}. 
                The status of the error is: {error.response.status}
            </div>
        )
    }


    const handleDialogClosing = () => {
        
        setItemDialog(prevValues => { return { ...prevValues, isOpen: false } })
        refetch()
    }

    return (
        <div style={{overflow:"hidden", height:"90vh", overflowY:"hidden"}}>
            <MCInputFieldDialog
                token={token}
                url={urlInputFields}
                postUrl={url}
                header={`Item: ${itemHeader}`}
                onClose={handleDialogClosing}
                {...itemDialog}/>
            <MCHeader text={itemHeader} fontWeight={400} fontSize={"2rem"} />
            <div>
                <p>{searchDetails.itemsToShow!==undefined&&_.isArray(searchDetails.itemsToShow) ?`${searchDetails.items.length} items found. Please use the plus button to add an item to the database.`:""}</p>
            </div>
            <MCTagSearch {...{searchDetails, setSearchDetails}} />
            <div style={{ display: "flex", flexDirection: "row", flexWrap: "wrap", overflowY : "scroll", height:"70vh"}}>
                {isLoading ? <p>Loading...</p> : searchDetails.itemsToShow.map((item,idx) => {
                console.log(item)
                return (
                    <MCEditableItem key={`${idx}-${itemHeader}-itemview`} {...item} />
                )
            
        })}
                <MCAddItem onClick={() => setItemDialog(prevValues => {return {...prevValues, isOpen:true}})} />
        </div> 
        </div>

    )
}

MCItemView.defaultProps = {
    token: {},
    itemHeader : "Column",
    url: "/api/v1/instruments/column",
    urlInputFields : "/api/v1/frontend/input_fields/user"
}