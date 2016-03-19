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
        points: []
    };

    function fetchDataPoints() {
        $http.get('/data/points/')
            .success(function(points) {
                data.points = points;
                draw();
            });
    }

    function init() {
        fetchDataPoints();
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

            });
    }

    function draw() {
        var width = 300,
            height = 300;

        var xScale = d3.scale.linear().domain([0, 20]).range([0, width]),
            yScale = d3.scale.linear().domain([0, 100]).range([height, 0]);

        var svg = d3.select('canvas').append('svg')
            .attr('width', width)
            .attr('height', height);

        svg.selectAll("circle")
            .data(data.points)
            .enter()
                .append("circle")
                .attr("class", "circle")
                .attr("cx", function (d) { return xScale(d.id); })
                .attr("cy", function (d) { return yScale(d.weight); })
                .attr("r", 2)
                .style("fill", 'red');
    }

    return {
        data: data,
        init: init,
        enterKey: enterKey,
        reset: reset,
        submit: submit
    };
}]);

app.controller('WeightController', ['$scope', 'WeightService', function($scope, WeightService) {

    $scope.service = WeightService;
    $scope.service.init();

}]);
