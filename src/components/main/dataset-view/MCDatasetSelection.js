import { InputGroup, Dialog, ButtonGroup, Tag } from "@blueprintjs/core";
import { useEffect, useState } from "react";
import { Button } from "@blueprintjs/core"

import { Link } from "react-router-dom";

import _ from "lodash";
import axios from "axios";
import { useQuery } from "react-query"

import { MCHeader } from "../../utils/components/MCHeader";
import { filterArrayBySearchString } from "../../utils/Filter";
import { MCSimpleResponseCheck } from "../../utils/ResponseChecks";

const initialSearchPropState = {isLoading: false, searchString: "", msg: "", featureIDMapper: {}, numberOfDatasets : 0}

function MCSearchDatasetsDialog(props) {

    const { isOpen, onClose, token, setFilter} = props
    const [searchProps, setSearchProps] = useState(initialSearchPropState)
    
    const performSearch = () => {

        setSearchProps(prevValues => { return { ...prevValues, "isLoading": true } })
        
        axios.get('/api/dataset/features', { params: { token: token, featureID: searchProps.searchString } }).then(
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

    return (
        <Dialog
            {...{ isOpen }}
            onClose={handleClose}
            onClosing={() => setSearchProps(initialSearchPropState)}
            canEscapeKeyClose={false}
            canOutsideClickClose={false}>
                <div className="middle-m">
                    <MCHeader text="Search for protein in datasets." />
                    <p>Please enter the Uniprot ID. After the searching has been performed, you will be able to filter the datasets based on the fact if the protein was found in the dataset.</p>
                    <div className="little-m">
                        <InputGroup
                            value={searchProps.searchString}
                            onChange={e => setSearchProps(prevValues => { return { ...prevValues, "searchString": e.target.value } })}
                            placeholder="Search for protein (Uniprot ID)" />
                    </div>
                    <div className="little-m">
                        <ButtonGroup>
                            <Button
                                text="Search"
                                loading={searchProps.isLoading}
                                onClick={performSearch}
                                disabled={searchProps.searchString.length < 6} />
                            <Button
                                text="Apply"
                                disabled={_.isEmpty(searchProps.featureIDMapper) || searchProps.numberOfDatasets === 0}
                                onClick={saveFilterAndClose} />
                            <Button text="Close" intent={"danger"} onClick={onClose} />
                        </ButtonGroup>
                        <p>{searchProps.msg}</p>
                    </div>
                </div>
        </Dialog>
    )
}

export function MCDatasetSelection (props) {
    const {token} = props
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
    const { isLoading } = useQuery("getDatasetsSummary", getDatasetSummary,
        {
            refetchOnWindowFocus : false,
            onSuccess: (data) => {
                console.log(data)
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
                    console.log(data)
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
            let datasetsThatMatchSearchTags = handleSearchTagBasedFiltering(dataSummary.raw, searchTags)
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
            let datasetsThatMatchSearchTags = handleSearchTagBasedFiltering(dataSummary.raw, searchTags)
            return filterArrayBySearchString(
                searchString,
                datasetsThatMatchSearchTags ,
                dataSummary.searchNames)
        }

        if (searchStringEmpty && !featureIDFilterIsEmpty && !searchTagsEmpty) {
            let datasetsThatMatchFeatureIDFilter = handleDatasetFilteringByDataID(dataSummary.raw, featureIDFilter)
            return handleSearchTagBasedFiltering(datasetsThatMatchFeatureIDFilter, searchTags)
        }

        // if all are not empty 
        let datasetsThatMatchFeatureIDFilter = handleDatasetFilteringByDataID(dataSummary.raw, featureIDFilter)
        let datasetsThatMatchSearchTagsAndFilter = handleSearchTagBasedFiltering(datasetsThatMatchFeatureIDFilter, searchTags)
        return filterArrayBySearchString(
            searchString,
            datasetsThatMatchSearchTagsAndFilter,
            dataSummary.searchNames)
    }


    const handleSearchTagBasedFiltering = (datasets, searchTags) => {
        //and based filtering
        let filteredDataIDs = searchTags.map(searchTag => {
            return (
                filterArrayBySearchString(searchTag,datasets,dataSummary.searchNames).map(o=>o.dataID) //easier to compare just dataIDs to find intersection.
            )
        })
        let dataIDs = _.intersection(...filteredDataIDs)
        return filterDatasetsByDataIDs(datasets, dataIDs)
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

    const filterDatasetsByDataIDs = (datasets, dataIDs) => {
        // filter the array of objects datasets using another array of dataIDs.
        if (_.isArray(dataIDs) && _.isArray(datasets)) {
            return _.filter(datasets, (datasetProps) => dataIDs.includes(datasetProps.dataID))
        }
        return []
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

    return(
        <div className="dataset-selection-content">
            <div className="middle-m">
            <MCHeader text="Dataset Selection" fontSize="1.5rem"/>
            </div>
            <MCSearchDatasetsDialog isOpen={searchDialogOpen} onClose={() => setSearchDialogOpen(false)} {...{token, "setFilter" : handleFeatureIDFilter}} /> 
            <div className="hor-aligned-div" style={{minWidth:"100%",paddingRight:"1rem"}}>
                <div style={{width:"100%",display:"flex",alignItems:"center"}}>
                <InputGroup 
                        leftIcon={"filter"} 
                        value={dataSummary.searchString}
                        fill={true}
                        placeholder="Search through datasets. Click enter to add a search tag." 
                        small={true}
                        onChange={onInputChange} 
                        onKeyUp={handleKeyUp}
                        rightElement={<div style={{marginRight:"0.5rem",marginTop:"0.2rem"}}><p>{`${dataSummary.toShow.length}/${dataSummary.raw.length}`}</p></div>}
                />
                </div>
                <div>
                    <Button icon="search" onClick={() => setSearchDialogOpen(true)} small={true} intent="primary"/>
                </div>
                <div>
                    <Button icon="reset" onClick={resetTagsAndFilters} small={true} intent="danger"/>
                </div>
                
            </div>

            <div className="hor-aligned-div">

                {_.isArray(dataSummary.searchTags) ? dataSummary.searchTags.map(searchTag => {
                    return (
                        <div key={searchTag} className="little-m">
                            <Tag
                                intent="primary"
                                onRemove={() => removeSearchTag(searchTag)}
                                interactive={true}>
                                {`${searchTag}`}
                            </Tag>
                        </div>)
                    
                }): null}
            </div>

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
                {isLoading?<p>Loading..</p>:null}
            {dataSummary.toShow.length>0?dataSummary.toShow.map(dataset => {
                return (
                
                    <div
                        key={dataset.dataID}
                        className="dataset-selection-box"
                        onMouseLeave = {(e) => {setMouseOverDataID(undefined)}}
                        onMouseEnter = {(e) => {setMouseOverDataID(dataset.dataID)}}>

                        <div className="little-m"> 
                            <MCHeader
                                text={dataset[dataSummary.headerName]}
                                hexColor={mouseOverDataID === dataset.dataID ? "#2F5597" : mouseOverDataID !== undefined ? "darkgrey" : "#2F5597"}
                                fontSize={"1.15rem"}
                                fontWeight={400} />
                        </div>

                        <div className="dataset-tag-box">
                            {dataSummary.tagNames.map(k => {
                                return (
                                    <div key={k} className="little-m" style={{opacity:mouseOverDataID === dataset.dataID ?"1":"0.5",cursor:"default"}}>
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
            }):<div><p>No datasets returned from API.</p></div>}
            </div>


         </div>
    )

}