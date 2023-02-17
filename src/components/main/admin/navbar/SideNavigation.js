import { Button, Navbar, NavbarGroup } from "@blueprintjs/core";
import _ from "lodash";
import { MCDatasetDashIcon, MCDatasetSearchIcon, MCSubmissionIconDash } from "../../../icon/MCMainIcons";



export function MCAdminSideNavigation(props) {
    
    const {logoutAdmin} = props 

    return (
        <div className="admin-navbar">
            <div className="admin-header">
                Admin
            </div>
            <MCSubmissionIconDash />
            <MCDatasetDashIcon />
            
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