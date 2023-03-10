



import { Button } from "@blueprintjs/core";
import { AnimatePresence, motion, useCycle } from "framer-motion";
import _ from "lodash";
import { Link } from "react-router-dom";

const links = [
    { name: "Protein Centric" ,to : "/protein"},
    { name  : "PTM" ,to : "/protein"},
    { name: "Datasets" ,to : "/dataset"},
    { name : "Impressum",to : "/impressum"},
    { name : "Contact",to : "/contac"}
  ];
  
  const itemVariants = {
    closed: {
      opacity: 0
    },
    open: { opacity: 1 }
  };

const sideVariants = {
    closed: {
      transition: {
        staggerChildren: 0.2,
        staggerDirection: -1
      }
    },
    open: {
        
        transition: {
        staggerChildren: 0.2,
        staggerDirection: 1
      }
    }
};
  
export function MCLeftbar(props) {
    const { firstLeveItems, secondLevelItems } = props 
    console.log(secondLevelItems)
    const [open, cycleOpen] = useCycle(false, true);

    return (
        <div>
        <AnimatePresence>
        {open  && (
        <motion.aside
            initial={{ width: 300 }}
            animate={{
            width: 300
            }}
            exit={{
            width: 50,
            transition: { delay: 0.7, duration: 0.3 }
            }}
        >
        <motion.div
            className="leftbar-container"
            initial="closed"
            animate="open"
            exit="closed"
            variants={sideVariants}
            >
                            {links.map(({ name, to, id }) => {
                
                                return (
                                    <div>
                                        <motion.div
                                            key={id}
                                            href={to}
                                            whileHover={{ scale: 1.05 }}
                                            variants={itemVariants}
                                        >
                                            
                                            <Link style={{ textDecoration: "none" }} to={to}>
                                                <Button text={name} minimal={true} small={true} />
                                            </Link>
                                        </motion.div >
                                            {_.has(secondLevelItems, name) && _.isArray(secondLevelItems[name]) ?
                                                secondLevelItems[name].map(secondLevelLink => {
                                                    return (
                                                        <motion.div variants={itemVariants}>
                                                            <Link key={`${name}-${secondLevelItems.name}`} to={"/protein"}>
                                                            {secondLevelLink.name}
                                                            </Link>
                                                        </motion.div>
                                                    )
                                                }
                                                    
                                                )
                                            : null}
                                        
                                    </div>
                                )
                            })}
                </motion.div>
                
        </motion.aside>
        )}
        </AnimatePresence>
            <div className="btn-container">
                <Button rightIcon={open?"arrow-left":"arrow-right"} onClick={cycleOpen} />
        {/* <button onClick={cycleOpen}>{open ? "Close" : "Open"}</button> */}
      </div>
        </div>
        )


}

MCLeftbar.defaultProps = {
    firstLeveItems : [],
    secondLevelItems: {"Datasets" : [{name : "asd23asd"}]}
}