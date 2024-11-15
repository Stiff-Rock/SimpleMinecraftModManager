async function getModList() {
  let mods = await window.api.loadModFolderList();


  if (!mods.length > 0) {
    addModCard('No mods found in folder');
  } else {
    mods.forEach(element => {
      addModCard(element);
    });
  }

}

function addModCard(element) {
  const text = document.createElement('p');
  text.innerText = element;

  const mainContent = document.getElementById('mainContent')
  mainContent.appendChild(text);
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
