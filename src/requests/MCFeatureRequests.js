import axios from "axios"

export async function getFeatureDetails (filter, token) {
        //fetch data from api
        const res = await axios.post("/api/features/details",
                        { filter: filter, token: token }, 
                        { headers: { 'Content-Type': 'application/json' } })
        
        return res.data

    }