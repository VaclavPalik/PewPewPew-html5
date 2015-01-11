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
	var setActive = function(element) {
		element.className += " active";
	};
	var setUnactive = function(element) {
		element.className = element.className.replace(/(?:^|\s)active(?!\S)/g,
				'');
	};

	var showGame = function() {
		showElement("game");
		hideElement("upgrades");
		hideElement("about");
		setActive(navGame);
		setUnactive(navUpgrade);
		setUnactive(navAbout);
	};

	var showUpgrades = function() {
		hideElement("game");
		showElement("upgrades");
		hideElement("about");
		setUnactive(navGame);
		setActive(navUpgrade);
		setUnactive(navAbout);
	};

	var showAbout = function() {
		hideElement("game");
		hideElement("upgrades");
		showElement("about");
		setUnactive(navGame);
		setUnactive(navUpgrade);
		setActive(navAbout);
	};

	navGame.addEventListener("click", showGame);
	navUpgrade.addEventListener("click", showUpgrades);
	navAbout.addEventListener("click", showAbout);

	var resizeFunction = function resizeFunction() {
		$(document.body).animate({
			paddingTop : $('#nav').height() + 2 + 'px'
		});
		document.getElementById("canvas").width = $(window).width() - 30;
		document.getElementById("canvas").height = $(window).height() - $('#nav').height() - 5;
	};

	$(window).resize(function () {window.setTimeout(resizeFunction, 50);});
	window.addEventListener("deviceorientation", function () {window.setTimeout(resizeFunction, 50);});
	resizeFunction();
}();