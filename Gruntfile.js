
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
                src: ['files/js/<%= pkg.name %>.js'],
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
            files: ['files/test/*.js']
        },
        jshint: {
            client: {
                options: {
                    "browser": true,
                    "curly": true
                },
                src: ['files/js/**/*.js']
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
                tasks: ['default', 'express'],
                options: {
                    nospawn: true
                }
            }
        },
        realese: {
            npm: false
        },
        mochacov: {
            options: {
                files: ['test/*.js']
            },
            travis: {
                options: {
                    coveralls: {
                        serviceName: 'travis-ci'
                    }
                }
            },
            test: {
                options: {
                    reporter: 'spec',
                    require: ['should'],
                    debug: true,
                    //'debug-brk': true
                    coverage: true,
                }
            }
        },
        mochaTest: {
            test: {
                options: {
                    reporter: 'spec',
                },
                src: ['test/*.js']
            },
            coverage: {
                options: {
                    reporter: 'html-cov',
                    quiet: true,
                    captureFile: 'coverage.html'
                },
                src: ['test/*.js']
            },
            'travis-cov': {
                options: {
                    reporter: 'travis-cov'
                },
                src: ['test/*.js']
            }
        },
        express: {
            runserver: {
                options: {
                    script: 'src/index.js',
                    node_env: 'dev',
                    port: 1337,
                    output: 'Server running'
                }
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
    grunt.loadNpmTasks('grunt-mocha-cov');
    grunt.loadNpmTasks('grunt-mocha-test');
    grunt.loadNpmTasks('grunt-release');
    grunt.loadNpmTasks('grunt-express-server');


    // Default task.
    grunt.registerTask('default', ['jshint', 'mochaTest']);
    grunt.registerTask('travis', ['jshint', 'mochacov']);
    grunt.registerTask('dist', ['clean', 'concat', 'uglify']);
    grunt.registerTask('server', ['default', 'express', 'watch']);

};