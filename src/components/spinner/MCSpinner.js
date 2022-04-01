

import { motion } from "framer-motion";
import { Text } from '@visx/text';
const icon = {
    hidden: { pathLength: 0, opacity:0.1, },
    visible: {
      pathLength: 1,
      opacity: 1,
      
      transition: {
        pathLength: { delay : 0, type: "linear", duration: 2.5, bounce: 0, repeat: Infinity,repeatType: "mirror"},
        opacity: { delay : 0, type: "spring", duration: 2.5, bounce: 0.1, repeat: Infinity,repeatType: "mirror"},
      }
    }
  }


const check = {
  hidden: { pathLength: 0},
  visible: {
    pathLength: 1,
    
    transition: {
      pathLength: { delay : 0, type: "linear", duration: 1, bounce: 0},
     
    }
  }
}


const cubeCoords = {"rect1":[[5.66,6.66],[0.03,3.37], [0.03,9.94],[5.69,13.22]],
                    "rect2":[[5.66,6.66],[5.69,13.22], [11.32,9.94], [11.26,3.37]],
                    "rect3":[[5.66,6.66], [11.26,3.37], [5.57,0.09], [0,3.37]]}

const cubeStartingPoints = [{x:0,y:0},{x:5.66,y:3.281},{x:-5.66,y:3.281},{x:0,y:6.565},{x:0,y:-6.564},{x:-5.66,y:-3.281},{x:16.11, y:-8.11},{x:0,y:0}]


const getRectCoords = (id,x,y) => {
  var coordsAsString = ''
  cubeCoords[id].forEach(value => {
      const xCoord = value[0] + x +15
      const yCoord = value[1] + y + 10
      const newString = xCoord + ',' + yCoord + ' '
      coordsAsString =  coordsAsString + newString})
  return (coordsAsString)
}

export const MCSpinner = (props) => {
    
    return(
        <div>
            <motion.svg viewBox="0 0 50 45" width={100} height={100} className={"icon"} xmlns="http://www.w3.org/2000/svg">
      
            
            {cubeStartingPoints.map(coords => {
              return(
              ["rect1","rect2","rect3"].map(v => {
                return(
                  <motion.polygon
                  key = {v}
                  points = {getRectCoords(v,coords.x,coords.y)}
                  strokeWidth={0.5}
                  stroke="black"
                  initial="hidden"
                  animate="visible"
                  fill={props.fillColor}
                  variants={icon}
                  />)
              })
            )})}
            
            <Text x={props.textX} y= {39.5}
                width = {40}
                verticalAnchor="middle"
                textAnchor={props.textAnchor}
                style = {{
                        fontFamily:" -apple-system", 
                        fontSize:"7px",
                        fill: props.fontColor,
                        fontWeight:"300",
                        lineHeight:"1.5"}}>
                                    
                  {props.done?props.doneText:props.initialText}
                                      
            </Text>
                                    
            {props.done?
            <motion.polyline points = "32,35.5 35,39 39,33" strokeWidth={1}
                  stroke="green"
                  initial="hidden"
                  animate="visible"
                  strokeLinecap={"round"}
                  fill={"transparent"}
                  variants={check}/>
                  :null}

    
            </motion.svg>
        </div>
    )

} 

MCSpinner.defaultProps = {
 
        fillColor : "#F6F9FB",
        fontColor : "black",
        done: false,
        initialText : "Loading..",
        doneText : "Done",
        textAnchor : "start",
        textX : 8
}
