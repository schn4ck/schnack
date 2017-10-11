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

    document.domain = url.host.split('.').slice(1).join('.');

    function refresh() {

        fetch(endpoint, {
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' }
        })
        .then( r => r.json() )
        .then((data) => {
            $(target).innerHTML = comments_tpl(data);

            const textarea = $(`${target} textarea.schnack-body`);
            const preview = $(`${target} .schnack-form blockquote.schnack-body`);

            const postBtn = $(target + ' .schnack-button');
            const previewBtn = $(target + ' .schnack-preview');
            const writeBtn = $(target + ' .schnack-write');

            if (postBtn) {
                postBtn.addEventListener('click', (d) => {
                    const body = textarea.value;
                    fetch(endpoint, {
                        credentials: 'include',
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ comment: body })
                    })
                    .then( r => r.json() )
                    .then((res) => {
                        console.log(res);
                        refresh();
                    });
                });

                previewBtn.addEventListener('click', (d) => {
                    const body = textarea.value;
                    textarea.style.display = 'none';
                    previewBtn.style.display = 'none';
                    preview.style.display = 'block';
                    writeBtn.style.display = 'inline';
                    fetch(`${host}/markdown`, {
                        credentials: 'include',
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ comment: body })
                    })
                    .then( r => r.json() )
                    .then((res) => {
                        console.log(res);
                        preview.innerHTML = res.html;
                        // refresh();
                    });
                });

                writeBtn.addEventListener('click', (d) => {
                    textarea.style.display = 'inline';
                    previewBtn.style.display = 'inline';
                    preview.style.display = 'none';
                    writeBtn.style.display = 'none';
                });
            }
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
                        window.__schnack_wait_for_oauth = () => {
                            windowRef.close();
                            refresh();
                        };
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
