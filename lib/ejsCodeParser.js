var esprima = require('esprima'),
	escope = require('escope'),
	estraverse = require('estraverse'),
	_ = require('underscore'),
	escodegen = require('escodegen'),
	Promise = require("bluebird");

function getEjsRequiredVars (code) {
	return Promise.promisify(getEjsBuilderScope)(code).then(function (scope) {
		return getGlobalVarsFromBuilderScope(scope);
	});
}

function wrapBuilderAstInFunction (ast) {
	return {
		type: "Program",
		body: [
			{
				"type": "FunctionDeclaration",
				"id": {
					"type": "Identifier",
					"name": "builder"
				},
				"params": [],
				"defaults": [],
				"body": ast,
				"rest": null,
				"generator": false,
				"expression": false
			}
		]
	}
}

function getEjsBuilderScope(code, callback) {
	var ast = esprima.parse(code, {loc: true});

	estraverse.traverse(ast, {
		enter: function (node, parent) {
			//Looking for the expression inside the with block
			if (parent && parent.type === 'WithStatement' && node.type === "BlockStatement") {
				var globalScope = escope.analyze(wrapBuilderAstInFunction(node)).scopes[0];
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
	getEjsRequiredVars: getEjsRequiredVars
};