/* Code for trampolines. It's dependent on the last known vertical acceleration. Touching it results in jumping higher. */

import * as PIXI from "/node_modules/pixi.js/dist/pixi.mjs";

export default class Trampoline extends PIXI.Sprite
{
    constructor(assetPath)
    {
        super(PIXI.Texture.from(assetPath));
        this.objectTag = "Jump Pad"
        this.anchor.set(0.5);
        this.height = 50; this.width = 50;
    }

    Update(delta)
    {
        //Update things here.
    }

    CollideWith(o, _delta)
    {
        let bounds1 = this.getBounds();
        let bounds2 = o.getBounds();

        if (bounds2.y + bounds2.height > bounds1.y)
        {
            if(bounds2.y < bounds1.y && bounds2.x + bounds2.width > bounds1.x && bounds2.x < bounds1.x + bounds1.width)
            {
                if(o.objectTag === "Player" && o.yAccel > 2)                                        //yAccel lower than 2 means the player is walking and not jumping. Jump pads work if it is higher.
                {
                    console.log("Player used a trampoline.");
                    let newJumpHeight = o.yAccel * 1.5;
                    o.Jump(newJumpHeight, _delta);
                }
            }
        }
    }
}