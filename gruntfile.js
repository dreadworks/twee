module.exports = function (grunt) {

	var config, sources, pgk, port, _;

	_ = require('underscore');

	port = 8080;
	pkg = grunt.file.readJSON('package.json');
	sources = [
		'intro',

		// exposed norne object
		'core',

		// utilities
		'util/register',
		'util/obj',
		'util/evt',
		'util/exc',
		'util/xhr',

		// core library
		'core/env',
		'core/world',

		// data objects (the model)
		'data/lane',
		'data/character',

		// rendering
		'render/clock',
		'render/broker',
		'render/canvas',
		'render/character',
		'render/lane',

		'outro'
	];

	config =  {

		pkg: pkg,

		target: {
			dev: '_dev/'+ pkg.name +'.js',
			test: 'text/'+ pkg.name +'.js'
		},

		sources: (function () {
			return _(sources).map(function (source) {
				return 'src/' + source + '.js';
			});
		}()),

		tests: (function () {
			return _(sources).map(function (source) {
				return 'test/' + source + '.spec.js';
			});
		}())

	};

	grunt.initConfig({
		pkg: config.pkg,

		clean: {
			dev: [config.target.dev],
			test: [config.target.test]
		},

		concat: {
			dev: {
				src: config.sources,
				dest: config.target.dev
			},
			test: {
				src: config.sources,
				dest: config.target.test
			}
		},

		watch: {
			files: _(config.sources).union(config.tests),
			tasks: 'test'
		},

		jasmine: {
			dev: {
				src: config.target.dev,
				options: {
					specs: config.tests,
					template: 'test/grunt.tmpl',
					vendor: 'lib/*.js',
					'--web-security': false
				}
			}
		},

		jshint: {
			options: {
				jshintrc: 'jshint.json'
			},
			source: _(config.sources).without('src/intro.js', 'src/outro.js')
		},

		connect: {
			test: {
				options: {
					port: port,
					base: 'test/assets',
					keepalive: false
				}
			}
		}

	});

	grunt.loadNpmTasks('grunt-contrib-clean');
	grunt.loadNpmTasks('grunt-contrib-concat');
	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadNpmTasks('grunt-contrib-jshint');
	grunt.loadNpmTasks('grunt-contrib-jasmine');
	grunt.loadNpmTasks('grunt-contrib-connect');


	grunt.registerTask('dev', ['clean:dev', 'concat:dev']);
	grunt.registerTask('test', ['dev', 'jshint', 'connect:test', 'jasmine:dev']);

};
