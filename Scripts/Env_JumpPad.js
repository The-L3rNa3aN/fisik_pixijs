/* Code for standard jump pad. Upon stepping, the player can jump 3 times higher. */

import * as PIXI from "/node_modules/pixi.js/dist/pixi.mjs";

export default class JumpPad extends PIXI.Sprite
{
    constructor(assetPath)
    {
        super(PIXI.Texture.from(assetPath));
        this.objectTag = "Jump Pad"
        this.anchor.set(0.5);
        this.height = 50; this.width = 50;
        this.jumpHeight = 6;
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
                if(o.objectTag === "Player")
                {
                    console.log("Player used a jump pad.");
                    o.Jump(this.jumpHeight, _delta);
                }
            }
        }
    }
}