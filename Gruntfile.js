
module.exports = function(grunt) {
    'use strict';

    // Project configuration.
    grunt.initConfig({
        // Metadata.
        pkg: grunt.file.readJSON('package.json'),
        banner: '/*! <%= pkg.name %> - v<%= pkg.version %> - ' +
            '<%= grunt.template.today("yyyy-mm-dd") %>\n' +
            '<%= pkg.homepage ? "* " + pkg.homepage + "\\n" : "" %>' +
            '* Copyright (c) <%= grunt.template.today("yyyy") %> <%= pkg.author.name %>;' +
            ' Licensed <%= _.pluck(pkg.licenses, "type").join(", ") %> */\n',
        // Task configuration.
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
            },
            options: {
                files: ['src/test/*.js']
            },
            all: ['src/test/*.js']
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
    grunt.loadNpmTasks('grunt-release');
    grunt.loadNpmTasks('grunt-express-server');


    // Default task.
    grunt.registerTask('default', ['jshint', 'mochacov:test']);
    grunt.registerTask('travis', ['jshint', 'mochacov:travis']);
    grunt.registerTask('dist', ['clean', 'concat', 'uglify']);
    grunt.registerTask('server', ['default', 'express', 'watch']);

};