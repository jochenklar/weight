var app = angular.module('weight', []);

app.config(['$httpProvider', '$interpolateProvider', function($httpProvider, $interpolateProvider) {
    $interpolateProvider.startSymbol('{$');
    $interpolateProvider.endSymbol('$}');
    $httpProvider.defaults.xsrfCookieName = 'csrftoken';
    $httpProvider.defaults.xsrfHeaderName = 'X-CSRFToken';
}]);

app.factory('WeightService', ['$http', '$timeout', function($http, $timeout) {

    var service = {
        string: '',
        dialpad: false
    };

    var threeMonthAgo = new Date(Date.now());
    threeMonthAgo.setDate(threeMonthAgo.getDate() - 90);

    var twoWeeksAgo = new Date(Date.now());
    twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);

    var tomorrow = new Date(Date.now());
    tomorrow.setDate(tomorrow.getDate() + 0.5);

    service.canvas = function canvas() {
        service.dialpad = false;
        d3.select('svg').selectAll("*").remove();

        service.draw('graph-two-weeks', twoWeeksAgo, tomorrow);
        service.draw('graph-three-month', threeMonthAgo, tomorrow);
    };

    service.showDialpad = function dialpad() {
        service.dialpad = true;
        service.reset();
    };

    service.enterKey = function (character) {
        service.string += character;
    };

    service.reset = function () {
        service.string = '';
    };

    service.submit = function () {
        var weight = parseFloat(service.string);
        $http.post('/data/points/', {'weight': weight})
            .success(function(response) {
                service.canvas();
            });
    };

    service.draw = function(canvasSelector, xMin, xMax) {
        $http.get('/data/points/?after=' + xMin.toISOString())
            .success(function(points) {
                service.drawDiagram(canvasSelector, xMin, xMax, points);
            });
    };

    service.drawDiagram = function(graphId, xMin, xMax, points) {

        var margin = {top: 10, right: 10, bottom: 30, left: 50},
            width = 640 - margin.left - margin.right,
            height = 400 - margin.top - margin.bottom;

        var yMin = points.reduce(function(prev, curr) {
            return prev.weight < curr.weight ? prev : curr;
        }).weight - 0.5;

        var yMax = points.reduce(function(prev, curr) {
            return prev.weight > curr.weight ? prev : curr;
        }).weight + 0.5;

        var xScale = d3.time.scale.utc()
                        .domain([xMin, xMax])
                        .range([0, width]),
            yScale = d3.scale.linear()
                        .domain([yMin, yMax])
                        .range([height, 0]);

        var ticks, tickFormat;
        if (xMax - xMin > 2000000000) {
            ticks = d3.time.month;
            tickFormat = d3.time.format('%b');
        } else {
            ticks = d3.time.day;
            tickFormat = d3.time.format('%a');
        }

        var xAxis = d3.svg.axis().scale(xScale)
                        .orient('bottom')
                        .ticks(ticks)
                        .tickSize(-height, 0)
                        .tickFormat(tickFormat),
            yAxis = d3.svg.axis().scale(yScale)
                        .tickSize(-width, 0)
                        .orient('left');


        var svg = d3.select('#' + graphId)
                        .append("g")
                        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

        svg.append('g').call(xAxis)
            .attr('class', 'axis')
            .attr('transform', 'translate(0,' + height + ')');
        svg.append('g').call(yAxis)
            .attr('class', 'axis')
            .attr('transform', 'translate(0, 0)');

        svg.append('g').selectAll('circle')
            .data(points)
            .enter()
                .append('circle')
                .attr('class', 'data')
                .attr('cx', function (d) { return xScale(new Date(d.datetime)); })
                .attr('cy', function (d) { return yScale(d.weight); });

        var line = d3.svg.line()
            .x(function (d) { return xScale(new Date(d.datetime)); })
            .y(function (d) { return yScale(d.weight); })
            .interpolate('basis');

        svg.append('g').append("path")
            .attr("d", line(points))
            .attr('class', 'data');
    };

    return service;
}]);

app.controller('WeightController', ['$scope', 'WeightService', function($scope, WeightService) {

    $scope.service = WeightService;
    $scope.service.canvas();

}]);
