import ObjectType from '@site/static/img/piece_types/ObjectType.png'
import AcceptNewType from '@site/static/img/piece_types/AcceptNewType.png'
import AcceptNewTypeInPart from '@site/static/img/piece_types/AcceptNewTypeInPart.png'
import ParseGraphic from '@site/static/img/piece_types/ParseGraphic.png'

# Creating Piece Types

In this guide you'll learn how we extended the graphics piece to add a stepped graphic piece to the blueprints which also covers the basics of adding a new piece type.

By reading this guide and following the code you will be able to understand how the pieces are parsed by the blueprints in Sofie and allow you to create your own pieces.xs

## Create a new ObjectType in the blueprints

In `packages\blueprints\src\common\definitions\objects.ts` create a new `ObjectType` in the `ObjectType` enum:

<img src={ObjectType} />

## Proof of concept parsing in the blueprints:

We essentially treat the stepped graphic as a sub-type of a Graphic object for the purposes of this example.

For this to work we first need to accept it as a valid graphic object so it can be parsed correctly in a Graphics part.

<img src={AcceptNewType} />

`packages\blueprints\src\base\showstyle\sofie-editor-parsers\index.ts`

We now have to also accept it during the parsing of the part:

<img src={AcceptNewTypeInPart} />

`packages\blueprints\src\base\showstyle\sofie-editor-parsers\gfx.ts`

Create simple types, we only have a `stepCount` property here because of the Rundown Editor's limitations. Ideally we'd ingest a `NoraContentSteps` as a step property that is already defined in Sofie so if you want to implement stepped graphics we suggest looking into that.

```typescript
export interface GraphicObjectBase extends BaseObject {
	objectType: ObjectType.Graphic | ObjectType.SteppedGraphic
	adlibVariant?: string
}
export interface SteppedGraphicObject extends GraphicObjectBase {
	objectType: ObjectType.SteppedGraphic
	attributes: SteppedGraphicObjectAttributes
}
export interface SteppedGraphicObjectAttributes extends GraphicObjectAttributes {
	stepCount: number
	[key: string]: string | number | boolean | undefined
}
```

`packages\blueprints\src\common\definitions\objects.ts`

Finally for the Sofie UI to render it as a stepped piece we need to return a piece with a step property on it's contents.

This can be skipped if you don't need to show steps for your pieces.

Here the step property has to be the type of `NoraContentSteps`. The content of your pieces could also differ based on your use-case.

<img src={ParseGraphic} />

packages\blueprints\src\base\showstyle\helpers\graphics.ts
