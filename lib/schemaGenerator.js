var _ = require('underscore');

//Currently this is very basic. A variables with nested properties is an object and everything else is a string
function addTypes(schema) {
	_.each(schema, function (value, key) {
		if (_.isEmpty(value)) {
			schema[key].type = "String";
		} else {
			schema[key] = {type: "Object", properties: addTypes(value)};
		}
	});
	return schema;
}

module.exports = {
	generate: function (variableNames) {
		var schema = {};
		_.each(variableNames, function (name) {
			var components = name.split(".");

			var iterationPointer = schema
			_.each(components, function (component, i) {
				iterationPointer[component] = iterationPointer[component] || {};
				iterationPointer = iterationPointer[component];
			});
		});
		return addTypes(schema);
	}
};