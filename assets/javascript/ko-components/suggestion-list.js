define(["jquery", "ko"], function($, ko) {
    function Suggestion(name) {
        this.name = name;
        this.copyToSearchBox = function(){
            console.log(this);
        }
    }

    function SuggestionsViewModel() {
        this.suggestions = [
            new Suggestion('Fried Chicken'),
            new Suggestion('Burger'),
            new Suggestion('Pizza'),
            new Suggestion('Pasta'),
            new Suggestion('Hamburgers'),
            new Suggestion('Food 1'),
            new Suggestion('Food 2'),
            new Suggestion('Food 3'),
            new Suggestion('Food 4')
        ];
    }

    $(document).ready(function(){
        ko.applyBindings(new SuggestionsViewModel(), document.getElementById("suggestion-content"));
    });
});
