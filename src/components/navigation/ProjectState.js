import { Text } from "@visx/text";
import { AnimatePresence, motion, useAnimationControls, useCycle, useInView } from "framer-motion";
import { useState, useRef, useEffect, useMemo } from "react";
import _ from "lodash"

{/* <polyline points="11.57 19.44 18.66 13.89 25.74 9.44 32.83 15.95 39.91 11.66" fill="none" stroke="#878787" stroke-miterlimit="10" stroke-width="0.3"/>
    <rect x="3.33" y="5.55" width="43.34" height="31.12" rx="1.9" fill="none" stroke="#1d1d1b" stroke-miterlimit="10" stroke-width="0.2"/>
    <rect x="18.33" y="37.78" width="13.34" height="5.56" fill="#fff" stroke="#1d1d1b" stroke-miterlimit="10" stroke-width="0.2"/>
    <rect x="15.55" y="43.34" width="18.89" height="1.11" fill="#fff" stroke="#1d1d1b" stroke-miterlimit="10" stroke-width="0.2"/>
    <g>
      <rect x="9.35" y="24.44" width="4.45" height="8.89" fill="#466688"/>
      <rect x="16.43" y="17.78" width="4.45" height="15.56" fill="#466688"/>
      <rect x="37.69" y="15" width="4.45" height="18.34" fill="#466688"/>
      <rect x="30.6" y="21.11" width="4.45" height="12.22" fill="#466688"/>
      <rect x="23.52" y="14.44" width="4.45" height="18.89" fill="#466688"/>
    </g>
    <circle cx="11.57" cy="19.44" r="1.67" fill="#878787"/>
    <circle cx="18.66" cy="13.89" r="1.67" fill="#878787"/>
    <circle cx="25.74" cy="9.44" r="1.67" fill="#878787"/>
    <circle cx="32.83" cy="15.55" r="1.67" fill="#878787"/>
    <circle cx="39.91" cy="11.66" r="1.67" fill="#878787"/>
  </g>
  <rect width="50" height="50" fill="none"/>
</svg> */}


export function DatasetIcon({ width, height, numberColumns = 6, margin = 5, betweenMargin = 1, strokeWidth = 0.2, fillColor = "#466688" }) {
    
    const columnWidth = (width - margin * 2 - betweenMargin * numberColumns) / (numberColumns)
    const numberRows = numberColumns //_.round((height - margin * 2) / columnWidth) - 1 //rectangle width == height


    const constOpacities = useMemo(() => {return _.range(numberRows).map(rI => _.range(numberColumns).map(i => _.random(0.1,1,true)))},[])

    return (
        <motion.svg width={width} height={height} viewBox={"0 0 50 50"} onMouseEnter={() => console.log("a")}>

            {/* {_.range(numberRows).map(rowIdx => {
                return (
                    <rect key={`mrow-${rowIdx}`} x={margin} y={margin + rowIdx * (columnWidth+betweenMargin)} width={columnWidth * 1.4} height={columnWidth} fill="#efefef" stroke="black" strokeWidth={strokeWidth} />
            )})} */}

            {_.range(numberRows).map(rowIdx => {
                return (_.range(numberColumns).map(colIdx => {
                    return (
                        <rect
                            key={`mrow-${colIdx}-${rowIdx}`}
                            x={margin + (betweenMargin + columnWidth) * colIdx}
                            stroke="white"
                            opacity={constOpacities[rowIdx][colIdx]}
                            y={margin + rowIdx * (columnWidth+betweenMargin)}
                            width={columnWidth}
                            height={columnWidth}
                            fill={fillColor}
                            strokeWidth={strokeWidth} />
                    )
                }))})}

        </motion.svg>
    )
}

