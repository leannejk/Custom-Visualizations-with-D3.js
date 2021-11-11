
/*
 * MatrixVis - Object constructor function
 * @param _parentElement 	-- the HTML element in which to draw the visualization
 * @param _data						-- the actual data: perDayData
 */

MatrixVis = function(_parentElement, _data, _businessData, _marriagesData){
    this.parentElement = _parentElement;
    this.data = _data;
    this.matrixBusinessTies = _businessData
    this.matrixMarriages = _marriagesData

    this.initVis();
}


/*
 * Initialize visualization (static content, e.g. SVG area or axes)
 */

MatrixVis.prototype.initVis = function(){
    var vis = this;

    vis.margin = {top: 100, right: 100, bottom: 100, left: 100},
        width = 480,
        height = 480;

    vis.svg = d3.select("#" + vis.parentElement).append("svg")
        .attr("width", width + vis.margin.left + vis.margin.right)
        .attr("height", height + vis.margin.top + vis.margin.bottom)
        .style("margin-left", vis.margin.left + "px")
        .append("g")
        .attr("transform", "translate(" + vis.margin.left + "," + vis.margin.top + ")");

    vis.svg.append("rect")
        .attr("class", "background")
        .attr("width", width)
        .attr("height", height);

    vis.x = d3.scaleBand()
        .domain(d3.range(16))
        .range([0, width])
        .padding(0.1);

    vis.y = d3.scaleBand()
        .domain(d3.range(16))
        .range([0, height])
        .padding(0.1);



    // (Filter, aggregate, modify data)
    vis.wrangleData();
}


/*
 * Data wrangling
 */

MatrixVis.prototype.wrangleData = function(){
    var vis = this;

    vis.dataVis = [];
    var tempDict = {}
        vis.data.forEach(function (d, index){
            tempDict["index"] = index;
            tempDict["name"] = d.Family;
            tempDict["businessTies"] = vis.matrixBusinessTies[index].reduce((n, x) => n + (x === "1"), 0);
            tempDict["businessValues"]= vis.matrixBusinessTies[index];
            tempDict["marriages"] = vis.matrixMarriages[index].reduce((n, x) => n + (x === "1"), 0);
            tempDict["marriageValues"] = vis.matrixMarriages[index]
            tempDict["numberPriorates"] = d.Priorates
            tempDict["wealth"] = d.Wealth
            tempDict["allRelations"] = vis.matrixBusinessTies[index].reduce((n, x) => n + (x === "1"), 0)
                + vis.matrixMarriages[index].reduce((n, x) => n + (x === "1"), 0);

            vis.dataVis.push(tempDict);
            tempDict = {};

        })

    vis.columnLabels = new Array(16);
    vis.rowLabels = new Array(16);

    for (var i = 0; i < 16; i++) {
        vis.columnLabels[i] = vis.dataVis[i]["name"];
        vis.rowLabels[i] = vis.dataVis[i]["name"];
    }



    console.log(vis.columnLabels)


    vis.updateVis();
}


/*
 * The drawing function
 */

MatrixVis.prototype.updateVis = function(){
    var vis = this;

    //update row labels:
    for (var i = 0; i < 16; i++) {
        vis.rowLabels[i] = vis.dataVis[i]["name"];
    }

    vis.row = vis.svg.selectAll(".row")
        .data(vis.dataVis)
        .enter().append("g")
        .attr("class", "row")
        .attr("transform", function(d, i) { return "translate(0," + vis.y(i) + ")"; });

    vis.row.selectAll('rect')
        .data(function(d) { return d; })
        .enter()
        .append('rect')
        .attr('x', 20)
        .attr('y', 20)
        .attr('width', vis.x.bandwidth())
        .attr('height', vis.y.bandwidth())
        .attr('stroke', 'gray')
        .attr('stroke-width', 0.5)
        .attr('fill', "black")

    // vis.row.selectAll(".cell")
    //     .data(function(d) { return d; })
    //     .enter().append("rect")
    //     .attr("class", "cell")
    //     .attr("x", function(d, i) { return vis.x(i); })
    //     .attr("width", 30)
    //     .attr("height", 30)
    //     .style("fill", "black");

    vis.row.append("line")
        .attr("x2", width);

    vis.row.append("text")
        .attr("x", 0)
        .attr("y", function(d, i) { return vis.y(i) / 2; })
        .attr("dy", ".32em")
        .attr("text-anchor", "end")
        .text(function(d, i) { return vis.rowLabels[i] });

    vis.column = vis.svg.selectAll(".column")
        .data(vis.columnLabels)
        .enter().append("g")
        .attr("class", "column")
        .attr("transform", function(d, i) { return "translate(" + vis.x(i) + ")rotate(-90)"; });

    vis.column.append("line")
        .attr("x1", -width);

    vis.column.append("text")
        .attr("x", 6)
        .attr("y",function(d, i) { return vis.y(i) / 2; })
        .attr("dy", ".32em")
        .attr("text-anchor", "start")
        .text(function(d, i) { return d; });

    // var bars = vis.svg.selectAll(".bar")
    //     .data(this.displayData)
    //
    // bars.enter().append("rect")
    //     .attr("class", "bar")
    //
    //     .merge(bars)
    //     .transition()
    //     .attr("width", vis.x.bandwidth())
    //     .attr("height", function(d){
    //         return vis.height - vis.y(d);
    //     })
    //     .attr("x", function(d, index){
    //         return vis.x(index);
    //     })
    //     .attr("y", function(d){
    //         return vis.y(d);
    //     })
    //
    // bars.exit().remove();
    //
    // // Call axis function with the new domain
    // vis.svg.select(".y-axis").call(vis.yAxis);
    //
    // // Update x-axis tick values to something more meaningful
    // vis.svg.select(".x-axis").call(vis.xAxis)
    //     .selectAll("text")
    //     .text(function(d){
    //         return vis.metaData.choices[d + 100];
    //     })
    //     .attr("transform", 'rotate(-45)')
    //     .style("text-anchor", "end")
}
