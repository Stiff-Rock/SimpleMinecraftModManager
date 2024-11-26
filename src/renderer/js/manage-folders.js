async function getModList() {
  let mods = await window.api.loadModFolderList();

  if (!mods.length > 0) {
    addModCard('No mods found in folder');
  } else {
    for (const element of mods) {
      addModCard(element);
    }
  }
}

function addModCard(mod) {
  const modList = document.getElementById('mod-folder-list');

  const modItem = document.createElement('div');
  modItem.classList.add('mod-item');

  const modContent = document.createElement('div');
  modContent.classList.add('mod-content');
  modContent.addEventListener('click', () => {
    // TODO: Dirigirte a la pagina del indice con una búsqueda del mod realizada
    // localStorage.setItem('selectedMod', mod.project_id);
    // window.location.href = 'mod-view.html';
  });
  modItem.appendChild(modContent);

  const modInfoContainer = document.createElement('div');
  modInfoContainer.classList.add('mod-info-container');
  modContent.appendChild(modInfoContainer);

  const modName = document.createElement('p');
  modName.classList.add('mod-title');
  modName.textContent = mod[0] + " - " + mod[1];
  modInfoContainer.appendChild(modName);

  const modDescription = document.createElement('p');
  modDescription.classList.add('mod-description');
  modDescription.textContent = mod[2];
  modInfoContainer.appendChild(modDescription);

  const buttonDiv = document.createElement('div');
  buttonDiv.classList.add('download-section')
  modItem.appendChild(buttonDiv);

  const downloadButton = document.createElement('button');
  downloadButton.classList.add('download-btn');
  downloadButton.textContent = 'Delete';

  downloadButton.addEventListener('click', (e) => {
    e.stopImmediatePropagation;
    window.api.deleteFile(mod[3]);
    modItem.remove();
  });
  buttonDiv.appendChild(downloadButton);


  modList.appendChild(modItem);
  modList.appendChild(document.createElement('br'));
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
