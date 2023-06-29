import { Button, Icon, Menu } from "@blueprintjs/core";
import { AnimatePresence, motion, useCycle, useAnimationControls, useAnimation } from "framer-motion";
import _ from "lodash";
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ElectrosrayPerformanceIcon, NonControlledSample, PerformanceMonitor, DatasetIcon } from "./ProjectState";
import { MCAnimatedText } from "../input/MCStaggeredText";

function ProteinIcon({ connect_n_neighbors = 5, strokeColor = "#1d1d1b", defaultFill = "#cac9c9" , fillColor = "#466688"}) {
  // mainNodes are connected using the n closest nodes (connect_n_neighbors)
  const smallerNodes = []
  // const mainNodes = [
  //   { cx: 6, cy: 25 },
  //   { cx: 12, cy: 32 },
  //   { cx: 15, cy: 38 },
  //   { cx: 16.3, cy: 5.73 },
  //   { cx: 18.22, cy: 15.9 },
  //   { cx: 29.17, cy: 15.1 },
  //   { cx: 33.6, cy: 35.1 },
  //   { cx: 41.5, cy: 13.5 },
  //   { cx: 43.34, cy: 31.53 }]
  
  const mainNodes = useMemo (() => _.range(8).map(rangeIdx => {return {cx : _.random(5,45), cy : _.random(5,45)}}), [])
  
  const lines = useMemo (() => _.flatten(mainNodes.map(point => _.sortBy(_.map(mainNodes, function (otherPoint) {
        let distance = Math.sqrt((point.cx - otherPoint.cx) ** 2 + (point.cy - otherPoint.cy) ** 2)
        otherPoint["distance"] = distance
        if (distance > 25) return null 
        return otherPoint
      }), "distance").slice(1, connect_n_neighbors).map(otherPoint => {
        if (otherPoint === null) return undefined
        return {
          x1: point.cx,
          y1: point.cy,
          x2: otherPoint.cx,
          y2: otherPoint.cy,
          stroke: "black",
          strokeWidth : 0.2
        }
      }))), [connect_n_neighbors]) 



  return (
<motion.svg xmlns="http://www.w3.org/2000/svg" width="50" height="50" viewBox="0 0 50 50">
  
      {lines.map((lineProps, lineIdx) => lineProps !== undefined ? <line {...lineProps} key={`line-noces-${lineIdx}`} /> : null)}
      {mainNodes.map((nodeProps, nodeIdx) => {
      
        return(
          <motion.circle
          key = {`${nodeIdx}-circle`}
            {...nodeProps}
            r={3}
            fill={defaultFill}
            stroke={strokeColor}
            strokeWidth={0.25}
            animate={{ fill : fillColor, r : _.random(2,5)}}
            transition={{ repeat: Infinity, repeatType: "reverse", duration: 3, repeatDelay : 0, delay : nodeIdx * 3 }}
          />
            // 
            // 
    )})}
</motion.svg>
  );
}


const icons = {
  Electrospray: ElectrosrayPerformanceIcon,
  Sample: NonControlledSample,
  Protein: ProteinIcon,
  Performance: PerformanceMonitor,
  Dataset : DatasetIcon
}

function getIcon(iconName,iconProps) {
  if (_.has(icons, iconName)) {
    const MenuIcon = icons[iconName]
    return <MenuIcon {...iconProps}/>
  }
}

const items = [
    {
      text: 'Your profile',
      icon: 'fas fa-user'
    },
    {
      text: 'Team',
      icon: 'fas fa-user-friends'
    },
    {
      text: 'Add contact',
      icon: 'fas fa-user-plus'
    },
    {
      text: 'Chats',
      icon: 'fas fa-comment-dots'
    },
    {
      text: false
    },
    {
      text: 'Files',
      icon: 'fas fa-folder'
    },
    {
      text: 'New file',
      icon: 'fas fa-file-medical'
    }
  ]
const links = [
    { name: "Protein" ,to : "/protein"},
    { name  : "PTM" ,to : "/ptm"},
    { name: "Datasets" ,to : "/dataset"},
    { name : "Impressum",to : "/impressum"},
    { name : "Contact",to : "/contac"}
  ];

const containerVariants = {
    opened: { width: '20rem' },
    closed: { width: '7rem' }
}

const menuItemVariants = {
  initial: {
    opacity: 0
  },
  visible: (i) => {
    return {
      opacity: 1,
      transition: {
        duration: 1,
        ease: 'easeIn',

      }
    }
  },
  hidden :  {
    opacity: 0,
    transition: {
      duration: 1,
      ease: [.1, 1, .57, 1]
    }
  }
}
// const menuIconVariants = {
//   opened: i => ({
//     x: [0, i*2.4, 0],
//   }), 
//   closed: i => ({
//     x: [0, -i*2.4, 0],
//   })
// }
const menuIconVariants = {
  visible: {}, 
  hidden: {}
}
  




