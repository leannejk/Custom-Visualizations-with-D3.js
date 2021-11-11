
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
        vis.width = 470,
        vis.height = 470;

    vis.cellHeight = 20, vis.cellWidth = 20, vis.cellPadding = 10;


    vis.svg = d3.select("#" + vis.parentElement).append("svg")
        .attr("width", vis.width + vis.margin.left + vis.margin.right)
        .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
        .style("margin-left", vis.margin.left + "px")
        .append("g")
        .attr("transform", "translate(" + vis.margin.left + "," + vis.margin.top + ")");

    // vis.svg.append("rect")
    //     .attr("class", "background")
    //     .attr("width", vis.width)
    //     .attr("height", vis.height);

    vis.x = d3.scaleBand()
        .domain(d3.range(16))
        .range([0, vis.width])

    vis.y = d3.scaleBand()
        .domain(d3.range(16))
        .range([0, vis.height])



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

    vis.currentData = vis.dataVis

    vis.columnLabels = new Array(16);
    vis.rowLabels = new Array(16);

    for (var i = 0; i < 16; i++) {
        vis.columnLabels[i] = vis.dataVis[i]["name"];
        vis.rowLabels[i] = vis.dataVis[i]["name"];
    }

    vis.row = vis.svg.selectAll(".row")
        .data(vis.dataVis)
        .enter().append("g")
        .attr("class", "row")
        .attr("transform", function(d, i) { return "translate(0," + vis.y(i) + ")"; });

    vis.column = vis.svg.selectAll(".column")
        .data(vis.columnLabels)
        .enter().append("g")
        .attr("class", "column")
        .attr("transform", function(d, i) { return "translate(" + vis.x(i) + ")rotate(-90)"; });



    console.log(vis.dataVis)


    vis.updateVis();
}


/*
 * The drawing function
 */

MatrixVis.prototype.updateVis = function(){
    var vis = this;
    vis.counterM = 0;
    vis.indexM = 0;
    vis.counterB = 0;
    vis.indexB = 0;

    vis.dataVis = vis.currentData;

    var select = document.getElementById('sort-chosen');
    var valueSelected = String(select.options[select.selectedIndex].value);

    if(valueSelected !== "ab"){
        vis.dataVis = vis.currentData.sort(function (a,b) {return b[valueSelected] - a[valueSelected]})
    }

    console.log(valueSelected)
    console.log(vis.dataVis)

    //update row labels:
    for (var i = 0; i < 16; i++) {
        vis.rowLabels[i] = vis.dataVis[i]["name"];
    }

    console.log(vis.rowLabels)

    vis.trianglePath = vis.row.selectAll(".triangle-path")
        .data(vis.dataVis);

    vis.trianglePath.enter().append("path")
        .attr("class", "triangle-path")
        .merge(vis.trianglePath)
        .transition(3000)
        .attr("d", function(d, index) {
        var x = (vis.cellWidth + vis.cellPadding) * index;
        var y = 0;

        return 'M ' + x +' '+ y + ' l ' + vis.cellWidth + ' 0 l 0 ' + vis.cellHeight + ' z';
    })
        .attr("fill", function (d,i){
            vis.counterM++;
            if(vis.counterM === 17){
                vis.counterM = 0;
                vis.indexM++;
            }
            if(vis.dataVis[vis.indexM]["marriageValues"][i] == "1"){
                return "#94D0DD"
            } else return "#efeff0"
        })

    vis.trianglePath.enter().append("path")
        .attr("class", "triangle-path2")
        .merge(vis.trianglePath)
        .transition(3000)
        .attr("d", function(d, index) {
            var x = (vis.cellWidth + vis.cellPadding) * index;
            var y = 0;
            return 'M ' + x +' '+ y + ' l 0 ' + vis.cellHeight + ' l ' + vis.cellWidth + ' 0 z';
        })
        .attr("fill", function (d,i){
            vis.counterB++;
            if(vis.counterB === 17){
                vis.counterB = 0;
                vis.indexB++;
            }
            if(vis.dataVis[vis.indexB]["businessValues"][i] == "1"){
                return "#dda194"
            } else return "#efeff0"
        })

    vis.trianglePath.exit().remove();

    //delete previous text:
    var element = Array.prototype.slice.call(document.getElementsByTagName("text"),0);

    for (var index = 0, len = element.length; index < len; index++) {
        element[index].parentNode.removeChild(element[index]);
    }

    vis.row.append("text")
        .attr("x", 0)
        .attr("y", function(d, i) { return vis.y(i) / 30; })
        .attr("dy", ".32em")
        .attr("text-anchor", "end")
        .text(function(d, i) { return vis.rowLabels[i] });

    vis.column.append("text")
        .attr("x", 6)
        .attr("y",function(d, i) { return vis.y(i)  / 30; })
        .attr("dy", ".32em")
        .attr("text-anchor", "start")
        .text(function(d, i) { return d; });

}
