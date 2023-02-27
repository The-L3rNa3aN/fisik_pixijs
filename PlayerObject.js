import * as PIXI from "./node_modules/pixi.js/dist/pixi.mjs";

export default class Player extends PIXI.Sprite
{
    constructor(assetPath)
    {
        super(PIXI.Texture.from(assetPath));
        this.isGrounded = false;                                                    //Boolean to check if the player is touching the ground.
        this.gConstant = 10;                                                        //Acceleration due to gravity.
        this.xVel = 0; this.yVel = 0;                                               //Player velocity.
        this.xAccel = 0; this.yAccel = 0;                                           //Player acceleration.
        this.jumpHeight = 2;                                                        //Jump height.
        this.speed = 0.7;                                                           //Player speed, duh.
        this.fCoeff = 0.2;                                                          //Friction co-efficient.
        this.floatInput = 0;
        
        //Booleans which return true when their respective keys are pressed.
        this.upClicked = false;
        this.downClicked = false;
        this.leftClicked = false;
        this.rightClicked = false;

        document.addEventListener('keydown', (e)=>this.DetectKey(e,1));
        document.addEventListener('keyup', (e)=>this.DetectKey(e,0));
    }

    DetectKey(keyPress,state)
    {
        let k = keyPress.key;
        if(k === 'a' || k === 'A') this.leftClicked = state;
        if(k === 'd' || k === 'D') this.rightClicked = state;
        if(k === 'w' || k === 'W') this.upClicked = state;
        if(k === 's' || k === 'S') this.downClicked = state;

    }

    Update(delta)
    {
        this.floatInput = Math.min(0, 1);

        //Gravity if the player isn't touching the ground.
        if(!this.isGrounded)
        {
            this.yVel = this.gConstant * delta / 10;
            this.yAccel += this.yVel * delta / 10;
            this.y += this.yAccel;
        }
        else
        {
            this.yVel = 0.1;
            this.yAccel = 0;
        }

        if(this.upClicked)                   //Jump.
        {
            if(this.isGrounded)
            {
                this.yVel -= Math.sqrt(this.jumpHeight * this.gConstant) * delta;        //Based on Bjorn's jump equation: v = SQRT(jumpHeight * -2 * gravity).
                this.yAccel = this.yVel / delta;                                         //Acceleration (Impulsive Force) = Velocity / Time.
                this.y += this.yAccel;                                                   //I dunno how I got this working, and my brain isn't in the mood to find out (JK. Adding up the minuses here.).
                this.isGrounded = false;
            }
            // else
            // {
            //     if(onLeftWall)
            //     {
            //         console.log("Left wall");
            //     }
            //     if(onRightWall)
            //     {
            //         console.log("Right wall");
            //     }
            // }
            //bunny.y -= 2;
        }

        this.xVel = 0;                                                                  //When not pressing anything, velocity will reduce to 0 and so will acceleration.
        if(this.leftClicked)
        {
            this.floatInput += delta;                                                   //Pressing 'A' or 'D' will increment 'floatInput' from 0 to 1.
            this.xVel = -this.speed * this.floatInput * delta;                          //A minus here since going left means you're travelling towards the origin, so your X-position decreases.
        }
        if(this.rightClicked)
        {
            this.floatInput += delta;
            this.xVel = this.speed * this.floatInput * delta;
        }

        this.xAccel += this.xVel * delta;                                                 //If you didn't know, acceleration is the rate of change of velocity.
        this.x += this.xAccel;                                                            //And we are adding it all to the X-position of the player.
        this.xAccel -= this.fCoeff * this.xAccel;                                         //Player acceleration, meet friction (the friction coefficient is multiplied with the current acceleration and serves as counter movement).

        if(Math.abs(this.xAccel) < 0.01) this.xAccel = 0;                                 //When not pressing anything, the player still drifts a little here and there. Any value lesser than 0.01 will be eliminated and set to 0.
    }

    CollideWith(o)
    {
        let bounds1 = this.getBounds();
        let bounds2 = o.getBounds();

        if (bounds1.x + bounds1.width > bounds2.x)
        {
            if (bounds1.x + bounds1.width - 5 < bounds2.x && bounds1.y + bounds1.height - 5 > bounds2.y && bounds1.y < bounds2.y + bounds2.height)
            {
                this.x -= (bounds1.x + bounds1.width) - bounds2.x;
                this.xAccel = 0;
                return ;
            }
        }

        if (bounds1.x < bounds2.x+bounds2.width)
        {
            if (bounds1.x > bounds2.x +bounds2.width - 5 && bounds1.y + bounds1.height - 5 > bounds2.y && bounds1.y < bounds2.y + bounds2.height)
            {
                this.x += (bounds2.x + bounds2.width) - bounds1.x;
                this.xAccel = 0;
                return;
            }
        }

        if (bounds1.y + bounds1.height > bounds2.y)
        {
            if(bounds1.y < bounds2.y && bounds1.x + bounds1.width > bounds2.x && bounds1.x < bounds2.x + bounds2.width)
            {
                this.y -= (bounds1.y + bounds1.height) - bounds2.y;
                this.isGrounded = true;
                return;
            }
            this.isGrounded = false;
        }

        if (bounds1.y < bounds2.y + bounds2.height)
        {
            if(bounds1.y > bounds2.y && bounds1.x + bounds1.width > bounds2.x && bounds1.x < bounds2.x + bounds2.width - 1)
            {
                this.y += (bounds2.y + bounds2.height) - bounds1.y;
                this.yAccel = 0;
                return;
            }
        }
    }
}