var start = true;

//sounds
var background = new Audio('sounds/background.mp3');
background.loop = true;
var click = new Audio('sounds/click.wav');
var game_over = new Audio('sounds/loss.mp3');
var bullet = new Audio('sounds/bullet.mp3');
var blast = new Audio('sounds/blast.mp3');
var destroy = new Audio('sounds/destroy.mp3');
var bulStop = false;

const Game = {

	init: function(me,ml){
		this.c = document.getElementById("game");
		this.c.width = this.c.width;
		this.c.height = this.c.height;
		this.ctx = this.c.getContext("2d");
		this.color = this.ctx.createRadialGradient(480, 270, 10, 460, 320, 540);
		this.color.addColorStop(0,"#1B2735");
		this.color.addColorStop(1,"black");
		this.bullets = [];
		this.enemyBullets = [];
		this.enemies = [];
		this.particles = [];
		this.bulletIndex = 0;
		this.enemyBulletIndex = 0;
		this.enemyIndex = 0;
		this.particleIndex = 0;
		this.maxParticles = 25;
		this.maxEnemies = me;
		this.enemiesAlive = 0;
		this.currentFrame = 0;
		this.maxLives = ml;
		this.life = 0;
		this.bindings();
		this.player = new Player();
		this.score = 0;
		this.paused = false;
		this.shooting = false;
		this.isGameOver = false;
    this.requestAnimationFrame = window.requestAnimationFrame;
		for(var i = 0; i<this.maxEnemies; i++){ //spawn initial enemies
			new Enemy();
			this.enemiesAlive++;
		}
		this.invincibleMode(2000); //player blinking at start (no damage will be taken)
		this.loop();
	},

	bindings: function(){
		window.addEventListener("keydown", this.buttonDown);
		window.addEventListener("keyup", this.buttonUp);
		this.c.addEventListener("click", this.clicked);
	},

	clicked: function(){
		if(!Game.paused) {
			Game.pause();
			cdl.style.display = "inline";
			background.muted = true;
		} else {
			if(Game.isGameOver){

				//restart background sound
				bulStop = false;
				background.currentTime = 0;
				background.play();

				cdl.style.display = "none";
				Game.init(me,ml);
			} else {
				Game.unPause();
				background.muted = false;
				cdl.style.display = "none";
				Game.loop();
				Game.invincibleMode(1000);
			}
		}
	},

	buttonUp: function(e){
		if(e.keyCode === 32){
			Game.shooting = false;
		}
		if(e.keyCode === 37 || e.keyCode === 65){
			Game.player.movingLeft = false;
		}
		if(e.keyCode === 39 || e.keyCode === 68){
			Game.player.movingRight = false;
		}
	},

	buttonDown: function(e){
		if(e.keyCode === 32){
			if(e.keyCode === 32){
				if(!Game.player.invincible){
					Game.player.shoot();
					Game.shooting = true;
				}
				if(Game.isGameOver){
					cdl.style.display = "none";

					//restart background and bullet sound
					bulStop = false;
					background.currentTime = 0;
					background.play();

					Game.init(me,ml);
				}
			}
		}
		if(e.keyCode === 37 || e.keyCode === 65){
			Game.player.movingLeft = true;
		}
		if(e.keyCode === 39 || e.keyCode === 68){
			Game.player.movingRight = true;
		}
	},

	random: function(min, max){
    return Math.floor(Math.random() * (max - min) + min);
  },

  invincibleMode: function(s){
  	this.player.invincible = true;
  	setTimeout(function(){
  		Game.player.invincible = false;
  	}, s);
  },

  collision: function(a, b){
		return !(
	    ((a.y + a.height) < (b.y)) ||
	    (a.y > (b.y + b.height)) ||
	    ((a.x + a.width) < b.x) ||
	    (a.x > (b.x + b.width))
		)
	},

  clear: function(){
  	this.ctx.fillStyle = Game.color;
  	this.ctx.fillRect(0, 0, this.c.width, this.c.height);
  },

  pause: function(){
		this.paused = true;
  },

  unPause: function(){
		this.paused = false;
  },

  gameOver: function(){
		start = false;
		bulStop = true;
		background.pause();
		game_over.play();
  	this.isGameOver = true;
  	this.clear();
  	var message = "GAME OVER!";
  	var message2 = "Points: " + Game.score;
  	var message3 = "Click on the Play Area or press Spacebar to Play Again";
  	this.pause();

		var cdl = document.getElementById("diffLvl");
		cdl.style.display = "inline";

		this.ctx.fillStyle = "white";
	  this.ctx.font = "bold 30px Prompt, sans-serif";
	  this.ctx.fillText(message, this.c.width/2 - this.ctx.measureText(message).width/2, this.c.height/2 - 50);
	  this.ctx.fillText(message2, this.c.width/2 - this.ctx.measureText(message2).width/2, this.c.height/2 - 5);
	  this.ctx.font = "bold 16px Prompt, sans-serif";
	  this.ctx.fillText(message3, this.c.width/2 - this.ctx.measureText(message3).width/2, this.c.height/2 + 30);
  },

  updateScore: function(){
  	this.ctx.fillStyle = "white";
  	this.ctx.font = "16px Prompt, sans-serif";
  	this.ctx.fillText("Points: " + this.score, 8, 20);
  	this.ctx.fillText("Lives: " + (this.maxLives - this.life), 8, 40);
  },

	loop: function(){
		if(!Game.paused){
			Game.clear();
			for(var i in Game.enemies){
				var currentEnemy = Game.enemies[i];
				currentEnemy.draw();
				currentEnemy.update();
				if(Game.currentFrame % currentEnemy.shootingSpeed === 0){
					currentEnemy.shoot();
				}
			}
			for(var x in Game.enemyBullets){
				Game.enemyBullets[x].draw();
				Game.enemyBullets[x].update();
			}
			for(var z in Game.bullets){
				Game.bullets[z].draw();
				Game.bullets[z].update();
			}
			if(Game.player.invincible){
				if(Game.currentFrame % 10 === 0){
					Game.player.draw();
				}
			} else {
				Game.player.draw();
			}

	    for(var i in Game.particles){
	      Game.particles[i].draw();
	    }
			Game.player.update();
			Game.updateScore();
			Game.currentFrame = Game.requestAnimationFrame.call(window, Game.loop);
		}
	}
};

