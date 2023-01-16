import _ from "lodash";
import React
 from "react";


function MCScatterPoint(props) {
    /* render using props */
    const {xscale,yscale,p,idx,defaultCircleFill,circleProps,r,opacity} = props
   
    return( 
        <circle 
            key={`${idx}-pp`} 
            cx={xscale(p[0])}  //move scale outsite? 
            cy={yscale(p[1])}  //move scale outsite? 
            r = {r} 
            fill={p[2]?p[0]>0?"#ea563c":"#7894a2":defaultCircleFill} 
            opacity={opacity}
            {...circleProps}/>
    )
  }



  function areEqual(prevProps, nextProps) {
    /*
    return true if passing nextProps to render would return
    the same result as passing prevProps to render,
    otherwise return false
    */
    if (prevProps.r !== nextProps.r) return false 
    if (prevProps.opacity !== nextProps.opacity) return false 
    if (prevProps.p[0] !== nextProps.p[0]) return false
    if (prevProps.p[1] !== nextProps.p[1]) return false
    //if (!_.isEqual(prevProps.p,nextProps.p)) return false 
    if (!_.isEqual(prevProps.xscale.domain,nextProps.xscale.domain)) return false 
    
    return true

  }
  export default React.memo(MCScatterPoint, areEqual);