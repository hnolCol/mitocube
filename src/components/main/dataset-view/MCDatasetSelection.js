import { InputGroup, Dialog, ButtonGroup, Tag, MenuItem } from "@blueprintjs/core";
import { useEffect, useState } from "react";
import { Button } from "@blueprintjs/core"

import { Link } from "react-router-dom";

import _ from "lodash";
import axios from "axios";
import { useQuery } from "react-query"

import { MCHeader } from "../../utils/components/MCHeader";
import { filterArrayBySearchString, filterDatasetsByDataIDs, handleSearchTagBasedFiltering } from "../../utils/Filter";
import { MCSimpleResponseCheck } from "../../utils/ResponseChecks";
import { MCGetFilterFromLocalStorage } from "../../utils/Misc";
import { Suggest2 } from "@blueprintjs/select";
import { OmnibarItem } from "../protein-view/MCProteinOmnibarSearch";
import useDebounce from "../../../hooks/useDebounce";
import { MCListAsTags } from "../../utils/components/MCTableLikeItem";
import { MCHighlightSpan } from "../../utils/components/MCHighlightText";
import { MCTagContainer } from "../../utils/components/MCTagContainer";

const initialSearchPropState = {isLoading: false, searchString: "", msg: "", featureIDMapper: {}, numberOfDatasets : 0}


function MCFeatureSuggest(props) {
    
    const {isLoading,isFetching,featureLabels, tags, setTags, items, ...rest } = props
    const [searchString, setSearchString] = useState("")
    const [itemsToShow, setItemsToShow] = useState([])
    
    const debounceSearchString = useDebounce(searchString, 300)
   


    useEffect(() => { 
        if (isLoading) return 
        if (isFetching) return
        //search in all entries of an item object
        if (!_.isArray(items)) return 
        if (items.length === 0) return 
        // search for string in all available columns, search is debounced (e.g. runs only if unchanged for some ms)
        let filteredItems = filterArrayBySearchString(debounceSearchString, items.slice(), Object.keys(items[0]))
        if (filteredItems.length > 20) {
            // if too many items, just show the first 20.
            filteredItems = filteredItems.slice(1,20)
        }
       
        setItemsToShow(filteredItems)
    },
        [debounceSearchString, isFetching, isLoading])


    const onItemSelect = (entry) => {
        
        let currentTags = tags.slice() 
        let tagAlreadyIn = _.includes(currentTags, entry)
        console.log(tagAlreadyIn)
        var newTags = []
        if (tagAlreadyIn) {
            newTags = _.filter(currentTags, tag => tag[featureLabels.id]===entry[featureLabels.id])
        }
        else {
            newTags =  _.concat(currentTags,[entry])
        }
        
        setTags(newTags)
        

    }

    const renderItem = (item, e) => {
        // if (!modifiers.matchesPredicate) {
        //   return null;
        // }
    
        
    return (
        <OmnibarItem
            key={item[featureLabels.id]}
            item={item}
            handleClose = {undefined}
            onSelect={() => e.handleClick()}
            featureLabels={featureLabels} />
           
        );
      }
    

    return (
        <Suggest2
            {...rest}
            disabled={isFetching  || isLoading}
            noResults = {searchString!==""?<p>No features matches search string</p>:<p>Enter query string to show results.</p>}
            menuProps={{ style: { overflowY: "scroll", maxHeight: "40vh" } }}
            query={searchString}
            items={itemsToShow} 
            onItemSelect={onItemSelect}
            resetOnClose={false}
            itemRenderer={renderItem}
            inputValueRenderer={T => T[featureLabels.main]}
            onQueryChange={(searchString) => setSearchString(searchString)}
            popoverProps = {{matchTargetWidth:true,minimal:true}}
            inputProps={{ placeholder: searchString===""?`Search in ${items.length} features ...`:searchString }} />     
    )
}
MCFeatureSuggest.defaultProps = {
    items: [],
    isLoading: false,
    isFetching : false
    
}


