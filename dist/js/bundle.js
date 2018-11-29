/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, { enumerable: true, get: getter });
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// create a fake namespace object
/******/ 	// mode & 1: value is a module id, require it
/******/ 	// mode & 2: merge all properties of value into the ns
/******/ 	// mode & 4: return value when already ns object
/******/ 	// mode & 8|1: behave like require
/******/ 	__webpack_require__.t = function(value, mode) {
/******/ 		if(mode & 1) value = __webpack_require__(value);
/******/ 		if(mode & 8) return value;
/******/ 		if((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
/******/ 		var ns = Object.create(null);
/******/ 		__webpack_require__.r(ns);
/******/ 		Object.defineProperty(ns, 'default', { enumerable: true, value: value });
/******/ 		if(mode & 2 && typeof value != 'string') for(var key in value) __webpack_require__.d(ns, key, function(key) { return value[key]; }.bind(null, key));
/******/ 		return ns;
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "/dist/";
/******/
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = "./src/index.js");
/******/ })
/************************************************************************/
/******/ ({

/***/ "./src/functions.js":
/*!**************************!*\
  !*** ./src/functions.js ***!
  \**************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\n\nObject.defineProperty(exports, \"__esModule\", {\n    value: true\n});\nexports.calculateActionTime = calculateActionTime;\n/**\n * Adds a specified number of actions to a game time to determine the correct phase and impulse in the future\n *\n * @param {number} actionPoints - A number of action points \n * @param {object} currentActionsPerImpulse - An object of distributed action points (e.g. {\"1\": 2, \"2\": 1, \"3\": 2, \"4\": 2})\n * @param {object} time - A game time object (e.g. {\"impulse\" : 1, \"phase\" : 1})\n * @return {object} - Returns an object with a correct time object as well as remaining actions {time: next, remaining: actions}\n */\nfunction calculateActionTime(actionPoints, currentActionsPerImpulse, time) {\n    var actions = actionPoints;\n    var ca = currentActionsPerImpulse;\n    var next = time;\n    var phase = time.phase;\n    var impulse = time.impulse;\n    var i = impulse;\n\n    //while there are still total actions at each impulse\n    while (actions >= ca[i]) {\n        //subtract the impulse's actions from total actions\n        actions = actions - ca[i];\n        i++;\n\n        //there are only 4 impulses per phase, so loop around\n        if (i > 4) {\n            i = 1;\n        }\n\n        //only increment the time if there are actions left\n        if (actions > 0) {\n            if (impulse === 4) {\n                phase += 1;\n                impulse = 1;\n            } else {\n                impulse += 1;\n            }\n\n            next.phase = phase;\n            next.impulse = impulse;\n        }\n    }\n\n    if (actionPoints === 0) {\n        actions = currentActionsPerImpulse[time.impulse];\n    }\n\n    //subtract the impulse amount from actions to get remaining\n    return JSON.stringify({ time: next, remaining: actions });\n}\n\n//# sourceURL=webpack:///./src/functions.js?");

/***/ }),

/***/ "./src/index.js":
/*!**********************!*\
  !*** ./src/index.js ***!
  \**********************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\n\nvar _functions = __webpack_require__(/*! ./functions */ \"./src/functions.js\");\n\nconsole.log((0, _functions.calculateActionTime)(673, { \"1\": 1, \"2\": 1, \"3\": 1, \"4\": 1 }, { \"impulse\": 1, \"phase\": 1 }));\n\n//# sourceURL=webpack:///./src/index.js?");

/***/ })

/******/ });