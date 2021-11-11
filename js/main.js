var matrixBusinessTies;
var matrixMarriages;
var matrixvis;

d3.text('data/BusinessTies').then(function (BusinessTies){
    var row_list = BusinessTies.replace(/\r?|\r/g, "").split('\n');
    matrixBusinessTies = row_list.map((r) => r.split(','));
})

d3.text('data/Marriages').then(function (Marriages){
    var row_list = Marriages.replace(/\r?|\r/g, "").split('\n');
    matrixMarriages = row_list.map((r) => r.split(','));
})

d3.csv('data/florentine-family-attributes.csv').then(function(data) {
    matrixvis = new MatrixVis("matrixvis", data, matrixBusinessTies, matrixMarriages)
})
