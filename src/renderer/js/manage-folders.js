

const waitForDOMReady = () => {
    return new Promise((resolve) => {
        if (document.readyState === "interactive" || document.readyState === "complete") {
            resolve();
        } else {
            document.addEventListener('DOMContentLoaded', () => resolve());
        }
    });
};

(async function () {
    await waitForDOMReady();

})();