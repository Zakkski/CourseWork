const svg = d3.select('svg');

const width = +svg.attr('width');
const height = +svg.attr('height');
const chartTitle = 'Top 10 Most Populous Countries';
const xLabel = 'Population';

const render = (data) => {
  const xValue = (d) => d.population;
  const yValue = (d) => d.country;
  const margin = {
    left: 200,
    right: 40,
    bottom: 70,
    top: 40,
  };
  innerWidth = width - margin.left - margin.right;
  innerHeight = height - margin.top - margin.bottom;

  const xScale = d3
    .scaleLinear()
    .domain([0, d3.max(data, xValue)])
    .range([0, innerWidth]);

  const yScale = d3
    .scaleBand()
    .domain(data.map(yValue))
    .range([0, innerHeight])
    .padding(0.1);

  const yAxis = d3.axisLeft(yScale);

  const g = svg
    .append('g')
    .attr('transform', `translate(${margin.left}, ${margin.top})`);

  const xAxisTickFormat = (number) => {
    // calling format function with the number passed
    return d3.format('.3s')(number).replace('G', 'B');
  };

  // passing format function to ticks
  const xAxis = d3
    .axisBottom(xScale)
    .tickFormat(xAxisTickFormat)
    .tickSize(-innerHeight);

  // can select multiple things with a comma in the select call
  g.append('g').call(yAxis).selectAll('.domain, .tick line').remove();
  const xAxisG = g
    .append('g')
    .call(xAxis)
    .attr('transform', `translate(0, ${innerHeight})`);

  xAxisG.select('.domain').remove();
  xAxisG
    .append('text')
    .attr('y', 65)
    .attr('x', innerWidth / 2)
    .attr('fill', 'black')
    .text(xLabel);

  g.selectAll('rect')
    .data(data)
    .enter()
    .append('rect')
    .attr('y', (d) => yScale(yValue(d)))
    .attr('width', (d) => xScale(xValue(d)))
    .attr('height', yScale.bandwidth());

  g.append('text').attr('y', -10).text(chartTitle);
};

d3.csv('data.csv').then((data) => {
  data.forEach((d) => {
    d.population = +d.population * 1000;
  });

  render(data);
});