function MCSearchDatasetsDialog(props) {

    const { isOpen, onClose, token, setFilter } = props
    const [searchItems, setSearchItems] = useState({ items: [], featureLabels: {} })
    const [searchProps, setSearchProps] = useState(initialSearchPropState)
    const [tags, setTags] = useState([])
    const filter = MCGetFilterFromLocalStorage()

    const getFeatureDetails = async () => {
        //fetch data from api
        const res = await axios.post("/api/features/details",
                        { token: token }, 
                        { headers: { 'Content-Type': 'application/json' } })
        
        return res.data

    }
    const { isLoading, isFetching } = useQuery(["getFeatureDetails",filter],
        getFeatureDetails, {
            onSuccess: (data) => {
                if (MCSimpleResponseCheck(data)) {
                    setSearchItems(prevValues => {return {...prevValues,"items" : data.features, "featureLabels" : data.featureLabels}})
                   
                }
            },
            refetchOnWindowFocus: false,
            enabled: _.isString(token) && isOpen
    })

    const performSearch = () => {
        //perform search 
        if (!_.has(searchItems.featureLabels, "id")) return 
        setSearchProps(prevValues => { return { ...prevValues, "isLoading": true } })
        axios.get('/api/dataset/features', { params: { token: token, featureIDs: _.join(_.map(tags, tag => tag[searchItems.featureLabels.id]),";") } }).then(
            response => {
                if (response.status === 200 && "success" in response.data && response.data["success"]) {
                    
                    setSearchProps(prevValues => {
                        return {
                            ...prevValues,
                            "isLoading": false,
                            "msg": response.data.msg,
                            "featureIDMapper": response.data["featureIDMapper"],
                            "numberOfDatasets" : response.data["numberOfDatasets"]
                        }
                    })
                }
                else{
                    setSearchProps(prevValues => { return { ...prevValues, "isLoading": false, "msg" : response.data.msg} })
                }
            }).catch(error => {
                setSearchProps(prevValues => { return { ...prevValues, "isLoading": false, "msg" : "API returned an error of code."} })
            })
        
        
    }

    const saveFilterAndClose = (e) => {
        if (!_.isEmpty(searchProps.featureIDMapper)){
            setFilter(searchProps.featureIDMapper)
        }
        handleClose()
    }

    const handleClose = (e) => {
        onClose()
    }

    const resetSearch = (e) => {
        setSearchProps(initialSearchPropState) 
        setTags([])
    }

    return (
        <Dialog
            style = {{width:"100vh"}}
            {...{ isOpen }}
            onClose={handleClose}
            onClosing={resetSearch}
            canEscapeKeyClose={true}
            canOutsideClickClose={true}>
                <div className="middle-m">
                    <MCHeader text="Search for protein in datasets." />
                <p>Please enter a search string and select features, you will be able to filter the datasets based on the fact if the protein(s) was/were found in the dataset.</p>
                <p>If you enter multiple proteins only datasets will be displayed in which {<MCHighlightSpan text="all proteins"/>} were detected.</p>
                <div className="little-m">
                    <MCFeatureSuggest {...searchItems} setTags={setTags} tags={tags} />
                    {_.has(searchItems.featureLabels, "main") && _.has(searchItems.featureLabels, "id") && tags.length > 0 ?
                        <div style={{maxWidth:"100%"}}>
                            <MCListAsTags array={tags.map(tag => `${tag[searchItems.featureLabels.main]}(${tag[searchItems.featureLabels.id]})`)} />
                        </div> : null}

                </div>
                    <div className="little-m">
                        <ButtonGroup>
                            <Button
                                text="Search"
                                icon = "search"
                                loading={searchProps.isLoading}
                                onClick={performSearch}
                                disabled={tags.length === 0} />
                            <Button
                            text="Apply Filter"
                            i   con= "filter-keep"
                                disabled={_.isEmpty(searchProps.featureIDMapper) || searchProps.numberOfDatasets === 0}
                                onClick={saveFilterAndClose} />
                            <Button
                                text="Reset"
                                onClick={() => setTags([])} />
                            <Button text="Close" intent={"danger"} onClick={onClose} />
                        </ButtonGroup>
                        <p>{searchProps.msg}</p>
                    </div>
                </div>
        </Dialog>
    )
}

