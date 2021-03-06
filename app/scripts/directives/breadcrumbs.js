angular.module('spaApp').directive('breadcrumbs', ['breadcrumbService', function(breadcrumbService) {
  return {
    restrict: 'E',
    replace: true,
    priority: 100,
    templateUrl: 'views/directives/breadcrumbs.html',
    link: function($scope) {

      $scope.$on('$stateChangeSuccess', function(){
        // Add the current state and params to the scope
        breadcrumbService.generate();
        $scope.breadcrumbList = breadcrumbService.list();
      });
    }
  };
}]);
