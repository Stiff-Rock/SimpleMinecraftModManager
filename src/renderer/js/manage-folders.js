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

function addModCard(mod) {
  const modList = document.getElementById('mod-folder-list');

  const modItem = document.createElement('div');
  modItem.classList.add('mod-item');

  const modContent = document.createElement('div');
  modContent.classList.add('mod-content');
  modContent.addEventListener('click', () => {
    localStorage.setItem('selectedMod', mod.project_id);
    window.location.href = 'mod-view.html';
  });
  modItem.appendChild(modContent);

  const modImg = document.createElement('img');
  modImg.src = mod.icon_url ?? '../img/default-mod-icon.png';
  modImg.classList.add('mod-img');
  modContent.appendChild(modImg);

  const modInfoContainer = document.createElement('div');
  modInfoContainer.classList.add('mod-info-container');
  modContent.appendChild(modInfoContainer);

  const modName = document.createElement('p');
  modName.classList.add('mod-title');
  modName.textContent = mod.title;
  modInfoContainer.appendChild(modName);

  const modDescription = document.createElement('p');
  modDescription.classList.add('mod-description');
  modDescription.textContent = mod.description;
  modInfoContainer.appendChild(modDescription);

  modList.appendChild(modItem);
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
