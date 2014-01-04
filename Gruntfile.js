
module.exports = function(grunt) {
    'use strict';

    require('blanket')({
        pattern: __dirname + '/src/'
    });

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        banner: '/*! <%= pkg.name %> - v<%= pkg.version %> - ' +
            '<%= grunt.template.today("yyyy-mm-dd") %>\n' +
            '<%= pkg.homepage ? "* " + pkg.homepage + "\\n" : "" %>' +
            '* Copyright (c) <%= grunt.template.today("yyyy") %> <%= pkg.author.name %>;' +
            ' Licensed <%= _.pluck(pkg.licenses, "type").join(", ") %> */\n',

        clean: {
            src: ['dist']
        },
        concat: {
            options: {
                banner: '<%= banner %>',
                stripBanners: true
            },
            dist: {
                src: ['public/js/<%= pkg.name %>.js'],
                dest: 'dist/<%= pkg.name %>.js'
            },
        },
        uglify: {
            options: {
                banner: '<%= banner %>'
            },
            dist: {
                src: '<%= concat.dist.dest %>',
                dest: 'dist/<%= pkg.name %>.min.js'
            },
        },
        jasmine: {
            files: ['public/test/*.js']
        },
        jshint: {
            client: {
                options: {
                    "browser": true,
                    "curly": true
                },
                src: ['public/js/**/*.js']
            },
            server: {
                options: {
                    curly: true,
                    debug: true,
                    node: true,
                    undef: true,
                    globals: {
                        before: true,
                        after: true,
                        describe: true,
                        it: true,
                        xdescribe: true,
                        xit: true
                    }
                },
                src: ['Gruntfile.js', 'src/**/*.js']
            },
        },
        watch: {
            client: {
                files: ['<%= jshint.client.src %>'],
                tasks: ['default']
            },
            server: {
                files: ['<%= jshint.server.src %>'],
                tasks: ['default'],
                options: {
                    nospawn: true
                }
            }
        },
        realese: {
            npm: false
        },
        mochaTest: {
            test: {
                options: {
                    reporter: 'spec',
                },
                src: ['test/*.js']
            },
            html: {
                options: {
                    reporter: 'html-cov',
                    quiet: true,
                    captureFile: 'coverage.html'
                },
                src: ['test/*.js']
            },
            lcov: {
                options: {
                    reporter: 'mocha-lcov-reporter',
                    quiet: true,
                    captureFile: 'lcov.info'
                },
                src: ['test/*.js']
            },
            travis: {
                options: {
                    reporter: 'travis-cov'
                },
                src: ['test/*.js']
            }
        },
        coveralls: {
            test: {
              src: 'lcov.info'
            }
        }
    });


    // These plugins provide necessary tasks.
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-jasmine');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-mocha-test');
    grunt.loadNpmTasks('grunt-release');
    grunt.loadNpmTasks('grunt-coveralls');


    // Default task.
    grunt.registerTask('default', ['jshint', 'test']);
    grunt.registerTask('test', [
        'mochaTest:test',
        'mochaTest:html',
        'mochaTest:travis'
    ]);
    grunt.registerTask('travis', [
        'jshint',
        'mochaTest:travis',
        'mochaTest:lcov',
        'coveralls'
    ]);
    grunt.registerTask('dist', ['clean', 'concat', 'uglify']);
};