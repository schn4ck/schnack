import {request,json} from 'd3-request';
import comments_tpl from './comments.jst.html';
import template from 'lodash.template';

(function() {

    var script = document.querySelectorAll('script[data-schnack-target]')[0];
    if (!script) return console.warn('schnack script tag needs some data attributes');

    var opts = script.dataset,
        host = opts.schnackHost,
        target = opts.schnackTarget,
        slug = opts.schnackSlug,
        tpl = template(comments_tpl);

    function refresh() {
        json(host+'/comments/'+slug, (err, data) => {
            if (err) console.error(err);
            console.log(data);
            var html = tpl(data);
            document.querySelectorAll(target)[0].innerHTML = html;
        });
    }

    refresh();

})();
