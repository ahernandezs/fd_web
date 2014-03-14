'use strict';

/* Controllers */

/* This controller is work flow of detail credit, obtain a .json to see on the view detailLineCredit.html */

angular.module('spaApp').controller('detailCreditCtrl',
  function($scope, $http,$log){
   
      $scope.gridOptions ={data: 'myData',
      columnDefs: [{field:'name',displayName:'Nombre del beneficiario'},
      {field:'monto',displayName:'Monto'},
      {field:'acount',displayName:'Cuenta'}]
    };

  $http.get('accounts/detailCredit.json').success(function(data){
        $scope.myData=data.detail;
    })
    .error(function(data, status) {
    console.log('Error: '+data, status);
    $location.path( '/login' );
    });

   $scope.producto="*******";
   $scope.noOperacion="#####";
   $scope.montoEnviar="000,000.00";
   $scope.date="DD/MM/YYYY";
   $scope.tc="00.00";
   $scope.operacion=45698;


    $scope.mail = [
      {name:'jbravor@anze.com.mx'},
      {name:'amigo@gmail.com'},
      {name:'cliente@banco.com.mx'}    
    ];
    


});



