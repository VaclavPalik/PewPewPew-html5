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
		/**
		 * The current upgrade's cost
		 */
		this.cost = function cost() {
			return (self.level + 1) * 100;
		};
		/**
		 * The upgrade's element id, used to change info on upgrade tab
		 */
		this.getElementId = function getElementId() {
			return "upgrade-" + self.name;
		};
		/**
		 * Fired when this upgrade is bought
		 */
		this.onBuy = function onBuy() {
			document.getElementById(self.getElementId() + "-cost").innerHTML = self
					.cost();
			document.getElementById(self.getElementId() + "-level").innerHTML = self.level;
		};
		/**
		 * generates this upgrade's HTML for upgrade tab
		 */
		this.getHtml = function getHtml() {
			return '<div id="' + self.getElementId() + '" class="tile">'
					+ self.name + "<br>" + 'Level: <span id="'
					+ self.getElementId() + '-level">0</span><br>'
					+ 'Cost: <span id="' + self.getElementId() + '-cost">'
					+ self.cost() + "</span>" + "</div>";
		};
		/**
		 * Tries to buy this upgrade, buys the upgrade for player if he has enough money
		 */
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
		money : 0,
		upgrades : {
			damage : new Upgrade("damage", 10),
			income : new Upgrade("income", 10)
		},
		/**
		 * The player's current income bonus
		 * @returns {Number}
		 */
		income : function income() {
			return this.upgrades.income.level;
		},
		/**
		 * The player's current damage from hit
		 * @returns {Number}
		 */
		damage : function damage() {
			return this.upgrades.damage.level + 1;
		},
		/**
		 * changes the player's money
		 * @param newMoney the new amount to set
		 */
		changeMoney : function changeMoney(newMoney) {
			this.money = newMoney;
			document.getElementById("money").innerHTML = this.money;
		},
		/**
		 * Adds money to player
		 * @param money the amount to be given
		 */
		addMoney : function addMoney(money) {
			this.changeMoney(this.money + money);
		},
		/**
		 * Removes money from player
		 * @param money the amount to be removed
		 */
		substractMoney : function substractMoney(money) {
			this.addMoney(-money);
		},
		score : 0,
		/**
		 * Adds score to player
		 * @param toAdd the amount
		 */
		addScore : function addScore(toAdd){
			this.score+=toAdd;
			//check the advance to the next level
			if(PewPew.game.levels[PewPew.game.level]<=this.score)
				PewPew.game.level++;
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
		 * @param damage
		 */
		this.receiveDamage = function receiveDamage(damage) {
			self.hp -= damage;
			if (self.hp <= 0) {
				self.onDestroy();
			}
		};
		/**
		 * called when an enemy is destroyed, adds score and money to player and removes the enemy from game
		 */
		this.onDestroy = function onDestroy() {
			PewPew.player.addMoney(self.value + PewPew.player.income());
			PewPew.player.addScore(self.value);
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

	//The enemy templates
	function Fighter(x, y) {
		Enemy.call(this, 1, x, y, "img/fighter.png", 1);
	}
	Fighter.prototype = Object.create(Enemy.prototype);

	function Mook(x, y) {
		Enemy.call(this, 2, x, y, "img/mook.png", 2);
	}
	Mook.prototype = Object.create(Enemy.prototype);
	
	function Bomber(x, y) {
		Enemy.call(this, 5, x, y, "img/bomber.png", 5);
	}
	Bomber.prototype = Object.create(Enemy.prototype);
	
	PewPew.game = {
		level : 1,
		levels : [0,50,200,500,2500,10000,50000,200000,1000000],
		enemies : [],
		/**
		 * handles the hitting the enemies
		 * @param evt the touch event into game area
		 */
		handleHit : function handleHit(evt) {
			evt.preventDefault();
			var touches = evt.changedTouches;
			var touchId, x, y;
			for (var i = 0; i < evt.changedTouches.length; i++) {
				touchId = evt.changedTouches[i].identifier;
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
		/**
		 * Spawns an enemy into game and moves him into random place ingame
		 * @param enemy
		 */
		spawnEnemy : function spawnEnemy(enemy) {
			var x = Math.floor(Math.random() * (PewPew.canvas.element.width-enemy.width));
			var y = Math.floor(Math.random() * (PewPew.canvas.element.height-enemy.height));
			enemy.setXY(x, y);
		}

	};
	/**
	 * The game canvas holder where the enemies are spawned
	 */
	PewPew.canvas = {
		element : document.getElementById("canvas"),
		context : null,
		/**
		 * redraws all the enemies alive in game
		 */
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
	
	//The enemy spawning loop
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
			break;
		case 3:
			if(Math.random()<=0.66){
				if(Math.random()<=0.66){
					PewPew.game.spawnEnemy(new Mook(0, 0));
				}else{
					PewPew.game.spawnEnemy(new Fighter(0, 0));
				}
			}
			break;
		
		case 4:
		default:
			if(Math.random()<=0.1){
				PewPew.game.spawnEnemy(new Bomber(0, 0));
				PewPew.game.spawnEnemy(new Fighter(0, 0));
			}else if(Math.random()<=0.66){
				PewPew.game.spawnEnemy(new Mook(0, 0));
			}else{
				PewPew.game.spawnEnemy(new Fighter(0, 0));
			}
			break;
		}
	}, 1000);
}();