/*This is the place where all the execution happens.*/
/*BUGS:
    1. The highermost tiles feature collision even when the player is away from its hor. range, having it float. Jumping will reverse the bug.
    
    TO DO:
    Wall-jumping.
    Jump pad - propels the player upwards 1.25 times the normal jump.
    Tweak the jump height. It's too much at the moment. (Try moving the jump code. Gives different results.)

THINGS THAT I CAN WORK ON BUT JUST CAN'T DECIDE:
    *None at the moment*
*/

import { Collide, Trigger, IsColliding, IsColliding_Gravity, WallBoundaries } from './collision.js';
import { Collectible } from './collectible.js';
import { Map_01 } from './level.js';
import PlayerObject from './PlayerObject.js';
import * as PIXI from './node_modules/pixi.js/dist/pixi.mjs';

var app = new PIXI.Application                                                          //Create our application instance
({
    width: 900, //width: window.innerWidth - 20,
    height: 900, //height: window.innerHeight - 20,
    backgroundColor: 0x2c3e50
});
document.body.appendChild(app.view);

// Load textures.
const bunnyTexture = PIXI.Sprite.from('./Textures/bunny.png');

var midPointX = app.renderer.width / 2;
var midPointY = app.renderer.height / 2;

var collidableTilesContainer = new PIXI.Container();

//Assign gameobjects here.
var bunny  = new PlayerObject("./Textures/bunny.png"); // var bunny = bunnyTexture; 
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
            obstacle = PIXI.Sprite.from('./Textures/tile_green.png');
            obstacle.x = tileX + 25; obstacle.y = tileY + 25;
            obstacle.height = 50; obstacle.width = 50;
            obstacle.anchor.set(0.5);
            collidableTilesContainer.addChild(obstacle);
            break;

        case 2:
            testCollectible = PIXI.Sprite.from('./Textures/tile_orange.png');
            testCollectible.x = tileX + 25; testCollectible.y = tileY + 25;
            testCollectible.width = 25; testCollectible.height = 25;
            testCollectible.anchor.set(0.5);
            app.stage.addChild(testCollectible);
            break;

        case 3:
            dirt = PIXI.Sprite.from('./Textures/tile_brown.png');
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

// bunny.anchor.set(0.5);                                                              //Center anchor points.
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

app.ticker.maxFPS = 65;
app.ticker.add(function(delta)                                                  //Listen for animate update
{
    bunny.Update(delta);
    // console.log(app.ticker.FPS);

    //The player should collide with these. ALWAYS CALL ANY COLLISION-RELATED FUNCTIONS AFTER THE GRAVITY-RELATED CODE.
    for(let i = 0; i < collidableTilesContainer.children.length; i++)
    {
        bunny.CollideWith(collidableTilesContainer.children[i]);
    }

    //Scroll the environment if the player is trying to go beyond the set wall boundaries.
    if(bunny.x < midPointX - 50 && bunny.leftClicked) collidableTilesContainer.x -= bunny.xAccel;
    if(bunny.x > midPointX + 50 && bunny.rightClicked) collidableTilesContainer.x -= bunny.xAccel;
    if(bunny.y <= midPointY - 50) collidableTilesContainer.y -= bunny.yAccel;
    if(bunny.y >= midPointY + 400) collidableTilesContainer.y -= bunny.yAccel;

    WallBoundaries(bunny, midPointX, midPointY);                                                          //Wall boundaries, of course.
});
