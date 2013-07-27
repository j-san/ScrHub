
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
                    globals: {
                        'jQuery': true,
                        'console': true
                    }
                },
                src: ['files/js/**/*.js']
            },
            server: {
                options: {
                    globals: {
                        'console': true
                    }
                },
                src: ['Gruntfile.js', 'src/**/*.js']
            },
        },
        watch: {
            all: {
                files: ['<%= jshint.server.src %>', '<%= jshint.client.src %>'],
                tasks: ['default']
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
                    debug: true,
                    //'debug-brk': true
                    coverage: true
                }
            },
            options: {
                files: ['<%= jshint.server.src %>']
            },
          }
    });


    // These plugins provide necessary tasks.
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-jasmine');
    grunt.loadNpmTasks('grunt-contrib-jasmine-node');
    grunt.loadNpmTasks('grunt-contrib-nodeunit');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-mocha-cov');
    grunt.loadNpmTasks('grunt-release');

    // Default task.
    grunt.registerTask('default', ['jshint', 'mochacov:test']);
    grunt.registerTask('travis', ['jshint', 'mochacov:travis']);
    grunt.registerTask('dist', ['clean', 'concat', 'uglify']);

};