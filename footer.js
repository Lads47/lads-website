(function() {
    // 1. Detect path prefix
    var scripts = document.getElementsByTagName('script');
    var thisScript = scripts[scripts.length - 1];
    var src = thisScript.getAttribute('src') || '';
    var prefix = src.indexOf('../') === 0 ? '../' : '';

    // 2. Build footer HTML
    var footerHtml = '<div class="container">' +
        '<div class="footer-grid">' +
            '<div class="footer-brand">' +
                '<img class="footer-logo" src="' + prefix + 'images/LOGO_clair.svg" alt="Les Ateliers du Stream">' +
            '</div>' +
            '<div class="footer-col">' +
                '<h5>Navigation</h5>' +
                '<ul>' +
                    '<li><a href="' + prefix + 'solutions">Nos solutions</a></li>' +
                    '<li><a href="' + prefix + 'realisations">R\u00e9alisations</a></li>' +
                    '<li><a href="' + prefix + 'approche">Notre accompagnement</a></li>' +
                    '<li><a href="' + prefix + 'formations">Nos formations</a></li>' +
                    '<li><a href="' + prefix + 'histoire">Notre histoire</a></li>' +
                '</ul>' +
            '</div>' +
            '<div class="footer-col">' +
                '<h5>Contact</h5>' +
                '<ul>' +
                    '<li><a href="mailto:prod@lesateliersdustream.fr">prod@lesateliersdustream.fr</a></li>' +
                    '<li><a href="tel:+33661968858">06 61 96 88 58</a></li>' +
                '</ul>' +
                '<div class="footer-social-row" style="margin-top:15px">' +
                    '<a href="https://www.instagram.com/lesateliersdustream/" target="_blank" rel="noopener"><img src="' + prefix + 'images/instagram.svg" alt="Instagram"></a>' +
                    '<a href="https://www.linkedin.com/company/les-ateliers-du-stream/" target="_blank" rel="noopener"><img src="' + prefix + 'images/linkedin.svg" alt="LinkedIn"></a>' +
                '</div>' +
            '</div>' +
            '<div class="footer-col">' +
                '<h5>L\u00e9gal</h5>' +
                '<ul>' +
                    '<li><a href="#">Mentions l\u00e9gales</a></li>' +
                    '<li><a href="#">Politique de confidentialit\u00e9</a></li>' +
                '</ul>' +
            '</div>' +
        '</div>' +
        '<div class="footer-bottom">' +
            '\u00a9 2025 Les Ateliers du Stream. Tous droits r\u00e9serv\u00e9s.' +
        '</div>' +
    '</div>';

    // 5. Inject footer
    var footerEl = document.getElementById('footer');
    if (footerEl) {
        var footer = document.createElement('footer');
        footer.innerHTML = footerHtml;
        footerEl.parentNode.replaceChild(footer, footerEl);
    }

    // 6. Create back-to-top button
    var btn = document.createElement('button');
    btn.className = 'back-to-top';
    btn.id = 'backToTop';
    btn.setAttribute('aria-label', 'Retour en haut');
    btn.innerHTML = '<img src="' + prefix + 'images/noun-up-arrow-1136566.svg" alt="Haut" style="filter:brightness(0) invert(1)">';
    btn.addEventListener('click', function() {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
    document.body.appendChild(btn);

    // 7. Back-to-top scroll behavior
    window.addEventListener('scroll', function() {
        if (window.scrollY > 80) {
            btn.classList.add('visible');
        } else {
            btn.classList.remove('visible');
        }
    });

    // 8. Scroll reveal (IntersectionObserver)
    var reveals = document.querySelectorAll('.reveal');
    if (reveals.length > 0) {
        var observer = new IntersectionObserver(function(entries) {
            entries.forEach(function(entry) {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible-anim');
                }
            });
        }, { threshold: 0.15 });
        reveals.forEach(function(el) { observer.observe(el); });
    }
})();
