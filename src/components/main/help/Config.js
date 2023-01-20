import { InputGroup } from "@blueprintjs/core";
import _ from "lodash";
import { useMemo, useState } from "react";
import ReactJson from "react-json-view";
import { MCHeader } from "../../utils/components/MCHeader";


const CONFIG_PARAMS = [
    {
        "section" : "Token",
        "paramName": "token-valid(h)",
        "type": "Integer",
        "example": 24,
        "info": "The number of hours the general access tokens (entry and admin) will be valid. If expired, the user will have to enter the website-password again.",
        "resources": []
    },
    {
        "section" : "Token",
        "paramName": "share-token-valid(h)",
        "type": "Integer",
        "example": 3000,
        "info": "The number of hours a share token is valid which allows to share performance data.",
        "resources": []
    },
    
    {
        "section" : "Email",
        "paramName": "email-sever-settings",
        "type": "Object[String,Any]",
        "example": {
            "MAIL_SERVER": "mail.privateemail.com", 
            "MAIL_PORT": 465, 
            "MAIL_USERNAME": "support@mitocube.com", 
            "MAIL_USE_TLS": 0, 
            "MAIL_USE_SSL": 1,
            "MAIL_DEFAULT_SENDER" : "support@mitocube.com"
        },
        "info": "Configuration for sending emails via Flask-Mail. The password should be placed in the .env file.",
        "resources": []
    },
    {
        "section" : "Email",
        "paramName": "email-pw",
        "type": "String",
        "example": "email-pw",
        "info": "The parameter name in the .env file providing the email account password.",
        "resources": []
    },
    {
        "section" : "Email",
        "paramName": "email-cc-submission-list",
        "type": "Array[String]",
        "example": ["email1@mitocube.com","email2@mitocube.com"],
        "info": "An array of email adresses that will be placed in 'cc for every email that is sent.",
        "resources": []
    },
    {
        "section" : "Submission",
        "paramName": "submission-states",
        "type": "Array[String]",
        "example": ["Submitted", "Processed", "Measuring", "Data analysis", "Done"],
        "info": "The states a submission can have. Each state change will be tracked in a submission json file. The user is notified upon change via email.",
        "dependsOn": "Submission must contain an 'Email' param",
        "resources": []
    },
    {
        "section" : "Submission",
        "paramName": "submission-search-columns",
        "type": "Array[String]",
        "example": ["Material","Organism","dataID","Title","Email","Type","Experimentator"],
        "info": "The parameter names that are used to find matches upon a string search throughout the submissions. The parameter names shoudl be included in a submission json file and should be available.",
        "dependsOn": "The search columns should be present in the submission json file and hence must be requested by users within the sample submission process. Hence, the parameter must be defined in the 'submission-details'.",
        "resources": []
    },
    {
        "section" : "Submission",
        "paramName": "submission-tags",
        "type": "Array[String]",
        "example": ["Experimentator","Email","Type","Organism","Material","dataID"],
        "info": "The submission parameter names that are displayed at tags at each submission item in the admin view.",
        "dependsOn": "The search columns should be present in the submission json file and hence must be requested by users within the sample submission process. Hence, the parameter must be defined in the 'submission-details'.",
        "resources": []
    },
]


//         "submission-tags" : ["Experimentator","Email","Type","Organism","Material","dataID"],
//         "submission-summary-short" : [

// "detail-params" : ["Creation Date","Title","Experimentator","Type","Organism","Material","groupingNames","Number Samples","Number Replicates","Number Groupings","Experimental Info"],
// "dataset-tag-names" : ["Creation Date","Type","Experimentator","Organism","Material","Number Samples","dataID"],
// "dataset-search-names" : ["Creation Date","Type","Experimentator","Organism","Material","dataID","Title"],
// "dataset-header" : "Title",
// "dataset-presentation" : ["Creation Date","Title","Material","Type","Organism","Experimentator","Number Samples"],
// "dataset-presentation-sort-by" : ["Organism","Type","Creation Date"],




function MCParameterDoc(props) {
    const { paramName, type, example, info } = props
     return (
         <div className="middle-m white-bg">
             <MCHeader text={paramName} fontSize="0.9rem" hexColor="#000000"/>
             <div className="hor-aligned-div">
                 <div style={{ width: "60%", paddingRight:"2rem"}}>
                 <h5>Explanation</h5>
                 <p>{info}</p>
                 </div>
                 <div>
                 <h5>Example</h5>
                 <ReactJson name={false} displayObjectSize={false} src={{ [paramName] : example }} quotesOnKeys={false} />
                 </div>
             </div>
             
             
        </div>
    )
}

export function MCConfigHelp() {
    const [search, setSearchString] = useState({searchString : ""})
    let configHeaders = _.uniq(_.map(CONFIG_PARAMS, param => param.section))

    let configParamaeters = useMemo(() => {
        let searchString = search.searchString
        if (searchString === undefined) return []
        if (searchString === "") return CONFIG_PARAMS
        let filteredParams = _.filter(CONFIG_PARAMS, param => param.paramName.includes(searchString))
        return filteredParams 
    }, [search.searchString])
    
    
    const handleSearchInput = (e) => {
        let searchString = e.target.value
        
        setSearchString(prevValues => { return {...prevValues,searchString} })

    }

    return (
        <div className="help-installation-container">
            <MCHeader text="MitoCube App Config" fontSize="1.5rem" />
            <InputGroup placeholder="Search config parameter.." onChange={handleSearchInput} value={search.searchString} />
            <div className="help-info-content">
                {configHeaders.map(configHeader => {
                    let params = _.filter(configParamaeters, param => param.section === configHeader)
                    if (params.length === 0) return null
                    return(
                    <div key={configHeader} className="middle-m">
                        <MCHeader text={configHeader} fontSize="1rem"/>
                        {params.map(param => {
                            return (
                                <MCParameterDoc key={param.paramName} {...param} />
                            )
                        })}
                    </div>)}
                    )}
                {/* <MCHeader text="General"/>
                <MCHeader text="Protein"/>
                <MCHeader text="Dataset" />
                <MCHeader text="PTM (Post translational modification)" />
                <MCHeader text="Submission" />
                <MCHeader text="Security (Admin)"/>
                <MCHeader text="Submission (Admin)" />
                <MCHeader text="Performance (Admin)" /> */}
                
            </div>
            
        </div>
    )
}