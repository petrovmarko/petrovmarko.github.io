(function() {
    // Apply saved theme immediately
    const saved = localStorage.getItem('theme');
    if (saved) document.documentElement.setAttribute('data-theme', saved);
    else if (window.matchMedia('(prefers-color-scheme: dark)').matches)
        document.documentElement.setAttribute('data-theme', 'dark');

    // Inject toggle switch after DOM loads
    document.addEventListener('DOMContentLoaded', function() {
        const wrapper = document.createElement('div');
        wrapper.className = 'toggle-switch';

        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.id = 'theme-toggle';
        checkbox.className = 'toggle-checkbox';
        checkbox.checked = document.documentElement.getAttribute('data-theme') === 'dark';

        const label = document.createElement('label');
        label.setAttribute('for', 'theme-toggle');
        label.className = 'toggle-label';
        label.setAttribute('aria-label', 'Toggle theme');

        checkbox.addEventListener('change', function() {
            const next = checkbox.checked ? 'dark' : 'light';
            document.documentElement.setAttribute('data-theme', next);
            localStorage.setItem('theme', next);
        });

        wrapper.appendChild(checkbox);
        wrapper.appendChild(label);
        document.getElementById('name-row').appendChild(wrapper);
    });
})();
