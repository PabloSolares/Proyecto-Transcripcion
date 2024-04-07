import axios from "axios";

const bytesToMegabytes = (bytes) => {
  return bytes / (1024 * 1024);
};

const audioBlobToBase64 = (blob) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const arrayBuffer = reader.result;
      const base64Audio = btoa(
        new Uint8Array(arrayBuffer).reduce(
          (data, byte) => data + String.fromCharCode(byte),
          ""
        )
      );
      resolve(base64Audio);
    };
    reader.onerror = reject;
    reader.readAsArrayBuffer(blob);
  });
};
const splitBase64Text =  (base64Text) => {
  const segmentSize = 1024 * 1024; // 1MB
    const totalSegments = Math.ceil(base64Text.length / segmentSize);
    const segmentsArray = [];

    for (let i = 0; i < totalSegments; i++) {
        const start = i * segmentSize;
        const end = Math.min(start + segmentSize, base64Text.length);
        const segment = base64Text.substring(start, end);
        segmentsArray.push(segment);
    }

    return segmentsArray;
}


const splitAndSendSegments = async (base64Text, key) => {
  const segmentSize = 1024 * 1024; // 1MB
  const totalSegments = Math.ceil(base64Text.length / segmentSize);
  const segmentsArray = [];

  for (let i = 0; i < totalSegments; i++) {
      const start = i * segmentSize;
      const end = Math.min(start + segmentSize, base64Text.length);
      const segment = base64Text.substring(start, end);
      segmentsArray.push(segment);
  }
  const promises =  splitBase64Text(base64Text).map(async (e, index) => {
    const endpoint = `https://speech.googleapis.com/v1/speech:recognize?key=${key}`;
    return await axios.post(endpoint, {
          config: {
            encoding: "MP3",
            sampleRateHertz: 48000,
            useEnhanced: true,
            enableAutomaticPunctuation: true,
            languageCode: "es-GT",
            // enableWordTimeOffsets: true
          },
          audio: {
            content: await e,
          },
        }).then(response => {
          return response.data; 
      })
      .catch(error => {
          console.error(`Error al enviar el segmento ${index}:`, error);
          throw error; 
      });
  })

  return Promise.all(promises);
}


export const transcibedAudio = async (audioFile) => {
  const apiKey = process.env.REACT_APP_APIKEY
  
  let sizeFile = bytesToMegabytes(audioFile.audio[0].size);
  let transcriptText = '';

    if (sizeFile > 1) {
      const base64Audio = await audioBlobToBase64(audioFile.audio[0]);
      const response = await splitAndSendSegments(base64Audio, apiKey)
      .then(results => {
        console.log('Todos los segmentos han sido enviados correctamente.');
        
        results.forEach((e) => {
          if (e.results && e.results.length >= 0 ) {
            for (let i = 0; i < e.results.length; i++) {
              console.log(e.results[0])

              transcriptText += e.results[i].alternatives[0].transcript; 
              
            }
          } 
        })
       
        return transcriptText
      })
        .catch((error) => {
          console.error('Ocurrió un error al enviar los segmentos:', error);
        })

    } else {
      const base64Audio = await audioBlobToBase64(audioFile.audio[0]);
      const endpoint = `https://speech.googleapis.com/v1/speech:recognize?key=${apiKey}`;
      const response = await axios.post(endpoint, {
        config: {
          encoding: "MP3",
          sampleRateHertz: 48000,
          useEnhanced: true,
          enableAutomaticPunctuation: true,
          languageCode: "es-GT",
          enableWordTimeOffsets: true
        },
        audio: {
          content: base64Audio,
        },
      });
      if (response.data?.results && response.data.results.length > 0) {
        transcriptText = response.data.results[0].alternatives[0].transcript;
      } else {
        transcriptText = "No se pudo obtener la transcripción. Intenta mas tarde";
      }
    }
  return transcriptText;
};

export default transcibedAudio;
