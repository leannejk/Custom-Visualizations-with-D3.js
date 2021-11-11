
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
        width = 384,
        height = 256;

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


    // vis.updateVis();
}


/*
 * The drawing function
 */

// PrioVis.prototype.updateVis = function(){
//     var vis = this;
//
//     // Update domains
//     vis.y.domain([0, d3.max(vis.displayData)]);
//
//     var bars = vis.svg.selectAll(".bar")
//         .data(this.displayData)
//
//     bars.enter().append("rect")
//         .attr("class", "bar")
//
//         .merge(bars)
//         .transition()
//         .attr("width", vis.x.bandwidth())
//         .attr("height", function(d){
//             return vis.height - vis.y(d);
//         })
//         .attr("x", function(d, index){
//             return vis.x(index);
//         })
//         .attr("y", function(d){
//             return vis.y(d);
//         })
//
//     bars.exit().remove();
//
//     // Call axis function with the new domain
//     vis.svg.select(".y-axis").call(vis.yAxis);
//
//     // Update x-axis tick values to something more meaningful
//     vis.svg.select(".x-axis").call(vis.xAxis)
//         .selectAll("text")
//         .text(function(d){
//             return vis.metaData.choices[d + 100];
//         })
//         .attr("transform", 'rotate(-45)')
//         .style("text-anchor", "end")
// }

MatrixVis.prototype.count = function(lit = false) {
    if ( !lit ) { return this.length}
    else {
        var count = 0;
        for ( var i=0; i < this.length; i++ ) {
            if ( lit == this[i] ){
                count++
            }
        }
        return count;
    }
}