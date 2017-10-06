import {request,json} from 'd3-request';
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
        json(endpoint, (err, data) => {
            if (err) console.error(err);
            console.log(data);
            $(target).innerHTML = comments_tpl(data);

            $(target + ' .schnack-button')
                .addEventListener('click', (d) => {
                    const body = $(`${target} .schnack-body`).value;
                    const data = { comment: body };
                    request(endpoint)
                        .mimeType('application/json')
                        .header('Content-Type', 'application/json')
                        .post(JSON.stringify(data), (err, res) => {
                            if (err) console.error(err);
                            console.log(res);
                            // todo: notify user that the comment is awaiting approval by site owner
                            refresh();
                        });
                });
        });
    }

    refresh();

})();
