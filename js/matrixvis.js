
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
        .attr("id" , "rowFather")
        .attr("transform", "translate(" + vis.margin.left + "," + vis.margin.top + ")");

    vis.tooltip = d3.select('body').append('div')
        .attr('class', 'tooltip')
        .style('opacity', 0)

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
    vis.initialData = vis.dataVis

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

    vis.column.append("text")
        .attr("x", 6)
        .attr("y",function(d, i) { return vis.y(i)  / 30; })
        .attr("dy", ".32em")
        .attr("text-anchor", "start")
        .text(function(d, i) { return d; });

    vis.updateVis();
}


/*
 * The drawing function
 */

MatrixVis.prototype.updateVis = function(){
    var vis = this;
    vis.counterM = 0;
    vis.indexM = -1;
    vis.counterB = 0;
    vis.indexB = -1;

    var select = document.getElementById('sort-chosen');
    var valueSelected = String(select.options[select.selectedIndex].value);

    if(valueSelected !== "ab"){
        vis.dataVis = vis.dataVis.sort(function (a,b) {return b[valueSelected] - a[valueSelected]})
    }
    else{
        vis.dataVis = vis.dataVis.sort(function (a,b) {return a.name.localeCompare(b.name)})
    }

    //update row labels:
    for (var i = 0; i < 16; i++) {
        vis.rowLabels[i] = vis.dataVis[i]["name"];
    }

    vis.trianglePath1 = vis.row.selectAll(".triangle-path1")
        .data(vis.dataVis);

    vis.path1 = vis.trianglePath1.enter().append("path")
        .attr("class", "triangle-path1")
        .merge(vis.trianglePath1)

    vis.path1.transition(10000)
        .attr("d", function(d, index) {
            var x = (vis.cellWidth + vis.cellPadding) * index;
            var y = 0;

            return 'M ' + x +' '+ y + ' l ' + vis.cellWidth + ' 0 l 0 ' + vis.cellHeight + ' z';
        })
        .attr("fill", function (d,i){
            if(i === 0){
                vis.indexM++;
            }
            if(vis.dataVis[vis.indexM]["marriageValues"][i] == "1"){
                return "#94D0DD"
            } else return "#efeff0"
        })


        vis.path1
            .on('mouseover', function(event, d) {
                var index = d["index"]

                 vis.svg.selectAll('path')
                .attr('style', "opacity : 0.2")

                var children = event["path"][1].childNodes
                for (var i = 0 ; i < children.length; i++){
                    children[i].style.opacity = "1";
                }

                var rows = document.getElementById("rowFather").childNodes
                for(var j = 0; j < 16; j ++){
                    var child = rows[j].childNodes
                    child[index].style.opacity = "1"
                    child[index + 16].style.opacity = "1"

                }
            vis.tooltip.transition().duration(5000).style('opacity', 0.9)
        })
            .on('mouseout', function (){
                vis.svg.selectAll('path').attr('style', "opacity : 1")
                vis.tooltip.transition().duration(5000).style('opacity', 0)
            })

    vis.trianglePath1.exit().remove();

    vis.trianglePath2 = vis.row.selectAll(".triangle-path2")
        .data(vis.dataVis);

    vis.path2 = vis.trianglePath2.enter().append("path")
        .attr("class", "triangle-path2")
        .merge(vis.trianglePath2)


    vis.path2.transition(10000)
        .attr("d", function(d, index) {
            var x = (vis.cellWidth + vis.cellPadding) * index;
            var y = 0;
            return 'M ' + x +' '+ y + ' l 0 ' + vis.cellHeight + ' l ' + vis.cellWidth + ' 0 z';
        })
        .attr("fill", function (d,i){
            if(i === 0){
                vis.indexB++;
            }
            if(vis.dataVis[vis.indexB]["businessValues"][i] == "1"){
                return "#dda194"
            } else return "#efeff0"
        })


    vis.path2
        .on('mouseover', function(event, d) {
            var index = d["index"]

            vis.svg.selectAll('path')
                .attr('style', "opacity : 0.2")

            var children = event["path"][1].childNodes
            for (var i = 0 ; i < children.length; i++){
                children[i].style.opacity = "1";
            }

            var rows = document.getElementById("rowFather").childNodes
            for(var j = 0; j < 16; j ++){
                var child = rows[j].childNodes
                child[index].style.opacity = "1"
                child[index + 16].style.opacity = "1"

            }
            vis.tooltip.transition().duration(5000).style('opacity', 0.9)
        })
        .on('mouseout', function (){
            vis.svg.selectAll('path').attr('style', "opacity : 1")
            vis.tooltip.transition().duration(5000).style('opacity', 0)
        })

    vis.trianglePath2.exit().remove();

    // vis.textRow = vis.row.selectAll("text")
    //     .data(vis.dataVis)
    //
    // vis.textRow.enter().append("text")
    //     .attr("x", 0)
    //     .attr("dy", ".32em")
    //     .attr("text-anchor", "end")
    //     .merge(vis.textRow)
    //     .attr("y", function(d, i) { return vis.y(i) / 30; })
    //     .text(function(d, i) { return vis.rowLabels[i] });
    //
    // vis.textRow.exit().remove()

    //delete previous text:
    var element = Array.prototype.slice.call(document.getElementsByClassName("rowText"),0);

    for (var index = 0, len = element.length; index < len; index++) {
        element[index].parentNode.removeChild(element[index]);
    }

    vis.row.append("text")
        .attr("class", "rowText")
        .attr("x", 0)
        .attr("y", function(d, i) { return vis.y(i) / 30; })
        .attr("dy", ".32em")
        .attr("text-anchor", "end")
        .text(function(d, i) { return vis.rowLabels[i] });




}
