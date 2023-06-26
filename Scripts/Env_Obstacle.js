import * as PIXI from "/node_modules/pixi.js/dist/pixi.mjs";

export default class Obstacle extends PIXI.Sprite
{
    constructor(assetPath)
    {
        super(PIXI.Texture.from(assetPath));
        this.objectTag = "Obstacle"
        this.anchor.set(0.5);
        this.height = 50; this.width = 50;
        this.isMovable = false;                                 //Toggle between making it movable by the player.
    }

    CollideWith(o)
    {
        if(this.isMovable == false)
        {
            if(o.objectTag == "Player")
                o.CollideWith(this);
        }
        else
        {
            let bounds1 = this.getBounds();
            let bounds2 = o.getBounds();

            if (bounds1.x + bounds1.width > bounds2.x)
            {
                if (bounds1.x + bounds1.width - 5 < bounds2.x && bounds1.y + bounds1.height - 5 > bounds2.y && bounds1.y < bounds2.y + bounds2.height)
                    this.x -= (bounds1.x + bounds1.width) - bounds2.x;
            }

            if (bounds1.x < bounds2.x + bounds2.width)
            {
                if (bounds1.x > bounds2.x +bounds2.width - 5 && bounds1.y + bounds1.height - 5 > bounds2.y && bounds1.y < bounds2.y + bounds2.height)
                    this.x += (bounds2.x + bounds2.width) - bounds1.x;
            }

            if (bounds1.y + bounds1.height > bounds2.y)
            {
                if(bounds1.y < bounds2.y && bounds1.x + bounds1.width > bounds2.x && bounds1.x < bounds2.x + bounds2.width)
                    this.y -= (bounds1.y + bounds1.height) - bounds2.y;
            }

            if (bounds1.y < bounds2.y + bounds2.height)
            {
                if(bounds1.y > bounds2.y && bounds1.x + bounds1.width > bounds2.x && bounds1.x < bounds2.x + bounds2.width - 1)
                    this.y += (bounds2.y + bounds2.height) - bounds1.y;
            }
        }
    }
}