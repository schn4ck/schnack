import fetch from 'unfetch';
import schnack_tpl from './schnack.jst.html';
import comments_tpl from './comments.jst.html';

const $ = sel => document.querySelector(sel);
const $$ = sel => document.querySelectorAll(sel);

export default class Schnack {
    constructor(options) {
        this.options = options;
        this.options.endpoint = `${options.host}/comments/${options.target}`;
        this.firstLoad = true;

        const url = new URL(options.host);

        if (url.hostname !== 'localhost') {
            document.domain = url.hostname
                .split('.')
                .slice(1)
                .join('.');
        }

        this.refresh();
    }

    refresh() {
        const { target, host, endpoint, partials } = this.options;
        const targetSelector = `#${target}`;

        fetch(endpoint, {
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json'
            }
        })
            .then(r => r.json())
            .then(data => {
                data.comments_tpl = comments_tpl;
                data.partials = partials;
                $(targetSelector).innerHTML = schnack_tpl(data);
                // console.log('data', data);

                const above = $(`${targetSelector} div.schnack-above`);
                const form = $(`${targetSelector} div.schnack-form`);
                const textarea = $(`${targetSelector} textarea.schnack-body`);
                const preview = $(`${targetSelector} .schnack-form blockquote.schnack-body`);

                const draft = window.localStorage.getItem(`schnack-draft-${target}`);
                if (draft && textarea) textarea.value = draft;

                const postBtn = $(targetSelector + ' .schnack-button');
                const previewBtn = $(targetSelector + ' .schnack-preview');
                const writeBtn = $(targetSelector + ' .schnack-write');
                const cancelReplyBtn = $(targetSelector + ' .schnack-cancel-reply');
                const replyBtns = $$(targetSelector + ' .schnack-reply');

                if (postBtn) {
                    postBtn.addEventListener('click', d => {
                        const body = textarea.value;
                        fetch(endpoint, {
                            credentials: 'include',
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json'
                            },
                            body: JSON.stringify({
                                comment: body,
                                replyTo: form.dataset.reply
                            })
                        })
                            .then(r => r.json())
                            .then(res => {
                                textarea.value = '';
                                window.localStorage.setItem(
                                    `schnack-draft-${target}`,
                                    textarea.value
                                );
                                if (res.id) {
                                    this.firstLoad = true;
                                    window.location.hash = `#comment-${res.id}~${target}`;
                                }
                                this.refresh();
                            });
                    });

                    previewBtn.addEventListener('click', d => {
                        const body = textarea.value;
                        textarea.style.display = 'none';
                        previewBtn.style.display = 'none';
                        preview.style.display = 'block';
                        writeBtn.style.display = 'inline';
                        fetch(`${host}/markdown`, {
                            credentials: 'include',
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json'
                            },
                            body: JSON.stringify({
                                comment: body
                            })
                        })
                            .then(r => r.json())
                            .then(res => {
                                preview.innerHTML = res.html;
                                // refresh();
                            });
                    });

                    writeBtn.addEventListener('click', d => {
                        textarea.style.display = 'inline';
                        previewBtn.style.display = 'inline';
                        preview.style.display = 'none';
                        writeBtn.style.display = 'none';
                    });

                    textarea.addEventListener('keyup', () => {
                        window.localStorage.setItem(`schnack-draft-${target}`, textarea.value);
                    });

                    replyBtns.forEach(btn => {
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
                    if (signout)
                        signout.addEventListener('click', e => {
                            e.preventDefault();
                            fetch(`${host}/signout`, {
                                credentials: 'include',
                                headers: {
                                    'Content-Type': 'application/json'
                                }
                            }).then(() => this.refresh());
                        });
                } else {
                    data.auth.forEach(provider => {
                        const btn = $(targetSelector + ' .schnack-signin-' + provider.id);
                        if (btn)
                            btn.addEventListener('click', d => {
                                const signin = (provider_domain = '') => {
                                    let windowRef = window.open(
                                        `${host}/auth/${provider.id}` +
                                            (provider_domain ? `/d/${provider_domain}` : ''),
                                        provider.name + ' Sign-In',
                                        'resizable,scrollbars,status,width=600,height=500'
                                    );
                                    window.__schnack_wait_for_oauth = () => {
                                        windowRef.close();
                                        window.schnackAdminInitialized = false;
                                        this.refresh();
                                    };
                                };
                                if (provider.id === 'mastodon') {
                                    // we need to ask the user what instance they want to sign on
                                    const masto_domain = window.prompt(
                                        'Please enter the domain name of the Mastodon instance you want to sign in with:',
                                        'mastodon.social'
                                    );
                                    // test if the instance is correct
                                    fetch(`https://${masto_domain}/api/v1/instance`)
                                        .then(r => r.json())
                                        .then(res => {
                                            if (res.uri === masto_domain) {
                                                // instance seems to be fine!
                                                signin(masto_domain);
                                            } else {
                                                window.alert(
                                                    `We could not find a Mastodon instance at "${masto_domain}". Please try again.`
                                                );
                                            }
                                        })
                                        .catch(err => {
                                            console.error(err);
                                            window.alert(
                                                `We could not find a Mastodon instance at "${masto_domain}". Please try again.`
                                            );
                                        });
                                } else {
                                    signin();
                                }
                            });
                    });
                }

                if (data.user && data.user.admin) {
                    if (!window.schnackPushInitialized) {
                        const push = document.createElement('script');
                        push.setAttribute('src', `${host}/push.js`);
                        document.head.appendChild(push);
                        window.schnackPushInitialized = true;
                    }

                    if (!window.schnackAdminInitialized) {
                        const action = evt => {
                            const btn = evt.target;
                            const data = btn.dataset;
                            fetch(`${host}/${data.class}/${data.target}/${data.action}`, {
                                credentials: 'include',
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json'
                                },
                                body: ''
                            }).then(() => this.refresh());
                        };
                        document.querySelectorAll('.schnack-action').forEach(btn => {
                            btn.addEventListener('click', action);
                        });
                        window.schnackAdminInitialized = true;
                    }
                }

                if (window.schnackFirstLoad && window.location.hash.match(/^#comment-\d+~.+$/)) {
                    const thread_id = window.location.hash.split(/~comments-div-(.+)/)[1];
                    comments_show(thread_id);
                    const hl = document.querySelector(window.location.hash.replace('~', '\\~'));
                    hl.scrollIntoView({ behavior: "smooth", block: "center" });
                    hl.classList.add('schnack-highlight');
                    window.schnackFirstLoad = false;
                }
            });
    }
}