const MenuItem = ({ isOpened, i, item =  { text : "Sample Submission", iconName : "Sample" } }) => {

  const controls = useAnimation()
  const [mouseOver, setMouseOver] = useState(false)

  const handleMouseEnter = () => {
    controls.start({ left: "4rem", opacity: 1, transition: { duration: 0.7, delay: 0.2, type: "spring" } })
    setMouseOver(true)
  }
  const handleMouseLeave = () => {
    controls.start({ left: "0rem", opacity: 0, transition: { duration: 0.4 } })
    setMouseOver(false)
  }
    return (
      // <motion.div 
      //   style={{width:"7rem"}}
      //   className="option-container"
      //   variants={menuIconVariants}
      //   custom={i}
      //   transition={{ duration: .8}}
      // >
      //   {/* <NonControlledSample width={50} height={50} xstart={5} ystart={5}/> */}
      //   <Link to="/protein" style={{display:"flex", alignItems:"center",textDecoration:"none",color:"black"}}>
      
      

      <div>
         
            <motion.div 
          style={{
            zIndex: 3,
            position: "relative",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginTop: "0.5rem",
            marginBottom: "0.5rem",
            marginLeft: "0.3rem",
            marginRight: "0.3rem",
            cursor: "default"
          }}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          >
       
          <motion.div animate={controls}
            style={{
              opacity: 0,
              position: "absolute",
              top : "0.2rem",
              left: "0rem",
              width: "7rem",
              height: "50px",
              backgroundColor: "#efefef",
              zIndex: 1,
              borderTopRightRadius: "0.3rem",
              borderBottomRightRadius: "0.3rem",
              display: "flex",
              fontSize : "1rem",
              alignItems: "center",
              justifyContent: "flex-start",
              boxShadow: "rgba(0, 0, 0, 0.15) 1.95px 1.95px 2.6px",
              paddingLeft: "0.3rem",
              
            }}
            >
              <div>{item.text} </div> 
          </motion.div >  
          <div
            
            >
            {/* <ElectrosrayPerformanceIcon width={80} height={50} /> */}
            {getIcon(item.iconName, { width: 50, height: 50, ystart: 8, xstart: 7, fillColor : mouseOver ? "#047433" : "#466688"})}
            {/* <NonControlledSample width={50} height={50} ystart={5} xstart={5}/> */}
            </div>
            </motion.div>
            
       
          </div>
      // </motion.div>      
      
    );
  }
  
export function MCLeftbar({ firstLevelItems = [], secondLevelItems = {} }) {
  console.log(firstLevelItems)
  const [isOpened, toggleContainer] = useCycle(false,true)
  const containerControls = useAnimation()
  
  // const containerVariants = {
  //   hidden: {
  //     height : "2rem",
  //     width: "3rem",
  //     backgroundColor : "#efefef"
  //   },
  //   visible: {
  //     height : "12rem",
  //     width: "12rem",
  //     backgroundColor : "#efefef"
  //   }
  // }

  useEffect(() => {
    if (!isOpened) {
      containerControls.start("hidden")
    }
    else {
      containerControls.start("visible")
    }
  }, [isOpened, containerControls])
  
  return (
    <div>
    
    <motion.div
      className="left-container"
      // initial="iconview"
      // style={{height:"2rem",width:"3rem"}}
      // animate={containerControls}
      // variants={containerVariants}
      transition={{duration: 1, type:"tween", staggerChildren : 1, delayChildren: 0.6, staggerDirection : isOpened?1:-1}}
    >
      {/* <Chevron callbackFn={toggleContainer}/> */}
      {firstLevelItems.map((firstLevelItem, fItemIdx) => {

        return (
         
            <MenuItem
              key={`${fItemIdx}${firstLevelItem.name}`}
              isOpened={isOpened}
              i={fItemIdx}
              item={{ text: firstLevelItem.name, iconName : firstLevelItem.iconName}} />
         
          
        )
      })}
      </motion.div>
      </div>
  )
}

MCLeftbar.defaultProps = {
  firstLevelItems : [{name : "Dataset View", to : "/dataset", iconName : "Dataset"}, {name : "Protein View", to : "/protein", iconName : "Protein"},{name : "Performance Monitoring", to : "/performance", iconName : "Performance"},{name : "Sample Submission", to : "/submission", iconName : "Sample"}, {name : "Performance", to : "/performance", iconName : "Electrospray"}]
}



//   const containerVariants = {
//     opened: { width: '20rem' },
//     closed: { width: '8rem' }
//   }





function Chevron({callbackFn, strokeColor = "black", strokeWidth = 0.8}) {
  const [isOpened, toggleOpen] = useCycle(false,true)
  const ctrls = useAnimationControls()

  const toggleOnClick = () => {
    toggleOpen()
    callbackFn()

  }
  const lineVariants = {
    opened: (i) => { return i === 0 ? { y1: 5, y2: 20 } : {y1 : 35, y2 : 20} },
    closed: (i) => { return i === 0 ? { y1: 20, y2: 5 } : {y1 : 20, y2 : 35} }
  }

  useEffect(() => {
    if (isOpened) {
      ctrls.start("closed")
    }
    else {
      ctrls.start("opened")
    }
  }, [isOpened,ctrls])
  
  return (
    <motion.svg
      width={20}
      height={20}
      viewBox={"0 0 40 40"}
      onMouseEnter={() => ctrls.start({ strokeWidth: 1.3, stroke: "blue"})}
      onMouseLeave={() => ctrls.start({ strokeWidth: strokeWidth, stroke: strokeColor})}
      onMouseUp={toggleOnClick}>
      <motion.g variants={lineVariants}>
        {[{ x1: 10, x2: 30, y1: 20, y2: 5 }, { x1: 10, x2: 30, y1: 20, y2: 35 }].map((chevLine,chevIdx) => {
          return (
            <motion.line
              {...chevLine}
              stroke={strokeColor}
              strokeWidth={strokeWidth}
              animate={ctrls}
              variants={lineVariants}
              custom={chevIdx}
              strokeLinecap={"round"}
              />
          )
        })}
   
        </motion.g>
    </motion.svg>
    
  )
}
