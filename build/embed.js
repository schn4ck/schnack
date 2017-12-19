(function () {
'use strict';

var index = typeof fetch=='function' ? fetch.bind() : function(url, options) {
	options = options || {};
	return new Promise( function (resolve, reject) {
		var request = new XMLHttpRequest();

		request.open(options.method || 'get', url);

		for (var i in options.headers) {
			request.setRequestHeader(i, options.headers[i]);
		}

		request.withCredentials = options.credentials=='include';

		request.onload = function () {
			resolve(response());
		};

		request.onerror = reject;

		request.send(options.body);

		function response() {
			var keys = [],
				all = [],
				headers = {},
				header;

			request.getAllResponseHeaders().replace(/^(.*?):\s*([\s\S]*?)$/gm, function (m, key, value) {
				keys.push(key = key.toLowerCase());
				all.push([key, value]);
				header = headers[key];
				headers[key] = header ? (header + "," + value) : value;
			});

			return {
				ok: (request.status/200|0) == 1,		// 200-299
				status: request.status,
				statusText: request.statusText,
				url: request.responseURL,
				clone: response,
				text: function () { return Promise.resolve(request.responseText); },
				json: function () { return Promise.resolve(request.responseText).then(JSON.parse); },
				blob: function () { return Promise.resolve(new Blob([request.response])); },
				headers: {
					keys: function () { return keys; },
					entries: function () { return all; },
					get: function (n) { return headers[n.toLowerCase()]; },
					has: function (n) { return n.toLowerCase() in headers; }
				}
			};
		}
	});
};

var schnack_tpl = function(data) {
var __t, __p = '';
if (data.user) { 
__p += '\n    ';
 if (data.user.admin) { 
__p += '\n    <div class="schnack-settings">\n        <button class="schnack-action" data-target="notification" data-class="setting" data-action="true">un</button>\n        <button class="schnack-action" data-target="notification" data-class="setting" data-action="false">mute notifications</button>\n    </div>\n    ';
 } 
__p += '\n<div class="schnack-above">\n    <div class="schnack-form">\n        <textarea class="schnack-body" placeholder="Post a comment. Markdown is supported!"></textarea>\n        <blockquote class="schnack-body" style="display:none"></blockquote>\n        <br>\n        <button class="schnack-preview">Preview</button>\n        <button style="display:none" class="schnack-write">Edit</button>&nbsp;\n        <button class="schnack-button">Send comment</button>&nbsp;\n        <button class="schnack-cancel-reply" style="display:none">Cancel</button>\n    </div>\n</div>\n(signed in as <span class="schnack-user">@' +
((__t = ( data.user.name )) == null ? '' : __t) +
'</span> :: <a class="schnack-signout" href="#">sign out</a>)\n\n';
 } else { 
__p += '\nTo post a comment you need to sign in via<br>\n';
 data.auth.forEach(function (provider, i) {  
__p += '\n    ' +
((__t = ( i ? ' or ' : '' )) == null ? '' : __t) +
'<button class="schnack-signin-' +
((__t = ( provider.id )) == null ? '' : __t) +
'"><i class="icon schnack-icon-' +
((__t = ( provider.id )) == null ? '' : __t) +
'"></i> ' +
((__t = ( provider.name )) == null ? '' : __t) +
'</button>\n';
 }) ;
__p += '\n';
 } 
__p += '\n';

var comments = [];
data.replies = {};
data.comments.forEach(function (comment) {
    if (comment.reply_to) {
        if (!data.replies[comment.reply_to]) { data.replies[comment.reply_to] = []; }
        data.replies[comment.reply_to].push(comment);
    } else {
        comments.push(comment);
    }
});
data.comments = comments;

__p += '\n' +
((__t = ( data.comments_tpl(data) )) == null ? '' : __t) +
'\n<style type="text/css">\n.schnack-action > * { pointer-events: none; }\n</style>';
return __p
};

var comments_tpl = function(data) {
var __t, __p = '';
console.log('comments tpl', data);

__p += '\n<ul class="schnack-comments">\n    ';
 data.comments.forEach(function (comment) { 
__p += '\n        <li id="comment-' +
((__t = ( comment.id )) == null ? '' : __t) +
'" data-id="' +
((__t = ( comment.id )) == null ? '' : __t) +
'" class="schnack-comment';
 if (!comment.approved && !comment.trusted) { 
__p += ' schnack-not-approved';
 } 
__p += '">\n            <div class="schnack-dateline">\n                <span class="schnack-author">';
 if (comment.author_url) { 
__p += '<a href="' +
((__t = ( comment.author_url )) == null ? '' : __t) +
'" target="_blank">';
 } 
__p +=
((__t = ( comment.display_name || comment.name )) == null ? '' : __t);
 if (comment.author_url) { 
__p += '</a>';
 } 
__p += '</span>\n                ';
 if (data.user && data.user.admin &&!comment.trusted) {
                ['trust', 'block'].forEach(function (action) { 
__p += '\n                <button class="schnack-action" data-target="' +
((__t = ( comment.user_id )) == null ? '' : __t) +
'" data-class="user" data-action="' +
((__t = ( action )) == null ? '' : __t) +
'"><i class="icon schnack-icon-' +
((__t = ( action )) == null ? '' : __t) +
'"></i> <span>' +
((__t = ( action )) == null ? '' : __t) +
'</span></button>\n                ';
 }); } 
__p += '\n                <span class="schnack-date"><a href="#comment-' +
((__t = ( comment.id )) == null ? '' : __t) +
'">' +
((__t = ( comment.created_at_s )) == null ? '' : __t) +
'</a></span>\n            </div>\n            <blockquote class="schnack-body">\n                ' +
((__t = ( comment.comment )) == null ? '' : __t) +
'\n            </blockquote>\n            ';
 if (!comment.approved && !comment.trusted) { 
__p += '\n            <div class="schnack-awaiting-approval">\n                ';
 if (data.user && data.user.admin) {
                ['approve', 'reject'].forEach(function (action) { 
__p += '\n                <button class="schnack-action" data-target="' +
((__t = ( comment.id )) == null ? '' : __t) +
'" data-class="comment" data-action="' +
((__t = ( action )) == null ? '' : __t) +
'"><i class="icon schnack-icon-' +
((__t = ( action )) == null ? '' : __t) +
'"></i> <span>' +
((__t = ( action )) == null ? '' : __t) +
'</span></button>\n                ';
 }); } 
__p += '\n                ' +
((__t = ( data.user.admin ? 'This' : 'Your' )) == null ? '' : __t) +
' comment is still waiting for ' +
((__t = ( data.user.admin ? 'your ' : '' )) == null ? '' : __t) +
'approval' +
((__t = ( !data.user.admin ? ' by the site owner' : '')) == null ? '' : __t) +
'.\n            </div>\n            ';
 } else if (data.user) { 
__p += '\n            <button class="schnack-reply" data-reply-to="' +
((__t = ( comment.id )) == null ? '' : __t) +
'">reply</button>\n            ';
 } 
__p += '\n            ';
 if (data.replies[comment.id]) {
            data.comments = data.replies[comment.id];
            
__p += '\n            ' +
((__t = ( data.comments_tpl(data) )) == null ? '' : __t) +
'\n            ';
 } 
__p += '\n        </li>\n    ';
 }) ;
__p += '\n</ul>\n';
return __p
};

(function() {
    var initialized = false;
    var firstLoad = true;
    var $ = function (sel) { return document.querySelector(sel); };
    var $$ = function (sel) { return document.querySelectorAll(sel); };
    var script = $('script[data-schnack-target]');

    if (!script) { return console.warn('schnack script tag needs some data attributes'); }

    var opts = script.dataset;
    var slug = opts.schnackSlug;
    var url = new URL(script.getAttribute('src'));
    var host = (url.protocol) + "//" + (url.host);
    var endpoint = host + "/comments/" + slug;
    var target = opts.schnackTarget;

    if (url.hostname != 'localhost') {
        document.domain = url.hostname.split('.').slice(1).join('.');
    }

    function refresh() {

        index(endpoint, {
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' }
        })
        .then( function (r) { return r.json(); } )
        .then(function (data) {
            data.comments_tpl = comments_tpl;
            $(target).innerHTML = schnack_tpl(data);

            var above = $((target + " div.schnack-above"));
            var form = $((target + " div.schnack-form"));
            var textarea = $((target + " textarea.schnack-body"));
            var preview = $((target + " .schnack-form blockquote.schnack-body"));

            var draft = window.localStorage.getItem(("schnack-draft-" + slug));
            if (draft && textarea) { textarea.value = draft; }

            var postBtn = $(target + ' .schnack-button');
            var previewBtn = $(target + ' .schnack-preview');
            var writeBtn = $(target + ' .schnack-write');
            var cancelReplyBtn = $(target + ' .schnack-cancel-reply');
            var replyBtns = $$(target + ' .schnack-reply');

            if (postBtn) {
                postBtn.addEventListener('click', function (d) {
                    var body = textarea.value;
                    index(endpoint, {
                        credentials: 'include',
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            comment: body,
                            replyTo: form.dataset.reply
                        })
                    })
                    .then( function (r) { return r.json(); } )
                    .then(function (res) {
                        console.log(res);
                        textarea.value = '';
                        window.localStorage.setItem(("schnack-draft-" + slug), textarea.value);
                        if (res.id) {
                            firstLoad = true;
                            window.location.hash = '#comment-'+res.id;
                        }
                        refresh();
                    });
                });

                previewBtn.addEventListener('click', function (d) {
                    var body = textarea.value;
                    textarea.style.display = 'none';
                    previewBtn.style.display = 'none';
                    preview.style.display = 'block';
                    writeBtn.style.display = 'inline';
                    index((host + "/markdown"), {
                        credentials: 'include',
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ comment: body })
                    })
                    .then( function (r) { return r.json(); } )
                    .then(function (res) {
                        console.log(res);
                        preview.innerHTML = res.html;
                        // refresh();
                    });
                });

                writeBtn.addEventListener('click', function (d) {
                    textarea.style.display = 'inline';
                    previewBtn.style.display = 'inline';
                    preview.style.display = 'none';
                    writeBtn.style.display = 'none';
                });

                textarea.addEventListener('keyup', function () {
                    window.localStorage.setItem(("schnack-draft-" + slug), textarea.value);
                });

                replyBtns.forEach(function (btn) {
                    btn.addEventListener('click', function () {
                        form.dataset.reply = btn.dataset.replyTo;
                        cancelReplyBtn.style.display = 'inline-block';
                        btn.parentElement.appendChild(form);
                    });
                });

                cancelReplyBtn.addEventListener('click', function () {
                    above.appendChild(form);
                    delete form.dataset.reply;
                    cancelReplyBtn.style.display = 'none';
                });
            }
            if (data.user) {
                var signout = $('a.schnack-signout');
                if (signout) { signout.addEventListener('click', function (e) {
                    e.preventDefault();
                    index((host + "/signout"), {
                        credentials: 'include',
                        headers: { 'Content-Type': 'application/json' },
                    })
                    .then( function (r) { return r.json(); } )
                    .then(function (res) {
                        console.log(res);
                        refresh();
                    });
                }); }
            } else {
                data.auth.forEach(function (provider) {
                    var btn = $(target + ' .schnack-signin-'+provider.id);
                    if (btn) { btn.addEventListener('click', function (d) {
                        var windowRef = window.open(
                            (host + "/auth/" + (provider.id)), provider.name+' Sign-In', 'resizable,scrollbars,status,width=600,height=500'
                        );
                        window.__schnack_wait_for_oauth = function () {
                            windowRef.close();
                            refresh();
                        };
                    }); }
                });
            }

            if (data.user && data.user.admin) {
                if (!initialized) {
                    var push = document.createElement('script');
                    push.setAttribute('src', (host + "/push.js"));
                    document.head.appendChild(push);
                    initialized = true;
                }

                var action = function (evt) {
                    var btn = evt.target;
                    var data = btn.dataset;
                    index((host + "/" + (data.class) + "/" + (data.target) + "/" + (data.action)), {
                        credentials: 'include',
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: ''
                    })
                    .then( function (r) { return r.json(); } )
                    .then(function (res) {
                        console.log(res);
                        refresh();
                    });
                };
                document.querySelectorAll('.schnack-action').forEach(function (btn) {
                    btn.addEventListener('click', action);
                });
            }

            if (firstLoad && window.location.hash.match(/^#comment-\d+$/)) {
                var hl = document.querySelector(window.location.hash);
                hl.scrollIntoView();
                hl.classList.add('schnack-highlight');
                firstLoad = false;
            }
        });
    }

    refresh();

})();

}());
