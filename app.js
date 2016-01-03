angular.module('scheduleApp', ['firebase'])

    .controller('mainController', function($scope, $firebase) {

        // get # of real time users
        var listRef = new Firebase("https://boiling-torch-6521.firebaseio.com/presence/");
        var userRef = listRef.push();

        // Add ourselves to presence list when online.
        var presenceRef = new Firebase("https://boiling-torch-6521.firebaseio.com/.info/connected");
        presenceRef.on("value", function(snap) {
            if (snap.val()) {
                userRef.set(true);
                // Remove ourselves when we disconnect.
                userRef.onDisconnect().remove();
            }
        });

        listRef.on("value", function(snap) {
            $scope.online = snap.numChildren();
        });

        // connect to firebase
        var baseRef = new Firebase("https://boiling-torch-6521.firebaseio.com/");
        var ref = baseRef.child('agents');
        var fb = $firebase(ref);

        // sync as object
        var syncObject = fb.$asObject();

        // three way data binding
        syncObject.$bindTo($scope, 'agents');

        // *****************************************************************************
        //
        //  Retrieve userID (name) of the operator from the login routine

        var authData = baseRef.getAuth();
        if (authData) {
            id = authData.uid;
            console.log(id);
            path = 'users/' + id;
            nameRef = baseRef.child(path);
            nameRef.on("value", function(snapshot) {
                user = snapshot.val();
                console.log(user);
                userName = user.name;
                console.log(userName);
                userID = userName;  //set this programatically via login script eventualy
                $scope.userID = userID;
            });
        } else {
            console.log("User is logged out");
        }

        $scope.stylechange = function (booking) {
            if (booking) {
                return { background: "#ddd" }
            }
        }



        // ************* I M P O R T A N T ******************

        //  This is only working in a single direction at the moment - agents to suppliers !!!!



        //***************************************
        //
        // This function is called by the ng-click event and passes the user and time of the booking
        // Then firebase is updated to set the booking with the operator (the agent happens client side)
        //
        // The 'bookedby' object for the AGENT is done here too. Ultimately I think everthing will be done here, not client side

        $scope.booking = function(booked,user,time) {
            console.log('CLICKED- '+ booked + ' ' + user + ' ' + time);
            var shortTime = time.replace(":", "");
            var opRef = new Firebase('https://boiling-torch-6521.firebaseio.com/suppliers/' + userID + '/slots/' + shortTime);
            var opShortRef = new Firebase('https://boiling-torch-6521.firebaseio.com/suppliers/' + userID + '/bookings/' );
            var agRef = new Firebase('https://boiling-torch-6521.firebaseio.com/agents/' + user + '/slots/' + shortTime);
            var agShortRef = new Firebase('https://boiling-torch-6521.firebaseio.com/agents/' + user + '/bookings/');
            var opRemRef = new Firebase('https://boiling-torch-6521.firebaseio.com/suppliers/' + userID + '/bookings/' + time );
            var agRemRef = new Firebase('https://boiling-torch-6521.firebaseio.com/agents/' + user + '/bookings/' );



            var id=time;
            var updatedObj = {};
            var updatedObj2 = {};

            if (booked == true) {
                updatedObj[id] = user;
                updatedObj2[id] = userID;

                opRef.update({
                    "booked": true,
                    "time": time,
                    "bookedby": user
                });
                agRef.update({
                    "bookedby": userID
                });
                opShortRef.update(updatedObj);
                agShortRef.update(updatedObj2);
            }

            if (booked == false) {

                opRef.update({
                    "booked": false,
                    "time": time,
                    "bookedby": ""
                });
                agRef.update({
                    "booked": false,
                    "bookedby": ""
                });
                opRemRef.remove();  //remove the item in "bookings"
                agRemRef.set(null);  //remove the item in "bookings"
                refresh();
            }

            var fredRef = new Firebase('https://samplechat.firebaseio-demo.com/users/fred');
            fredRef.remove();

        }


        var bookedrow = [];
        var bookedcol = [];

        function refresh(){
            setTimeout(function(){ window.location.reload(); },2000);  //refresh the data on the page
        }

        // use: ng-class="getClass($index, agents)" in HTML for this function
        $scope.getClass = function getClass(idx, list) {
            if (bookedrow[idx] == true) {
                return "disabled-row";
            } else {
             return "";
            }
        };

        $scope.isBooked = function isBooked(rowindex,colindex,bool,user,bookedby) {
            //console.log(rowindex + "|" + bool + "|" + user + "|" + bookedby);
            if (bool && user == bookedby) {
                bookedrow[rowindex] = true;
                bookedcol[colindex] = true;
                $scope.bookedrow = bookedrow;
                return "booked-owner";
            }
            if (bookedrow[rowindex] && user != bookedby){
                return "disabled-cell";
            }
            if (bookedcol[colindex] && user != bookedby){
                return "disabled-cell";
            }
        };

        $scope.isBookedCB = function isBooked(rowindex,colindex,bool,user,bookedby) {
            //console.log(rowindex + "|" + bool + "|" + user + "|" + bookedby);
            if (bool && user == bookedby) {
                bookedrow[rowindex] = true;
                bookedcol[colindex] = true;
                $scope.bookedrow = bookedrow;
                return "booked-ownerCB";
            }
            if (bookedrow[rowindex] && user != bookedby){
                return "disabled-cellCB";
            }
            if (bookedcol[colindex] && user != bookedby){
                return "disabled-cellCB";
            }
        };

        $scope.isDisabled = function isBooked(rowindex,colindex,bool,user,bookedby) {
            //console.log(rowindex + "|" + bool + "|" + user + "|" + bookedby);
            if (bool && user == bookedby) {
                bookedrow[rowindex] = true;
                bookedcol[colindex] = true;
                $scope.bookedrow = bookedrow;
                return false;
            }
            if (bookedrow[rowindex] && user != bookedby){
                return true;
            }
            if (bookedcol[colindex] && user != bookedby){
                return true;
            }
        };

        // Set the userID (name) of the logged in user in the scope so that it can be shown as a welcome
        $scope.userID = window.userID;
        console.log($scope);

        //*****************************************************************************
        //
        //  Setup the operators scope -  THIS IS NOT IN USE AT THE MOMENT

        // connect to firebase
        var oRef = new Firebase("https://boiling-torch-6521.firebaseio.com/operators");
        var ofb = $firebase(oRef);

        // sync as object
        var syncObject2 = ofb.$asObject();

        // three way data binding
        syncObject2.$bindTo($scope, 'operators');


    });

