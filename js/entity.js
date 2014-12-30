/* jshint devel: true */
var PewPew = {};

!function() {
	'use strict';

	/**
	 * Upgrade class
	 */
	function Upgrade(name, maxLevel) {
		var self = this;
		this.name = name;
		this.maxLevel = maxLevel;
		this.level = 0;
		this.cost = function() {
			return (self.level + 1) * 100;
		};
		this.getElementId = function() {
			return "upgrade-" + self.name;
		};
		this.onBuy = function() {
			document.getElementById(self.getElementId() + "-cost").innerHTML = self
					.cost();
			document.getElementById(self.getElementId() + "-level").innerHTML = self.level;
		};
		this.getHtml = function() {
			return '<div id="' + self.getElementId() + '" class="tile">'
					+ self.name + "<br>" + 'Level: <span id="'
					+ self.getElementId() + '-level">0</span><br>'
					+ 'Cost: <span id="' + self.getElementId() + '-cost">'
					+ self.cost() + "</span>" + "</div>";
		};
		this.tryBuy = function() {
			if (self.level >= self.maxLevel) {
				return false;
			}
			if (PewPew.player.money < self.cost()) {
				return false;
			}
			PewPew.player.substractMoney(self.cost());
			self.level++;
			self.onBuy();
		};
	}

	/**
	 * player singleton
	 */
	PewPew.player = {
		money : 50000,
		upgrades : {
			damage : new Upgrade("damage", 10),
			income : new Upgrade("income", 10)
		},
		income : function() {
			return this.upgrades.income.level + 1;
		},
		damage : function() {
			return this.upgrades.damage.level + 1;
		},
		changeMoney : function(newMoney) {
			this.money = newMoney;
			document.getElementById("money").innerHTML = this.money;
		},
		addMoney : function(money) {
			return this.changeMoney(this.money + money);
		},
		substractMoney : function(money) {
			return this.addMoney(-money);
		}
	};
	/**
	 * Fill upgrades tab
	 */
	var html = "";
	for ( var upgrade in PewPew.player.upgrades) {
		if (PewPew.player.upgrades.hasOwnProperty(upgrade)) {
			html += PewPew.player.upgrades[upgrade].getHtml();
		}
	}
	document.getElementById("upgrade-tiles").innerHTML = html;
	// add the event listeners to the created buttons
	var upg;
	for (upgrade in PewPew.player.upgrades) {
		if (PewPew.player.upgrades.hasOwnProperty(upgrade)) {
			upg = PewPew.player.upgrades[upgrade];
			document.getElementById(upg.getElementId()).addEventListener(
					"click", upg.tryBuy);

		}
	}

	/**
	 * Enemy class
	 */
	function Enemy(hp, x, y, image, value) {
		var self = this;
		this.hp = hp;
		this.x = x;
		this.y = y;
		this.setX = function(x) {
			self.x = x;
		};
		this.setY = function(y) {
			self.y = y;
		};
		this.image = image;
		this.value = value;
		/**
		 * deals damage to the enemy
		 */
		this.recieveDamage = function(damage) {
			self.hp -= damage;
			if (self.hp <= 0) {
				self.onDestroy();
			}
		};
		/**
		 * called when an enemy is destroyed
		 */
		this.onDestroy = function() {
			PewPew.player.addMoney(self.value * PewPew.player.income());
			var index = PewPew.game.enemies.indexOf(self);
			if (index > -1) {
				PewPew.game.enemies.splice(index, 1);
			}
			// redraw the scene
			PewPew.canvas.context.clearRect(0, 0, PewPew.canvas.width,
					PewPew.canvas.height);
			for ( var enemy in PewPew.game.enemies) {
				PewPew.canvas.context.drawImage(enemy.canvasImage, enemy.x,
						enemy.y);
			}
		};
		this.canvasImage = new Image();
		this.canvasImage.src = this.image;
		this.canvasImage.onload = function() {
			PewPew.canvas.context.drawImage(self.canvasImage, self.x, self.y);
		};
		this.width=this.canvasImage.width;
		this.height=this.canvasImage.height;
		PewPew.game.enemies[game.enemies.length] = this;
	}
	
	function Fighter(x, y){
		Enemy.call(this, 1, x, y, "img/fighter.png", 1);
	}
	Fighter.prototype = Object.create(Enemy.prototype);

	PewPew.game = {
		level : 1,
		enemies : [],
		handleHit : function(evt) {
			evt.preventDefault();
			var touches = event.changedTouches;
			var touchId, x, y;
			for (var i = 0; i < event.changedTouches.length; i++) {
				touchId = event.changedTouches[i].identifier;
				x = event.changedTouches[i].pageX;
				y = event.changedTouches[i].pageY;
				for ( var enemy in enemies) {
					// test if the enemy is hit
					if (x >= enemy.x && x <= enemy.x + enemy.width
							&& y >= enemy.y
							&& y <= enemy.y + enemy.height) {
						enemy.receiveDamage(PewPew.player.damage());
					}
				}
			}

		}
	};

	PewPew.canvas = {
		element : document.getElementById("canvas"),
		context : PewPew.canvas.element.getContext("2d"),
	};
	PewPew.canvas.element.addEventListener("touch", PewPew.game.handleHit
			.bind(PewPew.game));
}();