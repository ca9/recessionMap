/**
 * Created by aditya on 23/10/14.
 */
var recMap = angular.module('recMap', []);

recMap.controller('timeController', [ '$scope', function($scope) {
        $scope.years = [];
        for (var i = 2000; i <= 2013; i++) {
          if ((i <= 2007) || (i >= 2010)) {
              $scope.years.push(i);
          }
      }
    }]
);