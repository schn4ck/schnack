import fetch from 'unfetch';
import comments_tpl from './comments.jst.html';

(function() {
    const $ = (sel) => document.querySelector(sel);
    const script = $('script[data-schnack-target]');

    if (!script) return console.warn('schnack script tag needs some data attributes');

    const opts = script.dataset;
    const slug = opts.schnackSlug;
    const endpoint = `${opts.schnackHost}/comments/${slug}`;
    const target = opts.schnackTarget;

    function refresh() {
        fetch(endpoint, {
            withCredentials: true,
            headers: { 'Content-Type': 'application/json' }
        })
        .then( r => r.json() )
        .then((data) => {
            console.log(data);
            $(target).innerHTML = comments_tpl(data);

            $(target + ' .schnack-button').addEventListener('click', (d) => {
                const body = $(`${target} .schnack-body`).value;
                const data = { comment: body };
                fetch(endpoint, {
                    withCredentials: true,
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data)
                })
                .then( r => r.json() )
                .then((res) => {
                    console.log(res.json());
                    refresh();
                });
            });
        });
    }

    refresh();

})();
