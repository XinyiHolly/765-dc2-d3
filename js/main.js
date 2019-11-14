var dataFile;
var reviewerID;
var reviewerNum;
var path = '/data/';
var margin, width, height;
// Build color scale
var myColor = d3.scaleLinear()
                .range(["white", "#ae69b3"])
                .domain([0,5])

// The label of columns
var productIDs = [];
var ratings = [];
var allReviewers = [];
var allReviewerIDs = [];
var otherReviewers = [];
var otherReviewerIDs = [];
// The label of rows
var selectReviewers = [];
var selectReviewerIDs = [];

reDraw();

function reDraw() {
  clearVis();
  clearArrays();
  console.log(document.getElementById("datasize").value);
  dataFile = document.getElementById("datasize").value.concat('.csv');
  initVis();
  // visLegend();
}

function visLegend() {
  var legend = d3.select("#legend")
    .append("svg")
    .data([0,1,2,3,4,5])
      .enter()
    .append("g")
      .attr({
        'class': 'legend',
        'transform': function(d, i) {
                console.log(d);
          return "translate(" + (i * 40) + "," + (height + margin.bottom - 40) + ")";
        }
      });

  legend.append("rect")
  .attr({
    'width': 40,
    'height': 20,
      'fill': function(d) {
        myColor(d);
      }
  });

  legend.append("text")
  .attr({
    'font-size': 10,
    'x': 0,
    'y': 30
  })
}

function subRedraw1() {
  clearVis();
  clearSelectArrays();

  reviewerID = document.getElementById("reviewerid").value;

  if (reviewerID === 'ALL') {
    document.getElementById("reviewersbundle").hidden = true;
    // Set dimensions and margins of the graph and append svg object
    var svg = setAndAppend(allReviewerIDs.length, allProductIDs.length);
    visData(allReviewers, svg, allReviewerIDs, allProductIDs);
  } else {  
    initReviewerNums();
    document.getElementById("reviewersbundle").hidden = false;
    reviewerNum = document.getElementById("reviewernum").value;   
    // Select and reorganize top reviewers
    selectTopReviewers(allReviewers);
    var svg = setAndAppend(selectReviewerIDs.length, productIDs.length);
    visData(selectReviewers, svg, selectReviewerIDs, productIDs);
  }
}

function subRedraw2() {
  clearVis();
  clearSelectArrays();

  if (reviewerID === 'ALL') {
    document.getElementById("reviewersbundle").hidden = true;
    // Set dimensions and margins of the graph and append svg object
    var svg = setAndAppend(allReviewerIDs.length, allProductIDs.length);
    visData(allReviewers, svg, allReviewerIDs, allProductIDs);
  } else {
    document.getElementById("reviewersbundle").hidden = false; 
    reviewerNum = document.getElementById("reviewernum").value;  
    // Select and reorganize top reviewers
    selectTopReviewers(allReviewers);
    var svg = setAndAppend(selectReviewerIDs.length, productIDs.length);
    visData(selectReviewers, svg, selectReviewerIDs, productIDs);
  }
}

function clearVis() {
  d3.select("svg").remove();
}

function clearSelectArrays() {
  productIDs = [];
  ratings = [];
  selectReviewers = [];
  selectReviewerIDs = [];
}

function clearArrays() {
  productIDs = [];
  ratings = [];
  allReviewers = [];
  allReviewerIDs = [];
  allProductIDs = [];
  otherReviewers = [];
  otherReviewerIDs = [];
  selectReviewers = [];
  selectReviewerIDs = [];
}

function initVis() {

  d3.csv(path.concat(dataFile), function(data) {

    // Select and reorganize all reviewers
    selectAllReviewers(data);

    // Show all reviewers or get the target reviewer id
    initTargetReviewerIDs();

    reviewerID = document.getElementById("reviewerid").value;

    // Visualize the data
    if (reviewerID === 'ALL') {
      document.getElementById("reviewersbundle").hidden = true;
      // Set dimensions and margins of the graph and append svg object
      var svg = setAndAppend(allReviewerIDs.length, allProductIDs.length);
      visData(allReviewers, svg, allReviewerIDs, allProductIDs);
    } else {
      document.getElementById("reviewersbundle").hidden = false;
      // Show all possible visible reviewer numbers or hide
      initReviewerNums();
      // Select and reorganize top reviewers
      selectTopReviewers(data);
      var svg = setAndAppend(selectReviewerIDs.length, productIDs.length);
      visData(selectReviewers, svg, selectReviewerIDs, productIDs);
    }
  })
}

function initReviewerNums() {
  var reviewernum = document.getElementById("reviewernum");
  var length = reviewernum.options.length;
  for (i = length - 1; i >= 0; i--) {
    reviewernum.remove(i);
  }
  for (i = 0; i < allReviewerIDs.length; i++) {
    option = document.createElement("option");
    option.text = i;
    option.value = i;
    reviewernum.add(option);
  }
  reviewernum.value = allReviewerIDs.length - 1;
}

function initTargetReviewerIDs() {
  var reviewerid = document.getElementById("reviewerid");
  var length = reviewerid.options.length;
  for (i = length - 1; i >= 0; i--) {
    reviewerid.remove(i);
  }
  var option = document.createElement("option");
  option.text = 'ALL';
  option.value = 'ALL';
  reviewerid.add(option);
  allReviewerIDs.forEach(function(item, index){
    option = document.createElement("option");
    option.text = item;
    option.value = item;
    reviewerid.add(option);
  })
}

