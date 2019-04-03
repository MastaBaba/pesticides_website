import {axisBottom, interpolateYlGn, range, scaleLinear} from 'd3';

// TODO: add a control to select the parameter?
/* Reminder of the data available from the CSV
category: {
  atrAvgCat: row.atrazine_atrazine_category,
  atrMaxCat: row.atrazine_category,
  ibgeBode: row.ibge_code,
  simAvgCat: row.simazine_atrazina_category,
  simMaxCat: row.simazine_category,
},
number: {
  detected: +row.detected,
  eqBr: +row.eq_br,
  supBr: +row.sup_br,
  supEu: +row.sup_eu,
},
*/
const cfg = {
  field: 'detected',
  legend: {
    height: 10,
    subtitleOffset: 8,
    tickSize: 15,
    titleOffsetLine1: 38,
    titleOffsetLine2: 24,
    width: 10,
  },
  max: 27,
  typename: {
    click: 'mun-click',
    mouseout: 'mun-mouseout',
    mouseover: 'mun-mouseover',
  },
};

export function createCocktailChoropleth(parent, path, data, dispatcher) {
  parent
    .append('g')
    .classed('choropleth', true)
    .selectAll('path')
    .data(data.mun.features)
    .enter()
    .append('path')
    .attr('id', ft => 'id-' + ft.properties.ibgeCode)
    .attr('d', path)
    .style('fill', ft => {
      if (Number.isInteger(value(ft))) {
        return color(value(ft));
      }
      return null;
    })
    .on('mouseover', (ft, element) => {
      // invoke callbacks
      dispatcher.call(cfg.typename.mouseover, null, {
        properties: ft.properties,
        value: value(ft),
      });
    })
    .on('mouseout', (ft, element) => {
      // invoke callbacks
      dispatcher.call(cfg.typename.mouseout);
    })
    .on('click', (ft, element) => {
      // invoke callbacks
      dispatcher.call(cfg.typename.click, null, ft);
    });
  makeLegend(parent);
}

function value(ft) {
  if (!isNaN(ft.properties.map1Number)) {
    return ft.properties.map1Number;
  }
  return null;
}

const color = scaleLinear()
  .domain([0, cfg.max])
  .interpolate(() => interpolateYlGn);

function makeLegend(parent) {
  // TODO: should be a scheme (27 colors), not a continuous scale
  const xx = scaleLinear()
    .domain([0, cfg.max])
    .rangeRound([0, cfg.legend.width * cfg.max]);

  const legend = parent
    .append('g')
    .classed('legend', true)
    //.style('font-size', '0.8rem')
    //.style('font-family', 'sans-serif')
    .attr('transform', 'translate(550,66) scale(1.3)');

  legend
    .selectAll('rect')
    .data(range(0, cfg.max, 1))
    .enter()
    .append('rect')
    .attr('height', cfg.legend.height)
    .attr('x', el => xx(el))
    .attr('width', cfg.legend.width)
    .attr('fill', el => color(el));

  const label = legend
    .append('g')
    .attr('fill', '#000')
    .attr('text-anchor', 'start');

  // TODO: i18n
  label
    .append('text')
    .attr('y', -cfg.legend.titleOffsetLine1)
    .attr('font-weight', 'bold')
    .text('Number of pesticides detected in');

  label
    .append('text')
    .attr('y', -cfg.legend.titleOffsetLine2)
    .attr('font-weight', 'bold')
    .text('drinking water');

  // TODO: i18n
  label
    .append('text')
    .attr('y', -cfg.legend.subtitleOffset)
    .text('(light: none, dark: 27 different pesticides)');

  // Scale
  legend
    .append('g')
    .call(axisBottom(xx).tickSize(cfg.legend.tickSize))
    .select('.domain')
    .remove();
}
