module.exports = function(grunt) {

    // Insert inline files on "// !include file.ext" or "/* !include file.ext */"
    // TODO: detect and block recursive includes
    function embedIncludes(content, matches) {
        // Helper function; it's called twice in this function
        function hasEmbededIncludes(content) {
            return content.match(/\/(\/|\*)( )?\!(include|embed) ([a-z0-9\-\_\.\/]+( +)?(\*\/)?)/ig);
        }

        matches = matches || hasEmbededIncludes(content);
        var i = 0,
            l = matches ? matches.length : 0,
            file = null,
            currentMatch = null,
            fs = require('fs');

        for (i=0; i<l; i++) {
            currentMatch = matches[i];

            // Extract filename
            file = currentMatch.replace(/\/(\/|\*)( )?\!(include|embed) /, '');
            var isHtml = (file.indexOf('.htm') === (file.length - 4)) || (file.indexOf('.html') === (file.length - 5));
            // Read file
            file = fs.readFileSync(file);
            file = file + ""; // Convert to string if got anything else
            if (isHtml) {
                file = file.replace(/\\/g, '\\\\').replace(/"/g, '\\\"').replace(/'/g, "\\\'").replace(/\n/g, ' ');
            }

            // Insert the content inline
            content = content.replace(currentMatch, file);
        }

        matches = hasEmbededIncludes(content);
        return (matches && matches.length) ? embedIncludes(content, matches) : content;
    }

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        jshint: {
            all: ['Gruntfile.js', 'src/**/*.js']
        },
        concat: {
            dist: {
                options: {
                    separator: "\n",
                    process: function (content, srcpath) {
                        return embedIncludes(content);
                    }
                },
                src: 'src/js/<%= pkg.name %>.js',
                dest: 'build/<%= pkg.name %>.js'
            }
        },
        uglify: {
            options: {
                banner: '/*! <%= pkg.name %> - v<%= pkg.version %> - <%= grunt.template.today("yyyy-mm-dd") %> */\n'
            },
            my_target: {
                files: {
                    'build/<%= pkg.name %>.min.js': ['build/<%= pkg.name %>.js']
                }
            }
        },
        sass: {
            dist: {
                files: {
                    'build/bigblock.css': 'src/scss/main.scss'
                }
            }
        },
        shell: {
            publish: {
                // OK, auth data are on ssh config
                command: 'scp -r samples build tiagopadua.com:~/bigblock/'
            }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-sass');
    grunt.loadNpmTasks('grunt-shell');

    grunt.registerTask('default', ['jshint', 'concat', 'uglify', 'sass']);
    grunt.registerTask('publish', ['default', 'shell:publish']);
};
