
function copyText() {
    // Get the textarea element

    var eng_text_selection = document.getElementById('eng_txt');

    navigator.clipboard.writeText(eng_text_selection.value)
        .then(() => {
            var tooltip = document.getElementById("myTooltip_copy");
            tooltip.innerHTML = "Copied!";
        })
        .catch(() => {
            console.log("something went wrong while copying");
        });

}

function learnData() {

}

function playAudio() {
    var tam_text = document.getElementById("tam_txt").value;
    txt_len = tam_text.length;
    if (txt_len <= 200) {
        getAudio()
        var tooltip = document.getElementById("myTooltip_play");
        tooltip.innerHTML = "Playing..";
    }
    else {
        var tooltip = document.getElementById("myTooltip_play");
        tooltip.innerHTML = "Char limit is 200!";
    }
}
function outFunc(id) {
    if (id === "submit") {
        var tooltip = document.getElementById("myTooltip_submit");
        tooltip.innerHTML = "Transliterate";
    }
    else if (id === "play_btn") {
        var tooltip = document.getElementById("myTooltip_play");
        tooltip.innerHTML = "Play Audio";
    }
    else if (id === "copy_btn") {
        var tooltip = document.getElementById("myTooltip_copy");
        tooltip.innerHTML = "Copy";
    }

}

async function getAudio() {
    // Get the text from the form
    const text = document.getElementById("tam_txt").value;

    // Send the text to the Flask server using fetch
    const response = await fetch("/translite/audio", {
        method: "POST",
        body: new URLSearchParams({ text: text }),
        headers: {
            "Content-Type": "application/x-www-form-urlencoded"
        }
    });

    // Check if the response is OK
    if (response.ok) {
        const audioBlob = await response.blob();  // Get the audio data as a Blob

        // Create a URL for the Blob and set it as the source for the hidden audio player
        const audioUrl = URL.createObjectURL(audioBlob);
        const audioPlayer = document.getElementById("audio-player");
        audioPlayer.src = audioUrl;

        // Play the audio without showing the player
        audioPlayer.play();

    } else {
        console.error("Error fetching the audio");
    }
}

document.addEventListener('DOMContentLoaded', function () {
    document.getElementById('copy_btn').addEventListener('click', copyText);

    document.getElementById('learn_btn').addEventListener('click', function () {
        fetch('/translite/learn', {
            method: 'GET'
        })
            .then(response => response.json())
            .then(data => {
                document.getElementById("tam_txt").value = "";
                document.getElementById("eng_txt").value = "";

                document.getElementById("tam_txt").value = data.tam_txt;
                document.getElementById("eng_txt").value = data.eng_txt + '\n\n' + 'meaning: ' + data.meaning;

            })
            .catch(error => {
                console.error('Error fetching data:', error);
            });
    });

    //start
    document.getElementById('submit').addEventListener('click', function () {
        tam_txt_value = document.getElementById("tam_txt").value;
        fetch('/translite/api', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ tamil_txt: tam_txt_value })
        })
            .then(response => response.json())
            .then(data => {
                document.getElementById('eng_txt').value = data.eng_text;
                var tooltip = document.getElementById("myTooltip_submit");
                tooltip.innerHTML = "Done!";
            })
            .catch(error => {
                console.error('Error fetching data:', error);
            });
    });
    //end
});