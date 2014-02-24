'use strict';

angular.module('spaApp')
.controller('BiometricsCtrl', function ($scope,$http,$location,$sce,$stateParams,ctsBiometricas) {

	$scope.biometricAccounts = ctsBiometricas.accounts;
	$scope.seleccionTMP = {};
	$scope.mySelections = [];
	for(var x in $scope.biometricAccounts.accounts){
		if($stateParams.account_id == $scope.biometricAccounts.accounts[x]._account_id){
			$scope.seleccionTMP = $scope.biometricAccounts.accounts[x];
			break;
		}
	}

    $scope.gridOptions = { 	data: 'myData',
						    multiSelect: false,
						    selectedItems: $scope.mySelections,
    						columnDefs: [{field:'_account_id', displayName:'Fecha'}, 
			        					{field:'account_type', displayName:'Operación'},
			        					{field:'name', displayName:'Descripcion'},
			        					{field:'alias', displayName:'Cargo'},
			        					{field:'currency', displayName:'Abono'},
			        					{field:'last_digits', displayName:'Saldo'}],
			        		afterSelectionChange: function(data) {
								$location.path( $scope.mySelections[0]._account_id+'/detail' );
							}	
        				};

	$http({
		url: 'http://127.0.0.1:9000/accounts/account4.json',
		method: 'GET'
	}).
	success(function(data, status, headers) {
		$scope.myData = data.accounts;
	 	//console.log('Json: '+JSON.stringify($scope.myData));
	}).
	error(function(data, status) {
		console.log('Error: '+data, status);
		$location.path( '/login' );
	});

});