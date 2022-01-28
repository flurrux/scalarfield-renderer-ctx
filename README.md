
# scalar-field-renderer  

![static, wavy heightmap in 3D](./demo-gifs/static-field-1.gif)

```
import { Vector2 } from "@flurrux/simple-scalar-field-renderer/lib/types";
import { divide } from "@flurrux/simple-scalar-field-renderer/lib/vec2";
import { center } from "@flurrux/simple-scalar-field-renderer/src/grid-field";
import { setupHeightMapScene } from "@flurrux/simple-scalar-field-renderer/src/heightmap-scene";

const sceneController = setupHeightMapScene({
  gridField: center({ 
    position: [0, 0], 
    cellSize: 0.1, 
    size: [30, 30]
  }), 
  heightMap: ([x, y]: Vector2) => {
    const f = 2;
    return Math.sin(p[0] * f) * Math.sin(p[1] * f) * 0.35;
  },
  shape: "triangle"
});
```

```sceneController``` has the following type:  

```
type HeightMapScene = {
	updateHeightMap: (newHeightMap: ScalarField) => void,
	updateColorField: (newColorField: ColorField) => void,
	requestRender: Morphism<void, void>,
	transformCamera: Morphism<Transformation<OrbitCamera>, void>
}
```

```updateHeightMap``` can be used to animate the field:  

![oscillating, wavy heightmap in 3D](./demo-gifs/oscillating-field-1.gif)


```

import { startLoop } from "@flurrux/simple-scalar-field-renderer/src/util";

startLoop(
	(args) => {
		const f = 2;
		sceneController.updateHeightMap(
			([x, y]) => Math.sin(x * f) * Math.sin(y * f) * 0.35 * Math.sin(args.t)
		);
	}
);

```