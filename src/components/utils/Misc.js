import { useLocation } from "react-router-dom"
import { useMemo, useState, useCallback } from "react";
import {isObject, join } from "lodash";
import _ from "lodash"


export function makeRepeatedArray(arr, repeats) {
    return [].concat(...Array.from({ length: repeats }, () => arr));
}
export function isStringNumber(str) {
    if (typeof str != "string") return false 
    let isNumber = !isNaN(str) && // use type coercion to parse the _entirety_ of the string (`parseFloat` alone does not do this)...
        !isNaN(parseFloat(str)) // ...and ensure strings of whitespace fail
    if (isNumber) return { isNumber: isNumber, value: parseFloat(str) }
    return { isNumber: false, value: undefined }
    }

export function getMonthName(monthNumber) {
    const date = new Date();
    date.setMonth(monthNumber - 1);
  
    return date.toLocaleString('en-US', { month: 'long' });
  }
export function groupby(array,extractGroupFn){

    const uniqueValues = _.uniq(array.map(v => extractGroupFn(v)))
    const groupby = Object.fromEntries(uniqueValues.map(groupName => [groupName,[]]))
    _.forEach(array, v => groupby[extractGroupFn(v)].push(v) )
    return groupby
}

export function createEnum(values) {
    const enumObject = {};
    for (const val of values) {
      enumObject[val] = val;
    }
    return Object.freeze(enumObject);
  }
  

export function sortDates (data) {
    return(data.sort((a, b) => a.x - b.x))}

function getAverage (data) {
    return(data.reduce((acc, val) => acc + val.y, 0) / data.length)}

export function computeMovingAverage(data, period, dataIsSorted = false){
  const movingAverages = [];
    
  const sortedData =  dataIsSorted?data:sortDates(data);

  // if the period is greater than the length of the dataset
  // then return the average of the whole dataset
  // returns right sided dates (e.g.)
  if ( sortedData.pop() === undefined) {
    return [{x : undefined, y: undefined}]
  }
  if (period > sortedData.lengt) {
    return [{y : getAverage(data), x : sortedData.pop().x}];
  }
  for (let x = 0; x + period - 1 < sortedData.length; x += 1) {
    let d = sortedData.slice(x, x + period)
    movingAverages.push({
            y : getAverage(d),
            x : new Date().setTime(_.sum(d.map(v => v.x.getTime()))/d.length)
        })
    }
  return movingAverages;
}

export function getDomainFromArray(array,relMargin=0.02){

    let minValue = _.min(array)
    let maxValue = _.max(array)
    let margin = Math.sqrt(Math.pow(maxValue,2) - Math.pow(minValue,2)) * relMargin
    return [maxValue+margin,minValue-margin]
}

export function quantile (array,qs=[0,0.25,0.5,0.75,1.0],NIQR = 1.8, removeOutlier = true) {
    // remove falsly numbers (includes 0!)
    let sortedFilteredArray = _.sortBy(_.filter(array,Boolean))
    let N = sortedFilteredArray.length
    if (removeOutlier){
            //remove outlier before calculating quantiles
            let idxsForIQR = [0.25,0.5,0.75].map(q => (N-1) * q)
            const generousIQR = idxsForIQR.map(idx => {
                let b = Math.floor(idx)
                let r = idx - b 
                if (sortedFilteredArray[b+1]!==undefined) {
                    return sortedFilteredArray[b] + r * (sortedFilteredArray[b + 1] - sortedFilteredArray[b]);
                }
                else {
                    return sortedFilteredArray[b]
                }
            })
            // get min and max values
            const IQR = generousIQR[2] - generousIQR[0]
            const maxValue = generousIQR[1] + NIQR * IQR
            const minValue = generousIQR[1] - NIQR * IQR
            
            //overwrite array and calculate distribution again
            sortedFilteredArray = sortedFilteredArray.filter(x => x <= maxValue && x >= minValue)
        }
    let filteredN = sortedFilteredArray.length
    let idxs = qs.map(q => (filteredN-1) * q)
    const numberOutliers = N - filteredN 
    // return filtered quantiles 
    const caluclatedQuantiles =  idxs.map(idx => {
        let b = Math.floor(idx)
        let r = idx - b 
        if (sortedFilteredArray[b+1]!==undefined) {
            return sortedFilteredArray[b] + r * (sortedFilteredArray[b + 1] - sortedFilteredArray[b]);
        }
        else {
            return sortedFilteredArray[b]
        }
    })    
    return {qs:caluclatedQuantiles, n_removed:numberOutliers, N: sortedFilteredArray.length}
}   

