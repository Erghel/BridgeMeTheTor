const ONIONOO_URL = "https://onionoo.torproject.org/details?type=relay&running=true&fields=fingerprint,or_addresses";

const fetchWithTimeout = (uri, options = {}, time = 10000) => {
    const controller = new AbortController();
    const config = { ...options, signal: controller.signal };

    const timeout = setTimeout(() => {
        controller.abort()
    }, time);

    return fetch(uri, config);
};

const check_port = (hostport) => {
    // from https://searchfox.org/mozilla-central/source/netwerk/base/nsIOService.cpp
    let badports = [1, 7, 9, 11, 13, 15, 17, 19, 20, 21, 22, 23, 25, 37, 42, 43, 53, 69, 77, 79, 87,
        95, 101, 102, 103, 104, 109, 110, 111, 113, 115, 117, 119, 123, 135, 137, 139, 143, 161, 179,
        389, 427, 465, 512, 513, 514, 515, 526, 530, 531, 532, 540, 548, 554, 556, 563, 587, 601, 636,
        989, 990, 993, 995, 1719, 1720, 1723, 2049, 3659, 4045, 5060, 5061, 6000, 6566, 6665, 6666,
        6667, 6668, 6669, 6697, 10080];

    let url = new URL(`https://${hostport}`);

    return !badports.includes(parseInt(url.port));
};

const check = (hostport, fingerprint) => {
    fetchWithTimeout(`https://${hostport}`)
        .then((response) => document.getElementById("result").innerText = response)
        .catch((error) => {
            const line = `${hostport} ${fingerprint}\n`;

            if (error.name === 'AbortError') {
                document.getElementById("notworking").value += line;
            } else {
                document.getElementById("working").value += line;
            }
        })
};

const gettor = () => {
    return fetch(ONIONOO_URL);
};

const gettor_corsproxy1 = () => {
    return fetch(`https://jsonp.afeld.me/?url=${encodeURIComponent(ONIONOO_URL)}`);
};

const gettor_corsproxy2 = () => {
    return fetch(`https://corsanywhere.herokuapp.com/${encodeURIComponent(ONIONOO_URL)}`);
};

const process_data = (result) => {
    let relays = result.relays;
    let new_relays = [];

    for (let i = 0; i < 30; i++) {
        new_relays.push(relays[Math.floor(Math.random() * relays.length)]);
    }

    for (let relay of new_relays) {
        for (let address of relay.or_addresses) {
            if (address.search("\\[") === -1 && check_port(address)) {
                // skip ipv6 because js can't detect unavailability reason
                check(address, relay.fingerprint);
            }
        }
    }
};

const do_everything = (datafunc) => {
    return datafunc().then(result => {
        return result.json();
    }).then(result => {
        process_data(result);
    });
};


do_everything(gettor)
    .catch(error => {
        console.log(error);

        do_everything(gettor_corsproxy1)
            .catch(error => {
                console.log(error);
                do_everything(gettor_corsproxy2);
            });
    });
