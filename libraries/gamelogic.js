

init = function () {


	window.requestAnimFrame = (function(){
		return  window.requestAnimationFrame       || 
			window.webkitRequestAnimationFrame || 
			window.mozRequestAnimationFrame    || 
			window.oRequestAnimationFrame      || 
			window.msRequestAnimationFrame     ||  
			function( callback ){
				return window.setTimeout(callback, 1000 / 60);
			};
	})();

	

	//Initialize canvas and game variables
	var canvas = document.getElementById('canvas'),
		ctx = canvas.getContext( "2d" ), //create canvas context
		W = 640; // get window's width
		H = 480, //get window's height
		count = 0, //counter for game's hit
		reset = false,
		color = "white";
		
		
	var particles = []; //Array contaning particles
	var ball = {};
	var paddles = [2]; //Array containing paddles
	var mouse = {};
	var box = {};
	var old_time = new Date().getTime() / 1000;
	
	
	

	var ball = { // Ball object
			x: 50,
			y: 50,
			r: 5,
			c: "white",
			vx: 4,
			vy: 8,
			
			// Function to draw a ball
			draw : function() {

				ctx.beginPath();
				ctx.fillStyle = this.c;
				ctx.arc( this.x, this.y, this.r, 0, Math.PI*2, false );
				ctx.fill();
			}
			
		}; 


	//Function for creating paddle operations
	function Paddle(pos) { 
		//Height and width
		this.h = 10;
		this.w = 150;
		
		//Paddle's position
		this.x = W/2 - this.w/2
		this.y = (pos == "top") ? 0 : H - this.h;	
	}
	
	//collision box
	function getCollisionBox (parent) {
		if (parent.y == 0 ){
			paddleHit = 1;
		}
		else {
			paddleHit = 2;
		}
		box = {
		x1 : parent.x  ,
		x2 : parent.x + parent.w,
		y1 : parent.y ,
		y2 : parent.y + parent.h
		
		};
		
		return box;
	}
		
	paddles.push ( new Paddle("bottom") );
	paddles.push( new Paddle("top") );

	function paintCanvas() {
		ctx.fillStyle = "black";
		ctx.fillRect(0, 0, W, H);
	}


	//draw everything
	function draw() {
		paintCanvas();
		for( var i = 0; i < paddles.length; i++ ) {
			p = paddles[i];
			ctx.fillStyle = "white";
			ctx.fillRect(p.x, p.y, p.w, p.h);
			
			//collision box draw -- only for debugging
			/*
			box = getCollisionBox(p);
			ctx.fillStyle = "yellow";
			ctx.fillRect(box.x1, box.y1, box.x2-box.x1, box.y2-box.y1);
			*/

		}
		ball.draw();
		//show score
		ctx.font = "15px Clean"
		ctx.fillText( "Score = "+count, W-100,H-20 );
		
		var timeFlag = false;
		if (reset == true) {
			var new_time = new Date().getTime() / 1000;
			if (new_time - old_time >= 0.3){
				old_time = new_time;
				timeFlag = true;
				
			}
			//anonymous function to display message and reset the game !
			(function(){
				
				ctx.fillStyle = color;
				ctx.fillRect(W/2-5, H/2, 90, 30);
				if (timeFlag == true){
					color = color == "white" ? "black" : "white";
				}
				
				ctx.fillStyle = color == "white" ? "black" : "white";
				ctx.font = "15px Clean"
				ctx.fillText( "SAMAAPT!", W/2,H/2+20 );
				
			
			})();
		}
		
	
		update();
	}
	
	//start the animation loop
	function animLoop() {
		requestAnimFrame(animLoop);
		draw();
	
	}
	
	animLoop();
	
	
	function update(){
		console.log(count);
		if (reset == true) {			
			return;
		}
		
		//Move the ball
		ball.x += ball.vx, ball.y += ball.vy;
		
		//move the paddles
		if( mouse.x && mouse.y ) {
			for( var i = 1; i < paddles.length; i++ ) {
				p = paddles[i];
				p.x = mouse.x - p.w/2;

			}	
		}
		
		if( isColliding(ball) ){ //collision with wall
			collidingAction(ball);
		}
		else if( isColliding(ball, paddles[1])  || isColliding(ball, paddles[2])){ //collision with either paddle
				
				if ( paddleHit == 1 ){
					collidingAction(ball, paddles[1]);
					}
				else {
						collidingAction(ball, paddles[2]);
					}
			}
		else{
			if ( ball.y > H || ball.y < 0 ){ //if ball goes out of the bound
				resetgame();
			}

			}		
		
	}
	
	//add mouse movement listener
	canvas.addEventListener( "mousemove", trackPosition, true );
	canvas.addEventListener( "mousedown", trackClick, false );
	
	function trackPosition(e) {
		mouse.x = e.pageX;
		mouse.y = e.pageY;
	}
	
	function trackClick(e){
			count = reset == true ? 0 : count
			reset = false;
			
		
	}
	
	//collision check
	function isColliding(ball, object){
		if ( object == undefined ){
			//collision with the walls
			if ( ball.x < 0 || ball.x > W )
			{
			  return true;
			}
			
			return false;
		}
		//collision with either of the paddles
		box = getCollisionBox(object);
		if ( ball.x >= box.x1 && ball.x < box.x2 &&
			 ball.y >= box.y1 && ball.y < box.y2){
				return true;
			}
			 
		return false;
	}
	
	
	function collidingAction(ball, object){
		if ( object == undefined ) //object is wall
			{	
			  ball.vx = -ball.vx;
			}
		else {
			ball.vy = -ball.vy;
			if ( paddleHit == 1 ){
				//ball.y = object.y - object.h;
			}
			else {
				//ball.y = object.y;
			}		
			count++;
		}
			
		
	}
	
	
	function resetgame(){
		ball.x = W/2, ball.y = H/2, ball.vy = -ball.vy;
		reset = true;
		
	}
	

} // end of init()
