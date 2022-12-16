import { motion } from "framer-motion"
import { animate } from 'framer-motion';
import { Text } from "@visx/text";
import { useState, useEffect } from "react";
import _ from "lodash";


export const useAnimatedCounter = (
  maxValue = 80,
  initialValue = 0,
  duration = 1.2,
) => {
  const [counter, setCounter] = useState(initialValue);

  useEffect(() => {
    const controls = animate(initialValue, maxValue, {
      duration,
      onUpdate(value) {
        setCounter(value);
      }
    });
    return () => controls.stop();
  }, [initialValue, maxValue, duration]);

  return counter;
}
const darkgreen = '#8cc585';
//const lightgreen = '#e4ebdf';
const darkred = "#ad3025"
const darkorange = "#e94d40";


export function MCAnimatedPercentage (props) {
    const {perc,showValue, metricName,backgroundCircleColor, fontSizeValue, fontSizeMetric, width, height, scale, strokeWidth, enableHover, handleClick, handleHover, extraText, clicked} = props
    const [showText, setShowText] = useState(false)
    
    
    const r = width/(Math.PI*1.1)
    const counterValue = useAnimatedCounter(perc*100)
    const cy = height / 2 - 0.10*height
    const cx = width / 2
    const texty = cy + r*1.1 + 8

    const circleFill = {
        hidden: {
            pathLength : 0,
            
            },
        visible: {
            pathLength : perc,
            
            transition: {
                pathLength: { 
                    delay : 0.1, 
                    type: "spring", 
                    duration: 1.5, 
                    bounce: 0.1}
            }
        }
    }

    const getFillColor = (perc) => {
        if (perc > 0.75) return darkgreen
        if (perc > 0.5) return darkorange
        return darkred

    }

    const handleHoverItem = (mouseOverItem) => {
        setShowText(mouseOverItem)
        if (_.isFunction(handleHover)) handleHover(metricName)
        
    }

    const handleClickOnItem = (e) => {
         if (handleClick!==undefined&&_.isFunction(handleClick))
         {
            handleClick(metricName)
            
        }
    }   

    return(
        
        <motion.svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
            <motion.g 
                whileHover={scale?{ scale: 1.1}:undefined}
                onMouseEnter = {e => handleHoverItem(true)}
                onMouseLeave = {e => handleHoverItem(false)}
                onClick  = {handleClickOnItem}
                >
                <circle cx = {cx } cy = {cy} r = {r} stroke={backgroundCircleColor} strokeWidth={strokeWidth} fill="transparent"/>
                <motion.circle 
                    cx = {cx } 
                    cy = {cy} 
                    r = {r} 
                    transform = {`rotate(-90 ${cx} ${cy})`}
                    stroke={getFillColor(perc)} 
                    strokeWidth={strokeWidth} 
                    pathLength={1}
                    initial="hidden"
                    animate="visible"
                    fill = "transparent"
                    variants={circleFill}/>
                    {showValue?
                        <g>
                        <Text 
                            x = {cx} 
                            y={cy}
                            fontSize={fontSizeValue}
                            fontWeight={500}
                            verticalAnchor="middle"
                            textAnchor="middle"
                            cursor={"default"}>
                                {`${Math.round(counterValue)}%`}
                        </Text>
                        {extraText!==undefined && enableHover && showText?<Text 
                            x = {cx} 
                            y={cy+fontSizeValue}
                            fontSize={9}
                            fontWeight={500}
                            verticalAnchor="middle"
                            textAnchor="middle"
                            cursor={"default"}>
                                {`${extraText}`}
                        </Text>:null}
                        </g>:null}
                    
                
            </motion.g> 
            {(showText && enableHover) || clicked?
                    <Text 
                        x = {cx} 
                        y={texty }
                        fontSize={fontSizeMetric}
                        fontWeight={400}
                        verticalAnchor="start"
                        textAnchor="middle"
                        cursor={"default"}
                        width={width * 0.7}>
                            {metricName}
                    </Text>:null}
        </motion.svg>
       
    )

}

MCAnimatedPercentage.defaultProps = {
    perc : 0.75,
    showValue: true,
    scale : true,
    enableHover : true,
    handleHover : undefined,
    handleClick : undefined,
    extraText : undefined,
    strokeWidth : 8,
    width : 100,
    height : 110,
    fontSizeValue : 12,
    fontSizeMetric : 12,
    metricName : "#Peptides",
    backgroundCircleColor : "white"
}