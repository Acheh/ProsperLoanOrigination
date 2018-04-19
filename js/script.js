function draw(data) {

  const GRAPH_TITLE = 'Prosper Marketplace Quarterly Loan Originations on the 36-month Loans';
  
  /*
    Draw the initial graph
  */

  // add title to the graph
  d3.select('body')
    .append('h2')
      .text(GRAPH_TITLE);
};