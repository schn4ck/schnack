/* globals btoa, fetch, Notification */
// Vapid public key.
const applicationServerPublicKey = '%VAPID_PUBLIC_KEY%';
const schnack_host = '%SCHNACK_HOST%';

const serviceWorkerName = '/sw.js';

let isSubscribed = false;
let swRegistration = null;

(function() {
    Notification.requestPermission().then(function(status) {
        if (status === 'granted') {
            initialiseServiceWorker();
        }
    });
})();

function initialiseServiceWorker() {
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker
            .register(serviceWorkerName)
            .then(handleSWRegistration)
            .catch(err => console.error(err));
    } else {
        console.error("Service workers aren't supported in this browser.");
    }
}

function handleSWRegistration(reg) {
    swRegistration = reg;
    initialiseState(reg);
}

// Once the service worker is registered set the initial state
function initialiseState(reg) {
    // Are Notifications supported in the service worker?
    if (!reg.showNotification) {
        console.error("Notifications aren't supported on service workers.");
        return;
    }

    // Check if push messaging is supported
    if (!('PushManager' in window)) {
        console.error("Push messaging isn't supported.");
        return;
    }

    // We need the service worker registration to check for a subscription
    navigator.serviceWorker.ready.then(function(reg) {
        // Do we already have a push message subscription?
        reg.pushManager
            .getSubscription()
            .then(subscription => {
                if (!subscription) {
                    isSubscribed = false;
                    subscribe();
                } else {
                    // initialize status, which includes setting UI elements for subscribed status
                    // and updating Subscribers list via push
                    isSubscribed = true;
                }
            })
            .catch(err => {
                console.error('Error during getSubscription()', err);
            });
    });
}

function subscribe() {
    navigator.serviceWorker.ready.then(function(reg) {
        const subscribeParams = { userVisibleOnly: true };

        // Setting the public key of our VAPID key pair.
        const applicationServerKey = urlB64ToUint8Array(applicationServerPublicKey);
        subscribeParams.applicationServerKey = applicationServerKey;

        reg.pushManager
            .subscribe(subscribeParams)
            .then(subscription => {
                // Update status to subscribe current user on server, and to let
                // other users know this user has subscribed
                const endpoint = subscription.endpoint;
                const key = subscription.getKey('p256dh');
                const auth = subscription.getKey('auth');
                sendSubscriptionToServer(endpoint, key, auth);
                isSubscribed = true;
            })
            .catch(err => {
                // A problem occurred with the subscription.
                console.error('Unable to subscribe to push.', err);
            });
    });
}

function unsubscribe() {
    let endpoint = null;
    swRegistration.pushManager
        .getSubscription()
        .then(subscription => {
            if (subscription) {
                endpoint = subscription.endpoint;
                return subscription.unsubscribe();
            }
        })
        .catch(error => {
            console.error('Error unsubscribing', error);
        })
        .then(() => {
            removeSubscriptionFromServer(endpoint);

            console.error('User is unsubscribed.');
            isSubscribed = false;
        });
}

function sendSubscriptionToServer(endpoint, key, auth) {
    const encodedKey = btoa(String.fromCharCode.apply(null, new Uint8Array(key)));
    const encodedAuth = btoa(String.fromCharCode.apply(null, new Uint8Array(auth)));

    fetch(schnack_host + '/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ publicKey: encodedKey, auth: encodedAuth, endpoint })
    }).then(res => {
        // eslint-disable-next-line no-console
        console.log('Subscribed successfully! ' + JSON.stringify(res));
    });
}

function removeSubscriptionFromServer(endpoint) {
    const encodedKey = btoa(String.fromCharCode.apply(null, new Uint8Array(key)));
    const encodedAuth = btoa(String.fromCharCode.apply(null, new Uint8Array(auth)));

    fetch(schnack_host + '/unsubscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ publicKey: encodedKey, auth: encodedAuth, endpoint })
    }).then(res => {
        // eslint-disable-next-line no-console
        console.log('Unsubscribed successfully! ' + JSON.stringify(res));
    });
}

function urlB64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
}
