/* jshint devel: true */
!function() {
	'use strict';

	/**
	 * Upgrade class
	 */
	function Upgrade(name, maxLevel) {
		this.name = name;
		this.maxLevel = maxLevel;
		this.level = 0;
		this.cost = function() {
			return (this.level + 1) * 100;
		};
		this.getElementId = function (){
			return "upgrade-"+"name";
		};
	}

	/**
	 * player singleton
	 */
	player = {
		money : 0,
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
		changeMoney : function(newMoney){
			this.money=newMoney;
		},
		addMoney : function(money) {
			return this.changeMoney(this.money+money);
		},
		substractMoney : function(money){
			return this.addMoney(-money);
		} 
	};

	/**
	 * Enemy class
	 */
	function Enemy(hp, x, y, image, value) {
		this.hp = hp;
		this.x = x;
		this.y = y;
		this.setX = function(x) {
			this.x = x;
		};
		this.setY = function(y) {
			this.y = y;
		};
		this.image = image;
		this.value = value;
		/**
		 * deals damage to the enemy
		 */
		this.recieveDamage = function(damage) {
			this.hp -= damage;
			if (this.hp <= 0) {
				this.onDestroy();
			}
		};
		/**
		 * called when an enemy is destroyed
		 */
		this.onDestroy = function() {
			player.addMoney(this.value * player.income());
			var index = game.enemies.indexOf(this);
			if(index>-1){
				game.enemies.splice(index, 1);
			}
		};
		game.enemies[game.enemies.length]=this;
	}

	game = {
		level : 1,
		enemies : []
	};
}();