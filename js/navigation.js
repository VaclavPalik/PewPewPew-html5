/* jshint devel: true */
!function() {
	'use strict';

	var navGame = document.getElementById("nav-game");
	var navUpgrade = document.getElementById("nav-upgrade");
	var navAbout = document.getElementById("nav-about");

	var showElement = function(element) {
		document.getElementById(element).className = document
				.getElementById(element).className.replace(
				/(?:^|\s)invisible(?!\S)/g, '');
	};
	var hideElement = function(element) {
		document.getElementById(element).className += " invisible";
	};
	
	var showGame = function() {
		showElement("game");
		hideElement("upgrades");
		hideElement("about");
	};
	
	var showUpgrades = function() {
		hideElement("game");
		showElement("upgrades");
		hideElement("about");
	};
	
	var showAbout = function() {
		hideElement("game");
		hideElement("upgrades");
		showElement("about");
	};
	
	navGame.addEventListener("click", showGame);
	navUpgrade.addEventListener("click", showUpgrades);
	navAbout.addEventListener("click", showAbout);
}();