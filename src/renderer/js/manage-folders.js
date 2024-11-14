async function getModList() {
  const mods = await window.api.loadModFolderList();
  console.log('Mods cargados: ' + mods);
  mods.forEach(element => {
    const text = document.createElement('p');
    text.innerText = element;

    const mainContent = document.getElementById('mainContent')
    mainContent.appendChild(text);
  });
}

const waitForDOMReady = () => {
  return new Promise((resolve) => {
    if (document.readyState === "interactive" || document.readyState === "complete") {
      resolve();
    } else {
      document.addEventListener('DOMContentLoaded', () => resolve());
    }
  });
};

(async function() {
  await waitForDOMReady();
  getModList();
})();
