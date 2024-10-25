document.addEventListener('DOMContentLoaded', async () => {
    const config = await window.api.getConfig()
    const theme = config.theme;

    if (theme === 'dark') {
        document.body.classList.add('dark-mode');
    } else {
        document.body.classList.remove('dark-mode');
    }
});