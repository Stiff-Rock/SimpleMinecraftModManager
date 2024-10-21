async function fetchSelectedMod() {
    try {
        const mod = JSON.parse(localStorage.getItem('selectedMod'));
        if (mod == null) {
            throw Error('Selected mod info not found in local storage');
        }
        document.getElementById('mod-view-title').textContent = mod.title;
        document.getElementById('mod-view-img').src = mod.icon_url || '../img/default-mod-icon.png';
        const response = await fetch('https://api.modrinth.com/v2/project/P7dR8mSH/version/KZS9tylY');
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching the selected mod:', error);
        alert(error.message);
    }
}


document.addEventListener('DOMContentLoaded', async () => {
    const selectedMod = await fetchSelectedMod();

    document.getElementById("download-btn").addEventListener("click", async () => {
        try {
            const url = selectedMod.files[0].url;
            const fileName = selectedMod.files[0].filename ?? path.basename(url);
            await window.api.downloadFile(url, fileName);
        } catch (error) {
            console.error('Error invoking downloadFile:', error);
            alert(`Download failed: ${error.message}`);
        }
    });
    document.getElementById("back-btn").addEventListener("click", () => {
        window.location.href = "index.html";
    });
});
