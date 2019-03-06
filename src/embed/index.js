import Schnack from './client';

(function() {
    const script = document.querySelector('script[data-schnack-target]');
    if (!script) return console.warn('schnack script tag needs some data attributes');

    const opts = script.dataset;
    const slug = opts.schnackSlug;
    const url = new URL(script.getAttribute('src'));
    const host = `${url.protocol}//${url.host}`;
    const partials = {
        Preview: `Preview`,
        Edit: `Edit`,
        SendComment: `Send comment`,
        Cancel: `Cancel`,
        Or: `Or`,
        Mute: `mute notifications`,
        UnMute: `unmute`,
        PostComment: `Post a comment. Markdown is supported!`,
        AdminApproval: `This comment is still waiting for your approval`,
        WaitingForApproval: `Your comment is still waiting for approval by the site owner`,
        SignInVia: `To post a comment you need to sign in via`,
        Reply: `<i class='icon schnack-icon-reply'></i> reply`,
        LoginStatus:
            "(signed in as <span class='schnack-user'>@%USER%</span> :: <a class='schnack-signout' href='#'>sign out</a>)"
    };

    Object.keys(partials).forEach(k => {
        if (script.dataset[`schnackPartial${k}`])
            partials[k] = script.dataset[`schnackPartial${k}`];
    });

    // eslint-disable-next-line no-new
    new Schnack({
        target: opts.schnackTarget,
        slug,
        host,
        partials
    });
})();
