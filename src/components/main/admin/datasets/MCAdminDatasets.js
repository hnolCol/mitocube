
import { Alert, Button, Icon, InputGroup } from "@blueprintjs/core"
import axios from "axios"
import _ from "lodash"
import { useEffect, useState } from "react"
import {useQuery} from "react-query"
import useDebounce from "../../../../hooks/useDebounce"
import { MCHeader } from "../../../utils/components/MCHeader"
import { MCTagContainer } from "../../../utils/components/MCTagContainer"
import { MCTooltipButton } from "../../../utils/components/MCTooltipButton"
import { fromGroupingsToGroupMapper } from "../../../utils/Groupings"
import { arrayOfObjectsToTabDel, downloadJSONFile, downloadTxtFile } from "../../../utils/Misc"
import { MCSimpleResponseCheck } from "../../../utils/ResponseChecks"
import { MCSubmissionOverviewDialog } from "../submission/MCSubmissionDialogs"
import { filterArrayBySearchString, filterDatasetsByDataIDs, handleSearchTagBasedFiltering } from "../../../utils/Filter";
import { Link } from "react-router-dom"



export function MCAdminDatasets(props) {

    const { logoutAdmin, token } = props

    const [datasetItems, setDatasetItems] = useState({ itemsToShow: [], headers: [], items: [], lastSearch: {}, emailParamName: "" })
    const [alertDetails, setAlertDetails] = useState({isOpen : false, children : <div></div>, cancelButtonText : "", confirmButtonText : "Ok"})
    const [searchDetails, setSearchDetails] = useState({searchString : "", searchTags : []})
    const [errorMsg, setErrorMsg] = useState("") 
    const [topButtonLoading, setTopButtonLoadings] = useState({"paramsExample":false,"datasetExample":false,"addDataset" : false})
    const [datasetDialog, setDatasetDialog] = useState({isOpen:false,params:{},paramNames:[],onClose : () => console.log("close")})
    const debouncedSearchString = useDebounce(searchDetails.searchString, 200)
    

    const getDatasetParameters = async () => {
        // get dataset parameters
        const res = await axios.get('/api/admin/datasets', { params: { token } })
        return res.data
    }
    
    const { isLoading, isFetching, error } = useQuery(["getAdminDatasets", token], getDatasetParameters, {
        refetchOnWindowFocus : false,
        onSuccess: (data) => {
            if (_.has(data, "success") && !data["success"]) {
                if (!data["adminIsValid"]) {
                    logoutAdmin()
                }
                else {
                    setErrorMsg(data["msg"])
                }
            }
            else if (_.has(data, "success") && data["success"]) {
                // success 
                let responseData = data.data
                if (!_.isArray(responseData.params) || !_.isArray(responseData.tableHeader) ) {
                    setErrorMsg("API returned data that do not match the expected type.")
                    return 
                }
                setDatasetItems(prevValues => {
                    return {
                        ...prevValues,
                        itemsToShow: responseData.params,
                        headers: _.concat(responseData.tableHeader,["Actions"]),
                        items: responseData.params.slice(),
                        emailParamName : responseData.emailParamName,
                        lastSearch: {}
                    }
                })
            }
            }
    })

    useEffect(() => {
        // debounce string effect
        var filteredArray = []
        if (debouncedSearchString === "" && _.isArray(searchDetails.searchTags) && searchDetails.searchTags.length > 0) {
            filteredArray = handleSearchTagBasedFiltering(datasetItems.items,searchDetails.searchTags,datasetItems.headers)
        }
        else if (debouncedSearchString !== "") {
            filteredArray = filterArrayBySearchString(debouncedSearchString, datasetItems.items, datasetItems.headers)
        }
        else {
            filteredArray = datasetItems.items.slice()
        }
        
        setDatasetItems(prevValues => {return {...prevValues,"itemsToShow":filteredArray}})

    },[debouncedSearchString,datasetItems.items,datasetItems.headers])
        
    const handleDelete = async (dataID) => {

        const res = await axios.delete('/api/dataset', { data: { token: token, dataID: dataID } })
        
        
        // more checking! 
        let updatedDataParams = res.data.data.params
        if (debouncedSearchString !== "") {
            let filteredArray = filterArrayBySearchString(debouncedSearchString, updatedDataParams, datasetItems.headers)
            //handle data filtering if string is entered
            setDatasetItems(prevValues => {
                return {
                    ...prevValues,
                    "items": updatedDataParams,
                    "itemsToShow": filteredArray
                }
            })
        }
        else {
            setDatasetItems(prevValues => {
                return {
                    ...prevValues,
                    "items": updatedDataParams,
                    "itemsToShow": updatedDataParams.slice()
                }
            })
        }
    }

    
    const downloadDataset = async (dataID, paramsFile) => {
        
        const res = await axios.get('/api/dataset',{params:{...{token,dataID}}})
        if (MCSimpleResponseCheck(res.data)) {
            let datasetData = res.data.data
            if (_.isArray(datasetData) && _.isObject(datasetData[0])) {
                let headers = Object.keys(datasetData[0])
                let groupingMapper = fromGroupingsToGroupMapper(paramsFile)
                
                downloadTxtFile(arrayOfObjectsToTabDel(res.data.data,headers,groupingMapper),`dataset-${dataID}.txt`)
            }
            
            console.log(res.data)
        }
    }
    const handleView = (dataID, paramsFile, paramNames) => {
        setDatasetDialog(prevValues => {return {...prevValues,isOpen:true,paramsFile,paramNames,dataID,onClose:closeDialog}})
    }

    const closeDialog = () => {
        setDatasetDialog(prevValues => {
            return { ...prevValues, isOpen: false }
        })
    }
    const handleKeyUp = (e) => {
        // just add the tag upon enter
        if (e.code === "Enter") {
            handleSearchTag(searchDetails.searchString)
        }
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
       // let itemsToShow = handleSearchTagBasedFiltering(datasetItems.items,updatedSearchTags,datasetItems.headers)
        setSearchDetails(prevValues => { return { ...prevValues, searchTags: updatedSearchTags, searchString: "" } })

        if (removeFromTags) {
            
            let itemsToShow = updatedSearchTags.length === 0 ? datasetItems.items.slice(): handleSearchTagBasedFiltering(datasetItems.items, updatedSearchTags, datasetItems.headers)
            
            setDatasetItems(prevValues => {
                return {
                    ...prevValues,
                    "itemsToShow": itemsToShow
                }
            })
        }
        
    }
    const removeSearchTag = (searchTag) => {
        handleSearchTag(searchTag,true) //true = removeFromTags
    }
    const handleSort = (headerText) => {

        if (datasetItems.headers.includes(headerText)) {
            var lastSearch = {}
            
            if (!_.has(datasetItems.lastSearch, headerText)){ 
                lastSearch = {...datasetItems.lastSearch,[headerText] : "asc"}
            }
            else if (datasetItems.lastSearch[headerText] === "asc") {
                lastSearch = {...datasetItems.lastSearch,[headerText] : "desc"}
            }
            else if (datasetItems.lastSearch[headerText] === "desc") {
                lastSearch = { ...datasetItems.lastSearch }
                delete lastSearch[headerText]
            }

            var itemsSorted = []
            if (!_.isEmpty(lastSearch)) {
                itemsSorted = _.orderBy(datasetItems.itemsToShow, Object.keys(lastSearch), Object.values(lastSearch))
            }
            else{
                itemsSorted = datasetItems.items.slice() //original order
            }
            
            setDatasetItems(prevValues => {return {...prevValues, "itemsToShow" : itemsSorted, lastSearch}})
        }
    }
    

    const fetchAndDownloadParamExample = (e) => {   
        setTopButtonLoadings(prevValues => {return {...prevValues,"paramsExample":true}})
        axios.get('/api/dataset/params/example', { params: {token} }).then(response => {
            let responseData = response.data

            
            
            if (MCSimpleResponseCheck(responseData) && _.has(responseData,"paramsFile")) {
                downloadJSONFile(responseData.paramsFile,"paramsExample")
            }
            else if (!responseData["success"]) {
                if (!responseData["tokenIsValid"]) {
                    //if admin token is not valid, logout directly.
                    logoutAdmin()
                    //reset loading
                    setTopButtonLoadings(prevValues => { return { ...prevValues, "paramsExample": false } })
                    return
                }
                setAlertDetails(prevValues => {return {...prevValues, "isOpen" : true, "children" : <div>{responseData["msg"]}</div>}})
            }
            else {
                setAlertDetails(prevValues => {
                    return {
                        ...prevValues,
                        "isOpen": true,
                        "children": <div>API unexpected data.</div>
                    }
                })
            }
            //set loading to false 
            setTopButtonLoadings(prevValues => { return { ...prevValues, "paramsExample": false } })
            
        })
       

    }

    return (
        <div>
            <MCSubmissionOverviewDialog {...datasetDialog} />
            <Alert {...alertDetails} canEscapeKeyCancel={true} onClose ={() => setAlertDetails(prevValues => {return {...prevValues,"isOpen":false}})} />
            <div className="admin-dataset-container">
                <div className="admin-dataset-top-container">
                <MCHeader text="Datasets Manager" />
                <div className="vert-align-div-flexStart">
                <div className="admin-dataset-header">
                            <MCTooltipButton icon="info" content={<p>View Information about datasets in MitoCube.</p>}/>    
                            <MCTooltipButton
                                text="Example (Dataset)"
                                content={<p>Download a dataset example.</p>}
                                loading={topButtonLoading.datasetExample} />
                            <MCTooltipButton
                                text="Example (Params)"
                                content={<p>Download a params.json example which fits to the dataset example.</p>}
                                loading={topButtonLoading.paramsExample}
                                onClick={fetchAndDownloadParamExample} />
                            <MCTooltipButton
                                text="Add new dataset"
                                intent="success"
                                loading={topButtonLoading.addDataset}
                                content={<p>Add a new dataset using the params file annd txt file.</p>} />
                </div>
                <div style={{paddingLeft:"1rem",paddingRight:"1.5rem", width: "100vw"}}>
                        <InputGroup
                            fill={true}
                            placeholder="Search in datasets."
                            onChange={e => setSearchDetails(prevValues => { return { ...prevValues, searchString: e.target.value } })}
                            value={searchDetails.searchString}
                            onKeyUp={handleKeyUp} />
                    
                        <MCTagContainer searchTags={searchDetails.searchTags} handleRemove={removeSearchTag} />
                        
                        {`${datasetItems.items.length} datasets. ${debouncedSearchString!==""?`Filtering (${debouncedSearchString}) matches ${datasetItems.itemsToShow.length} datasets.`:""}`}
                </div>
                </div>
                </div>
                {isLoading || isFetching?
                        <p>Loading / Fetching .. {error} {errorMsg}</p>

                        :
                    <MCAdminDatasetTable
                    {...{
                        items : datasetItems.itemsToShow,           
                        handleSort,
                        lastSearch: datasetItems.lastSearch,
                        headers: datasetItems.headers, 
                        emailParamName: datasetItems.emailParamName,
                                handleDelete,
                                handleView,
                                downloadDataset
                }} />}
                    
                </div>
            </div>
       
    )   
}


