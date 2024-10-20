async function fetchMods() {
    try {
        const response = await fetch('https://staging-api.modrinth.com/v2/search');
        const data = await response.json();
        const mods = data.hits; 

        const modList = document.getElementById('modList');
        modList.innerHTML = '';

        mods.forEach(mod => {
            const modItem = document.createElement('div');
            modItem.classList.add('mod-item');

            const modImg = document.createElement('img');
            modImg.src = mod.icon_url;
            modImg.classList.add('mod-img');
            modItem.appendChild(modImg);

            const modName = document.createElement('p');
            modName.classList.add('mod-title');
            modName.textContent = mod.title;
            modItem.appendChild(modName);

            modList.appendChild(modItem);
        })
    } catch (error) {
        console.error('Error fetching mods:', error);
    }
}

// Call the function when the page loads
document.addEventListener('DOMContentLoaded', fetchMods);


document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('setPathBtn').addEventListener('click', async () => {
        console.log('Set Path Button clicked');
        const path = await window.api.setDownloadPath()
        console.log('Selected path:', path);
        if (path) {
            alert(`Download path set to: ${path}`)
        } else {
            alert('Download path selection was canceled.')
        }
    })

    fetchMods()
})