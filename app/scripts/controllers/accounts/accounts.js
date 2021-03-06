/**
 * The accounts controller. Gets accounts passing auth parameters
 */
angular.module('spaApp')
.controller('AccountsCtrl',['$scope', '$rootScope', '$location', 'accountsProviderFD', 'errorHandler',
function($scope, $rootScope, $location, accountsProviderFD, errorHandler) {

	// For searching purposes
	var params = {};
	params.numPage = 0;
	params.size = 100;
	// To make a comparison between today's date and the details dates
	$scope.today = new Date().getTime();
	// To separate the first four accounts
	$scope.notifications = [];
	//accounts contains all the received accounts and total contains the addition of each kind of balances
	$scope.accounts = {};
	$scope.total = {};
	// To hide the notifications in accounts
	$scope.hideNotifications = false;
	// Clear error
	errorHandler.reset();

	/**
	 * Evaluate payment_date or cut_date to determine if the the account should be displayed in notifications
	 * @param account
	 */
	var evaluateDate = function(account) {
		switch (account.account_type) {
			case 'LOAN_ACCOUNT':
			case 'CREDIT_ACCOUNT':
				if ( account.payment_date < $scope.today ) {
					$scope.notifications.push( account );
				}
				break;
			case 'SAVINGS_ACCOUNT':
			case 'INVESTMENT_ACCOUNT':
				if ( account.cut_date < $scope.today ) {
					$scope.notifications.push( account );
				}
				break;
			default:
				break;
		}
	};

	/**
	 * Receive the accounts from the middleware
	 */
	accountsProviderFD.getAccounts().then(
		function(data) {
			$scope.accounts.saving = [];
			$scope.total.saving = 0;
			$scope.accounts.investment = [];
			$scope.total.investment = 0;
			$scope.accounts.credit = [];
			$scope.total.credit = 0;
			$scope.accounts.loan = [];
			$scope.total.loan = 0;
			// To stop displaying the big
			delete $rootScope.showBGLoader;

			for (var i = 0; i < data.length; i++) {
				// Take the first four accounts for notifications
				if ( i < 4 ){
					evaluateDate( data[i] );
				}
				switch ( data[i].account_type ) {
					case 'SAVINGS_ACCOUNT':
						$scope.accounts.saving.push( data[i] );
						$scope.total.saving += +data[i].available_balance;
						break;
					case 'INVESTMENT_ACCOUNT':
						$scope.accounts.investment.push( data[i] );
						$scope.total.investment += +data[i].amount_invested;
						break;
					case 'LOAN_ACCOUNT':
						$scope.accounts.loan.push( data[i] );
						$scope.total.loan += +data[i].min_payment;
						break;
					case 'CREDIT_ACCOUNT':
						$scope.accounts.credit.push( data[i] );
						$scope.total.credit += +data[i].min_payment;
						break;
					default:
						break;
				}
			}
		},
		function(error) {
			// To stop displaying the big loader
			delete $rootScope.showBGLoader;
			errorHandler.setError( error.status );
		}
	);

	/**
	* Request the account detail from the middleware
	*/
	var getAccountDetail = function() {
		errorHandler.reset();
		accountsProviderFD.getAccountDetail( $scope.selectedAccountId ).then(
			function(detail) {
				console.info( detail );
				$scope.detail = detail;
			},
			function(error) {
					 console.error( error );
					 errorHandler.setError( error.status );
			}
		);
	};

	/**
	 * Change the view according to the selected account
	 */
	$scope.selectAccount = function(account) {
		errorHandler.reset();
		$scope.hideNotifications = true;

		var accountId = account._account_id;
		var type = account.account_type;

		// Both values are shared with the child controllers
		$scope.selectedAccountId = accountId;
		$scope.selectedAccount = account;
		// Contain the start and end dates (for searching purposes)
		$scope.searchParams = {};
		// Request account detail for all kinds of accounts
		getAccountDetail();

		// Request transactions (only for saving and credit accounts)
		if (type === 'SAVINGS_ACCOUNT' || type === 'CREDIT_ACCOUNT')
			$scope.getTransactions();

		switch (type) {
			case 'SAVINGS_ACCOUNT':
					$location.path('/accounts/'+ accountId +'/saving');
					break;
			case 'INVESTMENT_ACCOUNT':
					$location.path('/accounts/'+ accountId +'/investment');
					break;
			case 'LOAN_ACCOUNT':
					$location.path('/accounts/'+ accountId +'/loan');
					break;
			case 'CREDIT_ACCOUNT':
					$location.path('/accounts/'+ accountId +'/credit');
					break;
			default:
					break;
		}
	};

	/**
	 * Search transactions using the datepicker values
	 */
	$scope.searchTransactions = function() {
		var todaysDate = new Date();
		var dd = todaysDate.getDate();      // day
		var mm = todaysDate.getMonth()+1;   // month (January is 0!)
		var yy = todaysDate.getFullYear();  // year

		dd = dd < 10 ? '0' + dd : dd;
		mm = mm < 10 ? '0' + mm : mm;
		todaysDate = yy.toString() + mm.toString() + dd.toString();

		if ($scope.searchParams.startDate !== undefined)
			// startDate pass from String to Int
		var startDate = parseInt($scope.searchParams.startDate.split("/").reverse().join(""));
		if ($scope.searchParams.endDate !== undefined)
			// endDate pass from String to Int
		var endDate = parseInt($scope.searchParams.endDate.split("/").reverse().join(""));

		if( $scope.searchParams.startDate && $scope.searchParams.endDate ) {
			if (startDate > todaysDate || endDate > todaysDate)
						errorHandler.setError( {status : 601} );
			else if (startDate > endDate)
						errorHandler.setError( {status: 603} );
			else
				$scope.getTransactions($scope.searchParams.startDate, $scope.searchParams.endDate);
		} else if( $scope.searchParams.startDate === null && $scope.searchParams.endDate === null) {
				params.date_end = null;
				params.date_start = null;
				$scope.getTransactions();
		}
	};

	/**
	* Request the transactions from the middleware
	*/
	$scope.getTransactions = function() {
		$scope.transactions = null;
		accountsProviderFD.getTransactions( $scope.selectedAccountId, $scope.searchParams.startDate, $scope.searchParams.endDate ).then(
			function(transactions) {
				console.info( transactions );
				$scope.transactions = transactions;
			},
			function(error) {
					console.error( error );
					errorHandler.setError( error.status );
			}
		);
	};

}]);
