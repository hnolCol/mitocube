import _ from "lodash";
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
        "type": "Array",
        "example": ["Submitted", "Processed", "Measuring", "Data analysis", "Done"],
        "info": "The states a submission can have. Each state change will be tracked in a submission json file. The user is notified upon change via email.",
        "dependsOn": "Submission must contain an 'Email' param",
        "resources": []
    }
]


// "submission-states" : ["Submitted","Processed","Measuring","Data analysis","Done"], 
//         "submission-search-columns" : ["Material","Organism","dataID","Title","Email","Type","Experimentator"],
//         "submission-tags" : ["Experimentator","Email","Type","Organism","Material","dataID"],
//         "submission-summary-short" : [

function MCParameterDoc(props) {
    const { paramName, type, example, info } = props
     return (
         <div className="middle-m white-bg">
             <p>{paramName}</p>
             <ReactJson name={false} displayObjectSize={false} src={{"example" : example}}/>
             <p>{info}</p>
        </div>
    )
}

export function MCConfigHelp() {
    
    let configHeaders = _.uniq(_.map(CONFIG_PARAMS,param => param.section))
    return (
        <div className="help-installation-container">
            <MCHeader text="MitoCube App Config" fontSize="1.5rem" />
            <p></p>
            <div className="help-info-content">
                {configHeaders.map(configHeader => 
                    <div key={configHeader} className="middle-m">
                        <MCHeader text={configHeader} />
                        {_.filter(CONFIG_PARAMS, param => param.section === configHeader).map(param => {
                            return (
                                <MCParameterDoc key={param.paramName} {...param} />
                            )
                        })}
                    </div>
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