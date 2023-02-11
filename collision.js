/* All collision code here. */

export function Trigger(player, world) /* "o1" for "object 1" and "o2" for "object 2". */
{
    //Returns 'true' if "player" and "world" intersect.
    if (player.x + player.width > world.x && player.x < world.x + world.width && player.y + player.height > world.y && player.y < world.y + world.height)
        return true;
    return false;
}

/* NOTE: Remember to call Collide after any gravity-related code in "index.js". */
export function Collide(p, o) /* "p" for "player" and "o" for "object". */
{
    if(p.x + p.width / 2 > o.x - o.width / 2)     //"o" collision on the left.
    {
        if(p.x < o.x && p.y > o.y - o.height / 2 && p.y < o.y + o.height / 2)   //If "p"'s X pos is lesser than "o"'s and if "p" is within "o"'s Y-range.
            p.x = o.x - o.width / 2 - p.width / 2;
    }

    if(p.x - p.width / 2 < o.x + o.width / 2)     //"o" collision on the right.
    {
        if(p.x > o.x && p.y > o.y - o.height / 2 && p.y < o.y + o.height / 2)   //Ditto except if "p"'s X pos is greater than "o"'s.
            p.x = o.x + o.width / 2 + p.width / 2;
    }

    if(p.y + p.height / 2 > o.y - o.height / 2)   //"o" collision above.
    {
        if(p.y < o.y && p.x > o.x - o.width / 2 && p.x < o.x + o.width / 2)     //If "p"'s Y pos is lesser than "o"'s and if "p" is within "o"'s X-range.
            p.y = o.y - o.height / 2 - p.height / 2;
    }

    if(p.y - p.height / 2 < o.y + o.height / 2)   //"o" collision at the bottom.
    {
        if(p.y > o.y && p.x > o.x - o.width / 2 && p.x < o.x + o.width / 2)     //Ditto except if "p"'s Y pos is greater than "o"'s.
            p.y = o.y + o.height / 2 + p.height / 2;
    }

    
}

export function IsColliding(o1, o2) /* Ditto like Trigger. Checks if two objects are colliding with each other. */
{
    if((o2.y - o2.height / 2) - (o1.y + o1.height / 2) <= 3)            //Above.
    {
        if(o1.y < o2.y && o1.x > o2.x - o2.width / 2 && o1.x < o2.x + o2.width / 2)
            return true;
    }

    if((o1.y + o1.height / 2) - (o2.y - o2.height / 2) >= 3)            //Below.
    {
        if(o1.y > o2.y && o1.x > o2.x - o2.width / 2 && o1.x < o2.x + o2.width / 2)
            return true;
    }

    if((o2.x - o2.width / 2) - (o1.y + o1.width / 2) <= 3)             //Left.
    {
        if(o1.x < o2.x && o1.y > o2.y - o2.height / 2 && o1.y < o2.y + o2.height / 2)
            return true;
    }

    if((o1.x + o1.width / 2) - (o2.x - o2.width / 2) >= 3)              //Right.
    {
        if(o1.x > o2.x && o1.y > o2.y - o2.height / 2 && o1.y < o2.y + o2.height / 2)
            return true;
    }

    return false;
}

export function IsColliding_Gravity(o1, o2) /* Basically "IsColliding" but only for checking on surfaces above. */
{
    if(o1.y < o2.y && (o2.y - o2.height / 2) - (o1.y + o1.height / 2) <= 2 && o1.x < o2.x + o2.width / 2 && o1.x > o2.x - o2.width / 2)
    {
        return true;
    }
    
    return false;
}