function testYelpRequest(apitoken){
    var args = {
        url: 'https://api.yelp.com/v3/businesses/',
        type: 'search?',
        query: {
            categories: 'chicken',
            limit: 10, //number of results to return
            location: '77077'
        }
    };
    testApiCall(args, apitoken)
}

function testApiCall(options, apitoken){
    $.when(secureApiRequest.fetchResponse(options, apitoken)).done(function(){
        console.log(secureApiRequest.responseObject);
    });
}

function getDbStructure() {
    return {
        "event" : {
            "date" : "today(march 18)",
            "eventKey" : "2nub33ne7b4b4734bbeus(unique id) ",
            "eventName" : "eating pizza ",
            "location" : "downtown",
            "time" : "10:00" //optional
        },
        "user" : {
            "email" : "tom@gmail.com",
            "eventKey" : "2nub33ne7b4b4734bbeus", //It's same with eventkey; this will enable us to easily get the group which a user belongs to.
            "name " : "Tom",
            "time" : "10:00",
            "zipcode" : 77002
        }
    };
}