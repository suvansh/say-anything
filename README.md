# Prompting Segment Anything Model (SAM) Textually with CLIP
Use natural language prompting to interact with Meta's [SAM](https://segment-anything.com)! While they trained and studied text prompting, they have chosen not to release it as part of their demo, so I figured I would try my hand at it. This extension is of course not the same as the text encoder they used, but is instead a layer on top of it, calling a backend built with OpenAI's CLIP and leaning heavily on [kevinzakka's](https://github.com/kevinzakka) [implementation](https://colab.research.google.com/github/kevinzakka/clip_playground/blob/main/CLIP_GradCAM_Visualization.ipynb) of [Gradient-weighted Class Activation Mapping (Grad-CAM)](https://arxiv.org/abs/1610.02391).

This is just for fun, and results are variable in their quality. Some of the failure modes are explainable (the gradient mapping is imprecise, so some small objects are near misses) and others are just way off. Also tried grabbing all masks and filtering against the search term, but that was slower and noisier. Maybe with some more patience later it'll work better though.

## Installation
You can install the extension from the Chrome web store [here](https://chrome.google.com/webstore/detail/say-anything-prompt-segme/jndfmkiclniflknfifngodjnmlibhjdo).

If you prefer to run the extension locally from this repo, see the following instructions:
![Installation instructions from ChatGPT](img/installation_chatgpt.png?raw=true "Installation instructions")

## Screenshots
To be added later, see [here](https://twitter.com/SuvanshSanjeev/status/1644336502657384451?s=20) for now.
