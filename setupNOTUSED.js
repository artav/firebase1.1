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
        var ref = new Firebase("https://boiling-torch-6521.firebaseio.com/settings");
        var fb = $firebase(ref);

        // sync as object
        var syncObject = fb.$asObject();

        // three way data binding
        syncObject.$bindTo($scope, 'settings');

        // function to set the default data
        $scope.save = function() {

            fb.$set({
                days: {
                    name: 'Sunday',
                    name: 'Monday',
                    name: 'Tuesday'

                    }


            });

        };

    });