export function PerformanceMonitor({ width, height, startBarX = 10, marginBars = 2, baselineBar = 30, numberBars = 8, fillColor = "#466688", strokeWidth = 0.4}) {
    const rectWidth = (35 - marginBars * numberBars) / numberBars

    const rects = useMemo(() => _.range(numberBars).map(idx => _.random(18, 30-1.5*idx, true)).map((barStart, barIdx) => {
        return {
            x: startBarX + (barIdx * rectWidth) + (barIdx * marginBars),
            y: baselineBar,
            width: rectWidth,
            height: 0,
            custom : barStart
        }
        }), [] ) 
    const barVariants = {

        hidden: {opacity : 0},
        visible: (barStart) => {
           
            return ({
                opacity: 1,
                y : barStart - baselineBar,
                height : baselineBar - barStart
            })
        }
    }

    return (
        <motion.svg width={width} height={height} viewBox={"0 0 50 50"}>

            
            <rect x="3.33" y="5.55" width="43.34" height="31.12" rx="1.9" fill="#fff" stroke="#1d1d1b" strokeWidth={strokeWidth} />
            <rect x="18.33" y="37.78" width="13.34" height="5.56" fill="#fff" stroke="#1d1d1b" strokeWidth={strokeWidth} />
            <rect x="15.55" y="43.34" width="18.89" height="1.11" fill="#fff" stroke="#1d1d1b" strokeWidth={strokeWidth} />
            <motion.polyline points={_.join(rects.map(rectProps => `${rectProps.x + rectProps.width / 2} ${rectProps.custom - 4}`), " ")}  fill="none" stroke="#878787" pathLength={0} strokeWidth={strokeWidth+1} animate={{pathLength : 1}} transition={{duration : 1.2}} />
            {rects.map((rectProps, rectIdx) => <motion.rect
                key={`r-p-${rectProps.x}-${rectIdx}`}
                {...rectProps}
                animate="visible"
                initial="hidden"
                variants={barVariants}
                transition={{duration : 1, repeat : Infinity, repeatType : "mirror", repeatDelay : rectIdx * 0.4 }}
                fill={fillColor} />)}
        
        </motion.svg>


    )
}

export function ElectrosrayPerformanceIcon({
    width,
    height,
    sprayLength = 45,
    spectraLength = 20,
    xStart = 5,
    ycenter = 20,
    scatter = 10,
    fillColor = "#466688",
    strokeColor = "#1d1d1b",
    numberCircles = 40,
    circleRadius = 6,
    delayChildren = 2,
    spectraMarginLeft = -15,
}) {
    const spectraStart = xStart + spectraMarginLeft + sprayLength
    let spectrumRange = [spectraStart,spectraStart+spectraLength]

    const peakVariants = {
        hidden: {
            pathLength: 0,
        },
        visible: {
            pathLength: 1,
            }   
        }
    const circleVariansMove = {
        hidden: {
            cx: xStart - 5,
            r: circleRadius,
            opacity : 0
        },
        visible: (yPoint) => {
            return (
                {
                    cx: xStart + sprayLength,
                    r: circleRadius * 0.02,
                    cy : yPoint + (ycenter - yPoint),
                    opacity: 0.8}
        )}
    }
    let points = _.range(numberCircles).map(v => {
        return {
            cy: _.random(ycenter - 1.2*scatter, ycenter + 1.2* scatter,true),
            cx: circleRadius,
            r : circleRadius}
    })

    return (
        <motion.svg width={width} height={height} viewBox={"0 0 80 40"}>
        <motion.g transition={{ staggerChildren: 0.1, delayChildren : delayChildren }} animate="visible">
                
            {points.map((point, pIdx) => <motion.circle
                    key={`${point.cx}${pIdx}`}
                {...point}
                opacity={0}
                   // animate={"visible"}
                    fill={fillColor}
                    variants={circleVariansMove}
                    custom={point.cy}
                    transition={{ duration: 1.5, repeat: Infinity, repeatType: "loop", delay : _.random(0,2,true)+(pIdx*0.2)}} />)} 
   
                <motion.polyline
                    points={`${spectrumRange[1]} ${ycenter - scatter-3} ${spectrumRange[0]} ${ycenter-2} ${spectrumRange[0]} ${ycenter+2}  ${spectrumRange[1]} ${ycenter + scatter+3}`}
                    fill="none"
                    animate={"visible"}
                    pathLength={0}
                    variants={peakVariants}
                    stroke={strokeColor}
                    strokeMiterlimit="10"
                    transition={{ duration: 1, delay : 0.4}}
                    strokeWidth="1" />
    
            </motion.g>
            </motion.svg>
     
    )
    
    
}