function MCAdminDatasetTable(props) {
    const [mouseOverHeader, setMouseOverHeader] = useState("")
    const [mouseOverDataset, setMouseOverDataset] = useState(-1)
    const debouncedMouseOverData = useDebounce(mouseOverDataset,50)
    const { items, headers, lastSearch, handleSort, emailParamName, handleDelete,handleView,downloadDataset} = props


    return (
        <div className="admin-dataset-grid" style={{
        //    gridTemplateColumns: "[col-start] auto".repeat(headers.length),
            gridTemplateRows: "[row-start] 3.5rem".repeat(items.length+1)
            }}>
            <div className="top-right-absolute-container">
                <Link to="/">Home</Link>
            </div>
            {headers.map((headerText, headerIdx) => {
                let searchState = _.has(lastSearch,headerText)?lastSearch[headerText]:undefined
                return (
                    <div
                        className="admin-dataset-grid-left-center-item"
                        key={`headerLabel-${headerIdx}`}
                        style={{
                                    gridColumnStart: `col-start ${headerIdx + 1}`,
                                    gridRowStart: `row-start ${1}`,
                                    backgroundColor : "#2F5597"
                                }}
                            onMouseEnter={() => setMouseOverHeader(headerText)}
                            onMouseLeave={() => setMouseOverHeader("")}
                        >
                        <div>
                                <div className="hor-aligned-center-div-between-space" style={{height:"3rem"}}>
                                    
                                    <div>
                                        <MCHeader text={headerText} fontSize="0.9rem" hexColor="#ffffff"/>
                                    </div>
                                    <div>
                                    {
                                       headerText !== "Actions" && ( mouseOverHeader === headerText || _.has(lastSearch, headerText)) ?
                                            <div className="bp4-dark">
                                            <Button
                                                icon={searchState === undefined ? "sort" : searchState === "asc" ? "sort-asc" : "sort-desc"}
                                                small={true}
                                                minimal={true}
                                                onClick={() => handleSort(headerText)}
                                                intent={searchState !== undefined ? lastSearch[headerText] === "asc" ? "primary" : "danger" : "none"} />
                                                    </div> : null
                                            }
                                </div>
                                </div>
                        </div>
                    </div>
                )
            })}
            {/* add items to table. */}
            {items.map((item, itemidx) => {
                return(
                headers.map((headerText, headerIdx) => {
                    let mouseIsOverThisDataset = itemidx ===debouncedMouseOverData
                    let opacity = mouseIsOverThisDataset || debouncedMouseOverData === -1 ? 1 : 0.55
                    return (
                        <div key={`${itemidx}-${headerIdx}`}
                            className="white-bg admin-dataset-grid-left-center-item"
                            onMouseEnter={() => setMouseOverDataset(itemidx)}
                            onMouseLeave={() => setMouseOverDataset(-1)}
                            style={{
                                opacity: opacity,
                                gridColumnStart: `col-start ${headerIdx + 1}`,
                                gridRowStart: `row-start ${itemidx + 2}`
                                
                            }} >
                        
                            {headerText === "Actions" ?
                                <div className="hor-aligned-div">
                                    {[
                                        {
                                            iconName: "eye-open",
                                            content: <p>View dataset details.</p>,
                                            intent: mouseIsOverThisDataset ? "primary" : "none",
                                            onClick : () => handleView(item.dataID, item, Object.keys(item))},
                                        {
                                            iconName: "envelope",
                                            content: item[emailParamName]===undefined?undefined:<p>Wirte an email to experimentator.</p>,
                                            intent: "none",
                                            disabled : item[emailParamName]===undefined,
                                            onClick: item[emailParamName] !== undefined ? () =>
                                                window.open(`mailto:${_.isArray(item[emailParamName]) ?
                                                        _.join(item[emailParamName], ",") : item[emailParamName]}?subject=MitoCube Dataset Request ${item.dataID}`, "_blank") : undefined
                                        },
                                        {
                                            iconName: "download",
                                            content: <p>Download dataset.</p>,
                                            intent: mouseIsOverThisDataset ? "success" : "none",
                                            onClick : () => downloadDataset(item.dataID,item)
                                        },
                                        {
                                            iconName: "document",
                                            content: <p>Download params json file.</p>,
                                            intent: mouseIsOverThisDataset ? "warning" : "none",
                                            onClick : () => downloadJSONFile(item,`params-${item.dataID}.json`)
                                        },
                                        {
                                            iconName: "trash",
                                            content: <p>Move dataset to archive.</p>,
                                            intent: mouseIsOverThisDataset ? "danger" : "none",
                                            onClick : () => handleDelete(item.dataID)
                                        }].map((buttonProps, buttonIdx) => {
                                            let {iconName, ...rest} = buttonProps
                                            return (
                                                <MCTooltipButton
                                                    key={`headetTooltip-${buttonIdx}`}
                                                    icon={<Icon icon={iconName} iconSize={14} />}
                                                    {...rest}
                                                    />)
                                        })}
                                    
                                        {/* intent= {mouseIsOverThisDataset?"primary":"none"} />
                                    <MCTooltipButton icon={<Icon icon="download" iconSize={14}/>} content={<p>Download dataset.</p>} intent= {mouseIsOverThisDataset?"success":"none"}/>
                                    <MCTooltipButton icon={<Icon icon="document" iconSize={14}/>} content={<p>Download params json file.</p>} intent= {mouseIsOverThisDataset?"warning":"none"}/> */}
                                </div>
                                :
                                <div>
                                    <div>
                                        {item[headerText]}
                                    </div>
                                </div>}
                        </div>
                    )
                }))})}
        </div>
    )
}