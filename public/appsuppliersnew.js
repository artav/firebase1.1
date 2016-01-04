angular.module('scheduleApp', ['firebase'])

    .controller('mainController', function($scope, $timeout, $firebase) {

        var baseRef = new Firebase("https://boiling-torch-6521.firebaseio.com/");

        var bookedrow = [];
        var bookedcol = [];

        $scope.bookedrow = bookedrow;
        $scope.bookedcol = bookedcol;
        $scope.userID = window.userID;

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

                syncObject.$watch(function(){
                    console.info('data changed');
                    updateBookedRowCol($scope.agents);
                });

                function updateBookedRowCol(agents){
                    var line = 0;
                    angular.forEach($scope.agents,function(agent,userID){
                        if(!agent){
                            return;
                        }
                        var slots = agent.slots;
                        var col = 0;
                        angular.forEach(slots,function(slot,shortTime){
                            if(slot.booked && slot.bookedby === user.name){
                                bookedcol[col] = true;
                                bookedrow[line] = true;
                            }
                            ++col;
                        });
                        ++line;
                    });
                }

                // three way data binding
                syncObject.$bindTo($scope, 'agents').then(function(){ //loop through suppliers and populate bookedrow and booked column adequately.
                    updateBookedRowCol($scope.agents);
                });

                // connect to firebase

                var supplierRef = baseRef.child('suppliers');

                var supplierFb = $firebase(supplierRef);

                // sync as object
                var syncObject2 = supplierFb.$asObject();

                // three way data binding
                syncObject2.$bindTo($scope, 'suppliers');

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

            if (!booked) { //we want to book
                $timeout(function() {
                    $scope['suppliers'][userID]['slots'][shortTime]['booked'] = true;
                    $scope['suppliers'][userID]['slots'][shortTime]['bookedby'] = user;
                    $scope['agents'][user]['slots'][shortTime]['booked'] = true;
                    $scope['agents'][user]['slots'][shortTime]['bookedby'] = userID;
                    bookedrow[rowindex] = true;
                    bookedcol[colindex] = true;
                    // Save to log
                    /*logRef.push({
                        created: Firebase.ServerValue.TIMESTAMP,
                        action: "book",
                        slot: shortTime,
                        bookedby: userID,
                        bookedwith: user
                    });*/
                }, 0);
            }else{
                $timeout(function() {
                    $scope['suppliers'][userID]['slots'][shortTime]['booked'] = false;
                    $scope['suppliers'][userID]['slots'][shortTime]['bookedby'] = "";
                    $scope['agents'][user]['slots'][shortTime]['booked'] = false;
                    $scope['agents'][user]['slots'][shortTime]['bookedby'] = "";
                    bookedrow[rowindex] = false;
                    bookedcol[colindex] = false;
                    // Save to log
                    /*logRef.push({
                        created: Firebase.ServerValue.TIMESTAMP,
                        action: "UNBOOK",
                        slot: shortTime,
                        bookedby: userID,
                        bookedwith: user
                    });*/
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

        $scope.isBooked = function isBooked(rowindex,colindex,bool,user,bookedby) {
            //console.log(rowindex + "|" + bool + "|" + user + "|" + bookedby);
            if (bool && user == bookedby) {
                return "booked-owner";
            }
            if (bookedrow[rowindex] && user != bookedby){
                return "disabled-cell";
            }
            if (bookedcol[colindex] && user != bookedby){
                return "disabled-cell";
            }
            if (bool){
                return "disabled-cell";
            }
        };

        $scope.isBookedCB = function isBooked(rowindex,colindex,bool,user,bookedby) {
            //console.log(rowindex + "|" + bool + "|" + user + "|" + bookedby);
            if (bool && user == bookedby) {
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

        $scope.isDisabled = function isBooked(rowindex,colindex,bool,user,bookedby) {
            //
            if (bool && user == bookedby) {
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

        //console.log($scope);



    });


