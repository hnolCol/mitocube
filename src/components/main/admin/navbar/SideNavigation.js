import { Button, Navbar, NavbarGroup, H1 } from "@blueprintjs/core";
import _ from "lodash";
import { Link } from "react-router-dom";
import { MCDatasetDashIcon, MCDatasetSearchIcon, MCSubmissionIconDash } from "../../../icon/MCMainIcons";



export function MCAdminSideNavigation(props) {
    
    const {logoutAdmin} = props 

    return (
        <div className="admin-navbar">
            {["Submissions", "Performance", "Datasets"].map(v => 
                <div key={v} className="admin-nav-box">
                <Link style={{textDecoration: "none"}} to = {`/admin/${v.toLowerCase()}`}>
                        {v}
                </Link>
            </div>)}
            
            <div>
                
           </div>

        </div>
        // <Navbar>
        //     <NavbarGroup >

        //         <Button icon="log-out" onClick={_.isFunction(logoutAdmin) ? () => logoutAdmin() : undefined} minimal={true} />
        //     </NavbarGroup>
        // </Navbar>
        
    )
}