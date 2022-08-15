const speech = require('@google-cloud/speech');
const fs = require('fs');

async function speechToText(audioBytes) {
    let data = null

    const client = new speech.SpeechClient();
    // const fileName = './taimoor.wav';

    // const file = fs.readFileSync(fileName);
    // const audioBytes = file.toString('base64');

    const audio = {
        content: audioBytes,
    }
    const config = {
        enableWordTimeOffsets: true,
        enableAutomaticPunctuation: true,
        encoding: 'LINEAR16',
        sampleRateHertz: 44100,
        languageCode: 'ur-PK',
        audioChannelCount: 2,


    }
    const request = {
        audio: audio,
        config: config,

    }
    const [operation] = await client.longRunningRecognize(request);

    // Get a Promise representation of the final result of the job
    const [response] = await operation.promise();
    let word_time = [];
    response.results.forEach(result => {
        // console.log(`Transcription: ${result.alternatives[0].transcript}`);
        result.alternatives[0].words.forEach(wordInfo => {
            // NOTE: If you have a time offset exceeding 2^32 seconds, use the
            // wordInfo.{x}Time.seconds.high to calculate seconds.
            const startSecs =
                `${wordInfo.startTime.seconds}`
            const endSecs =
                `${wordInfo.endTime.seconds}` +
                '.' +
                wordInfo.endTime.nanos / 100000000;
            // store in word and time in output.txt
            word_time.push({
                end: endSecs,
                start: startSecs,
                text: wordInfo.word,

            });

        });
    });
    // console.log(word_time);
    data = word_time;

    return await formatData(data)

}
// speechToText().catch(console.error);
async function formatData(data) {
    // let fileName = "output.txt"
    // let data = fs.readFileSync(fileName);
    // data = JSON.parse(data);
    const word1 = "ہیں";
    const word2 = "ہے";
    let newData = [];
    let i = 0;

    for (let i = 0; i < data.length; i++) {
        if (data[i].text == word1) {
            data[i - 1].text = data[i - 1].text + " " + data[i].text
            data[i - 1].end = data[i].end;
            data.splice(i, 1)
            i--;
        }
        if (data[i].text == word2) {
            data[i - 1].text = data[i - 1].text + " " + data[i].text;
            data[i - 1].end = data[i].end;
            data.splice(i, 1)
            i--;
        }
    }
    // console.log(data);


    // get all elements with same start time///////////////////////////
    for (let i = 0; i < data.length; i++) {
        let start = data[i].start;
        let end = data[i].end;
        let text = data[i].text;
        let j = i + 1;
        while (j < data.length && data[j].start == start) {
            end = data[j].end;
            text = text + " " + data[j].text;
            j++;
        }
        let start_new = ""
        if (i == 0) {
            start_new = "0.0"
        }
        else {
            start_new = data[i - 1].end
        }
        newData.push({
            end: end,
            start: start_new,
            text: text,
            type: 0
        });
        i = j - 1;
    }

    ////////////////////////////////////////////////////////////////
    return newData;
}

const converter = async (req, res) => {
    const data = req.file
    // console.log("Called", data);
    const audioBytes = data.buffer.toString('base64');
    const ret = await speechToText(audioBytes);
    res.send(ret);
}

module.exports = {
    converter
}