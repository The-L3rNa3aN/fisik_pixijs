/*This is the place where all the execution happens.*/
/*BUGS:
    1. The highermost tiles feature collision even when the player is away from its hor. range, having it float. Jumping will reverse the bug.
    
    TO DO:
    Wall-jumping.
    Jump pad - propels the player upwards 1.25 times the normal jump.
    Tweak the jump height. It's too much at the moment. (Try moving the jump code. Gives different results.)
    Improve the collision model. It quite wacky. Make use of "getBounds()" for it.

THINGS THAT I CAN WORK ON BUT JUST CAN'T DECIDE:
    *None at the moment*
*/

import { Collide, Trigger, IsColliding, IsColliding_Gravity, WallBoundaries } from './collision.js';
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
app.loader.add('bunny', './Textures/bunny.png')
app.loader.add('button', './Textures/tile_white.png')
app.loader.add('obstacle', './Textures/tile_green.png')
app.loader.add('collectible', './Textures/tile_orange.png')
app.loader.add('dirt', './Textures/tile_brown.png')
    .load(startup);

//Player stuff.
var isGrounded = false;                                                                 //Boolean to check if the player is touching the ground.
var onLeftWall = false;                                                                 //Boolean to check if the player is touching a wall on the left. Required for wall-jumping.
var onRightWall = false;                                                                //Boolean to check if the player is touching a wall on the right. Required for wall-jumping.
var playerScore = 0;
var gConstant = 10;                                                                     //Acceleration due to gravity.
var xVel = 0, yVel = 0;                                                                 //Player body's velocity.
var xAccel = 0, yAccel = 0;                                                             //Player body's acceleration.
var jumpHeight = 2;                                                                     //Jump height. What else?
var floatInput = 0;
var speed = 0.7;
var fCoeff = 0.2;                                                                       //Friction coefficient.

var midPointX = app.renderer.width / 2;
var midPointY = app.renderer.height / 2;

