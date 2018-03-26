/**
 * Loads each template in the list array onto the page the loadTemplates function is being called from
 */
ko.components.register('suggestion-widget', {
    viewModel: function(params) {
       this.food = params.value;
    },
    template: //TODO: load template from external file
        '<li data-bind="text: food"></li>'
});