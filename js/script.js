function draw(data) {

  const GRAPH_TITLE = 'Prosper Marketplace Quarterly Loan Originations on the 36-month Loans';
  const RISK_LEVELS = ['AA', 'A', 'B', 'C', 'D', 'E', 'HR'];
  
  // process the data for barchart
  processedData = processData();
  let sumData = processedData[0]; // data dict of total loan amount in each quarter
  let stackedData = processedData[1]; // stack of loan amount by risk by quarter

  debugger;

  /*
    Draw the initial graph
  */

  // add title to the graph
  d3.select('body')
    .append('h2')
      .text(GRAPH_TITLE);

  /*
    Functions
  */

  function processData() {
    /*
      Process data into a stack and a sum array
      Returns:
          An array of a stacked data and a sum array
    */
    let flatData = [];
    let keys = [];
    let dataSum = {};

    for (period in data) {
      let item = {};
      item.period = period;
      dataSum[period] = 0;
      for (risk in data[period]) {
        dataSum[period] += data[period][risk]['amount'];
        item[risk] = data[period][risk]['amount'];
      }
      flatData.push(item);
    }

    RISK_LEVELS.reverse(); // reverse order to stack HR loan on the bottom of the chart
    let stack = d3.stack()
      .keys(RISK_LEVELS)
      .order(d3.stackOrderNone)
      .offset(d3.stackOffsetNone);
    RISK_LEVELS.reverse(); // reverse back to previous order

    return [dataSum, stack(flatData)];
  };
};