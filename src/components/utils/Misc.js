import { useLocation } from "react-router-dom"
import { useMemo } from "react";
export function MCGetFilterFromLocalStorage(){
    const MCFilter = JSON.parse(localStorage.getItem("mitocube-filter"))
    return MCFilter
}

export function QueryParam(){
    const { search } = useLocation();
    return useMemo(() => new URLSearchParams(search), [search]);
  }

export function getMitoCubeToken() {
    const tokenString = localStorage.getItem("mitocube-token")
    return tokenString===undefined?"":tokenString
}

export function downloadTxtFile (txtData,fileName) {
    const element = document.createElement("a");
    const file = new Blob([txtData], {type: 'text/plain'});
    element.href = URL.createObjectURL(file);
    element.download = fileName;
    document.body.appendChild(element); // Required for this to work in FireFox
    element.click();
  }

export function getLuma(rgbColor) {
    //taken from: https://stackoverflow.com/questions/12043187/how-to-check-if-hex-color-is-too-black
    var c = rgbColor.substring(1);      // strip #
    var rgb = parseInt(c, 16);   // convert rrggbb to decimal
    var r = (rgb >> 16) & 0xff;  // extract red
    var g = (rgb >>  8) & 0xff;  // extract green
    var b = (rgb >>  0) & 0xff;  // extract blue
    var luma = 0.2126 * r + 0.7152 * g + 0.0722 * b; // per ITU-R BT.709
    return luma
}

export function arrayOfObjectsToTabDel(data){
    if (data !== undefined && data.length > 0){
        const headers = Object.keys(data[0])
        const csvData = data.map(v => {
        const dd = headers.map(h => {return v[h]})
        return dd.join("\t")    
        }) 
        return [headers.join("\t"),csvData.join("\n")].join("\n")
    }
    
}   

export function downloadSVGAsText(svgEl,name="download.svg") {
    svgEl.setAttribute("xmlns", "http://www.w3.org/2000/svg");
    var svgData = svgEl.outerHTML;
    var preface = '<?xml version="1.0" standalone="no"?>\r\n';
    var svgBlob = new Blob([preface, svgData], {type:"image/svg+xml"});
    var svgUrl = URL.createObjectURL(svgBlob);
    var downloadLink = document.createElement("a");
    downloadLink.href = svgUrl;
    downloadLink.download = name;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
  }