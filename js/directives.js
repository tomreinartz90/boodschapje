/**
 */
angular.module('boodschapje').directive('noValidation', function() {
  return {
    require: 'ngModel',
    link: function(scope, elm, attrs, ctrl) {
      ctrl.$validators.email = function(modelValue, viewValue) {
        // everything is valid
        return true;
      };
    } 
  };
}).directive('stateClass', ['$state', function($state) {
  return {
    link: function($scope, $element, $attrs) {
      var stateName = $state.current.name || 'init',
          normalizedStateName = 'state-' + stateName.replace(/\./g, '-');
      $element.addClass(normalizedStateName);
    }
  }
}]);