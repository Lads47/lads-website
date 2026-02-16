(function() {
    // 1. Detect path prefix from script src attribute
    var scripts = document.getElementsByTagName('script');
    var thisScript = scripts[scripts.length - 1];
    var src = thisScript.getAttribute('src') || '';
    var prefix = src.indexOf('../') === 0 ? '../' : '';

    // 2. Detect home page
    var isHome = document.body.classList.contains('home');

    // 4. Detect active page
    var path = window.location.pathname.replace(/\\/g, '/');
    var filename = path.split('/').pop() || 'index';
    var parts = path.split('/').filter(function(p) { return p; });
    var parentDir = parts.length >= 2 ? parts[parts.length - 2] : '';

    var activeFile = filename;
    if (parentDir === 'solutions') activeFile = 'solutions';
    else if (parentDir === 'realisations') activeFile = 'realisations';
    else if (parentDir === 'formations') activeFile = 'formations';

    // 5. Build nav
    var navItems = [
        { href: prefix + 'solutions.html',    text: 'Nos solutions',       file: 'solutions' },
        { href: prefix + 'realisations.html',  text: 'Nos r\u00e9alisations', file: 'realisations' },
        { href: prefix + 'approche.html', text: 'Notre accompagnement', file: 'approche' },
        { href: prefix + 'formations.html',    text: 'Nos formations',      file: 'formations' },
        { href: prefix + 'histoire.html',    text: 'Notre histoire',      file: 'histoire' },
        { href: '#contact',                         text: 'Nous contacter',      file: null }
    ];

    var navHtml = '<ul>';
    for (var i = 0; i < navItems.length; i++) {
        var item = navItems[i];
        var cls = (!isHome && item.file && item.file === activeFile) ? ' class="active"' : '';
        navHtml += '<li><a href="' + item.href + '"' + cls + '>' + item.text + '</a></li>';
    }
    navHtml += '</ul>';

    // 6. Build logo
    var logoHtml;
    if (isHome) {
        logoHtml = '<a href="#" class="logo">' +
            '<img src="images/LOGO_clair.svg" alt="Les Ateliers du Stream" class="logo-light">' +
            '<img src="images/LOGO_fonce.svg" alt="Les Ateliers du Stream" class="logo-dark">' +
            '</a>';
    } else {
        logoHtml = '<a href="' + prefix + 'index.html" class="logo">' +
            '<img src="' + prefix + 'images/LOGO_fonce.svg" alt="Les Ateliers du Stream">' +
            '</a>';
    }

    // 7. Inject header HTML
    var headerEl = document.getElementById('header');
    if (headerEl) {
        headerEl.innerHTML = '<div class="header-inner">' +
            logoHtml +
            '<button class="menu-toggle" aria-label="Menu">' +
            '<span></span><span></span><span></span></button>' +
            '<nav>' + navHtml + '</nav></div>';

        // Menu toggle
        var toggle = headerEl.querySelector('.menu-toggle');
        toggle.addEventListener('click', function() {
            headerEl.querySelector('nav').classList.toggle('active');
        });
    }

    // 8. Home page scroll behavior
    if (isHome && headerEl) {
        window.addEventListener('scroll', function() {
            if (window.scrollY > 80) {
                headerEl.classList.add('scrolled');
            } else {
                headerEl.classList.remove('scrolled');
            }
        });
    }
})();
