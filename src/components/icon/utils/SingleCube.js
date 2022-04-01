import React from "react";
import Cube from "./Cube"
import {randomIntFromInterval} from "./Calculations"

const cubeOffsetCoords = [
                          {key:"rightLeftBottom",x:0,y:0},
                          {key:"rightRightBottom",x:5.66,y:3.281},
                          {key:"leftLeftBottom",x:-5.66,y:3.281},
                          {key:"leftRightBottom",x:0,y:6.565},
                          {key:"rightLeftTop",x:0,y:-6.564},
                          {key:"leftLeftTop",x:-5.66,y:-3.281},
                          {key:"leftRightTop",x:0,y:0},
                          {key:"rightRightTop",x:16.11, y:-8.11}
                        ]


const initialState = {classNames : new Array(cubeOffsetCoords.length).fill('')}

class SingleCube extends React.Component {
    constructor(props) {
        super(props);
        this.state = initialState;
        this.handleMouseEnter = this.handleMouseEnter.bind(this)        
      }

    handleMouseEnter(e) {
        
        const randomAnimationIndex = randomIntFromInterval(0,1)
        const classNames = cubeOffsetCoords.map((value,index) => {
            if (randomAnimationIndex === 0) {
                if (value.key.includes("Top")) { return('cube-move-up')} 
                else { return('cube-move-down')}} 
            else {
                if (value.key.includes("leftRightTop")) {return("cube-move-to-front")}
                else { return('none')}}})

        this.setState({classNames:classNames})
    }

    
    render() {
        const textColor = this.props.darkMode?"white":"black"

        return( 
                <g onMouseEnter = {this.handleMouseEnter} > 

                    {cubeOffsetCoords.map((value,index) => {
                    return(
                        <Cube {...value} className = {this.state.classNames[index]}/>)})}
                        
                        <text x={25} y={60}
                            style = {{fontFamily:" -apple-system", 
                                    fontSize:"8px",
                                    fill: textColor,
                                    fontWeight:"300",
                                    lineHeight:"1.5",
                                    }}>
                            MitoCube
                        </text>  
                        
                </g>
        )
    }
    static defaultProps = {
            className:''}
} 
export default SingleCube