function startup()
{
    var collidableTilesContainer = new PIXI.Container();

    //Booleans which return true when their respective keys are pressed.
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
                collidableTilesContainer.addChild(obstacle); // app.stage.addChild(obstacle);
                // obstacleArray.push(obstacle);
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
    bunny.x = midPointX;                                                   //Move the sprite to the center of the screen
    bunny.y = midPointY;

    //#region Scrollable Environment Indicator (not for the final game)
    var line1 = new PIXI.Graphics()
        .beginFill(0xfc4903)
        .lineStyle(4, 0xFFFFFF, 1)
        .moveTo(midPointX - 75, midPointY - 50)
        .lineTo(midPointX + 75, midPointY - 50)
        .closePath()
        .endFill();

    var line2 = new PIXI.Graphics()
        .beginFill(0xfc4903)
        .lineStyle(4, 0xFFFFFF, 1)
        .moveTo(midPointX + 75, midPointY - 50)
        .lineTo(midPointX + 75, midPointY + 400)
        .closePath()
        .endFill();

    var line3 = new PIXI.Graphics()
        .beginFill(0xfc4903)
        .lineStyle(4, 0xFFFFFF, 1)
        .moveTo(midPointX + 75, midPointY + 400)
        .lineTo(midPointX - 75, midPointY + 400)
        .closePath()
        .endFill();

    var line4 = new PIXI.Graphics()
        .beginFill(0xfc4903)
        .lineStyle(4, 0xFFFFFF, 1)
        .moveTo(midPointX - 75, midPointY + 400)
        .lineTo(midPointX - 75, midPointY - 50)
        .closePath()
        .endFill();
    //#endregion
        
    //Staged items have their sprite orders assigned in ascending order.
    app.stage.addChild(bunny);
    app.stage.addChild(collidableTilesContainer);
    // app.stage.addChild(line1, line2, line3, line4);                                     //For visualizing the bounding box. Comment to disable it.
    
    app.ticker.maxFPS = 60;
    app.ticker.add(function(delta)                                                  //Listen for animate update
    {
        floatInput = Math.min(0, 1);                                                //Similar to Unity's old input system, pressing a key changes its value from 0 to 1.
        
        //Collectibles here.
        //Collectible(bunny, testCollectible, playerScore);

        //Gravity if the player isn't touching the ground.
        if(!isGrounded)
        {
            yVel = gConstant * delta / 10;
            yAccel += yVel * delta / 10;
            bunny.y += yAccel;
        }
        else
        {
            yVel = 0.1;
            yAccel = 0;
        }

        //Movement code based on button presses.
        if(upClicked)                   //Jump.
        {
            if(isGrounded)
            {
                yVel -= Math.sqrt(jumpHeight * gConstant) * delta;                   //Based on Bjorn's jump equation: v = SQRT(jumpHeight * -2 * gravity).
                yAccel = yVel / delta;                                               //Acceleration (Impulsive Force) = Velocity / Time.
                bunny.y += yAccel;                                                   //I dunno how I got this working, and my brain isn't in the mood to find out (JK. Adding up the minuses here.).
                isGrounded = false;
            }
            else
            {
                if(onLeftWall)
                {
                    console.log("Left wall");
                }

                if(onRightWall)
                {
                    console.log("Right wall");
                }
            }
            //bunny.y -= 2;
        }

        //if(downClicked) bunny.y += 2 * delta;
        // if(leftClicked) bunny.x -= 2 * delta;
        // if(rightClicked) bunny.x += 2 * delta;

        xVel = 0;                                                                       //When not pressing anything, velocity will reduce to 0 and so will acceleration.
        if(leftClicked)
        {
            floatInput += delta;                                                        //Pressing 'A' or 'D' will increment 'floatInput' from 0 to 1.
            xVel = -speed * floatInput * delta;                                         //A minus here since going left means you're travelling towards the origin, so your X-position decreases.
        }

        if(rightClicked)
        {
            floatInput += delta;
            xVel = speed * floatInput * delta;
        }

        //The player should collide with these. ALWAYS CALL ANY COLLISION-RELATED FUNCTIONS AFTER THE GRAVITY-RELATED CODE.
        for(let i = 0; i < collidableTilesContainer.children.length; i++)
        {
            testCollide(bunny, collidableTilesContainer.children[i].getBounds());
        }

        xAccel += xVel * delta;                                                         //If you didn't know, acceleration is the rate of change of velocity.
        bunny.x += xAccel;                                                              //And we are adding it all to the X-position of the player.
        xAccel -= fCoeff * xAccel;                                                      //Player acceleration, meet friction (the friction coefficient is multiplied with the current acceleration and serves as counter movement).
        
        if(Math.abs(xAccel) < 0.01) xAccel = 0;                                         //When not pressing anything, the player still drifts a little here and there. Any value lesser than 0.01 will be eliminated and set to 0.

        //Scroll the environment if the player is trying to go beyond the set wall boundaries.
        if(bunny.x < midPointX - 50 && leftClicked) collidableTilesContainer.x -= xAccel;
        if(bunny.x > midPointX + 50 && rightClicked) collidableTilesContainer.x -= xAccel;
        if(bunny.y <= midPointY - 50) collidableTilesContainer.y -= yAccel;
        if(bunny.y >= midPointY + 400) collidableTilesContainer.y -= yAccel;

        WallBoundaries(bunny, midPointX, midPointY);                                                          //Wall boundaries, of course.
    });
}

function testCollide(p, o)
{
    o.x += 25; o.y += 25;                       //Offsetting because we're using "getBounds()".

    if(p.x + p.width / 2 > o.x - o.width / 2)     //"o" collision on the left.
    {
        if(p.x < o.x && p.y > o.y - o.height / 2 && p.y < o.y + o.height / 2)   //If "p"'s X pos is lesser than "o"'s and if "p" is within "o"'s Y-range.
        {
            p.x = o.x - o.width / 2 - p.width / 2;
            onLeftWall = true;
            return;
        }

        onLeftWall = false;
    }

    if(p.x - p.width / 2 < o.x + o.width / 2)     //"o" collision on the right.
    {
        if(p.x > o.x && p.y > o.y - o.height / 2 && p.y < o.y + o.height / 2)   //Ditto except if "p"'s X pos is greater than "o"'s.
        {
            p.x = o.x + o.width / 2 + p.width / 2;
            onRightWall = true;
            return;
        }

        onRightWall = false;
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
            p.y = o.y + o.height / 2 + p.height / 2;
            yAccel = 0;                                                          //Without this, the player will remain stuck on the roof until the length of the jump is coming to an end.
            return;
        }
    }
}
