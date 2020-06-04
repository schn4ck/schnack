import Schnack from './client';

(function() {
    const script = document.currentScript;
    const opts = script.dataset;
    if(!("schnackTargetClass" in opts)) {
        return console.warn('schnack script tag data attribute "data-schnack-target-class" missing');
    }
    const elements = document.querySelectorAll(opts.schnackTargetClass);
    const targets = [].map.call(elements, e => e.id);
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

    // global variable for initialization status of the push script
    window.schnackPushInitialized = false;
    // ... of the admin buttons
    window.schnackAdminInitialized = false;
    // ... scroll status
    window.schnackFirstLoad = true;

    // eslint-disable-next-line no-new
    targets.forEach(target =>
        new Schnack({
            target,
            host,
            partials
        }));
})();
