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

    var xMin = new Date(Date.now());
    xMin.setDate(xMin.getDate() - 14);

    var xMax = new Date(Date.now());
    xMax.setDate(xMax.getDate() + 1);

    function canvas() {
        data.dialpad = false;

        $http.get('/data/points/?after=' + xMin.toISOString())
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
        d3.select('svg').selectAll("*").remove();

        var margin = {top: 10, right: 10, bottom: 30, left: 50},
            width = 640 - margin.left - margin.right,
            height = 360 - margin.top - margin.bottom;

        var yMin = data.points.reduce(function(prev, curr) {
            return prev.weight < curr.weight ? prev : curr;
        }).weight - 0.5;

        var yMax = data.points.reduce(function(prev, curr) {
            return prev.weight > curr.weight ? prev : curr;
        }).weight + 0.5;

        var xScale = d3.time.scale.utc()
                        .domain([xMin, xMax])
                        .range([0, width]),
            yScale = d3.scale.linear()
                        .domain([yMin, yMax])
                        .range([height, 0]);

        var xAxis = d3.svg.axis().scale(xScale)
                        .orient('bottom')
                        .ticks(d3.time.day)
                        .tickSize(-height, 0)
                        .tickFormat(d3.time.format("%m/%d")),
            yAxis = d3.svg.axis().scale(yScale)
                        .tickSize(0, 0)
                        .orient('left');


        var svg = d3.select('svg')
                        .append("g")
                        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

        svg.append('g').call(xAxis)
            .attr('class', 'axis')
            .attr('transform', 'translate(0,' + height + ')');
        svg.append('g').call(yAxis)
            .attr('class', 'axis')
            .attr('transform', 'translate(0, 0)');

        svg.append('g').selectAll('circle')
            .data(data.points)
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
            .attr("d", line(data.points))
            .attr('class', 'data');
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
