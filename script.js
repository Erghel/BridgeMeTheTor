window.addEventListener("load", () => {
    if ("serviceWorker" in navigator) {
        navigator.serviceWorker.register("service-worker.js");
    }
});

const LIST_URL = "https://torscan-ru.ntc.party/relays.txt";

const gettor = () => {
    return fetch(LIST_URL);
};

const gettor_corsproxy1 = () => {
    return fetch(`https://corsanywhere.herokuapp.com/${LIST_URL}`);
};

const gettor_corsproxy2 = () => {
    return fetch(`https://tauron.herokuapp.com/${LIST_URL}`);
};

const gettor_corsproxy3 = () => {
    return fetch(`https://corsbypasser.herokuapp.com/${LIST_URL}`);
};

const process_data = (result) => {
    document.getElementById("working").value = result;
};

const do_everything = (datafunc) => {
    return datafunc().then(result => {
        return result.text();
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
                do_everything(gettor_corsproxy2)
                    .catch(error => {
                        console.log(error);
                        do_everything(gettor_corsproxy3);
                    });
            });
    });
