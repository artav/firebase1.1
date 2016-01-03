angular.module('scheduleApp', ['firebase'])

    .controller('mainController', function($scope, $timeout, $firebase) {





        /*userRef = baseRef.child('users').child(user.uid);
        userRef.once('value', function (snap) {
            var user = snap.val();
            if (!user) {
                return;
            }
        });*/

        var baseRef = new Firebase("https://boiling-torch-6521.firebaseio.com/");

        var bookedrow = [];
        var bookedcol = [];

        $scope.bookedrow = bookedrow;
        $scope.bookedcol = bookedcol;


        //console.log($scope);

        // *****************************************************************************
        //
        //  Retrieve userID (name) of the operator from the login routine
        var logRef = baseRef.child('log');
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




                // connect to firebase

                var agentRef = baseRef.child('agents');

                var agentFb = $firebase(agentRef);

                // sync as object
                var syncObject = agentFb.$asObject();

                // three way data binding
                syncObject.$bindTo($scope, 'agents');

                // connect to firebase

                var supplierRef = baseRef.child('suppliers');

                var supplierFb = $firebase(supplierRef);

                // sync as object
                var syncObject2 = supplierFb.$asObject();

                // three way data binding
                syncObject2.$bindTo($scope, 'suppliers').then(function(){ //loop through suppliers qnd populqte bookedrow and booked column adequately.
                    var line = 0;
                    angular.forEach($scope.suppliers,function(value,userID){
                        if(!value){
                            return;
                        }
                        var slots = value.slots;
                        var col = 0;
                        angular.forEach(slots,function(slotData,shortTime){
                            if(slotData.booked && slotData.bookedby === user.name){
                                bookedcol[col] = true;
                                bookedrow[line] = true;
                            }
                            ++col;
                        });
                        ++line;
                    });
                });
            });
        } else {
            console.log("User is logged out");
            window.location.assign("./")
        }

        //alter the scope object when a booking is made
        //////////////////////////////////////////////////////////////////////




        $scope.booking = function(rowindex,colindex,booked,user,time) {
            console.log('CLICKED- '+ booked + ' ' + user + ' ' + time);
            var shortTime = time.replace(":", "");

            if (booked == true) {
                $timeout(function() {
                    $scope['agents'][userID]['slots'][shortTime]['booked'] = true;
                    $scope['agents'][userID]['slots'][shortTime]['bookedby'] = user;
                    $scope['suppliers'][user]['slots'][shortTime]['booked'] = true;
                    $scope['suppliers'][user]['slots'][shortTime]['bookedby'] = userID;
                    bookedrow[rowindex] = true;
                    bookedcol[colindex] = true;

                    // Save to log
                    logRef.push({
                        created: Firebase.ServerValue.TIMESTAMP,
                        action: "book",
                        slot: shortTime,
                        bookedby: userID,
                        bookedwith: user
                    });
                }, 0);
            }

            if (booked == false) {
                $timeout(function() {
                    $scope['agents'][userID]['slots'][shortTime]['booked'] = false;
                    $scope['agents'][userID]['slots'][shortTime]['bookedby'] = "";
                    $scope['suppliers'][user]['slots'][shortTime]['booked'] = false;
                    $scope['suppliers'][user]['slots'][shortTime]['bookedby'] = "";
                    bookedrow[rowindex] = false;
                    bookedcol[colindex] = false;

                    // Save to log
                    logRef.push({
                        created: Firebase.ServerValue.TIMESTAMP,
                        action: "UNBOOK",
                        slot: shortTime,
                        bookedby: userID,
                        bookedwith: user
                    });
                }, 0);
            }
        };



        // old routines for styling

        // use: ng-class="getClass($index, agents)" in HTML for this function
        $scope.getClass = function getClass(idx, list) {
            if (bookedrow[idx] == true) {
                return "disabled-row";
            } else {
                return "";
            }
        };

        $scope.isBooked = function isBooked(rowindex,colindex,bool,user,bookedby,time) {
            //console.log(rowindex + "|" + bool + "|" + user + "|" + bookedby);

                if (bool && user == bookedby) {
                    //$scope.bookedrow = bookedrow;
                    return "booked-owner";
                }
                if (bookedrow[rowindex] && user != bookedby) {
                    return "disabled-cell";
                }
                if (bookedcol[colindex] && user != bookedby) {
                    return "disabled-cell";
                }
                if (bool) {
                    return "disabled-cell";
                }

        };

        $scope.isBookedCB = function isBooked(rowindex,colindex,bool,user,bookedby) {
            //console.log(rowindex + "|" + bool + "|" + user + "|" + bookedby);
            if (bool && user == bookedby) {
               // $scope.bookedrow = bookedrow;
                return "booked-ownerCB";
            }
            if (bookedrow[rowindex] && user != bookedby){
                return "disabled-cellCB";
            }
            if (bookedcol[colindex] && user != bookedby){
                return "disabled-cellCB";
            }
            if (bool){
                return "disabled-cellCB";
            }
        };

        $scope.isDisabled = function isBooked(rowindex,colindex,bool,user,bookedby,time) {
            //
            if (bool && user == bookedby) {
               // $scope.bookedrow = bookedrow;
                return false;
            }
            if (bookedrow[rowindex] && user != bookedby){
                return true;
            }
            if (bookedcol[colindex] && user != bookedby){
                return true;
            }
            if (bool){
                return true;
            } //
        };





        // Set the userID (name) of the logged in user in the scope so that it can be shown as a welcome
        $scope.userID = window.userID;
        //console.log($scope);



    });