export function NonControlledSample({
    width,
    height,
    xstart,
    ystart,
    delayChildren = 0.3,
    fillColor = "#466688",
    strokeColor = "#1d1d1b" }) {
    
    
    
    const lineVariants = {
        hidden: {
            pathLength: 0,
        },
        visible: {
            pathLength: 1,
            }   
    }
    const fillVariants = {
        hidden: {
            opacity : 0
        },
        visible: {
            opacity : 1 
        }
    }
    
    const circleVariants = {

        hidden: ([cx,cy]) => {
            return ({
                opacity: 0,
                cy: cy,
                cx : cx,
            })
        },
        visible: ([cx, cy]) => {
            let xdirection = _.random() > 0.5 ? -1 : 1
            return ({
                opacity: 0.8,
                cx : cx + (xdirection * _.random(3,5,true)),
                cy: cy-23,
                r : 0,
            })
        }
    }
    const points = useMemo(() => _.range(20).map(idx => { return ({ cx: _.random(13, 17,true) , cy : _.random(12,18,true), r : _.random(2,5,true)})}), []) 
    return (
        <motion.svg width={width} height={height} viewBox={"0 0 40 40"}>
        <g transform={`translate(${xstart},${ystart})`}>
        <polygon points="14.26 29.95 0.24 29.95 9.36 11.37 7.02 0.15 14.26 0.15 14.32 0.15 21.57 0.15 19.23 11.37 28.34 29.95 14.32 29.95 14.26 29.95"
            fill="#fff" stroke={strokeColor} strokeMiterlimit="10" strokeWidth="0.3" variants={lineVariants} />
        <path d="M20.38,16a1.46,1.46,0,0,0-.64-.68,1.48,1.48,0,0,0-1.41-.12,3.23,3.23,0,0,0-.53.41,8.06,8.06,0,0,1-3.44,1.81c-1.35.18-3.15-.9-4.1-1.81h-.11l-6,12.3a1.44,1.44,0,0,0,1.29,2.07H24.61a1.43,1.43,0,0,0,1.3-2Z"
            transform="translate(-0.71 -0.74)" fill={fillColor} variants={fillVariants} />
                {points.map((point, pIdx) =>
                    <motion.circle
                        key={`${point.cx}${pIdx}`}
                        {...point}
                        initial="hidden"
                        animate="visible"
                        fill={fillColor}
                        variants={circleVariants}
                        opacity={0}
                        custom={[point.cx, point.cy]}
                        transition={{duration : 3, repeat: Infinity, repeatType : "loop", delay : pIdx*0.4}} />)}
            </g>
            </motion.svg>
    )
}

function AnimatedSVGText({x,y,text,ctrls, delayChildren, reverse, staggerDelay = 0.1,  ...rest}) {

    const variants = {
        hidden: {
            opacity : 0
        },
        visible: {
            opacity : 1
        }
    }

    return (
        
        <text x={x} y={y} textAnchor="start">
        {text.split("").map((char, charIdx) => {
            return (
                <motion.tspan
                    alignmentBaseline={"central"}
                    opacity={0}
                    key={`${charIdx}-char`}
                    variants = {variants}
                    animate={ctrls}
                    transition={{
                        delay: charIdx * staggerDelay + delayChildren,
                        repeat: reverse?1:0,
                        repeatType :  "reverse",
                        repeatDelay: text.length * (staggerDelay*0.1) + (text.length - charIdx) * 0.2
                    }}>
                    
                    {char}
                </motion.tspan>
            )
        })}
        </text>
    )
}
AnimatedSVGText.defaultProps = {
    delayChildren: 0.5,
    staggerDelay: 0.1,
    reverse : true
}


