---
sidebar_position: 4
---

# AdLibs

AdLibs are pieces or actions that can be taken by the user during a show. Sofie provides two different types of AdLibs:

1. AdLib Pieces
2. AdLib Actions

Both can have two context, either belong to a segment or part or have a global context (which is still limited to the Rundown they are in! It's important to keep in mind that a Global AdLib will not be available for an entire RundownPlaylist, it's tied to a given Rundown in that playlist.)

AdLib Pieces are the old way of improvising during a show, they simply insert a piece into it's layer.

AdLib Actions however as the name suggests are executing actions with logic inside your blueprint. Usually the result of an AdLib Action is a new piece or part in the rundown, but it can also change the current pieces and parts in the rundown.

You can use it to alter the content of these pieces as well and add checks when executing an Action.

We recommend only using AdLib actions if you are creating a new system, as it's much more flexible and is able to do everything AdLib Pieces did, so when you decide that you need more functionality it's less work to extend them.
