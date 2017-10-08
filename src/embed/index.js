import fetch from 'unfetch';
import comments_tpl from './comments.jst.html';

(function() {
    const $ = (sel) => document.querySelector(sel);
    const script = $('script[data-schnack-target]');

    if (!script) return console.warn('schnack script tag needs some data attributes');

    const opts = script.dataset;
    const slug = opts.schnackSlug;
    const url = new URL(script.getAttribute('src'));
    const host = `${url.protocol}//${url.host}`;
    const endpoint = `${host}/comments/${slug}`;
    const target = opts.schnackTarget;

    function refresh() {
        fetch(endpoint, {
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' }
        })
        .then( r => r.json() )
        .then((data) => {
            $(target).innerHTML = comments_tpl(data);

            const postBtn = $(target + ' .schnack-button');

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
                    console.log(res);
                    refresh();
                });
            });

            if (data.user) {
                const signout = $('a.schnack-signout');
                if (signout) signout.addEventListener('click', (e) => {
                    e.preventDefault();
                    fetch(`${host}/signout`, {
                        credentials: 'include',
                        headers: { 'Content-Type': 'application/json' },
                    })
                    .then( r => r.json() )
                    .then((res) => {
                        console.log(res);
                        refresh();
                    });
                });
            } else {
                data.auth.forEach((provider) => {
                    const btn = $(target + ' .schnack-signin-'+provider.id);
                    if (btn) btn.addEventListener('click', (d) => {
                        let windowRef = window.open(
                            `${host}/auth/${provider.id}`, provider.name+' Sign-In', 'resizable,scrollbars,status,width=600,height=500'
                        );
                        windowRef.onbeforeunload = refresh();
                    });
                });
            }

            if (data.user && data.user.admin) {
                const action = (evt) => {
                    const btn = evt.target;
                    const data = btn.dataset;
                    fetch(`${host}/${data.class}/${data.target}/${data.action}`, {
                        credentials: 'include',
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: ''
                    })
                    .then( r => r.json() )
                    .then((res) => {
                        console.log(res);
                        refresh();
                    });
                };
                document.querySelectorAll('.schnack-action').forEach((btn) => {
                    btn.addEventListener('click', action);
                });
            }
        });
    }

    refresh();

})();
