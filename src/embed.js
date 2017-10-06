import {request,json} from 'd3-request';
import comments_tpl from './comments.jst.html';

(function() {

    var $ = (sel) => document.querySelector(sel),
        script = $('script[data-schnack-target]');

    if (!script) return console.warn('schnack script tag needs some data attributes');

    var opts = script.dataset,
        slug = opts.schnackSlug,
        endpoint = opts.schnackHost+'/comments/'+slug,
        target = opts.schnackTarget;

    function refresh() {
        json(endpoint, (err, data) => {
            if (err) console.error(err);
            console.log(data);
            $(target).innerHTML = comments_tpl(data);

            $(target + ' .schnack-button')
                .addEventListener('click', (d) => {
                    var body = $(target + ' .schnack-body').value;
                    request(endpoint)
                        .mimeType('application/json')
                        .header('Content-Type', 'application/json')
                        .post(JSON.stringify(body), (err, res) => {
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
