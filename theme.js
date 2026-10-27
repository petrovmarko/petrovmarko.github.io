(function () {
    const root = document.documentElement;
    let theme = 'light';

    try {
        if (window.localStorage.getItem('theme') === 'dark') theme = 'dark';
    } catch (error) {
        theme = 'light';
    }

    root.dataset.theme = theme;

    document.addEventListener('DOMContentLoaded', function () {
        const options = document.querySelectorAll('[data-theme-option]');

        function updateControls() {
            options.forEach(function (option) {
                option.setAttribute('aria-pressed', String(option.dataset.themeOption === theme));
            });
        }

        options.forEach(function (option) {
            option.addEventListener('click', function () {
                theme = option.dataset.themeOption;
                root.dataset.theme = theme;

                try {
                    window.localStorage.setItem('theme', theme);
                } catch (error) {
                    // The theme still changes when storage is unavailable.
                }

                updateControls();
                window.dispatchEvent(new CustomEvent('themechange'));
            });
        });

        updateControls();
    });
})();
