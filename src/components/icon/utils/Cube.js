import React from "react";
const initialState = {className:'',colorScheme:"grey"}

const cubeCoords = {"rect1":[[5.69,13.22],[5.66,6.66],[0.03,3.37], [0.03,9.94]],
                    "rect2":[[5.69,13.22], [11.32,9.94], [11.26,3.37], [5.66,6.66]],
                    "rect3":[[5.66,6.66], [11.26,3.37], [5.57,0.09], [0,3.37]]}

const colorSchemes = {'teal':{fill: "#85CFDD" ,fillDark:"#49A5BC" },
                      'grey':{fill:"#F6F9FB",fillDark : "#CDD6E2"},
                      'orange':{fill:"#F6C8AD",fillDark : "#F19560"}}

//const colorSchmemeIds = ['teal','grey','grey','orange']


class Cube extends React.Component {
    
    constructor(props) {
        super(props);
        this.state = initialState;
        this.handleMouseEnter = this.handleMouseEnter.bind(this)
        this.handleMouseLeave = this.handleMouseLeave.bind(this)
        this.handleClick = this.handleClick.bind(this)
        this.getRectCoords = this.getRectCoords.bind(this)
      }

    componentDidMount() {
            this.setState({fill:this.props.fill,
                stroke:this.props.stroke!== undefined ? this.props.stroke : "#000000",
                strokeWidth:this.props.strokeWidth !== undefined ? this.props.strokeWidth : 0.2,
                }
                )  
    }
    
    handleClick (e) {
        this.props.handleClick(this.props.cellPart)
    }
    handleMouseEnter (e) {
        
        this.setState({className:this.props.className + '-go'})
    }

    getRectCoords (id) {
        var coordsAsString = ''
        cubeCoords[id].forEach(value => {
            const xCoord = value[0] + this.props.x + this.props.offsetX
            const yCoord = value[1] + this.props.y + this.props.offsetY
            const newString = xCoord + ',' + yCoord + ' '
            coordsAsString =  coordsAsString + newString})
        return (coordsAsString)
    }
    

    handleMouseLeave (e) {
        this.setState({fill:this.props.fill,
            strokeWidth:this.props.strokeWidth !== undefined ? this.props.strokeWidth : 0.2})
    }   
    render() {   
        return( 
 
        <g style = {{stroke:"#000000",strokeWidth:0.1,strokeLinejoin:"bevel"}} 
            className = {this.state.className} onMouseEnter = {this.handleMouseEnter}>
            <polygon points={this.getRectCoords('rect1')} 
                fill={colorSchemes[this.state.colorScheme].fill}/>
            <polygon points={this.getRectCoords('rect2')} 
                fill={colorSchemes[this.state.colorScheme].fillDark}/>
            <polygon points={this.getRectCoords('rect3')} 
                fill={colorSchemes[this.state.colorScheme].fill}/>
        </g>
        
        )
    }
    static defaultProps = {
            transform : "translate(0,0)",
            className:'',
            offsetX : 32,
            offsetY : 15,
            x: 0,
            y: 0}
} 
export default Cube