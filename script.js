const w = 700;
const h = 500;
const margin = {top: 50, right: 25, bottom: 50, left: 75}

var color = d3.scaleOrdinal(["#c93d1f", "#65c91f"]);

const canvas = d3.select('.graph')
               .append("svg")
               .attr("width", w)
               .attr("height", h);

d3.json('https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/cyclist-data.json')
.then(data => {
  
  const tip = d3.tip()
                .attr('class', 'd3-tip')
                .attr('id', 'tooltip')
                .html(function(d) {
                    return d;
                })
                .direction('n')
                .offset([-10, 0]);
  
  canvas.call(tip);
  
  const minData = new Date((d3.min(data.map(d => d.Year)) - 2) + '');
  const maxData = new Date((d3.max(data.map(d => d.Year)) + 2) + '');
  
  let xValue = data.map(d => new Date(d.Year + ""));
  xValue= [...xValue, minData, maxData];
  
  const xScale = d3.scaleTime()
                   .domain([d3.min(xValue), d3.max(xValue)])
                   .range([margin.left, w - margin.left - margin.right]);

  canvas.append("g")
      .attr('id', 'x-axis')
      .attr("transform", `translate(0, ${h - margin.bottom})`)
      .call(d3.axisBottom(xScale));
  
  canvas.append('text')
    .attr('id', 'x-info')
    .attr('x', w / 2 - 40)
    .attr('y', h)
    .text('Year');
  
  const yValue = data.map(d => {
    const [min, sec] = d.Time.split(":");
    return new Date (1970, 0, 1, 0, min, sec);
  });
  const yScale = d3.scaleTime()
                   .domain([d3.min(yValue), d3.max(yValue)])
                   .range([h - margin.bottom, margin.top]);
  
  const timeFormat = d3.timeFormat("%M:%S");
  const yAxis = d3.axisLeft(yScale).tickFormat(timeFormat);
  
  canvas.append("g")
        .attr("id", "y-axis")
        .attr("transform", `translate(${ margin.left})`, 0)
      .call(yAxis);
  
  canvas.append('text')
    .attr('id', 'y-info')
    .attr('transform', 'rotate(-90)')
    .text('Time (minutes)')
    .attr('x', - h / 2)
    .attr('y', 20)
  
  canvas.selectAll("circle")
    .data(data)
    .enter().append("circle")
    .attr("class", "dot")
    .attr("r", 6)
    .attr("cx", (d, i) => xScale(xValue[i]))
    .attr("cy", (d, i) => yScale(yValue[i]))
    .attr("data-xvalue", (d, i) => xValue[i])
    .attr("data-yvalue", (d, i) => yValue[i])
    .attr("fill", (d) => d.Doping ? color(1) : color(0))
    .attr("stroke", 'black')
    .on("mouseover", function(d, i) {
      tip.attr("data-year", xValue[i])
      let html = (d.Name + ": " + d.Nationality + "<br/>"
              + "Year: " +  d.Year + ", Time: " + d.Time 
              + (d.Doping?"<br/><br/>" + d.Doping:""));
      tip.show(html, this);
    })
    .on("mouseout", tip.hide);
  
   var legend = canvas.selectAll(".legend")
    .data(color.domain())
    .enter().append("g")
    .attr("class", "legend")
    .attr("id", "legend")
    .attr("transform", function(d, i) {
      return "translate(0," + (h/2 - i * 20) + ")";
    });
  
  legend.append("rect")
    .attr("x", w - 18)
    .attr("width", 18)
    .attr("height", 18)
    .style("fill", color);

  legend.append("text")
    .attr("x", w - 24)
    .attr("y", 9)
    .attr("dy", ".35em")
    .style("text-anchor", "end")
    .style("font-size", "1.5rem")
    .text(function(d) {
      console.log(d);
      if (d) return "Riders with doping allegations";
      else {
        return "No doping allegations";
      };
    });
});
