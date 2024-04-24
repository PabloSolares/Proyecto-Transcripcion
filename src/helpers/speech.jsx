import axios from "axios";

// Función auxiliar para convertir bytes a megabytes
const bytesToMegabytes = (bytes) => {
  return bytes / (1024 * 1024);
};
// Función auxiliar para convertir un blob de audio
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

// Función auxiliar para dividir un texto base64 en segmentos
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

// Función para dividir un texto base64 de audio en segmentos y enviarlos a la API
const splitAndSendSegments = async (base64Text, key, lan) => {
  const segmentSize = 1024 * 1024; // 1MB
  const totalSegments = Math.ceil(base64Text.length / segmentSize);
  const segmentsArray = [];
  // Dividir el texto base64 en segmentos
  for (let i = 0; i < totalSegments; i++) {
      const start = i * segmentSize;
      const end = Math.min(start + segmentSize, base64Text.length);
      const segment = base64Text.substring(start, end);
      segmentsArray.push(segment);
  }
   // Mapear cada segmento a una Promesa para enviarlo a la API
  const promises =  splitBase64Text(base64Text).map(async (e, index) => {
    const endpoint = `https://speech.googleapis.com/v1/speech:recognize?key=${key}`;
    return await axios.post(endpoint, {
          config: {
            encoding: "MP3",
            sampleRateHertz: 48000,
            useEnhanced: true,
            enableAutomaticPunctuation: true,
            languageCode: lan,
            enableWordTimeOffsets: true
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
// Esperar a que todos los segmentos se procesen y devolver los resultados
  return Promise.all(promises);
}


export const transcibedAudio = async (audioFile) => {
  const apiKey = "AIzaSyA17EgR12viKVmi00ZjTWL0HYVP_pZpZyc";
  let sizeFile = bytesToMegabytes(audioFile.audio[0].size);
  let transcriptText = '';
 // Verificar si el tamaño del archivo es mayor que 1MB
    if (sizeFile > 1) {
      // Convertir el blob de audio a base64 usando la funcion audioBlobToBase64
      const base64Audio = await audioBlobToBase64(audioFile.audio[0]);
      // Dividir el audio base64 en segmentos y enviarlos a la API
      const response = await splitAndSendSegments(base64Audio, apiKey, audioFile.language)
      .then(results => {   
        // Procesar los resultados y concatenar las transcripciones
        results.forEach((e) => {
          if (e.results && e.results.length >= 0 ) {
            for (let i = 0; i < e.results.length; i++) {
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
      // Si el tamaño del archivo es menor o igual a 1MB, enviar el archivo de audio completo de una vez
      const base64Audio = await audioBlobToBase64(audioFile.audio[0]);
      const endpoint = `https://speech.googleapis.com/v1/speech:recognize?key=${apiKey}`;
      const response = await axios.post(endpoint, {
        config: {
          encoding: "MP3",
          sampleRateHertz: 48000,
          useEnhanced: true,
          enableAutomaticPunctuation: true,
          languageCode: audioFile.language,
          enableWordTimeOffsets: true
        },
        audio: {
          content: base64Audio,
        },
      });
        // Obtener la transcripción de la respuesta de la API
      if (response.data?.results && response.data.results.length > 0) {
        transcriptText = response.data.results[0].alternatives[0].transcript;
      } else {
        transcriptText = "No se pudo obtener la transcripción. Intenta mas tarde";
      }
    }
    // Devolver la transcripción
  return transcriptText;
};

export default transcibedAudio;
