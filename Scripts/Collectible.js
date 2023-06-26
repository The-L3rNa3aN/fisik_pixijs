/* Simple stuff for collectibles. */
import { Trigger } from "./Collision.js";

export function Collectible(player, object, score)
{
    if(Trigger(player, object))
    {
        console.log("Collectible");
        object.x = -10; object.y = -10;         //Transfer the object to an unreachable area instead of deleting it.
        score += 1;                             //Increment the score with whatever value you want. I don't give a shit.
    }
}