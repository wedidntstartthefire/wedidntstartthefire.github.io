module.exports = function(grunt) {

	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
		minCSS: 'assets/css/style.min.css',
		concatCSS: 'assets/css/style_concat.css',
		concatJS: 'assets/js/script_concat.js',
		minJS: 'assets/js/wdstf.min.js',
		execute: {
			start_server: {
				src: ['app.js']
			},
		},
		watch: {
			css: {
				files: ['assets/css/src/style.css'],
				tasks: ['css']
			},
      js: {
        files: ['assets/js/src/wdstf.js'],
				tasks: ['js']
      }
		},
		clean: {
			revcss: {
				src: ['assets/css/*style.min.css']
			},
			mincss: {
				src: ['<%= minCSS %>']
			},
			concatCSS: {
				src: ['<%= concatCSS %>']
			},
			revjs: {
				src: ['assets/js/*wdstf.min.js'],
			},
			minjs: {
				src: ['assets/js/*wdstf.min.js'],
			},
			concatJS: {
				src: ['<%= concatJS %>'],
			},
      resizedImages: {
        src: ['assets/images/resized/*.*'],
      }
		},

		concat: {
			dist: {
	      src: ['assets/css/src/style.css'],
	      dest: '<%= concatCSS %>',
	    },
			js: {
				files: {'<%= concatJS %>': [
					'assets/js/src/wdstf.js',
				]},
			},
		},

		cssmin: {
			options: {
				banner: '/*!\n* <%= pkg.author_name %>\n* <%= pkg.author_url %>\n* Built for <%= pkg.built_for_url %>\n* @author <%= pkg.author_name %>\n* @version <%= pkg.version %>\n* @build_date <%= grunt.template.today("dd-mm-yyyy") %>\n*/'
			},
			css: {
				files: {
					'<%= minCSS %>' : [ '<%= concatCSS %>' ]
				}
			}
		},
		rev: {
			css: {
				files: {
					src: ['<%= minCSS %>']
				}
			},
			js: {
				files: {
					src: ['<%= minJS %>'],
				},
			},
		},
		injector: {
			css: {
				files: {
					'index.html': ['assets/css/*style.min.css']
				}
			},
			js: {
				files: {
					'index.html': ['assets/js/*wdstf.min.js'],
				},
			},
		},
		serve: {
      path: './index.html',
      options: {
        port: 9000
      }
    },
		uglify: {
			options: {
				banner: '/*! <%= pkg.name %> minified file generated @ <%= grunt.template.today("dd-mm-yyyy") %> */\n',
			},
			js: {
				files: {
				'assets/js/wdstf.min.js': ['<%= concatJS %>'],
				},
			},
    },

		removelogging: {
			dist: {
				src: 'assets/js/wdstf.min.js',
				dest: 'assets/js/wdstf.min.js',
			},
		},

    imagemin: {                          // Task
      dynamic: {                         // Target
        files: [{
          expand: true,                  // Enable dynamic expansion
          cwd: 'assets/images/resized/',                   // Src matches are relative to this path
          src: ['**/*.{png,jpg,jpeg,gif}'],   // Actual patterns to match
          dest: 'assets/images/'         // Destination path prefix
        }]
      }
    },

    image_resize: {
      resize: {
        options: {
          width: 100,
          height: 100,
        },
        src: 'assets/images/src/*.{png,jpg,jpeg,gif}',
        dest: 'assets/images/resized/'
      }
    },

	});

	grunt.loadNpmTasks('grunt-contrib-concat');
	grunt.loadNpmTasks('grunt-contrib-cssmin');
	grunt.loadNpmTasks('grunt-contrib-clean');
	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadNpmTasks('grunt-contrib-jshint');
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-remove-logging');
  grunt.loadNpmTasks('grunt-contrib-imagemin');
  grunt.loadNpmTasks('grunt-image-resize');
	grunt.loadNpmTasks('grunt-http');
	grunt.loadNpmTasks('grunt-injector');
	grunt.loadNpmTasks('grunt-rev');
	grunt.loadNpmTasks('grunt-execute');
	grunt.loadNpmTasks('grunt-serve');
	grunt.registerTask('css', ['concat', 'clean:revcss', 'cssmin:css', 'rev:css', 'clean:concatCSS', 'clean:mincss', 'injector:css']);
  grunt.registerTask('js', ['clean:revjs', 'concat:js', 'uglify:js', 'rev:js', 'clean:concatJS', 'injector:js']);
  grunt.registerTask('images', ['image_resize', 'imagemin', 'clean:resizedImages']);
	grunt.registerTask('start', ['server','watch']);
	grunt.registerTask('default', ['start']);

	grunt.registerTask('build', ['css', 'js']);

};