var Player = function(){
	this.width = 60;
	this.height = 20;
	this.x = Game.c.width/2 - this.width/2; //initial x coordinate of player
	this.y = Game.c.height - this.height; //initial y coordinate of player
	this.movingLeft = false;
	this.movingRight = false;
	this.speed = 8;
	this.invincible = false;
	this.color = "white";

	this.die = function(){
		if(Game.life < Game.maxLives){
			destroy.play();
			Game.invincibleMode(2000);
	 		Game.life++;
		} else {
			Game.pause();
			Game.gameOver();
		}
	};

	this.draw = function(){
		Game.ctx.fillStyle = this.color;
		Game.ctx.fillRect(this.x, this.y, this.width, this.height);
	};

	this.update = function(){
		if(this.movingLeft && this.x > 0){
			this.x -= this.speed;
		}
		if(this.movingRight && this.x + this.width < Game.c.width){
			this.x += this.speed;
		}
		if(Game.shooting && Game.currentFrame % 10 === 0){
			this.shoot();
		}
		for(var i in Game.enemyBullets){
			var currentBullet = Game.enemyBullets[i];
			if(Game.collision(currentBullet, this) && !Game.player.invincible){
				this.die();
				delete Game.enemyBullets[i];
			}
		}
	};

	this.shoot = function(){
		if(bulStop === false){
			bullet.play();
		}
		Game.bullets[Game.bulletIndex] = new Bullet(this.x + this.width/2);
		Game.bulletIndex++;
	};

};

//Player bullet
var Bullet = function(x){
	this.width = 8;
	this.height = 20;
	this.x = x;
	this.y = Game.c.height - 10;
	this.vy = 8;
	this.index = Game.bulletIndex;
	this.active = true;
	this.color = "white";

	this.draw = function(){
		Game.ctx.fillStyle = this.color;
		Game.ctx.fillRect(this.x, this.y, this.width, this.height);
	};

	this.update = function(){
		this.y -= this.vy;
		if(this.y < 0){
			delete Game.bullets[this.index];
		}
	};

};

//Enemy movement and bullet travel
v = .1;
var Enemy = function(){
	this.width = 60;
	this.height = 20;
	this.x = Game.random(0, (Game.c.width - this.width));
	this.y = Game.random(10, 40);
	this.vy = Game.random(1, 3) * v;
	this.index = Game.enemyIndex;
	Game.enemies[Game.enemyIndex] = this;
	Game.enemyIndex++;
	this.speed = Game.random(2, 3);
	this.shootingSpeed = Game.random(30, 80);
	this.movingLeft = Math.random() < 0.5 ? true : false;
	this.color = "hsl("+ Game.random(0, 360) +", 60%, 50%)";

	this.draw = function(){
		Game.ctx.fillStyle = this.color;
		Game.ctx.fillRect(this.x, this.y, this.width, this.height);
	};

	this.update = function(){
		if(this.movingLeft){
			if(this.x > 0){
				this.x -= this.speed;
				this.y += this.vy;
			} else {
				this.movingLeft = false;
			}
		} else {
			if(this.x + this.width < Game.c.width){
				this.x += this.speed;
				this.y += this.vy;
			} else {
				this.movingLeft = true;
			}
		}

		for(var i in Game.bullets){
			var currentBullet = Game.bullets[i];
			if(Game.collision(currentBullet, this)){
				this.die();
				delete Game.bullets[i];
			}
		}
	};

	this.die = function(){
	  this.explode();
		blast.play();
	  delete Game.enemies[this.index];
	  Game.score += 15;
	  Game.enemiesAlive = Game.enemiesAlive > 1 ? Game.enemiesAlive - 1 : 0;
	  if(Game.enemiesAlive < Game.maxEnemies){
	  	Game.enemiesAlive++;
	  	setTimeout(function(){
	  		new Enemy();
		  }, 2000); //Enemy respawn time
		}
	};

	this.explode = function(){
		for(var i=0; i<Game.maxParticles; i++){
	    new Particle(this.x + this.width/2, this.y, this.color);
	  }
	};

	this.shoot = function(){
		new EnemyBullet(this.x + this.width/2, this.y, this.color);
	};

};

