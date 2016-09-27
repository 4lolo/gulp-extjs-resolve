'use strict';
	
module.exports = function (options) {
	if (!options) {
		options = {};
	}
	
    var classes = options.classes || [],
		mainFile = options.mainFile || '',
		paths = options.paths || {},
		optionalCount = 0,
		result;
		
	global.window = {
		addEventListener: function () {},
		removeEventListener: function () {},
		
		document: {
			documentElement: {
				style: {}
			},
			head: {},
			
			addEventListener: function () {},
			removeEventListener: function () {},
			createElement: function () {},
			getElementById: function () {},
			getElementsByTagName: function (tag) {
				if (tag === 'script') {
					return [{ src: '' }];
				}
			}
		},
		location: {
			protocol: 'http'
		},
		navigator: {
			userAgent: 'AppleWebKit/0'
		},
		
		Ext: {}
	};
	global.document = global.window.document;
	global.location = global.window.location;
	global.navigator = global.window.navigator;
	global.Ext = global.window.Ext;

	require(mainFile);
	
	// FIX
	clearInterval(global.Ext.Element.collectorThreadId);

	global.Ext.apply(global.Ext.Loader, {
		syncModeEnabled: true,
		setPath: global.Ext.Function.flexSetter(function(name, path) {
			path = require('fs').realpathSync(path);
			global.Ext.Loader.config.paths[name] = path;

			return global.Ext.Loader;
		}),

		loadScriptFile: function(filePath, onLoad, onError, scope, synchronous) {
			require(filePath);
			onLoad.call(scope);
		}
	});

	global.Ext.Loader.setPath(paths);
	global.Ext.apply(Ext.Loader, {
		setPath: function () {}
	});
		
	while (classes.length > 0) {
		global.Ext.Loader.require(classes.shift());
	}

	while (optionalCount !== global.Ext.Loader.optionalRequires.length) {
		optionalCount = global.Ext.Loader.optionalRequires.length;
		global.Ext.Loader.require(global.Ext.Loader.optionalRequires);
	}

	result = global.Ext.Loader.history.map(function (cls) {
		return global.Ext.Loader.classNameToFilePathMap[cls];
	});
	
	delete global.window;
	delete global.document;
	delete global.location;
	delete global.navigator;
	delete global.Ext;
	
	return result;
};
