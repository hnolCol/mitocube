

export function MCLegend(props) {

    return(

        <div>
            {Object.keys(props.legendData).map((k,i) => {
                return (
                    <div key={`${i}-legend-item`}> 
                    <svg width={20} height={20} viewBox="0 0 20 20"><rect x={0} y = {0} width={20} height={20} fill="red"/></svg>
                    <p>{k}</p>
                    </div>
                )
            })}
        </div>

    )

}


MCLegend.defaultProps = {

    legendData : {KO:"red",WT:"blue"}
}