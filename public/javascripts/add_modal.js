function numberWithCommas(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}


function findLastReportedQuarter(index, oData){

    if(index < 0){
        return "NA", "NA"
        console.alert("MISSING DATA") //????
    }
    var quarter = aDates[index][0] + aDates[index][1];
    var yhCount = oData.homeless_data[quarter].p1e.count;

    if(!(isNaN(yhCount)) || yhCount == "-"){
        return index
    }
    return findLastReportedQuarter(index - 1, oData)
}

var h = 3300;
var w = 500;

var margin = {
    top: 10,
    right: 10,
    bottom: 10,
    left: 10
};

function loadFeatureInfoBox( id, name){

    //$("#featureTitle").html(name);
    //$("#featureIdTitle").html("ONS Entity Id: " + id);

    var oData = oEntities[id];
    console.log("data")
    console.log(oData)
    console.log("national")
    console.log(oNational)




    var x = 0;
    var y = 0;

    var hackDiv = document.createElement("div");

    d3.select("#featureInfoContainer").remove()

    var svg = d3.select(hackDiv)
        .append("div")
        .classed("svg-container", true) //container class to make it responsive
        .attr("id", "featureInfoContainer")
        .append("svg")
        .attr("preserveAspectRatio", "xMinYMin meet")
        .attr("viewBox", "0 0 " + (margin.left + w + margin.right) + " " + (margin.top + h + margin.bottom) )
        .classed("svg-content-responsive", true)
        //.append('g')
        //.attr('transform', translation(margin.left, margin.top));

//  ----Population-------------
    y += 0;
    x = 0;
    var popCount = oData.population_16to24;
    var popCount = numberWithCommas(popCount)


    svg.append("foreignObject")
        .attr('x', x)
        .attr('y', y)
        .attr("width", w)
        .attr("height", 40)
        .append("xhtml:div")
        //.style("font", "20px 'Arial',")
        .html("<div style='font-family: Arial; font-size: 25px'> Population 16-24 year olds "
            + "<span style='color: #D04627; font-weight: 900'>" + popCount + "</span>"
            + "</div>")


    y += 40;
    svg.append("image")
        .attr("xlink:href", "/images/persons.png")
        .attr("x",x)
        .attr("y", y)
        .attr("width", 350)
        .attr("height", 131);




    y += 130;


    //-----line break-----------------
    y += 50

    linemargin = 20;
    var lineData = [{"x":linemargin, "y": y }, {"x": w - linemargin, "y": y}]

    var lineFunction = d3.svg.line()
        .x(function(d) { return d.x; })
        .y(function(d) { return d.y; })

    var breakline = svg.append("path")
        .attr("d", lineFunction(lineData))
        .attr("stroke", " #D04627")
        .attr("stroke-width", "2.5px")
        .attr("stroke-linecap", "round")
        .attr("stroke-linejoin", "round")
        .attr("fill", "none")


    var a1 = [0, 1]
    //var smallRadius = 5;
    //var bigRadius = 10;
    var aCircRadius = [5, 5];
    var aCircColor = ["#D04627", "#D04627"];
    var aCircX = [linemargin, w - linemargin];

    var breaklinecircles = svg.selectAll("circle.a1")
            .data(a1)
            .enter()
            .append("circle")
            .attr("cx", function(d){console.log(aCircX[d]); return aCircX[d]})
            .attr("cy", y)
            .attr("fill", function(d){return aCircColor[d]})
            .attr("r", function(d){return aCircRadius[d]})

    y += 50;
    //-----line break end-----------------


//  --------homelessness-----------------------------------


    //--------P1E-----------------


    var avgP1EPercent = oNational.homeless_data["2014Q4"].p1e.median;
    var avgP1ERate = Math.round(avgP1EPercent * 100);
    var aBuckets = oNational.homeless_data["2014Q4"].p1e.quintiles;
    var colorAverage = selectcolor(avgP1EPercent, aBuckets, true);

    var yhCount = oData.homeless_data["2014Q4"].p1e.count;
    var yhPercent = oData.homeless_data["2014Q4"].p1e.percent;
    var yhRate = Math.round(yhPercent * 100)

    x = 0;


    svg.append("foreignObject") // --- care
        .attr('x', x)
        .attr('y', y )
        .attr("width", w)
        .attr("height", 100)
        .append("xhtml:div")
        .style({"font": "25px 'Arial'"})
        .html("<span>Youth Homelessness </span>");

    y = y + 80;

    if (yhCount == 0) { //-------------Zero homeless

        svg.append("foreignObject") // zero
            .attr('x', x)
            .attr('y', y - 15)
            .attr("width", 100)
            .attr("height", 100)
            .append("xhtml:div")
            .html("<span style='font-family: Arial; font-weight: 900; font-size: 60px; color:grey'> 0 </span>")

        svg.append("foreignObject") //homeless young people reported in NAME
            .attr('x', x + 50)
            .attr('y', y)
            .attr("width", w - x - 50)
            .attr("height", 100)
            .append("xhtml:div")
            //.style({"font": "20px 'Arial', 'Arial Bold"})
            .html("<span style='font-family: Arial; font-size: 20px'>"
                + "homeless young people reported in " + name + " in the last 3 months.</span>")

    } else if(yhCount == "-" ){ //-------------Less than 5

        svg.append("foreignObject") //less than  5 homeless young people reported in NAME
            .attr('x', x)
            .attr('y', y)
            .attr("width", w)
            .attr("height", 100)
            .append("xhtml:div")
            .html("<span style='font-family: Arial; font-size: 20px'>"
            + "Less than 5 homeless young people were reported in " + name
            + " in the last 3 months.</span>")


    } else if (isNaN(yhCount)){ //-----missing months

        var index = findLastReportedQuarter(aDates.length - 1, oData);
        var missingQuarters = aDates.length - 1 - index;
        var missingMonths = missingQuarters * 3;
        var quarter = aDates[index][0] + aDates[index][1];
        var lastYhCount = oData.homeless_data[quarter].p1e.count;
        var lastYhPercent = oData.homeless_data[quarter].p1e.percent;
        var lastYhRate = Math.round(lastYhPercent * 100);


        var aBuckets = oNational.homeless_data.p1e_missing_count.quintiles
        var color = selectcolor(missingMonths, aBuckets, true);

        y += 10;
        svg.append("foreignObject") //missing months
            .attr('x', x)
            .attr('y', y  - 15)
            .attr("width", 100)
            .attr("height", 110)
            .append("xhtml:div")
            .html("<span style='font-family: Arial; font-weight: 900; font-size: 60px; color:" + color + "'>"
            +  missingMonths + "</span>")

        svg.append("foreignObject") //homeless young people reported in NAME
            .attr('x', function(){
                if(missingMonths > 9) {
                    return x + 90
                } else {
                    return x + 60
                }

            })
            .attr('y', y)
            .attr("width", w - 100)
            .attr("height", 110)
            .append("xhtml:div")
            //.style({"font": "20px 'Arial', 'Arial Bold"})
            .html("<span style='font-family: Arial; font-size: 20px'>"
            + "months since " + name + " reported the number of young homeless."
            + "</span>");


        var color = selectcolor(lastYhPercent, aBuckets, true);

        if(lastYhCount == "-"){
            //last reported value
            y += 150;
            svg.append("foreignObject")
                .attr('x', x)
                .attr('y', y - 15)
                .attr("width", w)
                .attr("height", 100)
                .append("xhtml:div")
                //.style({"font": "20px 'Arial Black', 'Arial Bold', 'Gadget', 'sans-serif'", "top": "0px"})
                .html("<span style='font-family: Arial; font-size: 20px; text-align: right'>The last reported count was "
                + "less than 5 youths.</span>");

            y -= 40;

        }else {
            //last reported value
            y += 100;
            svg.append("foreignObject")
                .attr('x', x)
                .attr('y', y - 15)
                .attr("width", w)
                .attr("height", 100)
                .append("xhtml:div")
                //.style({"font": "20px 'Arial Black', 'Arial Bold', 'Gadget', 'sans-serif'", "top": "0px"})
                .html("<span style='font-family: Arial; font-size: 20px; text-align: right'>The last reported count was "
                + "<span style='font-family: Arial; font-weight: 900; font-size: 60px; color:" + color + "'>"
                + lastYhCount + "</span>"
                + "<span style='font-family: Arial; font-size: 20px'> youths.</span>");

            y += 100;
            svg.append("foreignObject") // rate vs national average
                .attr('x', x)
                .attr('y', y - 15)
                .attr("width", w)
                .attr("height", 200)
                .append("xhtml:div")
                .html("<span style='font-family: Arial; font-size: 20px'>This was a rate of  "
                + "<span style='font-family: Arial; font-weight: 900; font-size: 60px; color:" + color + "'>"
                + lastYhRate + "</span>"
                + "<span style='font-family: Arial; font-size: 20px'> per 10,000 16-24 year olds.</span>")
        }


    } else { //----all others with a number count

        var aBuckets = oNational.homeless_data["2014Q4"].p1e.quintiles;
        var color = selectcolor(yhPercent, aBuckets, true);
        var colorAverage = selectcolor(avgP1EPercent, aBuckets, true);

        svg.append("foreignObject") // --- count
            .attr('x', x)
            .attr('y', y - 15)
            .attr("width", 100)
            .attr("height", 100)
            .append("xhtml:div")
            .style({"font": "60px 'Arial Black', 'Arial Bold', 'Gadget', 'sans-serif'", "text-align": "center", "color": color})
            .html("<span>" +  yhCount + "</span>")

        svg.append("foreignObject") //homeless young people reported in NAME
            .attr('x', x + 100)
            .attr('y', y)
            .attr("width", w - 100)
            .attr("height", 100)
            .append("xhtml:div")
            //.style({"font": "20px 'Arial', 'Arial Bold"})
            .html("<span style='font-family: Arial; font-size: 20px'>"
            + "homeless young people reported in " + name
            + " in the last 3 months.</span>")

        y += 100;
        svg.append("foreignObject") // rate vs national average
            .attr('x', x)
            .attr('y', y - 15)
            .attr("width", w)
            .attr("height", 200)
            .append("xhtml:div")
            .html("<span style='font-family: Arial; font-size: 20px'>That is a rate of  "
            + "<span style='font-family: Arial; font-weight: 900; font-size: 60px; color:" + color + "'>"
            + yhRate + "</span>"
            + "<span style='font-family: Arial; font-size: 20px'> per 10,000 16-24 year olds.</span>")

    }


    y += 100;
    svg.append("foreignObject") // rate vs national average
        .attr('x', x)
        .attr('y', y - 15)
        .attr("width", w)
        .attr("height", 200)
        .append("xhtml:div")
        .html("<span style='font-family: Arial; font-size: 20px'>On average  "
        + "<span style='font-family: Arial; font-weight: 900; font-size: 60px; color:" + colorAverage + "'>"
        + avgP1ERate + "</span>"
        + "<span style='font-family: Arial; font-size: 20px'> young people per 10,000 are being registered "
        + "as homeless every 3 months.</span>");

    y += 100;


    //--------------Core-------------------------

    y += 50;

    svg.append("image")  //------house image
        .attr("xlink:href", "/images/red-house.png")
        .attr("x",x)
        .attr("y", y - 25)
        .attr("width", 150)
        .attr("height", 150);


    svg.append("foreignObject") //not all homeless people are recorded as homeless
        .attr('x', x + 170)
        .attr('y', y)
        .attr("width", w - 150)
        .attr("height", 100)
        .append("xhtml:div")
        //.style({"font": "20px 'Arial', 'Arial Bold"})
        .html("<p style='font-family: Arial; font-size: 20px;'>"
        + "Not all young homeless people are"
        + "<p style='font-family: Arial; font-size: 20px;'> recorded as homeless.</p>");





    y += 150;
    svg.append("foreignObject")//most are housed by...
        .attr('x', x)
        .attr('y', y)
        .attr("width", w)
        .attr("height", 100)
        .append("xhtml:div")
        //.style({"font": "20px 'Arial', 'Arial Bold"})
        .html("<span style='font-family: Arial; font-size: 20px'>"
        + "Most are housed by housing associations and charities.</span>");

    var core_priority = oData.homeless_data["2014Q1"].core_priority.count;
    var core_non_priority = oData.homeless_data["2014Q1"].core_non_priority.count;
    var core_ratio = Math.round(core_priority /(core_priority + core_non_priority) * 100);

    y += 50;
    svg.append("foreignObject") //had met the criteria
        .attr('x', x)
        .attr('y', y)
        .attr("width", w)
        .attr("height", 150)
        .append("xhtml:div")
        //.style({"font": "20px 'Arial', 'Arial Bold"})
        .html("<span style='font-family: Arial; font-size: 20px'>"
        + "Only "
        + "<span style='font-family: Arial; font-weight: 900; font-size: 60px; color: grey'>"
        + core_ratio + "%</span>"
        + "<span style='font-family: Arial; font-size: 20px'>"
        + " of these had met official criteria.</span>");

    y += 100

    //-----line break-----------------
    y += 50

    linemargin = 20;
    var lineData = [{"x":linemargin, "y": y }, {"x": w - linemargin, "y": y}]

    var lineFunction = d3.svg.line()
        .x(function(d) { return d.x; })
        .y(function(d) { return d.y; })

    var breakline = svg.append("path")
        .attr("d", lineFunction(lineData))
        .attr("stroke", " #D04627")
        .attr("stroke-width", "2.5px")
        .attr("stroke-linecap", "round")
        .attr("stroke-linejoin", "round")
        .attr("fill", "none")


    var a1 = [0, 1]
    //var smallRadius = 5;
    //var bigRadius = 10;
    var aCircRadius = [5, 5];
    var aCircColor = ["#D04627", "#D04627"];
    var aCircX = [linemargin, w - linemargin];

    var breaklinecircles = svg.selectAll("circle.a1")
        .data(a1)
        .enter()
        .append("circle")
        .attr("cx", function(d){console.log(aCircX[d]); return aCircX[d]})
        .attr("cy", y)
        .attr("fill", function(d){return aCircColor[d]})
        .attr("r", function(d){return aCircRadius[d]})

    y += 50;
    //-----line break end-----------------


//  --------Missing Data----------------------------
    y += 50;

    svg.append("image")  //------house image
        .attr("xlink:href", "/images/falling-arrow-red.png")
        .attr("x",x)
        .attr("y", y - 60)
        .attr("width", 150)
        .attr("height", 150);


    svg.append("foreignObject") // --- count
        .attr('x', x + 170)
        .attr('y', y - 20 )
        .attr("width", w - 170)
        .attr("height", 100)
        .append("xhtml:div")
        .style({"font": "20px 'Arial'"})
        .html("<span> Over the last couple of years reporting of homeless youth has been falling. </span>")

    y += 100;
    svg.append("foreignObject") // --- count
        .attr('x', x)
        .attr('y', y )
        .attr("width", w)
        .attr("height", 100)
        .append("xhtml:div")
        .style({"font": "20px 'Arial'"})
        .html("<span style='font-family: Arial; font-size: 20px'> From "
            + "<span style='font-family: Arial; font-weight: 900; font-size: 60px; color: grey'> 97% </span>"
            + "<span style='font-family: Arial; font-size: 20px'> of authorities reporting in 2012."
            + "</span>");

    y += 100;
    svg.append("foreignObject") // --- count
        .attr('x', x)
        .attr('y', y )
        .attr("width", w)
        .attr("height", 100)
        .append("xhtml:div")
        .style({"font": "20px 'Arial'"})
        .html("<span style='font-family: Arial; font-size: 20px'> To below "
        + "<span style='font-family: Arial; font-weight: 900; font-size: 60px; color: grey'> 70% </span>"
        + "<span style='font-family: Arial; font-size: 20px'> reporting in 2014."
        + "</span>");

    y += 100

    //-----line break-----------------
    y += 50

    linemargin = 20;
    var lineData = [{"x":linemargin, "y": y }, {"x": w - linemargin, "y": y}]

    var lineFunction = d3.svg.line()
        .x(function(d) { return d.x; })
        .y(function(d) { return d.y; })

    var breakline = svg.append("path")
        .attr("d", lineFunction(lineData))
        .attr("stroke", " #D04627")
        .attr("stroke-width", "2.5px")
        .attr("stroke-linecap", "round")
        .attr("stroke-linejoin", "round")
        .attr("fill", "none")


    var a1 = [0, 1]
    //var smallRadius = 5;
    //var bigRadius = 10;
    var aCircRadius = [5, 5];
    var aCircColor = ["#D04627", "#D04627"];
    var aCircX = [linemargin, w - linemargin];

    var breaklinecircles = svg.selectAll("circle.a1")
        .data(a1)
        .enter()
        .append("circle")
        .attr("cx", function(d){console.log(aCircX[d]); return aCircX[d]})
        .attr("cy", y)
        .attr("fill", function(d){return aCircColor[d]})
        .attr("r", function(d){return aCircRadius[d]})

    //y += 50;
    //-----line break end-----------------


    //
    //y += 20;
    //svg.append("foreignObject") // --- count
    //    .attr('x', x)
    //    .attr('y', y )
    //    .attr("width", w)
    //    .attr("height", 100)
    //    .append("xhtml:div")
    //    .style({"font": "20px 'Arial'"})
    //    .html("<span style='font-family: Arial; font-size: 20px'>"
    //    + "Below are some of the risk factors that are associated with the young and homeless."
    //    + "</br></br>"
    //    + "Numbers for " + name + ":"
    //    + "</span>");
    //
    //
    //y += 40;


//  --------Risk Factors-------------------------------

    var marginTopRiskText = 100;
    var wRiskText = w;
    var hRiskText = 60;
    var xRiskText = x;

//  ---------------care

    var risk = "care";
    //var riskPercent = Already a rate

    var riskAverage = oNational.risks_data[risk].median;
    var aBuckets = oNational.risks_data[risk].quintiles;
    var colorAverage = selectcolor(riskAverage, aBuckets, true);

    if(oData.risks_data.hasOwnProperty(risk)) {
        var riskRate = Number(oData.risks_data[risk].percent);
        var color = selectcolor(riskRate, aBuckets, true);
    } else {
        var riskRate = "NA"
        var color = "grey"
    }

    //console.log(Number(riskRate))
    y -= 30;
    y += marginTopRiskText;
    svg.append("foreignObject") // --- care
        .attr('x', x)
        .attr('y', y )
        .attr("width", wRiskText)
        .attr("height", hRiskText)
        .append("xhtml:div")
        .style({"font": "25px 'Arial'"})
        .html("<span>Children in care </span>");

    y += 30;
    svg.append("foreignObject") // rate vs national average
        .attr('x', xRiskText)
        .attr('y', y - 15)
        .attr("width", w)
        .attr("height", 200)
        .append("xhtml:div")
        .html("<span style='font-family: Arial; font-weight: 900; font-size: 60px; color:" + color + "'>"
        + riskRate + "</span>"
        + "<span style='font-family: Arial; font-size: 14px'> vs </span>"
        + "<span style='font-family: Arial; font-weight: 900; font-size: 60px; color:" + colorAverage + "'>"
        + riskAverage + "</span>"
        + "<span style='font-family: Arial; font-size: 14px'> per 10,000 national average.</span>");

//  ----------------unemployment

    var risk = "unemployment_total";

    var riskAveragePercent = oNational.risks_data[risk].median; //data as a perecent
    var riskAverage = Math.round(riskAveragePercent * 10) / 10; // want 1 decimal place
    var aBuckets = oNational.risks_data[risk].quintiles;
    var colorAverage = selectcolor(riskAveragePercent, aBuckets, true);

    if(oData.risks_data.hasOwnProperty(risk)) {
        var riskPercent = Number(oData.risks_data[risk].percent);
        var riskRate = Math.round(riskPercent * 10) / 10;
        var color = selectcolor(riskPercent, aBuckets, true);
    } else {
        var riskRate = "NA";
        var color = "grey";
    }

    //console.log(Number(riskRate))

    y += marginTopRiskText;
    svg.append("foreignObject") //---unemployment
        .attr('x', x)
        .attr('y', y )
        .attr("width", wRiskText)
        .attr("height", hRiskText)
        .append("xhtml:div")
        .style({"font": "25px 'Arial'"})
        .html("<span>Youth on Job Seekers Allowance</span>");

    y += 30;
    svg.append("foreignObject") // rate vs national average
        .attr('x', xRiskText)
        .attr('y', y - 15)
        .attr("width", w)
        .attr("height", 200)
        .append("xhtml:div")
        .html("<span style='font-family: Arial; font-weight: 900; font-size: 60px; color:" + color + "'>"
        + riskRate + "%</span>"
        + "<span style='font-family: Arial; font-size: 14px'> vs </span>"
        + "<span style='font-family: Arial; font-weight: 900; font-size: 60px; color:" + colorAverage + "'>"
        + riskAverage + "%</span>"
        + "<span style='font-family: Arial; font-size: 14px'> national average.</span>");


//  ----------------deprivation


    var risk = "deprivation";

    var riskAverage = oNational.risks_data[risk].median;
    var aBuckets = oNational.risks_data[risk].quintiles;
    var colorAverage = selectcolor(riskAverage, aBuckets, false);

    if(oData.risks_data.hasOwnProperty(risk)) {
        var riskRate = Number(oData.risks_data[risk].percent);
        var color = selectcolor(riskRate, aBuckets, false);
    } else {
        var riskRate = "NA"
        var color = "grey"
    }

    var aDep = [65, 130, 195, 260, 326];
    var xScale = d3.scale.linear()
        .domain([0, 326])
        .range([x, x + 450]);
    var barh = 70;

    y += marginTopRiskText;
    svg.append("foreignObject") //---deprivation
        .attr('x', x)
        .attr('y', y )
        .attr("width", wRiskText)
        .attr("height", hRiskText)
        .append("xhtml:div")
        .style({"font": "25px 'Arial'"})
        .html("<span>Deprivation</span>");

    //y += 50;
    //svg.append("foreignObject") // rank out of
    //    .attr('x', xRiskText)
    //    .attr('y', y - 15)
    //    .attr("width", w)
    //    .attr("height", 200)
    //    .append("xhtml:div")
    //    .html("<span style='font-family: Arial; font-size: 20px'>rank out of 326</span>");

    x = 0;
    y += 30;
    var depRect = svg.selectAll("rect.aDep") //bar box
        .data(aDep)
        .enter()
        .append("rect")
        .attr('x', function(d, i){
            return xScale(x + i * 65.2)
        })
        .attr('width', function(d){
            return xScale(65.2)
        })
        .attr('y',y)
        .attr('height', barh )
        .attr('fill', function(d){
            return selectcolor(d - 10 , aBuckets, false)
        })
        .attr('stroke', 'white')
        .attr('stroke-width', '3')

    y += -2;
    svg.append("foreignObject") // rate vs national average
        .attr('x', function(){
            if(riskRate > 99){extra = 5} else {extra = 15}
            return xScale(Math.floor((riskRate)/65)*65) + x + extra
        })
        .attr('y', y - 5)
        .attr("width", w)
        .attr("height", 200)
        .attr('text-anchor', 'middle')
        .append("xhtml:div")
        .html("<span style='font-family: Arial Narrow; font-weight: 900; font-size: 60px; color:white'>"
        + riskRate + "</span>");
    //+ "<span style='font-family: Arial; font-size: 20px'></span>");


    y += 90;
    svg.append("foreignObject") // rate vs national average
        .attr('x', xRiskText)
        .attr('y', y - 15)
        .attr("width", w)
        .attr("height", 20)
        .append("xhtml:div")
        .html("<span style='font-family: Arial; font-size: 14px'>Dark red indicate a high concentration of deprivation</span>");

    y -= 40;



//  ----------------education level 3

    var risk = "education_level3";

    var riskAverage = oNational.risks_data[risk].median;
    var aBuckets = oNational.risks_data[risk].quintiles;
    var colorAverage = selectcolor(riskAverage, aBuckets, false);

    if(oData.risks_data.hasOwnProperty(risk)) {
        var riskRate = Number(oData.risks_data[risk].percent);
        var color = selectcolor(riskRate, aBuckets, false);
    } else {
        var riskRate = "NA";
        var color = "grey";
    }

    y += marginTopRiskText;
    svg.append("foreignObject") //---education level 3
        .attr('x', x)
        .attr('y', y )
        .attr("width", wRiskText)
        .attr("height", hRiskText)
        .append("xhtml:div")
        .style({"font": "25px 'Arial'"})
        .html("<span>A levels and equivalents</span>");

    y += 30;
    svg.append("foreignObject") // rate vs national average
        .attr('x', xRiskText)
        .attr('y', y - 15)
        .attr("width", w)
        .attr("height", 200)
        .append("xhtml:div")
        .html("<span style='font-family: Arial; font-weight: 900; font-size: 60px; color:" + color + "'>"
        + riskRate + "%</span>"
        + "<span style='font-family: Arial; font-size: 14px'> vs </span>"
        + "<span style='font-family: Arial; font-weight: 900; font-size: 60px; color:" + colorAverage + "'>"
        + riskAverage + "%</span>"
        + "<span style='font-family: Arial; font-size: 14px'>  national average.</span>");


//  ----------------education attainment gap

    var risk = "education_attainment_gap";

    var riskAverage = oNational.risks_data[risk].median;
    var aBuckets = oNational.risks_data[risk].quintiles;
    var colorAverage = selectcolor(riskAverage, aBuckets, true);

    if(oData.risks_data.hasOwnProperty(risk)) {
        var riskRate = Number(oData.risks_data[risk].percent);
        var color = selectcolor(riskRate, aBuckets, true);
    } else {
        var riskRate = "NA";
        var color = "grey";
    }

    //console.log(Number(riskRate))

    y += marginTopRiskText;
    svg.append("foreignObject") //---education attainment gap
        .attr('x', x)
        .attr('y', y )
        .attr("width", wRiskText)
        .attr("height", hRiskText)
        .append("xhtml:div")
        .style({"font": "25px 'Arial'"})
        .html("<span>Achievement gap</span>");

    y += 30;
    svg.append("foreignObject") // rate vs national average
        .attr('x', xRiskText)
        .attr('y', y - 15)
        .attr("width", w)
        .attr("height", 200)
        .append("xhtml:div")
        .html("<span style='font-family: Arial; font-weight: 900; font-size: 60px; color:" + color + "'>"
        + riskRate + "%</span>"
        + "<span style='font-family: Arial; font-size: 14px'> vs </span>"
        + "<span style='font-family: Arial; font-weight: 900; font-size: 60px; color:" + colorAverage + "'>"
        + riskAverage + "%</span>"
        + "<span style='font-family: Arial; font-size: 14px'>  national average.</span>");


//  ----------------apprenticeship

    var risk = "apprenticeship";

    var riskAveragePercent = oNational.risks_data[risk].median;
    var riskAverage = Math.round(riskAveragePercent* 10);
    var aBuckets = oNational.risks_data[risk].quintiles;
    var colorAverage = selectcolor(riskAveragePercent, aBuckets, false);

    if(oData.risks_data.hasOwnProperty(risk)) {
        var riskPercent = Number(oData.risks_data[risk].percent);
        var riskRate = Math.round(riskPercent * 10);
        var color = selectcolor(riskPercent, aBuckets, false);
    } else {
        var riskRate = "NA";
        var color = "grey";
    }

    //console.log(Number(riskRate))

    y += marginTopRiskText;
    svg.append("foreignObject") //---apprenticeship
        .attr('x', x)
        .attr('y', y )
        .attr("width", wRiskText)
        .attr("height", hRiskText)
        .append("xhtml:div")
        .style({"font": "25px 'Arial'"})
        .html("<span>Apprenticeship starts</span>");

    y += 30;
    svg.append("foreignObject") // rate vs national average
        .attr('x', xRiskText)
        .attr('y', y - 15)
        .attr("width", w)
        .attr("height", 200)
        .append("xhtml:div")
        .html("<span style='font-family: Arial; font-weight: 900; font-size: 60px; color:" + color + "'>"
        + riskRate + "</span>"
        + "<span style='font-family: Arial; font-size: 14px'> vs </span>"
        + "<span style='font-family: Arial; font-weight: 900; font-size: 60px; color:" + colorAverage + "'>"
        + riskAverage + "</span>"
        + "<span style='font-family: Arial; font-size: 14px'>  per 1000 national average.</span>");


//  ----------------truancy

    var risk = "truancy";

    var riskAveragePercent = oNational.risks_data[risk].median;
    var riskAverage = Math.round(riskAveragePercent* 10);
    var aBuckets = oNational.risks_data[risk].quintiles;
    var colorAverage = selectcolor(riskAveragePercent, aBuckets, true);

    if(oData.risks_data.hasOwnProperty(risk)) {
        var riskPercent = Number(oData.risks_data[risk].percent);
        var riskRate = Math.round(riskPercent * 10);
        var color = selectcolor(riskPercent, aBuckets, true);
    } else {
        var riskRate = "NA";
        var color = "grey";
    }

    //console.log(Number(riskRate))

    y += marginTopRiskText;
    svg.append("foreignObject") //---truancy
        .attr('x', x)
        .attr('y', y )
        .attr("width", wRiskText)
        .attr("height", hRiskText)
        .append("xhtml:div")
        .style({"font": "25px 'Arial'"})
        .html("<span>Persistent truants</span>");

    y += 30;
    svg.append("foreignObject") // rate vs national average
        .attr('x', xRiskText)
        .attr('y', y - 15)
        .attr("width", w)
        .attr("height", 200)
        .append("xhtml:div")
        .html("<span style='font-family: Arial; font-weight: 900; font-size: 60px; color:" + color + "'>"
        + riskRate + "</span>"
        + "<span style='font-family: Arial; font-size: 14px'> vs </span>"
        + "<span style='font-family: Arial; font-weight: 900; font-size: 60px; color:" + colorAverage + "'>"
        + riskAverage + "</span>"
        + "<span style='font-family: Arial; font-size: 14px'>  per 1000 national average.</span>");



//  ----------------hospital admissions

    var risk = "hospital";

    //var riskAveragePercent = oNational.risks_data[risk].median;
    var riskAverage = Math.round(oNational.risks_data[risk].median);
    var aBuckets = oNational.risks_data[risk].quintiles;
    var colorAverage = selectcolor(riskAverage, aBuckets, true);

    if(oData.risks_data.hasOwnProperty(risk)) {
        //var riskPercent = Number(oData.risks_data[risk].percent);
        var riskRate = Math.round(Number(oData.risks_data[risk].percent));
        var color = selectcolor(riskRate, aBuckets, true);
    } else {
        var riskRate = "NA";
        var color = "grey";
    }

    //console.log(Number(riskRate))

    y += marginTopRiskText;
    svg.append("foreignObject") //---hospital
        .attr('x', x)
        .attr('y', y )
        .attr("width", wRiskText)
        .attr("height", hRiskText)
        .append("xhtml:div")
        .style({"font": "25px 'Arial'"})
        .html("<span>Emergency hospital admissions</span>");

    y += 30;
    svg.append("foreignObject") // rate vs national average
        .attr('x', xRiskText)
        .attr('y', y - 15)
        .attr("width", w)
        .attr("height", 200)
        .append("xhtml:div")
        .html("<span style='font-family: Arial; font-weight: 900; font-size: 60px; color:" + color + "'>"
        + riskRate + "</span>"
        + "<span style='font-family: Arial; font-size: 14px'> vs </span>"
        + "<span style='font-family: Arial; font-weight: 900; font-size: 60px; color:" + colorAverage + "'>"
        + riskAverage + "</span>"
        + "<span style='font-family: Arial; font-size: 14px'>  per 10,000 national average.</span>");


//  ----------------mental health

    var risk = "mentalhealth";

    var riskAveragePercent = oNational.risks_data[risk].median; //data as a perecent
    var riskAverage = Math.round(riskAveragePercent * 10) / 10; // want 1 decimal place
    var aBuckets = oNational.risks_data[risk].quintiles;
    var colorAverage = selectcolor(riskAveragePercent, aBuckets, true);

    if(oData.risks_data.hasOwnProperty(risk)) {
        var riskPercent = Number(oData.risks_data[risk].percent);
        var riskRate = Math.round(riskPercent * 10) / 10;
        var color = selectcolor(riskPercent, aBuckets, true);
    } else {
        var riskRate = "NA";
        var color = "grey";
    }

    //console.log(Number(riskRate))

    y += marginTopRiskText;
    svg.append("foreignObject") //---mental health
        .attr('x', x)
        .attr('y', y )
        .attr("width", wRiskText)
        .attr("height", hRiskText)
        .append("xhtml:div")
        .style({"font": "25px 'Arial'"})
        .html("<span>Mental health problems (all ages)</span>");

    y += 30;
    svg.append("foreignObject") // rate vs national average
        .attr('x', xRiskText)
        .attr('y', y - 15)
        .attr("width", w)
        .attr("height", 200)
        .append("xhtml:div")
        .html("<span style='font-family: Arial; font-weight: 900; font-size: 60px; color:" + color + "'>"
        + riskRate + "%</span>"
        + "<span style='font-family: Arial; font-size: 14px'> vs </span>"
        + "<span style='font-family: Arial; font-weight: 900; font-size: 60px; color:" + colorAverage + "'>"
        + riskAverage + "%</span>"
        + "<span style='font-family: Arial; font-size: 14px'> national average.</span>");




    //y += 150;
    //svg.append("foreignObject") // rate vs national average
    //    .attr('x', 50)
    //    .attr('y', y - 15)
    //    .attr("width", 400)
    //    .attr("height", 200)
    //    .append("xhtml:div")
    //    .html("<span style='font-family: Arial; font-size: 20px'>"
    //    + "This infographic was built using open data </br> on the </span>"
    //    + "<a style='font-family: Arial; font-weight: 900; font-size: 20px; color: steelblue'"
    //    + " href='http://nquiringminds.com/smart-cities/'>Open City Data Platform</a>");

    y += 50

    //update svg height
    svg.attr("viewBox", "0 0 " + (margin.left + w + margin.right) + " " + (margin.top + y + margin.bottom) )

//    $(".featureInfoModal").modal("show");

  return hackDiv;
}




//-------------------------------------------------------

function riskFactorClick(event){
    $(".riskFactorsModal").modal("show");
}

