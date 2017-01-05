Minium Demo - 'Quick, Draw!'
===========================

Overview
--------

This is a simple Minium demo project, where it plays with Google AI experiment 'Quick, Draw!'.
Where is a video of Minium drawing a penguin:

<iframe src="https://player.vimeo.com/video/194549806" width="640" height="360" frameborder="0" webkitallowfullscreen mozallowfullscreen allowfullscreen></iframe>

Minium uses use some auxiliary sites to "learn" how to draw a penguin:

* First, it searches for line drawing images in [Google images](https://images.google.com) and picks the first one
* It uses that image to get its contours using [Contour by José Manuel Pérez](https://jmperezperez.com/contour/)
* That service converts an image into SVG with `polyline` elements, from which Minium can easily extract all lines and corresponding points
* Minium then simplifies lines so that they have less points and therefore are quickier to draw. For that, it uses the javascript library [Simplify.js by Vladimir Agafonkin](http://mourner.github.io/simplify-js)
* Minium can now go back into 'Quick, Draw' and draw points using mouse interactions with offsets based on line points

Quick Start
-----------

* Download the latest release of [Minium Developer](https://github.com/viltgroup/minium-developer/releases/) (version 1.5 or later is required)
* Get this project code, for instance:

```bash
git clone https://github.com/viltgroup/minium-quickdraw-demo.git
```

* Run Minium Developer and open the project in it
* Open `scripts/quickdraw-test.js` and evaluate it
