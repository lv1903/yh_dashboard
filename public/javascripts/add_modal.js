function numberWithCommas(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}


function findLastReportedQuarter(index, oData){

    if(index < 0){
        return "NA", "NA"

    }
    var quarter = aDates[index][0] + aDates[index][1];
    var yhCount = oData.homeless_data[quarter].p1e.count;

    if(!(isNaN(yhCount)) || yhCount == "-"){
        return index
    }
    return findLastReportedQuarter(index - 1, oData)
}