function selectAllReviewers(data) {
  allReviewers = data;
  // Sort records of all reviewers based on: 1. reviewerID ascendingly; 2. rating descendingly
  allReviewers.sort(function(a, b){
    if (a.reviewerID === b.reviewerID) {
      return parseInt(b.rating) - parseInt(a.rating);
    }
    return parseInt(a.reviewerID) - parseInt(b.reviewerID);
  })

  // Get all reviewers' distinct IDs
  allReviewers.forEach(function (item, index) {
    allReviewerIDs.push(item.reviewerID);
    allProductIDs.push(item.productID);
  })
  allReviewerIDs = Array.from(new Set(allReviewerIDs));
  allProductIDs.sort(function(a, b) {
    if (a === b) {
      return b - a;
    }
    return a - b;
  })
  allProductIDs = Array.from(new Set(allProductIDs));
}

function setAndAppend(reviewerNum, productNum) {
  // set the dimensions and margins of the graph
  margin = {top: 30, right: 30, bottom: 50, left: 50};
  width = 50 * productNum;
  height = 50 * reviewerNum + 1;

  // append the svg object to the body of the page
  var svg = d3.select("#my_dataviz")
              .append("svg")
                .attr("width", width + margin.left + margin.right)
                .attr("height", height + margin.top + margin.bottom)
              .append("g")
                .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
  return svg;
}

function visData(data, svg, reviewers, products) {

  // Build X scales and axis:
  var x = d3.scaleBand()
            .range([ 0, width ])
            .domain(products)
            .padding(0.01);
  svg.append("g")
      .attr("transform", "translate(0," + height + ")")
     .call(d3.axisBottom(x))


  // text label for the x axis
  svg.append("text")             
      .attr("transform",
            "translate(" + (width/2) + " ," + 
                           (height + margin.top + 20) + ")")
      .style("text-anchor", "middle")
      .text("Product ID");

  // Build Y scales and axis:
  var y = d3.scaleBand()
            .range([ 0, height ])
            .domain(reviewers)
            .padding(0.01);
  svg.append("g")
     .call(d3.axisLeft(y));

  // text label for the y axis
  svg.append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 0 - margin.left)
      .attr("x",0 - (height / 2))
      .attr("dy", "1em")
      .style("text-anchor", "middle")
      .text("Reviewer ID");  

  svg.selectAll()
     .data(data, function(d) {return d.productID+':'+d.reviewerID;})
     .enter()
     .filter(function(d){
        return x(d.productID) != null && y(d.reviewerID) != null
      })
     .append("rect")
     .attr("x", function(d) { return x(d.productID) } )
     .attr("y", function(d) { return y(d.reviewerID)} )
     .attr("width", x.bandwidth() ) 
     .attr("height", y.bandwidth() )
     .style("fill", function(d) {       
        // console.log("productID: " + d.productID) 
        // console.log("reviewerID: " + d.reviewerID)
        return myColor(d.rating)   
      })
}

function selectTopReviewers() {

  // Get the target reviewer shown in the first row
  var firstReviewer = allReviewers.filter( function(d) {
    return d.reviewerID == reviewerID;
  });
  // Sort records of the target reviewer based on its ratings descendingly and then productID ascendingly
  firstReviewer.sort(function(a, b){
    if (a.rating === b.rating) {
      return parseInt(a.productID) - parseInt(b.productID);
    }
    return parseInt(b.rating) - parseInt(a.rating);
  })
  // console.log(firstReviewer);

  // collect product IDs of the target reviewer as the columns
  var reviewersArray = [];
  firstReviewer.forEach(function (item, index) {
    productIDs.push(item.productID);
    ratings.push(item.rating);
  });  
  // console.log(productIDs);
  // console.log(ratings);

  // Get other reviewers
  otherReviewers = allReviewers.filter( function(d) {
    return d.reviewerID != reviewerID;
  })
  // Get all other reviewers' IDs
  var otherReviewersArray = [];
  otherReviewers.forEach(function (item, index) {
    otherReviewersArray.push(item.reviewerID);
  })
  otherReviewerIDs = Array.from(new Set(otherReviewersArray));
  // console.log(otherReviewerIDs);

  otherReviewerIDs.forEach(function (item, index) {
    // Get each of other reviewers
    var otherReviewer = otherReviewers.filter( function(d) {
      return d.reviewerID == item;
    })
    // console.log(otherReviewer);
    var score = 0;
    otherReviewer.forEach(function (subItem, index) {
      if (productIDs.includes(subItem.productID)) {
        score += 10;
        index = productIDs.indexOf(subItem.productID);
        score -= Math.abs(subItem.rating - ratings[index]);
      }
    }); 
    otherReviewer.forEach(function (subItem, index) {
      subItem['score'] = score;
    }); 
  })

  otherReviewers.sort(function(a, b){
    if (a.score === b.score) {
      return parseInt(a.reviewerID) - parseInt(b.reviewerID);
    }
    return b.score - a.score;
  })

  otherReviewerIDs = otherReviewers.map(a => a.reviewerID);
  otherReviewerIDs = Array.from(new Set(otherReviewerIDs));
  otherReviewerIDs = otherReviewerIDs.slice(0, reviewerNum);

  selectReviewers = firstReviewer;
  selectReviewerIDs.push(reviewerID);
  var cutIndex = otherReviewers.length;
  for (record of otherReviewers) {
    if (!otherReviewerIDs.includes(record.reviewerID)) {
      cutIndex = otherReviewers.indexOf(record);
      break;
    }
  }
  otherReviewers = otherReviewers.slice(0, cutIndex);
  selectReviewers = selectReviewers.concat(otherReviewers);
  selectReviewerIDs = selectReviewerIDs.concat(otherReviewerIDs);
}
