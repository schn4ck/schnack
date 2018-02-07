import fetch from 'unfetch';
import schnack_tpl from './schnack.jst.html';
import comments_tpl from './comments.jst.html';

(function() {
    let initialized = false;
    let firstLoad = true;
    const $ = (sel) => document.querySelector(sel);
    const $$ = (sel) => document.querySelectorAll(sel);
    const script = $('script[data-schnack-target]');

    if (!script) return console.warn('schnack script tag needs some data attributes');

    const opts = script.dataset;
    const slug = opts.schnackSlug;
    const url = new URL(script.getAttribute('src'));
    const host = `${url.protocol}//${url.host}`;
    const endpoint = `${host}/comments/${slug}`;
    const target = opts.schnackTarget;

    if (url.hostname != 'localhost') {
        document.domain = url.hostname.split('.').slice(1).join('.');
    }

    function refresh() {

        fetch(endpoint, {
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' }
        })
        .then( r => r.json() )
        .then((data) => {
            data.comments_tpl = comments_tpl;
            $(target).innerHTML = schnack_tpl(data);

            const above = $(`${target} div.schnack-above`);
            const form = $(`${target} div.schnack-form`);
            const textarea = $(`${target} textarea.schnack-body`);
            const preview = $(`${target} .schnack-form blockquote.schnack-body`);

            const draft = window.localStorage.getItem(`schnack-draft-${slug}`);
            if (draft && textarea) textarea.value = draft;

            const postBtn = $(target + ' .schnack-button');
            const previewBtn = $(target + ' .schnack-preview');
            const writeBtn = $(target + ' .schnack-write');
            const cancelReplyBtn = $(target + ' .schnack-cancel-reply');
            const replyBtns = $$(target + ' .schnack-reply');

            if (postBtn) {
                postBtn.addEventListener('click', (d) => {
                    const body = textarea.value;
                    fetch(endpoint, {
                        credentials: 'include',
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            comment: body,
                            replyTo: form.dataset.reply
                        })
                    })
                    .then( r => r.json() )
                    .then((res) => {
                        textarea.value = '';
                        window.localStorage.setItem(`schnack-draft-${slug}`, textarea.value);
                        if (res.id) {
                            firstLoad = true;
                            window.location.hash = '#comment-'+res.id;
                        }
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

                textarea.addEventListener('keyup', () => {
                    window.localStorage.setItem(`schnack-draft-${slug}`, textarea.value);
                });

                replyBtns.forEach((btn) => {
                    btn.addEventListener('click', () => {
                        form.dataset.reply = btn.dataset.replyTo;
                        cancelReplyBtn.style.display = 'inline-block';
                        btn.parentElement.appendChild(form);
                    });
                });

                cancelReplyBtn.addEventListener('click', () => {
                    above.appendChild(form);
                    delete form.dataset.reply;
                    cancelReplyBtn.style.display = 'none';
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
                if (!initialized) {
                    const push = document.createElement('script');
                    push.setAttribute('src', `${host}/push.js`);
                    document.head.appendChild(push);
                    initialized = true;
                }

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
                        refresh();
                    });
                };
                document.querySelectorAll('.schnack-action').forEach((btn) => {
                    btn.addEventListener('click', action);
                });
            }

            if (firstLoad && window.location.hash.match(/^#comment-\d+$/)) {
                const hl = document.querySelector(window.location.hash);
                hl.scrollIntoView();
                hl.classList.add('schnack-highlight');
                firstLoad = false;
            }
        });
    }

    refresh();

})();
