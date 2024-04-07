import React, { useState } from "react";
import { useForm } from "react-hook-form";
import transcibedAudio from "../helpers/speech";

export const Inicio = () => {
  // Usar useForm para manejar el formulario
  const {
    register,
    formState: { errors },
    handleSubmit,
  } = useForm();

  // Estado para almacenar el texto transcribido
  const [text, setText] = useState(false);

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
      });
  };
  // Función para manejar la presentación del formulario
  const onSubmit = async (data) => {
    getTranscription(data);
  };

  return (
    <div id="content">
      <h1>Transcripción</h1>

      <form
        onSubmit={handleSubmit(onSubmit)} /*action="/upload" method="post"*/
      >
        <label>Seleccionar documento:</label>
        <input
          type="file"
          id="audio"
          name="audio"
          {...register("audio", { required: true })}
          accept=".mp3, .wav, .ogg"
        />

        <button type="submit" value="Enviar">
          Cargar Documento
        </button>
      </form>
      {/* Mostrar mensajes de error y transcripción */}
      {
        // Mostrar mensaje de error si el campo de audio no se ha completado
        errors.audio?.type === "required" ? (
          <p>El campo audio es requerido</p>
        ) : text ? ( // Mostrar texto transcribido si está disponible
          <div>
            <h3>Transcripción:</h3> <p>{text}</p>
          </div>
        ) : (
          // Mostrar mensaje de selección de documento si no hay texto transcribido
          <h4>Selecciona un documento</h4>
        )
      }
    </div>
  );
};
