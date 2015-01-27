var esprima = require('esprima'),
	escope = require('escope'),
	estraverse = require('estraverse'),
	_ = require('underscore'),
	escodegen = require('escodegen'),
	Promise = require("bluebird");

function getEjsRequiredVarsInternal(ast, variables) {
	return Promise.promisify(getEjsBuilderScope)(ast, variables).then(function (scope) {
		var newVariables = getGlobalVarsFromBuilderScope(scope);
		variables = variables.concat(newVariables);
		if (newVariables.length) {
			return getEjsRequiredVarsInternal(ast, variables);
		}
		return variables;
	});
}

function wrapBuilderAstInFunction (ast, knownVariables) {
	return {
		type: "Program",
		body: [
			{
				"type": "FunctionDeclaration",
				"id": {
					"type": "Identifier",
					"name": "builder"
				},
				"params": _.map(knownVariables, function (variable) {
					return {"type": "Identifier", name: variable}
				}),
				"defaults": [],
				"body": ast,
				"rest": null,
				"generator": false,
				"expression": false
			}
		]
	}
}

function getEjsBuilderScope(ast, knownVariables, callback) {

	estraverse.traverse(ast, {
		enter: function (node, parent) {
			//Looking for the expression inside the with block
			if (parent && parent.type === 'WithStatement' && node.type === "BlockStatement") {
				var globalScope = escope.analyze(wrapBuilderAstInFunction(node, knownVariables)).scopes[0];
				callback(null, globalScope);
				this.break();
			}
		},
		leave: function (node, parent) {
			if (node.type  === "Program") {
				callback(new Error('Could not find builder function in provided code'));
			}
		}
	});
}

var INTERNAL_EJS_VARS = ["__line", "__output", "escape"];

function getGlobalVarsFromBuilderScope(scope) {
	return _.chain(scope.implicit.left)
		.map(function (implicitVar) {
			return implicitVar.identifier.name;
		})
		.filter(function (varName) {
			return !_.include(INTERNAL_EJS_VARS, varName);
		})
		.compact()
		.uniq()
		.value();
}

module.exports = {
	getEjsRequiredVars: function getEjsRequiredVars (code) {
		var variables = [];
		var ast = esprima.parse(code, {loc: true});
		return getEjsRequiredVarsInternal(ast, variables);
	}
}