function Sample({
    ctrls,
    fakeAnimation,
    xstart, 
    ystart,
    delayChildren = 0.3,
    fillColor = "#466688",
    strokeColor = "#1d1d1b",
}) {

    const lineVariants = {
        hidden: {
            pathLength: 0,
        },
        visible: {
            pathLength: 1,
            }   
    }

    const fillVariants = {
        hidden: {
            opacity : 0
        },
        visible: {
            opacity : 1 
        }
    }
    
    const circleVariants = {

        hidden: ([cx,cy]) => {
            return ({
                opacity: 0,
                cy: cy,
                cx : cx,
            })
        },
        visible: ([cx, cy]) => {
            let xdirection = _.random() > 0.5 ? -1 : 1
            return ({
                opacity: 0.8,
                cx : cx + (xdirection * _.random(3,5,true)),
                cy: cy-28,
                r : 0,
            })
        }
    }


    let points = _.range(20).map(idx => { return ({ cx: _.random(13, 18,true) , cy : _.random(12,15), r : _.random(2,5,true)})})


    return (
        <motion.g
            animate={ctrls}
            variants={fakeAnimation}
            transition={{ staggerChildren: 0.8, delayChildren: delayChildren }}
            transform={`translate(${xstart},${ystart})`}>
                    
            <motion.polygon points="14.26 29.95 0.24 29.95 9.36 11.37 7.02 0.15 14.26 0.15 14.32 0.15 21.57 0.15 19.23 11.37 28.34 29.95 14.32 29.95 14.26 29.95"
                fill="#fff" stroke={strokeColor} strokeMiterlimit="10" strokeWidth="0.3" variants={lineVariants} />
            <motion.path d="M20.38,16a1.46,1.46,0,0,0-.64-.68,1.48,1.48,0,0,0-1.41-.12,3.23,3.23,0,0,0-.53.41,8.06,8.06,0,0,1-3.44,1.81c-1.35.18-3.15-.9-4.1-1.81h-.11l-6,12.3a1.44,1.44,0,0,0,1.29,2.07H24.61a1.43,1.43,0,0,0,1.3-2Z" t
                transform="translate(-0.71 -0.74)" fill={fillColor} variants={fillVariants} />
            {points.map((point, pIdx) => <motion.circle
                    key={`${point.cx}${pIdx}`}
                    {...point}
                    fill={fillColor}
                    variants={circleVariants}
                    opacity={0}
                    custom={[point.cx, point.cy]}
                    transition={{duration : 3, repeat: Infinity, repeatType : "loop"}} />)}
            </motion.g>

    )
}


function Check({
    ctrls,
    fakeAnimation,
    xcenter,
    ycenter,
    delayChildren = 0,
    radius = 20,
    strokeColor = "#1d1d1b",
    fillColor = "#466688"
}) {
    const lineVariants = {
        hidden: {
            pathLength: 0,
            opacity : 0
        },
        visible: {
            pathLength: 1,
            opacity : 1,
        }
    }
    const circleVariants = {
            hidden: {
                opacity: 0,
            },
            visible: {
                opacity: 1,
                }   
    }
    return (
        <motion.g
            animate={ctrls}
            variants={fakeAnimation}
            transition={{ staggerChildren: 0.8, delayChildren: delayChildren }}>

            <motion.circle
                cx={xcenter} cy={ycenter} r={radius} fill="none" stroke={strokeColor} strokeMiterlimit="10" strokeWidth="0.3" variants={circleVariants}/>
            
            <motion.polyline
                points={`${xcenter-radius/3} ${ycenter} ${xcenter} ${ycenter+radius/3} ${xcenter+radius/2} ${ycenter-radius/3}`}
                fill="none"
                opacity={0}
                pathLength={0}
                stroke={fillColor}
                strokeLinecap="round"
                strokeMiterlimit="10"
                strokeWidth="6"
                variants={lineVariants} />
            

        </motion.g>
    )
}


function Electrosray({
    ctrls,
    fakeAnimation,
    sprayLength = 50,
    spectraLength = 30,
    xStart = 5,
    ycenter = 185,
    scatter = 12,
    fillColor = "#466688",
    strokeColor = "#1d1d1b",
    numberPeaks = 36,
    numberCircles = 35,
    circleRadius = 5,
    delayChildren = 2,
    spectraMarginLeft = 5,
}) {
    const spectraStart = xStart + spectraMarginLeft + sprayLength
    let spectrumRange = [spectraStart,spectraStart+spectraLength]

    const peakVariants = {
        hidden: {
            pathLength: 0,
        },
        visible: {
            pathLength: 1,
            }   
        }
    const circleVariansMove = {
        hidden: {
            cx: xStart - 5,
            r: circleRadius,
            opacity : 0
        },
        visible: (yPoint) => {
            return (
                {
                    cx: xStart + sprayLength,
                    r: circleRadius * 0.02,
                    cy : yPoint + (ycenter - yPoint),
                    opacity: 0.8}
        )}
    }
    let points = _.range(numberCircles).map(v => {
        return {
            cy: _.random(ycenter - scatter, ycenter + scatter),
            cx: circleRadius,
            r : circleRadius}
    })

    let peaks = _.range(numberPeaks).map(v => {
        let x = _.random(spectrumRange[0], spectrumRange[1])
        return {
            y2 : _.random(ycenter + scatter, ycenter - scatter), //ycenter-scatter,
            y1 : ycenter+scatter,// ,
            x1: x,
            x2 : x
            }
    })
    return (
        <motion.g transition={{ staggerChildren: 0.1, delayChildren : delayChildren }} variants={fakeAnimation}>
                
            {points.map((point, pIdx) => <motion.circle
                    key={`${point.cx}${pIdx}`}
                    {...point}
                    fill={fillColor}
                    variants={circleVariansMove}
                    custom={point.cy}
                    transition={{ duration: 1.5, repeat: Infinity, repeatType: "loop" }} />)} 
   
                <motion.polyline
                    points={`${spectrumRange[0]} ${ycenter - scatter} ${spectrumRange[0]} ${ycenter + scatter} ${spectrumRange[1]} ${ycenter + scatter}`}
                    fill="none"
                    pathLength={0}
                    animate={ctrls}
                    variants={peakVariants}
                    stroke={strokeColor}
                    strokeMiterlimit="10"
                    transition={{ duration: 1, delay : delayChildren + 0.2}}
                    strokeWidth="1" />
                
                {peaks.map((peak, peakIdx) => <motion.line
                    key={`${peak.y1}${peakIdx}`}
                    {...peak}
                    animate={ctrls}
                    pathLength={0}
                    // custom={peak.x1}
                    variants={peakVariants}
                    transition={{ duration: 2, repeat: Infinity, delay : delayChildren + (peakIdx * 0.2) + _.random()*20, repeatType: "mirror", repeatDelay : _.random(0,5,true)}}
                    stroke={strokeColor}
                    strokeWidth="0.5" />)}
                
            </motion.g>
     
    )
    
    
}


