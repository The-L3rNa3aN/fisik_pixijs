/*This is the place where all the execution happens.*/
/*BUGS:
    1. The highermost tile (practically the first collidable tile) features collision even when the player is away from its hor. range, having it float. Jumping will reverse the bug.
    2. Jumping is different on different systems.
    3. On start, the player falls and clips through some tiles.
*/

import { Collide, Trigger, IsColliding, IsColliding_Gravity } from './collision.js';
import { Collectible } from './collectible.js';
import { Map_01 } from './level.js';

var app = new PIXI.Application                                                          //Create our application instance
({
    width: 900, //width: window.innerWidth - 20,
    height: 900, //height: window.innerHeight - 20,
    backgroundColor: 0x2c3e50
});
document.body.appendChild(app.view);

// Load textures.
app.loader.add('bunny', 'https://pixijs.io/examples/examples/assets/bunny.png')
app.loader.add('button', './Textures/tile_white.png')
app.loader.add('obstacle', './Textures/tile_green.png')
app.loader.add('collectible', './Textures/tile_orange.png')
app.loader.add('dirt', './Textures/tile_brown.png')
    .load(startup);

//Player stuff.
var isGrounded = false;                                                                 //Boolean to check if the player is touching the ground.

function startup()
{
    var playerScore = 0;                                                                //Player score.
    var gConstant = 10;                                                                //Acceleration due to gravity.
    var vel = 0;                                                                        //Player body's velocity.
    var accel = 0;                                                                      //Player body's acceleration.
    var jumpHeight = 2;                                                                 //Jump height. What else?

    var upClicked = false;
    var downClicked = false;
    var leftClicked = false;
    var rightClicked = false;

    document.addEventListener('keydown', OnKeyDown);
    document.addEventListener('keyup', OnKeyUp);

    //Keyboard input.
    function OnKeyDown(keyPress)
    {
        let k = keyPress.key;

        if(k === 'a' || k === 'A') leftClicked = true;
        if(k === 'd' || k === 'D') rightClicked = true;
        if(k === 'w' || k === 'W') upClicked = true;
        if(k === 's' || k === 'S') downClicked = true;
    }

    function OnKeyUp(keyPress)
    {
        let k = keyPress.key;
        
        if(k === 'a' || k === 'A') leftClicked = false;
        if(k === 'd' || k === 'D') rightClicked = false;
        if(k === 'w' || k === 'W') upClicked = false;
        if(k === 's' || k === 'S') downClicked = false;
    }

    //Assign gameobjects here.
    var bunny = new PIXI.Sprite(app.loader.resources.bunny.texture);
    var testCollectible = undefined;
    var obstacle = undefined;
    var dirt = undefined;

    //Loading the level.
    var level = Map_01();
    var obstacleArray = new Array();
    var tileX = 0; var tileY = 0;
    for(var i = 0; i < level.length; i++)
    {
        if(i >= 18 && i % 18 == 0) { tileX = 0; tileY += 50; }

        switch(level[i])
        {
            case 1:
                obstacle = new PIXI.Sprite(app.loader.resources.obstacle.texture);
                obstacle.x = tileX + 25; obstacle.y = tileY + 25;
                obstacle.height = 50; obstacle.width = 50;
                obstacle.anchor.set(0.5);
                app.stage.addChild(obstacle);
                obstacleArray.push(obstacle);
                break;

            case 2:
                testCollectible = new PIXI.Sprite(app.loader.resources.collectible.texture);
                testCollectible.x = tileX + 25; testCollectible.y = tileY + 25;
                testCollectible.width = 25; testCollectible.height = 25;
                testCollectible.anchor.set(0.5);
                app.stage.addChild(testCollectible);
                break;

            case 3:
                dirt = new PIXI.Sprite(app.loader.resources.dirt.texture);
                dirt.x = tileX + 25; dirt.y = tileY + 25;
                dirt.width = 50; dirt.height = 50;
                dirt.anchor.set(0.5);
                app.stage.addChild(dirt);
                break;

            default:
                break;
        }

        tileX += 50;
    }

    bunny.anchor.set(0.5);                                                              //Center anchor points.
    bunny.x = app.renderer.width / 2;                                                   // Move the sprite to the center of the screen
    bunny.y = app.renderer.height / 2;
    
    //Staged items have their sprite orders assigned in ascending order.
    app.stage.addChild(bunny);
    
    app.ticker.add(function(delta)                                                  //Listen for animate update
    {
        //Is the player touching the ground?
        //isGrounded = IsColliding(bunny, obstacle);
        
        //Collectibles here.
        //Collectible(bunny, testCollectible, playerScore);

        //Gravity if the player isn't touching the ground.
        if(!isGrounded)
        {
            vel = gConstant * delta / 10;
            accel += vel * delta / 10;
            bunny.y += accel;
        }
        else
        {
            vel = 0.1;
            accel = 0;
        }

        //Movement code based on button presses.
        if(upClicked)                   //Jump.
        {
            if(isGrounded)
            {
                vel -= Math.sqrt(jumpHeight * gConstant) * delta;                   //Based on Bjorn's jump equation: v = SQRT(jumpHeight * -2 * gravity).
                accel = vel / delta;                                                //Acceleration (Impulsive Force) = Velocity / Time.
                bunny.y += accel;                                                   //I dunno how I got this working, and my brain isn't in the mood to find out (JK. Adding up the minuses here.).
                isGrounded = false;
            }
            //bunny.y -= 2;
        }

        //if(downClicked) bunny.y += 2 * delta;
        if(leftClicked) bunny.x -= 2 * delta;
        if(rightClicked) bunny.x += 2 * delta;

        //The player should collide with these. ALWAYS CALL ANY COLLISION-RELATED FUNCTIONS AFTER THE GRAVITY-RELATED CODE.
        for(var i = 0; i < obstacleArray?.length; i++)
        {
            testCollide(bunny, obstacleArray[i]);
        }

        //console.log(accel);
    });
}

function testCollide(p, o)
{
    if(p.x + p.width / 2 > o.x - o.width / 2)     //"o" collision on the left.
    {
        if(p.x < o.x && p.y > o.y - o.height / 2 && p.y < o.y + o.height / 2)   //If "p"'s X pos is lesser than "o"'s and if "p" is within "o"'s Y-range.
        {
            p.x = o.x - o.width / 2 - p.width / 2; return;
        }
    }

    if(p.x - p.width / 2 < o.x + o.width / 2)     //"o" collision on the right.
    {
        if(p.x > o.x && p.y > o.y - o.height / 2 && p.y < o.y + o.height / 2)   //Ditto except if "p"'s X pos is greater than "o"'s.
        {
            p.x = o.x + o.width / 2 + p.width / 2; return;
        }
    }

    if(p.y + p.height / 2 > o.y - o.height / 2)   //"o" collision above.
    {
        if(p.y < o.y && p.x > o.x - o.width / 2 && p.x < o.x + o.width / 2)     //If "p"'s Y pos is lesser than "o"'s and if "p" is within "o"'s X-range.
        {
            p.y = o.y - o.height / 2 - p.height / 2;
            isGrounded = true;
            return;
        }
        
        isGrounded = false;
    }

    if(p.y - p.height / 2 < o.y + o.height / 2)   //"o" collision at the bottom.
    {
        if(p.y > o.y && p.x > o.x - o.width / 2 && p.x < o.x + o.width / 2)     //Ditto except if "p"'s Y pos is greater than "o"'s.
        {
            p.y = o.y + o.height / 2 + p.height / 2; return;
        }
    }
}
