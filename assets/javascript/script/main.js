define(["jquery", "bootstrap", "corsanywhere", "ko", "koDebug"], function ($, bootstrap, cors, ko, kob) {

    function Activity(id, categories, name, location, users, image_url, maxSeats) {
        var self = this;
        self.key = ko.observable(id);


        self.categories = ko.observableArray(categories);
        self.name = ko.observable(name);
        self.location = ko.observable(location);

        self.users = ko.observableArray();

        if (users) {

            self.users.removeAll();
            $.each(users, function (key, value) {

                var user = {id:key,email:value.email,firstName:value.firstName,lastName:value.lastName};
                self.users.push(user);
            });


        }

        if (maxSeats) {
            self.maxSeats = ko.observable(maxSeats);
        }
        else
        {
            self.maxSeats = ko.observable(0);
        }
        self.image_url = ko.observable(image_url);


    }

   



    function LetsEatModel() {

        var self = this;

        self.userVisible = ko.observable(false);

        self.pickedJoin = ko.observable(false);
        self.joinActivity = ko.observable();

        self.pickedCreate = ko.observable(false);
        self.createActivity = ko.observable();

        self.searchTerm = ko.observable('chicken');

        self.zipCode = ko.observable('77077');

        self.zipInfo = ko.observable('');


      //  self.maxSeats = ko.observable(0);

        self.email = ko.observable();
        self.firstName = ko.observable();
        self.lastName = ko.observable();

        self.searchResult = ko.observableArray();

        self.currentEvents = ko.observableArray([new Activity()]);

        self.createEventList = ko.observableArray();

        // These observable keep track of what page is displaying
        self.landingVisible = ko.observable(true);

        self.resultsVisible = ko.observable(false);

        self.createVisible = ko.observable(false);


       

        // Sends AJAX to google APIs and sets VM's zipInfo to relevant JSON data.
        self.zipRequest = ko.computed(function () {
            // TODO: VALIDATOR: Below ajax call should only run when "self.zipInfo() === valid Zip Code
            // ELSE it should set self.zipInfo to something like "Zip Code not recognized"
            if (self.zipCode() !== null || typeof self.zipCode() !== 'undefined') {
                $.ajax({
                    url: "http://maps.googleapis.com/maps/api/geocode/json?address=" + self.zipCode(),
                    method: "GET"
                }).done(function (res) {
                    var info = res.results[0].formatted_address;
                    self.zipInfo(info);
                });
            }
        });

        //search
        self.submitSearch = function () {

            var searchTerm = self.searchTerm();
            var zipCode = self.zipCode();
            self.searchResult.removeAll();
            self.currentEvents.removeAll();

            self.currentEvents.valueWillMutate();
            self.createEventList.valueWillMutate();
            var apitoken = "O6n9AwTvAVvbc1aMOVvSmI_ATeiK6bEXa3Ad-nEfWVp0tuJPnG_yv01m8WwvcQ3Urd2B7Z25hxVCOF35wf_-C-Ub-zm57JG_EnQMn0vQj6LNBDfkj-xlcWHUSxKuWnYx";

            var args = {
                url: 'https://api.yelp.com/v3/businesses/',
                type: 'search?',
                query: {
                    categories: searchTerm,
                    limit: 20, //number of results to return
                    location: zipCode
                }
            };

            $.when(secureApiRequest.fetchResponse(args, apitoken)).done(function () {
                console.log(secureApiRequest.responseObject);

                ko.utils.arrayPushAll(self.searchResult, secureApiRequest.responseObject.businesses);

                ko.utils.arrayForEach(self.searchResult(), function (item) {
                    var db = firebase.database();
                    db.ref().child("events").orderByKey().equalTo(item.id).once("value", function (snapshot) {
                        if (snapshot.val()) {
                            var dbData = snapshot.val();

                            var arr2 = Object.values(dbData);
                            var value = arr2[0];

                            var activity = new Activity(item.id, item.categories, item.name, item.location, value.users, item.image_url, value.maxSeats);


                            self.currentEvents.push(activity);
                            // console.log(self.currentEvents());
                        }
                        else {
                            //console.log("DoNotExists: " + item.id);
                            var activity = new Activity(item.id, item.categories, item.name, item.location, undefined, item.image_url, 0);
                            self.createEventList.push(activity);

                        }

                    })

                }, self)



            });
            self.currentEvents.valueHasMutated();
            self.createEventList.valueHasMutated();
            self.landingVisible(false);
            self.resultsVisible(true);

        }




        self.joinEvent = function () {

            console.log("selected event : " + this.key());
            self.resultsVisible(false);
            self.userVisible(true);
            self.pickedJoin(true);
            self.pickedCreate(false);
            self.joinActivity = this;

        }


        self.createEvent = function () {
            console.log("Creating event : " + this.key);
            self.createVisible(false);
            self.userVisible(true);
            self.pickedCreate(true);
            self.pickedJoin(false);
            self.createActivity = this;
        }

        self.submitUserInfo = function () {
            //console.log(self.firstName());

            if (self.pickedJoin()) {

                var match = ko.utils.arrayFirst(self.currentEvents(), function (item) {

                    return (item.key === self.joinActivity.key)
                });

                if (match) {

                    match.users.push({ email: self.email(), firstName: self.firstName(), lastName: self.lastName() })

                    self.resultsVisible(true);
                    self.userVisible(false);
                    self.pickedJoin(false);
                }

                var user = { email: self.email(), firstName: self.firstName(), lastName: self.lastName() };
                addUserTofirebaseDB(self.joinActivity.key(), user);


            }
            else if (self.pickedCreate()) {

                console.log(self.createActivity);
                self.createActivity.users.push({ email: self.email(), firstName: self.firstName(), lastName: self.lastName() })
                self.currentEvents.push(self.createActivity);

                var match = ko.utils.arrayFirst(self.createEventList(), function (item) {
                    return (item.key === self.createActivity.key)
                });

                if (match) {
                    //match.remove(self.createActivity.key)

                }
                self.resultsVisible(true);
                self.userVisible(false);
                self.pickedJoin(false);

                var dbRef = firebase.database();
                var rootRef = firebase.database().ref();
                var eventRef = rootRef.child("events");

                var eventObj = {
                    [self.createActivity.key()]: {
                        categories: self.createActivity.categories(),
                        eventName: self.createActivity.name(),
                        location: self.createActivity.location(),
                        timestamp: firebase.database.ServerValue.TIMESTAMP,
                        maxSeats: self.maxSeats()
                    }
                };


                eventRef.update(eventObj);

                var userRef = eventRef.child(self.createActivity.key() + "/users");
                var newUserRef = userRef.push();
                newUserRef.set({
                    email: self.email(),
                    firstName: self.firstName(),
                    lastName: self.lastName()
                })

            }


        }

        function addUserTofirebaseDB(key, user) {
            var dbRef = firebase.database().ref("events/" + key + "/users");
            dbRef.push(user);

        }

        self.navToCreate = function () {

            self.resultsVisible(false);
            self.createVisible(true);
        }

        self.navToResult = function () {
            self.createVisible(false);
            self.resultsVisible(true);
        }

    }

    // The's landing page code
    $(document).ready(function () {
        ko.applyBindings(new LetsEatModel());


    });

});