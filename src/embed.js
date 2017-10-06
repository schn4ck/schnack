import fetch from 'unfetch';
import comments_tpl from './comments.jst.html';

(function() {
    const $ = (sel) => document.querySelector(sel);
    const script = $('script[data-schnack-target]');

    if (!script) return console.warn('schnack script tag needs some data attributes');

    const opts = script.dataset;
    const slug = opts.schnackSlug;
    const host = opts.schnackHost;
    const endpoint = `${host}/comments/${slug}`;
    const loginTwitter = `${host}/auth/twitter`;
    const target = opts.schnackTarget;

    function refresh() {
        fetch(endpoint, {
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' }
        })
        .then( r => r.json() )
        .then((data) => {
            console.log(data);
            $(target).innerHTML = comments_tpl(data);

            const postBtn = $(target + ' .schnack-button');
            const twitterBtn = $(target + ' .schnack-signin-twitter');

            if (twitterBtn) twitterBtn.addEventListener('click', (d) => {
                let windowRef = window.open(
                    loginTwitter, 'Twitter Sign-In', 'resizable,scrollbars,status,width=600,height=500'
                );
            });

            if (postBtn) postBtn.addEventListener('click', (d) => {
                const body = $(`${target} .schnack-body`).value;
                const data = { comment: body };
                fetch(endpoint, {
                    credentials: 'include',
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