function DataAnalysis({
    ctrls,
    xStart,
    ycenter,
    fakeAnimation,
    heigth = 30,
    delayChildren = 0,
    fillColor = "#466688",
    strokeColor = "#1d1d1b",
    spectraLength = 40}) {
    
    const spectrumRange = [xStart,xStart+spectraLength]
    const halfHeight = heigth / 2 
    const peakVariants = {
        hidden: {
            pathLength: 0,
            strokeWidth : 0.5,
            stroke : strokeColor
        },
        visible: (x1) => {
            const match = x1 === undefined ? false : _.random(0,10) < 6
            console.log(x1)
            return ({
                pathLength: 1,
                stroke: match ? fillColor : strokeColor,
                strokeWidth : match ? 1.0 : 0.5
        })
        }   
    }
    
   const peaks =  _.range(35).map(p => {
        const x = _.random(spectrumRange[0],spectrumRange[1],true)
        return ({ x1: x, x2: x, y1: ycenter + halfHeight, y2: _.random(ycenter - halfHeight, ycenter + halfHeight, true) })
    })
    return (
        <motion.g>

            <motion.polyline
                    points={`${spectrumRange[0]} ${ycenter - halfHeight } ${spectrumRange[0]} ${ycenter + halfHeight } ${spectrumRange[1]-5} ${ycenter + halfHeight }`}
                    fill="none"
                    pathLength={0}
                    variants={peakVariants}
                    stroke={strokeColor}
                    strokeMiterlimit="10"
                    transition={{ duration: 1, delay : delayChildren + 0.2}}
                strokeWidth="1" />
            

            
        </motion.g>
        
    )
}



function VerticalExpandingLine({ x, y1, y2, ctrls, lineVariants, strokeColor,delayChildren, duration = 1.3, ...rest}) {
    
    const circleVarians = {
        hidden: {
            cy: y1,
            opacity : 0
        },
        visible: {
            cy: y2,
            opacity : 1
        }
    }
    return (
        <motion.g>
            <motion.line
                x1={x}
                x2={x}
                y1={y1}
                y2={y2}
                strokeWidth={0.5}
                animate={ctrls}
                variants={lineVariants}
                stroke={strokeColor} 
                transition={{ duration, delay : delayChildren}}
                {...rest} />
            
            <motion.circle
                cx={x}
                cy={y1}
                r={3}
                strokeWidth={0.5}
                stroke = {strokeColor}
                fill={"white"}
                variants={circleVarians}
                animate={ctrls}
                opacity={0}
                transition={{ duration, delay : delayChildren}} />
        </motion.g>
    )
}