export function MCDatasetSelection (props) {
    const {token, setInspected} = props
    const [dataSummary, setDataSummary] = useState({
                                                raw: [],
                                                filtered: [],
                                                searchString: "",
                                                toShow: [],
                                                featureIDFilter: {},
                                                searchTags: [],
                                                datasetTagNames: [],
                                                searchNames: []
                                            })
    const [searchDialogOpen, setSearchDialogOpen] = useState(false)
    const [mouseOverDataID, setMouseOverDataID] = useState(undefined)
    
    //const dataSummary.searchNames = ["shortDescription", "Material", "Organism", "dataID"] //get from API? 
    const getDatasetSummary = async () => {
        const res = await axios.get("/api/data/summary", { params: { token: token } })
        return res.data
    }
    const { isLoading, isError } = useQuery("getDatasetsSummary", getDatasetSummary,
        {
            refetchOnWindowFocus : false,
            onSuccess: (data) => {
                
                if (MCSimpleResponseCheck(data) && _.has(data, "tagNames")
                    && _.has(data, "searchNames") && _.has(data,"datasets")) {
                        let datasets = data["datasets"]
                        setDataSummary(
                            prevValues => {
                                return {
                                    ...prevValues,
                                    raw: datasets.slice(),
                                    toShow: datasets,
                                    headerName : data["headerName"],
                                    tagNames: data["tagNames"],
                                    searchNames: data["searchNames"],
                                    searchString: ""}}
                            )
                }
                else {
                    console.log("the received data could not be interpreted.") //better error handling. 
                }
        }})
    
    const onInputChange = (e) => {

        const searchString = e.target.value
            
            setDataSummary(prevValues => {
                return {
                    ...prevValues,
                    "toShow": getDatasetsToShow(searchString, dataSummary.featureIDFilter, dataSummary.searchTags),
                    "searchString": searchString
                }
            })}

    const getDatasetsToShow = (searchString,featureIDFilter, searchTags) => {
        // handles dataset selection. Using featureIDFilter, searchTags and searchString as inputs. 
        // featureID filter and searchTags are first applied, then searchString (if present)
        let featureIDFilterIsEmpty = _.isEmpty(featureIDFilter)
        let searchTagsEmpty = searchTags.length === 0
        let searchStringEmpty = searchString === ""

        if (searchStringEmpty && featureIDFilterIsEmpty && searchTagsEmpty) {
            // no filter applied
            return dataSummary.raw.slice()
        }

        if (searchStringEmpty && !featureIDFilterIsEmpty && searchTagsEmpty) {
            //featureID filter is active but searchstring and search tags are empty
            return handleDatasetFilteringByDataID(dataSummary.raw,featureIDFilter)
        }

        if (!searchStringEmpty && featureIDFilterIsEmpty && searchTagsEmpty) {
            // just search string is active
            return filterArrayBySearchString(
                searchString,
                dataSummary.raw,
                dataSummary.searchNames)
        }
        
        if (searchStringEmpty && featureIDFilterIsEmpty && !searchTagsEmpty) {
            //only search tags are available
            let datasetsThatMatchSearchTags = handleSearchTagBasedFiltering(dataSummary.raw, searchTags, dataSummary.searchNames)
            return datasetsThatMatchSearchTags
        }

        if (!searchStringEmpty && !featureIDFilterIsEmpty && searchTagsEmpty) {
            let datasetsThatMatchFeatureIDFilter = handleDatasetFilteringByDataID(dataSummary.raw, featureIDFilter)
            return filterArrayBySearchString(
                searchString,
                datasetsThatMatchFeatureIDFilter,
                dataSummary.searchNames)
        }

        if (!searchStringEmpty && featureIDFilterIsEmpty && !searchTagsEmpty) {
            //search string in tag-filtered datasets
            let datasetsThatMatchSearchTags = handleSearchTagBasedFiltering(dataSummary.raw, searchTags, dataSummary.searchNames)
            return filterArrayBySearchString(
                searchString,
                datasetsThatMatchSearchTags ,
                dataSummary.searchNames)
        }

        if (searchStringEmpty && !featureIDFilterIsEmpty && !searchTagsEmpty) {
            let datasetsThatMatchFeatureIDFilter = handleDatasetFilteringByDataID(dataSummary.raw, featureIDFilter)
            return handleSearchTagBasedFiltering(datasetsThatMatchFeatureIDFilter, searchTags, dataSummary.searchNames)
        }

        // if all are not empty 
        let datasetsThatMatchFeatureIDFilter = handleDatasetFilteringByDataID(dataSummary.raw, featureIDFilter)
        let datasetsThatMatchSearchTagsAndFilter = handleSearchTagBasedFiltering(datasetsThatMatchFeatureIDFilter, searchTags, dataSummary.searchNames)
        return filterArrayBySearchString(
            searchString,
            datasetsThatMatchSearchTagsAndFilter,
            dataSummary.searchNames)
    }



    const handleKeyUp = (e) => {
        // just add the tag upon enter
        if (e.code === "Enter") {
            handleSearchTag(dataSummary.searchString)
        }
    }

    const handleSearchTag = (searchString, removeFromTags = false) => {
        let updatedSearchTags = []
        if (_.isString(searchString) && !removeFromTags && searchString !== "" && !dataSummary.searchTags.includes(searchString)) {
            updatedSearchTags = _.concat(dataSummary.searchTags,[searchString]) //create new array
            
        }
        else if (removeFromTags && dataSummary.searchTags.includes(searchString)) {
            updatedSearchTags = _.without(dataSummary.searchTags, searchString) //create new array
        }
        else {
            //just return, eg. deleting must explicitly called (removeFromTags)
            return
        }

        setDataSummary(prevValues => {
            return {
                ...prevValues,
                "searchString" : "",
                "searchTags": updatedSearchTags,
                "toShow": getDatasetsToShow("", dataSummary.featureIDFilter, updatedSearchTags)
            }
        })
    }

    const removeSearchTag = (searchTag) => {
        handleSearchTag(searchTag,true) //true = removeFromTags
    }

    const handleDatasetFilteringByDataID = (datasets, featureIDFilters) => {

        let dataIDs = _.intersection(...Object.values(featureIDFilters))
        return  filterDatasetsByDataIDs(datasets, dataIDs)
    }


    const handleFeatureIDFilter = (newFeatureIDFilter) => {
        
        let featureIDFiltersMerged = { ...dataSummary.featureIDFilter, ...newFeatureIDFilter }
        setDataSummary(prevValues => {
            return {
                ...prevValues,
                "featureIDFilter": featureIDFiltersMerged,
                "toShow": getDatasetsToShow(dataSummary.searchString, featureIDFiltersMerged, dataSummary.searchTags)
            }
        })
    }

    const removeFeatureIDFilter = (featureID) => {

        if (Object.keys(dataSummary.featureIDFilter).includes(featureID)) {
            let newFeatureIDFilter = _.omit(dataSummary.featureIDFilter, featureID)
            setDataSummary(prevValues => {
                return {
                    ...prevValues,
                    "featureIDFilter": newFeatureIDFilter,
                    "toShow": getDatasetsToShow(dataSummary.searchString, newFeatureIDFilter, dataSummary.searchTags)
                }
            })
        }
    }

    const resetTagsAndFilters = () => {
        // reset all filter options. (e.g. show all datasets)
        
        setDataSummary(prevValues => {
            return {
                ...prevValues,
                featureIDFilter: {},
                searchTags : [],
                searchString: "",
                toShow : dataSummary.raw
        }})

    }

    const handleDatasetInspection = (dataID) => {
        let linkInfo = {"to":`/dataset/${dataID}?type=summary`, name : dataID}
        setInspected(linkInfo)
    }

    return(
        <div className="dataset-selection-content">
            <div className="top-right-absolute-container">
            <Link to="/">Home</Link>
            </div>
            <div className="middle-m">
            <MCHeader text="Dataset Selection" fontSize="1.5rem"/>
            </div>
            <MCSearchDatasetsDialog isOpen={searchDialogOpen} onClose={() => setSearchDialogOpen(false)} {...{token, "setFilter" : handleFeatureIDFilter}} /> 
            <div className="hor-aligned-div" style={{ minWidth: "100%", paddingRight: "1.5rem"}}>
                
                <InputGroup 
                        leftIcon={"filter"} 
                        value={dataSummary.searchString}
                        fill={true}
                        placeholder="Search through datasets. Click enter to add a search tag." 
                        small={false}
                        onChange={onInputChange} 
                        onKeyUp={handleKeyUp}
                        rightElement={<div style={{marginRight:"0.5rem",marginTop:"0.2rem"}}><p>{`${dataSummary.toShow.length}/${dataSummary.raw.length}`}</p></div>}
                        />
        
                <div>
                    <Button icon="search" onClick={() => setSearchDialogOpen(true)} small={false} intent="primary"/>
                </div>
                <div>
                    <Button icon="reset" onClick={resetTagsAndFilters} small={false} intent="danger"/>
                </div>
               
            </div>
                

            <MCTagContainer searchTags={dataSummary.searchTags} handleRemove={removeSearchTag} />

            <div className="hor-aligned-div">

                {_.isObject(dataSummary.featureIDFilter) ? Object.keys(dataSummary.featureIDFilter).map(featureID => {
                    return (
                        <div key={featureID} className="little-m">
                            <Tag
                                onRemove={() => removeFeatureIDFilter(featureID)}
                                interactive={true}>
                                {`${featureID} (${dataSummary.featureIDFilter[featureID].length})`}
                            </Tag>
                        </div>)
                }): null}
            </div>
            <div className="dataset-selection-container">
                {isLoading?<p>Loading..</p>:isError?<p>An error occured trying to reach the API.</p>:null}
            {dataSummary.toShow.length>0?dataSummary.toShow.map(dataset => {
                return (
                
                    <div
                        key={dataset.dataID}
                        className="dataset-selection-box"
                        onMouseLeave = {(e) => {setMouseOverDataID(undefined)}}
                        onMouseEnter = {(e) => {setMouseOverDataID(dataset.dataID)}}>

                        <div className="little-m"> 
                            <Link to={`/dataset/${dataset.dataID}?type=summary`} style={{ textDecoration: "none", cursor: "pointer" }} onClick={() => handleDatasetInspection(dataset.dataID)}>
                            <MCHeader
                                text={dataset[dataSummary.headerName]}
                                hexColor={mouseOverDataID === dataset.dataID ? "#2F5597" : mouseOverDataID !== undefined ? "darkgrey" : "#000000"}
                                fontSize={"1.10rem"}
                                    fontWeight={300} />
                            </Link>
                        </div>

                        <div className="dataset-tag-box">
                            {dataSummary.tagNames.map(k => {
                                return (
                                    <div key={k} className="little-m" style={{opacity:mouseOverDataID === dataset.dataID ?"1":"0.7",cursor:"default"}}>
                                        <Tag style={{ fontSize: "0.8rem" }} minimal={true}>{dataset[k]}</Tag>
                                </div>
                                )
                            })}
                           
                           
                        </div>
                        {mouseOverDataID===dataset.dataID?
                            <div style={{position:"absolute",right:10,top:10}}>
                                <Link to={`/dataset/${dataset.dataID}?type=summary`}>
                                    <Button text="Explore"
                                        intent="primary"
                                        small={false}
                                        minimal={true}
                                        rightIcon={"chevron-right"} />
                                </Link>
                            </div>
                            :
                            null}
                        </div>
                       
                )
            }) : <div><p>{dataSummary.toShow.length === 0 && dataSummary.raw.length > 0? "No dataset matches the defined tag and/or search strings." : "No datasets returned from API."}</p></div>}
            </div>


         </div>
    )

}