


import { MCItemView } from "./MCItemView";
import { MCItemHeaders } from "./MCItemHeader";
import { useQuery } from "react-query";
import axios from "axios";
import _ from "lodash"
import { useMemo, useState } from "react";

export function MCItemConfiguration(props) {
    const { token, url } = props
    const [selectedHeader, setSelectedHeader] = useState(undefined)
    console.log(url)
    const getConfigItems = async () => {

        const res = await axios.get(
            url, {
            headers: {
                'Authorization': `${token.token_type} ${token.access_token}`
            }
        })
        return res.data
    }

    const { isLoading, isError, error, data } = useQuery(["getConfigItems"], getConfigItems)

    
    const selectedHeaderData = useMemo(() => {
        if (!_.isArray(data)) return []
        return data.filter(v => v.itemHeader === selectedHeader)[0]
    }, [selectedHeader])

    return (
        isLoading ? <p>Loading..</p> : isError ? <p>Error {JSON.stringify(error.response)}</p> : 
            _.isArray(data) ? 
                    <div className="hor-aligned-div" style={{height : "100%", overflowY:"hidden"}}>
                    <MCItemHeaders headers={data.map(v => v.itemHeader)} onHeaderSelection={setSelectedHeader} selectedHeader={selectedHeader} />
                    <div style={{ margin: "2rem" }}>
                        {selectedHeader !== undefined?
                            <MCItemView
                                token={token}
                                itemHeader={selectedHeader}
                                url={selectedHeaderData["url"]}
                                urlInputFields={selectedHeaderData["urlInputField"]} /> : null}
                    </div>
        </div> : null
    )
}

// itemName : "Column",
// url: "/api/v1/instruments/column",
// urlInputFields : "/api/v1/frontend/input_fields/user"

MCItemConfiguration.defaultProps = {
    token: { "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoiNkZWdFFpRW9JZ1lIIiwicm9sZSI6ImFkbWluIiwiZXhwIjoxNjc5NjkyNTUwfQ.-SfNrwvFcEEE9SEV0C6pUypEHH2nqgADtLtguEd2TfU", token_type: "Bearer" },
    url : "/api/v1/frontend/configuration/items"
}