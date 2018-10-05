import Schnack from './client';

(function() {
    const script = document.querySelector('script[data-schnack-target]');
    if (!script) return console.warn('schnack script tag needs some data attributes');

    const opts = script.dataset;
    const slug = opts.schnackSlug;
    const dateFormat = opts.dateFormat || 'MMMM DD, YYYY - h:mm a';
    const url = new URL(script.getAttribute('src'));
    const host = `${url.protocol}//${url.host}`;

    new Schnack({
        target: opts.schnackTarget,
        slug,
        dateFormat,
        host
    });
})();
