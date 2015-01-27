var generator = require('../lib/schemaGenerator'),
	expect = require("chai").expect;

describe('Schema Generator', function () {
	it ("Generates flat schema", function () {
		var schema = generator.generate(["test", "test1"]);
		expect(schema).to.eql({test: {type: "String"}, test1: {type: "String"}});
	});

	it("Generates nested schema", function () {
		var schema = generator.generate(["nested", "nested.variable", "test1"]);
		expect(schema).to.eql({test1: {type: "String"}, nested: {type: "Object", properties: {variable: {type: "String"}}}});
	});

	it("Generates deep nested schema", function () {
		var schema = generator.generate(["nested.deep.deep1", "nested", "nested.deep", "test1"]);
		expect(schema).to.eql({test1: {type: "String"}, nested: {type: "Object", properties: {
			deep: {type: "Object", properties: {
				deep1: {type: "String"}
			}}
		}}});
	});
});