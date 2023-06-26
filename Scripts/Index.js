/*This is the place where all the execution happens.*/
/*BUGS:
    1. The highermost tiles feature collision even when the player is away from its hor. range, having it float. Jumping will reverse the bug.
    2. Pressing both 'A' and 'D' results in the player going right at twice the speed.
    3. Buggy jump pads make the player disappear.
    
    TO DO:
    Wall-jumping.
    Tweak the jump height. It's too much at the moment. (Try moving the jump code. Gives different results.)
    Change the game time of the day based on the local time of the machine.
    Movable tiles. Could be a nice inclusion for certain puzzles. (Discovered by accidentally creating a bug with Obstacle())

THINGS THAT I CAN WORK ON BUT JUST CAN'T DECIDE:
    Ropes, I guess. (Inspiration from "Half Life: Opposing Force").
*/

import { WallBoundaries } from './Collision.js';
import { Map_01 } from './Level.js';
import Player from './Ent_Player.js';
import JumpPad from './Env_JumpPad.js';
import * as PIXI from "/node_modules/pixi.js/dist/pixi.mjs";
import { addStats, Stats } from '/node_modules/pixi-stats/lib/stats.js';
import Trampoline from './Env_Trampoline.js';
import Obstacle from './Env_Obstacle.js';

var app = new PIXI.Application                                                          //Create our application instance
({
    width: 900, //width: window.innerWidth - 20,
    height: 900, //height: window.innerHeight - 20,
    backgroundColor: 0x2c3e50
});
document.body.appendChild(app.view);

var midPointX = app.renderer.width / 2;
var midPointY = app.renderer.height / 2;

var collidableTilesContainer = new PIXI.Container();                                    //The collidable environment which is also scrollable.
var jumpTestArray = [];

//Assign gameobjects here.
var player  = new Player("./Textures/bunny.png");
var testCollectible = undefined;
var obstacle = undefined;
var dirt = undefined;
var jumpPad = undefined;
var trampoline = undefined;
var testMovableObj = undefined;

//Loading the level.
var level = Map_01();
var tileX = 0; var tileY = 0;
for(let i = 0; i < level.length; i++)
{
    if(i >= 18 && i % 18 == 0) { tileX = 0; tileY += 50; }

    switch(level[i])
    {
        case 1:
            obstacle = new Obstacle('./Textures/tile_green.png'); // obstacle = PIXI.Sprite.from('./Textures/tile_green.png');
            obstacle.x = tileX + 25; obstacle.y = tileY + 25;
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

        case 4:
            jumpPad = new JumpPad('./Textures/tile_jumpPad.png');
            jumpPad.x = tileX + 25; jumpPad.y = tileY + 25;
            collidableTilesContainer.addChild(jumpPad);
            jumpTestArray.push(jumpPad);
            break;

        case 5:
            trampoline = new Trampoline('./Textures/tile_red.png');
            trampoline.x = tileX + 25; trampoline.y = tileY + 25;
            collidableTilesContainer.addChild(trampoline);
            break;

        case 6:
            testMovableObj = new Obstacle('./Textures/tile_brown.png');
            testMovableObj.x = tileX + 25; testMovableObj.y = tileY + 25;
            testMovableObj.isMovable = true;
            collidableTilesContainer.addChild(testMovableObj);
            break;

        default:
            break;
    }
    tileX += 50;
}

player.anchor.set(0.5);                                                             //Center anchor points.
player.x = midPointX;                                                               //Move the sprite to the center of the screen
player.y = midPointY;

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
app.stage.addChild(player);
app.stage.addChild(collidableTilesContainer);
// app.stage.addChild(line1, line2, line3, line4);                                     //For visualizing the bounding box. Comment to disable it.

var tume = new Date();
console.log(tume.getHours(), tume.getMinutes());

const stats = addStats(document, app);
app.ticker.maxFPS = 63;
app.ticker.add(function(delta)                                                      //Listen for animate update
{
    stats.update();
    player.Update(delta);
    jumpPad.CollideWith(player, delta);
    trampoline.CollideWith(player, delta);

    //The player should collide with these. ALWAYS CALL ANY COLLISION-RELATED FUNCTIONS AFTER THE GRAVITY-RELATED CODE.
    for(let i = 0; i < collidableTilesContainer.children.length; i++)
    {
        // let o = collidableTilesContainer.children[i];
        // player.CollideWith(collidableTilesContainer.children[i]);
        collidableTilesContainer.children[i].CollideWith(player);
    }

    // for(let i = 0; i < jumpTestArray.length; i++)
    // {
    //     jumpTestArray[i].CollideWith(player, delta);
    // }

    //Scroll the environment if the player is trying to go beyond the set wall boundaries.
    if(player.x < midPointX - 50 && player.leftClicked) collidableTilesContainer.x -= player.xAccel;
    if(player.x > midPointX + 50 && player.rightClicked) collidableTilesContainer.x -= player.xAccel;
    if(player.y <= midPointY - 50) collidableTilesContainer.y -= player.yAccel;
    if(player.y >= midPointY + 400) collidableTilesContainer.y -= player.yAccel;

    WallBoundaries(player, midPointX, midPointY);                                       //Wall boundaries, of course.
});
