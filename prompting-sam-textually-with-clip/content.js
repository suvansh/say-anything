let mostRecentImageURL = null;
// Listen for click events on the document
document.addEventListener("mouseup", (event) => {
    // Check if the event target is an image element
    if (event.target.matches(".react-photo-album--row img")) {
        // Store the image URL
        mostRecentImageURL = event.target.src;
        console.log(mostRecentImageURL);
    }
});

function getDisplayedImageSize(element) {
    const displayedSize = element.getBoundingClientRect();
    return {
        width: displayedSize.width,
        height: displayedSize.height,
    };
}

function getScalingFactors(originalSize, displayedSize) {
    return {
        scaleX: displayedSize.width / originalSize.width,
        scaleY: displayedSize.height / originalSize.height,
    };
}

function scalePoints(points, scalingFactors) {
    return points.map(({ x, y }) => ({
        x: x * scalingFactors.scaleX,
        y: y * scalingFactors.scaleY,
    }));
}

function delay(duration) {
    return new Promise((resolve) => setTimeout(resolve, duration));
}


function waitForElement(selector) {
    return new Promise((resolve) => {
        const element = document.querySelector(selector);
        if (element) {
            if (element.tagName === 'IMG' && !element.complete) {
                element.addEventListener('load', () => resolve(element));
            } else {
                resolve(element);
            }
        } else {
            const observer = new MutationObserver((mutations) => {
                for (const mutation of mutations) {
                    for (const addedNode of mutation.addedNodes) {
                        if (addedNode.matches && addedNode.matches(selector)) {
                            if (addedNode.tagName === 'IMG' && !addedNode.complete) {
                                addedNode.addEventListener('load', () => {
                                    observer.disconnect();
                                    resolve(addedNode);
                                });
                            } else {
                                observer.disconnect();
                                resolve(addedNode);
                                return;
                            }
                        }
                    }
                }
            });
            observer.observe(document.body, { childList: true, subtree: true });
        }
    });
}

window.addEventListener("load", function () {
    // Create input textbox overlay
    const inputOverlay = document.createElement("div");
    inputOverlay.innerHTML = `
        <form id="inputForm" style="display: flex; flex-direction: column;">
            <input type="text" id="inputText" placeholder="Enter text prompt" required>
            <div class="form-row">
                <input type="number" id="numDetections" min="1" placeholder="How many?">
                <button type="submit">Submit</button>
            </div>
            <div class="form-row">
                <span style="font-size: 10px; margin-top: 5px; color: #ffffff">Made with love and AI by <a href="https://brilliantly.ai" target="_blank" rel="noopener noreferrer" class="brilliantly">brilliantly</a>.</span>
                <div class="help tooltip">?
                    <span class="tooltiptext">The extension will click on the first few spots that match the text prompt. You can set the mode to be additive or subtractive, even bounding box if you're feeling silly.</span>
                </div>
            </div>
        </form>
    `;
    inputOverlay.style.cssText = `
        position: fixed;
        width: 205px;
        top: 82.8px;
        right: 10px;
        z-index: 10000;
        background: darkslateblue;
        padding: 10px;
        border: 1px solid #ccc;
        border-radius: 5px;
    `;
    document.body.appendChild(inputOverlay);
    const inputForm = document.getElementById("inputForm");
    const inputText = document.getElementById("inputText");
    const numDetectionsInput = document.getElementById("numDetections");

    function getElementOffset(element) {
        const rect = element.getBoundingClientRect();
        return {
            top: rect.top + window.pageYOffset,
            left: rect.left + window.pageXOffset,
        };
    }

    function simulateClick(targetElement, browserX, browserY) {
        ['mouseover', 'mousemove', 'mousedown', 'focus', 'mouseup', 'click'].forEach((eventType) => {
            let event = null
            if (eventType === 'focus') {
                event = new MouseEvent(eventType);
            } else {
                event = new MouseEvent(eventType, {
                    bubbles: true,
                    cancelable: true,
                    clientX: browserX,
                    clientY: browserY,
                });
            }
            targetElement.dispatchEvent(event);
        });
    }

    // Click on the image at the returned (x, y) coordinates
    async function clickPoints(element, points) {
        for (const { x, y } of points) {
            const offset = getElementOffset(element);
            const browserX = x + offset.left;
            const browserY = y + offset.top;
            console.log(`Clicking on (${browserX}, ${browserY})`);

            simulateClick(element, browserX, browserY);

            // Introduce a delay between clicks
            await delay(50);
        }
    }

    // Get the image element on the website
    waitForElement(".Canvas img").then((imageElement) => {
        // Handle form submission
        inputForm.addEventListener("submit", async (e) => {
            e.preventDefault();

            const textQuery = inputText.value;
            const numDetections = numDetectionsInput.value ? parseInt(numDetectionsInput.value, 10) : null;
            if (!textQuery) {
                alert("Please enter a text query");
                return;
            }

            if (mostRecentImageURL) {
                // // Fetch the most recent image as a Blob
                // const response = await fetch(mostRecentImageURL);
                // const imageBlob = await response.blob();

                // Send a POST request to the Flask backend API
                body = {
                    textQuery: textQuery,
                    imageURL: mostRecentImageURL,
                    numDetections: numDetections,
                };
                const apiResponse = await fetch("https://sam-clip-server.brilliantly.ai/api/coordinates", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(body),
                });

                const { points, image_width, image_height } = await apiResponse.json();
                // Get the image canvas element
                const konvajsContentElement = document.querySelector("div.konvajs-content");

                const originalSize = {
                    width: image_width,
                    height: image_height,
                }
                const displayedSize = getDisplayedImageSize(konvajsContentElement);
                const scalingFactors = getScalingFactors(originalSize, displayedSize);
                const scaledPoints = scalePoints(points, scalingFactors);

                // Click on the image at the returned (x, y) coordinates
                clickPoints(konvajsContentElement, scaledPoints);
            } else {
                alert("Please open an image first");
                return;
            }

        });
    });
});