export function MCSVGProjectState(props) {
    const { fillColor, strokeColor } = props
    const ctrls = useAnimationControls() //so to be replace with useAnimate
    const ref = useRef(null)
    const inView = useInView(ref, { amount : 1,  once : true})
    const fakeAnimation = {
        hidden: {},
        visible: {},
    };
    const  circleAnimation = {
        hidden: {
            opacity: 0
        },
        visible: {
            opacity: 1
        },
        transition: {
            when : "afterChildren",
            duration: 0.3,
            ease: [0.2, 0.65, 0.3, 0.9],
        }
    }

    const lineAnimation = {
        hidden: {
            pathLength: 0,
            opacity: 0
            
        },
        visible: {
            pathLength: 1,
            opacity: 1
        },
        transition: {
            duration: 0.4,
            ease: [0.2, 0.65, 0.3, 0.9],
        }
    }

    useEffect(() => {
        if (inView) {
            ctrls.start("visible");
             }
         if (!inView) {
             ctrls.start("hidden");
             }
    }, [inView, ctrls])

    return (
        <motion.svg width={500} height={600} viewBox="0 0 200 400" ref={ref} xmlns="http://www.w3.org/2000/svg">
            {/* <text x={} */}

        <motion.g animate={ctrls}
                variants={fakeAnimation}
                transition={{ staggerChildren: 15}}>
                
                <Sample xstart={20} ystart={10} ctrls={ctrls} fakeAnimation={fakeAnimation} delayChildren={0.0} />
                <AnimatedSVGText x="55" y="22" text="Sample submission" ctrls={ctrls} variants={circleAnimation} delayChildren={0.75} />
                <VerticalExpandingLine x={35} y1={45} y2={85} ctrls={ctrls} lineVariants={lineAnimation} strokeColor={strokeColor} delayChildren={3.5} />
            {/* <motion.g
                    animate={ctrls}
                    variants={fakeAnimation}
                    transition={{ staggerChildren: 0.4, delayChildren: 2 }}>
                <motion.line x1="19.15" y1="35.84" x2="19.15" y2="70.84" fill="#fff" stroke={strokeColor}strokeMiterlimit="10" strokeWidth="0.3" variants={lineAnimation}/>
            </motion.g> */}
                <Electrosray ctrls={ctrls} fakeAnimation={fakeAnimation} ycenter={110} xStart={0} delayChildren={5} />
                <AnimatedSVGText x="95" y="110" text="Measuring" ctrls={ctrls} variants={circleAnimation} delayChildren={7.2} />
                <VerticalExpandingLine x={35} y1={130} y2={170} ctrls={ctrls} lineVariants={lineAnimation} strokeColor={strokeColor} delayChildren={7.75} />
                
            {/* <motion.g
                    animate={ctrls}
                    variants={fakeAnimation}
                    transition={{ staggerChildren: 0.4, delayChildren: 3 }}>
            <motion.polyline points="9.62 96.13 15.68 100.84 26.68 88.84" fill="none" stroke={fillColor} strokeLinecap="round" strokeMiterlimit="10" strokeWidth="6" variants={lineAnimation}/>
            <motion.circle cx="18.15" cy="94.84" r="18" fill="none" stroke={strokeColor}strokeMiterlimit="10" strokeWidth="0.3" variants={circleAnimation}/>
            </motion.g>

                <AnimatedSVGText x="45" y="94.84" text="Done" ctrls={ctrls} variants={circleAnimation} delayChildren={3.2} reverse={false} /> */}
                <DataAnalysis xStart={12} ycenter={195} height={55} ctrls={ctrls} variants={circleAnimation} delayChildren={9}/>
                <AnimatedSVGText x="75" y="195" text="Data analysis" ctrls={ctrls} variants={circleAnimation} delayChildren={9.2} reverse={false} />
                <VerticalExpandingLine x={35} y1={220} y2={260} ctrls={ctrls} lineVariants={lineAnimation} strokeColor={strokeColor} delayChildren={9.6} />
                
                <Check ctrls={ctrls} fakeAnimation={fakeAnimation} xcenter={35} ycenter={285} delayChildren={11.5} />
                <AnimatedSVGText x="65" y="285" text="Done" ctrls={ctrls} variants={circleAnimation} delayChildren={11.6} reverse={false} />

                {/* <AnimatedSVGText x="95" y="220" text="Total costs" ctrls={ctrls} variants={circleAnimation} delayChildren={9.2} />
                <AnimatedSVGText x="95" y="200" text="Turnover time: 2 weeks" ctrls={ctrls} variants={circleAnimation} delayChildren={9.0}/>
                <AnimatedSVGText x="95" y="220" text="" ctrls={ctrls} variants={circleAnimation} delayChildren={9.2}/> */}
            </motion.g>
        
        </motion.svg>
    )
}

MCSVGProjectState.defaultProps = {
    fillColor: "#466688",
    strokeColor : "#1d1d1b" 
}