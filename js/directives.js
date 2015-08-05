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
});