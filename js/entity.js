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
		this.cost = function cost() {
			return (self.level + 1) * 100;
		};
		this.getElementId = function getElementId() {
			return "upgrade-" + self.name;
		};
		this.onBuy = function onBuy() {
			document.getElementById(self.getElementId() + "-cost").innerHTML = self
					.cost();
			document.getElementById(self.getElementId() + "-level").innerHTML = self.level;
		};
		this.getHtml = function getHtml() {
			return '<div id="' + self.getElementId() + '" class="tile">'
					+ self.name + "<br>" + 'Level: <span id="'
					+ self.getElementId() + '-level">0</span><br>'
					+ 'Cost: <span id="' + self.getElementId() + '-cost">'
					+ self.cost() + "</span>" + "</div>";
		};
		this.tryBuy = function tryBuy() {
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
		income : function income() {
			return this.upgrades.income.level + 1;
		},
		damage : function damage() {
			return this.upgrades.damage.level + 1;
		},
		changeMoney : function changeMoney(newMoney) {
			this.money = newMoney;
			document.getElementById("money").innerHTML = this.money;
		},
		addMoney : function addMoney(money) {
			return this.changeMoney(this.money + money);
		},
		substractMoney : function substractMoney(money) {
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
		this.setX = function setX(x) {
			self.x = x;
			PewPew.canvas.redraw();
		};
		this.setY = function setY(y) {
			self.y = y;
			PewPew.canvas.redraw();
		};
		this.setXY = function setXY(x, y) {
			self.x = x;
			self.y = y;
			PewPew.canvas.redraw();
		};
		this.image = image;
		this.value = value;
		/**
		 * deals damage to the enemy
		 */
		this.receiveDamage = function receiveDamage(damage) {
			self.hp -= damage;
			if (self.hp <= 0) {
				self.onDestroy();
			}
		};
		/**
		 * called when an enemy is destroyed
		 */
		this.onDestroy = function onDestroy() {
			PewPew.player.addMoney(self.value * PewPew.player.income());
			var index = PewPew.game.enemies.indexOf(self);
			if (index > -1) {
				PewPew.game.enemies.splice(index, 1);
			}
			// redraw the scene
			PewPew.canvas.redraw();
		};
		this.canvasImage = new Image();
		this.canvasImage.src = this.image;
		this.width=self.canvasImage.width;
		this.height=self.canvasImage.height;
		this.canvasImage.onload = function() {
			PewPew.canvas.context.drawImage(self.canvasImage, self.x, self.y);
			self.width = self.canvasImage.width;
			self.height = self.canvasImage.height;
		};

		PewPew.game.enemies[PewPew.game.enemies.length] = self;
	}

	function Fighter(x, y) {
		Enemy.call(this, 1, x, y, "img/fighter.png", 1);
	}
	Fighter.prototype = Object.create(Enemy.prototype);

	function Mook(x, y) {
		Enemy.call(this, 2, x, y, "img/mook.png", 2);
	}
	Mook.prototype = Object.create(Enemy.prototype);
	
	PewPew.game = {
		level : 1,
		enemies : [],
		handleHit : function handleHit(evt) {
			evt.preventDefault();
			var touches = event.changedTouches;
			var touchId, x, y;
			for (var i = 0; i < event.changedTouches.length; i++) {
				touchId = event.changedTouches[i].identifier;
				x = event.changedTouches[i].clientX-PewPew.canvas.element.getBoundingClientRect().left;
				y = event.changedTouches[i].clientY-PewPew.canvas.element.getBoundingClientRect().top;
				for ( var enemy in PewPew.game.enemies) {
					enemy = PewPew.game.enemies[enemy];
					// test if the enemy is hit
					if (x >= enemy.x && x <= enemy.x + enemy.width
							&& y >= enemy.y && y <= enemy.y + enemy.height) {
						enemy.receiveDamage(PewPew.player.damage());
					}
				}
			}

		},
		spawnEnemy : function spawnEnemy(enemy) {
			var x = Math.floor(Math.random() * (PewPew.canvas.element.width-enemy.width));
			var y = Math.floor(Math.random() * (PewPew.canvas.element.height-enemy.height));
			enemy.setXY(x, y);
		}

	};

	PewPew.canvas = {
		element : document.getElementById("canvas"),
		context : null,
		redraw : function redraw() {
			this.context.clearRect(0, 0, PewPew.canvas.element.width,
					PewPew.canvas.element.height);
			for ( var enemy in PewPew.game.enemies) {
				enemy = PewPew.game.enemies[enemy];
				PewPew.canvas.context.drawImage(enemy.canvasImage, enemy.x,
						enemy.y);
			}
		},
	};
	PewPew.canvas.context = PewPew.canvas.element.getContext("2d");
	PewPew.canvas.element.addEventListener("touchstart", PewPew.game.handleHit
			.bind(PewPew.game));
	window.setInterval(function() {
		switch(PewPew.game.level){
		case 1:
			if(Math.random()<=0.33){
				PewPew.game.spawnEnemy(new Fighter(0, 0));
			}	
			break;
		case 2:
			if(Math.random()<=0.33){
				if(Math.random()<=0.33){
					PewPew.game.spawnEnemy(new Mook(0, 0));
				}else{
					PewPew.game.spawnEnemy(new Fighter(0, 0));
				}
			}
		}
			
	}, 1000);
}();