function capitalizeString(s)
{
    if (s[0] === undefined) return ""
    return s[0].toUpperCase() + s.slice(1,2);
}

export function extractNamePrefix(s){
    if (s===undefined) return ""
    if (s === "") return ""
    let strSplit = s.split(" ")
    return join(strSplit.map(v => capitalizeString(v)),"")

}

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
    return tokenString===undefined || tokenString === null?"":tokenString
}


export function getMitoCubeAdminToken() {
    const tokenString = localStorage.getItem("mitocube-token-admin")
    return tokenString===undefined || tokenString === null?"":tokenString
}

export function removeMitoCubeAdminToken() {
    // removes mitocube-token
    if (localStorage.getItem("mitocube-token-admin") !== null){
        localStorage.removeItem("mitocube-token-admin")
    }
}

export function setMitoCubeAdminToken(tokenString) {
    // save token string to local storage
    localStorage.setItem("mitocube-token-admin",tokenString)
}


export function saveSubmission(submissionState) {
    if (submissionState===null) {
        localStorage.removeItem("mitocube-submission")
    }
    else 
    {
        const overwritten = localStorage.getItem("mitocube-submission") !== null 
        localStorage.setItem("mitocube-submission",JSON.stringify(submissionState))
       
        return overwritten?"Saved. A previous submission was overwritten":"Submission saved in local storage."
    }
}

export function getSavedSubmission() {
    return JSON.parse(localStorage.getItem("mitocube-submission"))

}


export function getFeatureLists() {
    const featureLists = localStorage.getItem("mitocube-lists")
   
    return featureLists===null ||  featureLists === undefined?{}:JSON.parse(featureLists)
}

export function saveFeatureList(listName,listItems) {
    
    let featureLists = JSON.parse(localStorage.getItem("mitocube-lists"))
    if (featureLists === null ||  featureLists === undefined){
        localStorage.setItem("mitocube-lists",JSON.stringify({[listName]:listItems}))
    }
    else if (_.isObject(featureLists)){
        featureLists[listName] = listItems
        localStorage.setItem("mitocube-lists",JSON.stringify(featureLists))
    }
    
}


export function downloadJSONFile (data, fileName) {
   
    // create file in browser
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const href = URL.createObjectURL(blob);
  
    // create "a" HTLM element with href to file
    const link = document.createElement("a");
    link.href = href;
    link.download = fileName + ".json";
    document.body.appendChild(link);
    link.click();
  
    // clean up "a" element & remove ObjectURL
    document.body.removeChild(link);
    URL.revokeObjectURL(href);
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


const euclDistance = function(p1,p2,accX,accY,minDistX,minDistY){
    if (Math.abs(p1[accX] - p2[accX]) > minDistX) return Infinity
    if (Math.abs(p1[accY] - p2[accY]) > minDistY) return Infinity
    return Math.sqrt(Math.pow(p1[accX] - p2[accX], 2) + Math.pow(p1[accY] - p2[accY], 2))
}

export function findClosestMatch(p,points,accX=0,accY=1,minDistX,minDistY){
    // console.log(p,accX,accY)
    // console.log(points)
    // console.log(euclDistance(p,points[0],accX,accY))
    var distanceToPoints = _.map(points,function(v) {return euclDistance(p,v,accX,accY,minDistX,minDistY)})
    let minIdx = distanceToPoints.indexOf(Math.min(...distanceToPoints));
    if(distanceToPoints[minIdx]===Infinity) return undefined
    return minIdx
}


export function arrayToTabDel(data,columnNames){

    const csvDataFromArray = data.map(v => {
        return(
            _.map(columnNames,ii => v[ii]).join("\t")
        )
    })
    return [columnNames.join("\t"),csvDataFromArray.join("\n")].join("\n")
}


export function arrayOfObjectsToTabDel(data, headers, groupingMapper){
    
    if (data !== undefined && Array.isArray(data) && headers.length === data[0].length) {
       
        const groupings = groupingMapper===undefined?undefined:Object.keys(groupingMapper).map(groupingName => {
            const headersMappedToGroupings = headers.map(headerName => groupingMapper[groupingName][headerName])
            return headersMappedToGroupings.join("\t")  
        })
        const csvDataFromArray = data.map(v => {
            return v.join("\t")    
            }) 
        
        return groupings!==undefined?[headers.join("\t"),groupings.join("\n"),csvDataFromArray.join("\n")].join("\n"):[headers.join("\t"),csvDataFromArray.join("\n")].join("\n")


    }
    else if (data !== undefined && data.length > 0 && isObject(data)){
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


