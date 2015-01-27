var parser = require('../lib/ejsCodeParser'),
	fs = require('fs'),
	ejs = require('ejs'),
	expect = require("chai").expect;

describe("Ejs parser", function () {
	it("Extracts global vars from ejs generated code", function (done) {
		var filename = __dirname + "/fixtures/testTemplate.src.html";
		var template = fs.readFileSync(filename, {encoding: "UTF-8"});
		var code = ejs.compile(template, {filename: filename, client: true});
		parser.getEjsRequiredVars(code.toString()).then(function (variables) {
			expect(variables).to.have.length(3);
			expect(variables).to.contain("test", "heading", "variable");
			done();
		}).catch(done);
	});

	it("Extracts nested variables from ejs generated code", function (done) {
		var filename = __dirname + "/fixtures/testTemplateWithNestedVar.src.html";
		var template = fs.readFileSync(filename, {encoding: "UTF-8"});
		var code = ejs.compile(template, {filename: filename, client: true});
		parser.getEjsRequiredVars(code.toString()).then(function (variables) {
			expect(variables).to.have.length(3);
			expect(variables).to.contain("test", "heading", "nested", "nested.variable");
			done();
		}).catch(done);
	});
});

//
//describe("Utils tests", function () {
//	describe ("remove with block from code", function () {
//		it("Removes the block as expected", function () {
//			var code = "var out = 2" +
//				"with (locals || {}) { (function () { " +
//				"var x = 0" +
//				"})()" +
//				"}" +
//				"return out;"
//			var processedCode = ejsCodeParser.removeWithFromCode(code);
//
//			var expected = "var out = 2" +
//				" (function () { " +
//				"var x = 0" +
//				"})()" +
//				"return out;"
//
//			expect(processedCode).to.eql(expected)
//		});
//
//		it("Removes the block as expected when code has newlines", function () {
//			var code = "var out = 2\n" +
//				"with (locals || {}) { (function () { \n" +
//				"var x = 0\n" +
//				"})()\n" +
//				"}\n" +
//				"return out;"
//			var processedCode = ejsCodeParser.removeWithFromCode(code);
//
//			var expected = "var out = 2\n" +
//				" (function () { \n" +
//				"var x = 0\n" +
//				"})()\n\n" +
//				"return out;"
//
//			expect(processedCode).to.eql(expected)
//		});
//	});
//});