var EnemyBullet = function(x, y, color){
	this.width = 8;
	this.height = 20;
	this.x = x;
	this.y = y;
	this.vy = 6;
	this.color = color;
	this.index = Game.enemyBulletIndex;
	Game.enemyBullets[Game.enemyBulletIndex] = this;
	Game.enemyBulletIndex++;

	this.draw = function(){
		Game.ctx.fillStyle = this.color;
		Game.ctx.fillRect(this.x, this.y, this.width, this.height);
	};

	this.update = function(){
		this.y += this.vy;
		if(this.y > Game.c.height){
			delete Game.enemyBullets[this.index];
		}
	};

};

//Enemies falling after being destroyed
var Particle = function(x, y, color){
    this.x = x;
    this.y = y;
    this.vx = Game.random(-5, 5);
    this.vy = Game.random(-5, 5);
    this.color = color || "orange";
    Game.particles[Game.particleIndex] = this;
    this.id = Game.particleIndex;
    Game.particleIndex++;
    this.life = 0;
    this.gravity = .05;
    this.size = 8;
    this.maxlife = 100;

		this.draw = function(){
	    this.x += this.vx;
	    this.y += this.vy;
	    this.vy += this.gravity;
	    this.size *= .9;
	    Game.ctx.fillStyle = this.color;
	    Game.ctx.fillRect(this.x, this.y, this.size, this.size);
	    this.life++;
	    if(this.life >= this.maxlife){
	      delete Game.particles[this.id];
	    }
	  };

  }

  //Choose level after clicking play
  document.getElementById("play").addEventListener("click", myFunction);
	var ins1 = document.getElementById("instructions1");
	var desc = document.getElementById("desc");
	var lvlDesc = document.getElementById("lvlDesc");
	var toggle = document.getElementById("toggle");
  function myFunction() {
		toggle.style.display = "inline-block";
		lvlDesc.style.display = "block";
		desc.style.display = "none";
		ins1.style.display = "none";
		click.play();
		background.play();
  	var b = document.getElementById("play");
		var lvls = document.getElementsByClassName("lvl");
		if(b.style.display === "none"){
			b.style.display = "block";
		}else{
			b.style.display = "none";
			lvls[0].style.display = "inline";
			lvls[1].style.display = "inline";
			lvls[2].style.display = "inline";
		}
	}
	//Play game after choosing level
	var b1 = document.getElementById("easy");
	b1.addEventListener("click", playLvlE);
	var b2 = document.getElementById("normal")
	b2.addEventListener("click", playLvlN);
	var b3 = document.getElementById("hard")
	b3.addEventListener("click", playLvlH);

	//Max enemies and lives initial value
	var me = 5;
	var ml = 5;

	//Canvas
	var canvas = document.getElementById("game");

	var ins2 = document.getElementById("instructions2");

	// Easy level
	function playLvlE(){
			click.play();

			bulStop = false;

			if(start === false){
				background.currentTime = 0;
				background.play();
			}

			canvas.style.display = "block";
			b1.style.display = "none";
			b2.style.display = "none";
			b3.style.display = "none";
			me = 5;
			ml = 5;
			v = .1;

			lvlDesc.style.display = "none";
			ins2.style.display = "block";

			Game.init(me,ml);
	}

	// Normal level
	function playLvlN(){
			click.play();

			bulStop = false;

			if(start === false){
				background.currentTime = 0;
				background.play();
			}

			canvas.style.display = "block";
			b1.style.display = "none";
			b2.style.display = "none";
			b3.style.display = "none";
			me = 7;
			ml = 3;
			v = .15;

			lvlDesc.style.display = "none";
			ins2.style.display = "block";

			Game.init(me,ml);
	}

	// Hard level
	function playLvlH(){
			click.play();

			bulStop = false;

			if(start === false){
				background.currentTime = 0;
				background.play();
			}

			canvas.style.display = "block";
			b1.style.display = "none";
			b2.style.display = "none";
			b3.style.display = "none";
			me = 10;
			ml = 1;
			v = .3;

			lvlDesc.style.display = "none";
			ins2.style.display = "block";

			Game.init(me,ml);
	}

	// Choose Different Level Button
	var cdl = document.getElementById("diffLvl");
	cdl.addEventListener("click", playDiffLvl);

	function playDiffLvl(){
		click.play();
		cdl.style.display = "none";
		b1.style.display = "inline";
		b2.style.display = "inline";
		b3.style.display = "inline";
	}

	var speaker = document.getElementById("speaker");
	toggle.addEventListener("click",toggleSound);

	var mute = false;
	function toggleSound(){
		if(mute===false){
			speaker.src = "images/off.png";
			background.muted = true;
			mute = true;
		}
		else{
			speaker.src = "images/on.png";
			background.muted = false;
			mute = false;
		}
	}
