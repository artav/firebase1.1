angular.module('scheduleApp', ['firebase'])

    .controller('mainController', function($scope, $timeout, $firebase) {


        // connect to firebase
        var baseRef = new Firebase("https://boiling-torch-6521.firebaseio.com/");
        var agentRef = baseRef.child('agents');
        var logRef = baseRef.child('log');
        var agentFb = $firebase(agentRef);

        // sync as object
        var syncObject = agentFb.$asObject();

        // three way data binding
        syncObject.$bindTo($scope, 'agents');

        // connect to firebase
        var supplierRef = baseRef.child('suppliers');
        var supplierFb = $firebase(supplierRef);

        // sync as object
        var syncObject = supplierFb.$asObject();

        // three way data binding
        syncObject.$bindTo($scope, 'suppliers');

        console.log($scope);

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
            window.location.assign("./")
        }

        //alter the scope object when a booking is made
        //////////////////////////////////////////////////////////////////////

        var bookedrow = [];
        var bookedcol = [];

        $scope.booking = function(rowindex,colindex,booked,user,time) {
            console.log('CLICKED- '+ booked + ' ' + user + ' ' + time);
            var shortTime = time.replace(":", "");

            if (booked == true) {
                $timeout(function() {
                    $scope['suppliers'][userID]['slots'][shortTime]['booked'] = true;
                    $scope['suppliers'][userID]['slots'][shortTime]['bookedby'] = user;
                    $scope['agents'][user]['slots'][shortTime]['booked'] = true;
                    $scope['agents'][user]['slots'][shortTime]['bookedby'] = userID;
                    $scope.$apply();
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
                    $scope['suppliers'][userID]['slots'][shortTime]['booked'] = false;
                    $scope['suppliers'][userID]['slots'][shortTime]['bookedby'] = "";
                    $scope['agents'][user]['slots'][shortTime]['booked'] = false;
                    $scope['agents'][user]['slots'][shortTime]['bookedby'] = "";
                    bookedrow[rowindex] = false;
                    bookedcol[colindex] = false;
                    $scope.$apply();
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

        //DELAY UNTIL DATA LOADED - HACK
        setTimeout(function(){

           var agentsObj = Object.keys($scope['agents']);
            var agentsLen = agentsObj.length;
           console.log("number of agents = " + agentsLen);


          for (var i = 0; i < agentsLen; i++) {
             var oneAgent = agentsObj[i];
                 var agentKeys = oneAgent.slots;
                    console.log(agentKeys);
            }
        }, 3000);  //END OF DELAY


    });


