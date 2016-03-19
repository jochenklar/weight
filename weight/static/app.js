var app = angular.module('weight', []);

app.config(['$httpProvider', '$interpolateProvider', function($httpProvider, $interpolateProvider) {
    $interpolateProvider.startSymbol('{$');
    $interpolateProvider.endSymbol('$}');
    $httpProvider.defaults.xsrfCookieName = 'csrftoken';
    $httpProvider.defaults.xsrfHeaderName = 'X-CSRFToken';
}]);

app.factory('WeightService', ['$http', '$timeout', function($http, $timeout) {

    var data = {
        string: '',
        dialpad: false,
        points: []
    };

    function canvas() {
        data.dialpad = false;

        $http.get('/data/points/')
            .success(function(points) {
                data.points = points;
                draw();
            });
    }

    function dialpad() {
        data.dialpad = true;
        reset();
    }

    function enterKey(character) {
        data.string += character;
    }

    function reset() {
        data.string = '';
    }

    function submit() {
        var weight = parseFloat(data.string);
        $http.post('/data/points/', {'weight': weight})
            .success(function(response) {
                canvas();
            });
    }

    function draw() {
        var svg = d3.select('svg');
        svg.selectAll("*").remove();

        var margin = {top: 10, right: 10, bottom: 10, left: 50},
            width = 640 - margin.left - margin.right,
            height = 360 - margin.top - margin.bottom;

        var xMin = new Date(data.points[0].datetime),
            xMax = new Date(data.points[data.points.length - 1].datetime);

        var yMin = data.points.reduce(function(prev, curr) {
            return prev.weight < curr.weight ? prev : curr;
        }).weight - 0.5;

        var yMax = data.points.reduce(function(prev, curr) {
            return prev.weight > curr.weight ? prev : curr;
        }).weight + 0.5;

        var xScale = d3.time.scale.utc()
                        .domain([xMin, xMax])
                        .range([margin.left, width + margin.left]),
            yScale = d3.scale.linear()
                        .domain([yMin, yMax])
                        .range([height - margin.bottom, margin.top]);

        var xAxis = d3.svg.axis().scale(xScale)
                        .orient('bottom')
                        .ticks(d3.time.day, 1)
                        .tickFormat(d3.time.format("%b %d")),
            yAxis = d3.svg.axis().scale(yScale).orient('left');

        svg.append('g').call(xAxis)
            .attr("transform", "translate(0," + (height - margin.bottom) + ")");
        svg.append('g').call(yAxis)
            .attr("transform", "translate(" + (margin.left) + ")", 0);

        svg.append('g').selectAll('circle')
            .data(data.points)
            .enter()
                .append('circle')
                .attr('class', 'circle')
                .attr('cx', function (d) { return xScale(new Date(d.datetime)); })
                .attr('cy', function (d) { return yScale(d.weight); })
                .attr('r', 5)
                .style('fill', 'red');

        var line = d3.svg.line()
            .x(function (d) { return xScale(new Date(d.datetime)); })
            .y(function (d) { return yScale(d.weight); })
            .interpolate("bundle");

        svg.append('g').append("path")
            .attr("d", line(data.points))
            .attr("stroke", "red")
            .attr("stroke-width", 2)
            .attr("fill", "none");;
    }

    return {
        data: data,
        canvas: canvas,
        dialpad: dialpad,
        enterKey: enterKey,
        reset: reset,
        submit: submit
    };
}]);

app.controller('WeightController', ['$scope', 'WeightService', function($scope, WeightService) {

    $scope.service = WeightService;
    $scope.service.canvas();

}]);
