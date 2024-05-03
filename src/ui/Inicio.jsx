import React, { useState } from "react";
import { useForm } from "react-hook-form";
import transcibedAudio from "../helpers/speech";
import { LoadingSpinner } from "./LoadingSpinner";
import { ShowTranscripcion } from "./showTranscripcion";

function calculateWER(referenceText, generatedText) {
 // Convertir los textos en arrays de palabras
 const referenceWords = referenceText.trim().toLowerCase().match(/\b\w+\b/g);
 const generatedWords = generatedText.trim().toLowerCase().match(/\b\w+\b/g);

 // Si alguno de los textos es nulo, retornar un WER del 100%
 if (!referenceWords || !generatedWords) {
   return 100;
 }

 // Longitud de los textos
 const referenceLength = referenceWords.length;
 const generatedLength = generatedWords.length;

 // Calcular la distancia entre los textos de referencia y generados
 let distance = 0;

 // Crear un conjunto de palabras únicas en el texto de referencia
 const referenceSet = new Set(referenceWords);

 // Comparar las palabras del texto generado con las del texto de referencia
 generatedWords.forEach(word => {
   if (!referenceSet.has(word)) {
     distance++;
   }
 });

 // Calcular el WER como el porcentaje de palabras incorrectas respecto a la longitud del texto de referencia
 const WER = distance / referenceLength * 100;
 const roundedWER = Math.round(WER * 100) / 100; // Redondear a 2 decimales

 return roundedWER;
}

const comparacion = (transcripcion1, transcripcion2) => {
  // Dividir las transcripciones en palabras
  const palabrasTranscripcion1 = transcripcion1.split(" ");
  const palabrasTranscripcion2 = transcripcion2.split(" ");

  // Encontrar diferencias entre las transcripciones
  const erroresTranscripcion1 = palabrasTranscripcion1.filter(
    (palabra) => !palabrasTranscripcion2.includes(palabra)
  );
  const erroresTranscripcion2 = palabrasTranscripcion2.filter(
    (palabra) => !palabrasTranscripcion1.includes(palabra)
  );

  // Corregir transcripciones
  const transcripcionCorregida = palabrasTranscripcion1
    .map((palabra, index) => {
      if (
        palabrasTranscripcion2[index] &&
        palabra !== palabrasTranscripcion2[index]
      ) {
        return palabrasTranscripcion2[index];
      } else {
        return palabra;
      }
    })
    .join(" ");

  // Marcar palabras con errores en la transcripción original
  const transcripcionConErrores = palabrasTranscripcion1
    .map((palabra) => {
      if (erroresTranscripcion1.includes(palabra)) {
        return `<span style="color: red;">${palabra}</span>`;
      } else {
        return palabra;
      }
    })
    .join(" ");

  // Retornar el texto corregido entre las dos transcripciones y la transcripción original con errores marcados en rojo
  return [{
    transcriptCor: true,
    text: transcripcionCorregida
  }, 
  {
    transcriptCor: false,
    text: transcripcionConErrores}];
};

export const Inicio = () => {
  // Usar useForm para manejar el formulario
  const {
    register,
    formState: { errors },
    handleSubmit,
  } = useForm();

  // Estado para almacenar el texto transcribido
  const [text, setText] = useState(false);
  const [loading, setLoading] = useState(null);

  // Función para obtener la transcripción del audio

  const getTranscription = async (data) => {
    await transcibedAudio(data)
      .then((results) => {
        // Si la transcripción es exitosa, establecer el texto transcribido en el estado
        if (results !== undefined) {
          setText(results);
        }
      })
      .catch((error) => {
        console.error("Ocurrió un error al enviar los segmentos:", error);
      })
      .finally(() => {
        setLoading(false);
      });
  };
  // Función para manejar la presentación del formulario
  const onSubmit = async (data) => {
    setLoading(true);
    getTranscription(data);
  };

  return (
    <div id="content" className="container mt-5">
      <h1>Transcripción</h1>

      <form onSubmit={handleSubmit(onSubmit)} className="mb-3">
        <div className="form-group">
          <label>
            <h4>Seleccionar documento:</h4>
          </label>
          <input
            type="file"
            id="audio"
            name="audio"
            {...register("audio", { required: true })}
            accept=".mp3, .wav, .ogg"
            className="form-control-file"
          />
        </div>

        {/* Selector de idiomas con Bootstrap */}
        <div className="form-group">
          <label htmlFor="language">
            <h4>Seleccionar idioma:</h4>
          </label>
          <select
            id="language"
            className="form-select form-select-sm"
            style={{ width: "150px", marginBottom: "20px" }}
            {...register("language")} // Aquí se debe usar el mismo nombre del campo que en useForm
          >
            <option value="es-MX">Español</option>
            <option value="en-US">Inglés</option>
          </select>
        </div>

        <button type="submit" value="Enviar" className="btn btn-primary">
          Cargar Audio
        </button>
      </form>
      {/* Mostrar mensajes de error y transcripción */}
      <div className="card mt-3 p-4">
        {errors.audio?.type === "required" ? (
          <p className="text-danger">El campo audio es requerido</p>
        ) : loading ? (
          <LoadingSpinner />
        ) : text.length > 0 ? (
          // Mostrar texto transcribido si está disponible
          <div className="container">
            <div className="row justify-content-center">
              {
                <h3>
                  Tasa de error de la transcripción:{" "}
                  {calculateWER(text[1].text, text[2].text)}%
                </h3>
              }
              {text.map((e, i) => {
                console.log(e)
                return (
                  <div className="col-md-6">
                    <ShowTranscripcion
                      key={i}
                      text={e.text}
                      model={e.model}
                      comparation={false}
                    />
                  </div>
                );
              })}

              {calculateWER(text[1].text, text[2].text) === 0 ? (
                <h3>No hay errores</h3>
              ) : (
                comparacion(text[1].text, text[2].text).map((e, i) => {
                  return (
                    <div className="col-md-6">
                      <ShowTranscripcion
                        key={i}
                        text={e.text}
                        // model="Con errores"
                        titleName={e.transcriptCor}
                        comparation={true}
                      />
                    </div>
                  );
                })
              )}
            </div>
          </div>
        ) : (
          // Mostrar mensaje de selección de documento si no hay texto transcribido
          <h4 className="text-danger">Selecciona un documento</h4>
        )}
      </div>
    </div>
  );
};
