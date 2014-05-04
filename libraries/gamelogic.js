//TODO : fix blinker for Paused mode
//TODO : Implement a ticker

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

//=============== INIT =======================================================================

	//Initialize canvas and game variables
	var canvas = document.getElementById('canvas'),
		ctx = canvas.getContext( "2d" ), //create canvas context
		W = 640; // get window's width
		H = 480, //get window's height
		score = 0, //scoreer for game's hit
		reset = false,
		color = "white",
		paused = true;
		
		
	var particles = []; //Array contaning particles
	var ball = {};
	var paddles = [2]; //Array containing paddles
	var mouse = {
			oldx: 0,
			oldy: 0,
			x : 0,
			y: 0,
			swing : false
		};
	var box = {};
	var old_time = old_time_mouse = old_swingON_time =new Date().getTime() / 1000;
	
	


	var ball = { // Ball object
			x: 50,
			y: 50,
			r: 5,
			c: "white",
			vx: 4,
			vy: 8,
			dir: "right",
			// Function to draw a ball
			draw : function() {

				ctx.beginPath();
				ctx.fillStyle = this.c;
				ctx.arc( this.x, this.y, this.r, 0, Math.PI*2, false );
				ctx.fill();
			}
			
		}; 

	//add dummy balls to the list, new balls will be added after a certain timer gets over
	var ballList = [3];
	ballList[0] = ball;
	ballList[1] = ballList[2] = undefined ;

//======================================================================================	

	canvas.focus(); //gets canvas the focus of the window

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
		
	paddles.push( new Paddle("bottom") );
	paddles.push( new Paddle("top") );

	function paintCanvas() {
		ctx.fillStyle = "black";
		ctx.fillRect(0, 0, W, H);
	}


//================== DRAW ====================================================================	

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

		for( var i = 0; i < ballList.length; i++ ) {
			if (ballList[i] != undefined) 
					ballList[i].draw();
        }

        //function to show text on screen !
        function showText(text, x, y){
            ctx.font = "15px Clean"
		    ctx.fillText( text, x,y );
   

        }

		//show score		
        showText( "Score = "+score, W-100, H-20 );
		
		//if game is in reset mode
		var timeFlag = false;
		if (reset == true) {
			var new_time = new Date().getTime() / 1000;
			if (new_time - old_time >= 0.3){
				old_time = new_time;
				timeFlag = true;
				
			}
			// (no-longer ) anonymous function to display message and reset the game !
			function blink(text){
				
				ctx.fillStyle = color;
				ctx.fillRect(W/2-25, H/2, 120, 30);
				if (timeFlag == true){
					color = color == "white" ? "black" : "white";
				}
				
				ctx.fillStyle = color == "white" ? "black" : "white";
				showText( text, W/2-20,H/2+20 );
				
			
			}
			blink("SAMAAPT!");
		}

		//if game is in paused mode
		if( paused == true ){
			blink("Press P to play ! ");
		}
		
		//update the positions
		update();
	}
	

//======================================================================================	

	//start the animation loop
	function animLoop() {
		requestAnimFrame(animLoop);
		draw();
	
	}
	
	animLoop();
	
	
//=========== UPDATE ===========================================================================	

	function update(){
		if (reset == true || paused == true) {			
			return;
		}
		
		//Move the ball
		for( var i = 0; i < ballList.length; i++ ) {
			if (ballList[i] != undefined) 
					ballList[i].x += ballList[i].vx, ballList[i].y += ballList[i].vy;
        }
		
		//move the paddles
		if( mouse.x && mouse.y ) {
			for( var i = 1; i < paddles.length; i++ ) {
				p = paddles[i];
				p.x = mouse.x - p.w/2;

			}	
		}
		

		for( var i = 0; i < ballList.length; i++ ) {
			if (ballList[i] != undefined){
				if( isColliding(ballList[i]) ){ //collision with wall
					collidingAction(ballList[i]);
				}
				else if( isColliding(ballList[i], paddles[1])  || isColliding(ballList[i], paddles[2])){ //collision with either paddle
						
						if ( paddleHit == 1 ){
							collidingAction(ballList[i], paddles[1]);
							}
						else {
								collidingAction(ballList[i], paddles[2]);
							}
					}
				else{
					if ( ballList[i].y > H || ballList[i].y < 0 ){ //if ball goes out of the bound
						resetgame();
						}
					}//ending else
			}//ending undefined if 
					
        }//ending for


		//SWING
		//storing old mouse values after an interval
		var new_time_mouse = new Date().getTime() / 1000;
		if (new_time_mouse - old_time_mouse >= 0.1){
			old_time_mouse = new_time_mouse;	
			mouse.oldx = mouse.x;
			
			}

		if ( mouse.x - mouse.oldx  > 100){
			mouse.swing = true;
			}		

        //disable swing mode in case it is not disabled by collidingAction
        if(mouse.swing){
            var new_swingON_time = new Date().getTime() / 1000;
            if (new_swingON_time - old_swingON_time > 0.5 ){ //disable after 2 seconds
                mouse.swing = false;
                old_swingON_time = new_swingON_time;                
                }
            }
		
	}

//======================================================================================	
	
	//add mouse movement listener
	canvas.addEventListener( "mousemove", trackPosition, true );
	canvas.addEventListener( "mousedown", trackClick, false );
	canvas.addEventListener( "keydown", pauseFlag, false );

	
	function trackPosition(e) {
		
		mouse.x = e.pageX;
		mouse.y = e.pageY;

		
	}
	
	function trackClick(e){ //restart the game and reset the score
		score = reset == true ? 0 : score
		reset = false;		
	}

	function pauseFlag(e){ // toggle paused time
		if ( e.keyCode == 80 ) //check for button p
			{
				paused = paused == true ? false : true ;
			}
			printDebug();
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
			  ball.dir = ball.dir == "left" ? "right" : "left";
			}
		else {
			ball.vy = -ball.vy;
			if ( paddleHit == 1 ){
				//ball.y = object.y - object.h;
			}
			else {
				//ball.y = object.y;
			}		
			score++;
			//performing the swing action
			if ( mouse.swing == true ){
				ball.vx = -ball.vx;
				ball.dir = ball.dir == "left" ? "right" : "left";
				mouse.swing = false;
			}
		}
			
		
	}
	
	
	function resetgame(){
		ball.x = W/2, ball.y = H/2, ball.vy = -ball.vy;
		reset = true;
		
	}

	function printDebug(){
		console.log( "================================================" )
		for( var i = 0; i < ballList.length; i++ ) {
			if (ballList[i] != undefined){
				console.log("Ball : "+ i + " X-> " + ballList[i].x + " Y-> " + ballList[i].y + " Dir-> " + ballList[i].dir );
			}
		}

		for( var i = 1; i < paddles.length; i++ ) {
				console.log("Paddle : "+ i + " X-> " + paddles[i].x + " Y-> " + paddles[i].y);
		}

	}
	

} // end of init()