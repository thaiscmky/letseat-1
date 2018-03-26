/**
 * Submits headers and token to authorization required API
 * @type {{responseObject: null | object, fetchResponse: object}}
 */
let secureApiRequest = {
    responseObject: null,
    fetchResponse: function (options, token) {
        let callHeaders = new Headers();
        callHeaders.append("Authorization", "Bearer " + token);
        //TODO add API to own server and change herokuapp's url
        return fetch("https://yummyeatsearch.herokuapp.com/" + options.url + options.type + $.param(options.query), {
            headers: callHeaders
        }).then((res) => {
            return res.json();
        }).then((json) => {
            secureApiRequest.responseObject = json;
        });
    }
};










