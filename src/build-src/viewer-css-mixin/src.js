

/**
 * A mixin to append the viewer css to the Viewer instance
 * @function viewerCSSMixin
 * @param {Viewer} viewer The viewer instance.
 *
 */

function viewerCSSMixin(viewerInstance, options) {
    var head = document.head || document.getElementsByTagName("head")[0];
    var style = document.createElement("style");
    style.innerText = styleText;
    head.appendChild(style);
}

export default viewerCSSMixin;



