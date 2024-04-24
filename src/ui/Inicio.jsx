import React, { useState } from "react";
import { useForm } from "react-hook-form";
import transcibedAudio from "../helpers/speech";
import { LoadingSpinner } from "./LoadingSpinner";
import {PDFDownloadLink } from "@react-pdf/renderer";
import { PDFDoc } from "./PDFDoc";

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
            <option value="en-US">Íngles</option>

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
        ) : text ? (
          // Mostrar texto transcribido si está disponible
          <div className="card-body">
            <h3 className="card-title">Transcripción:</h3>
            <PDFDownloadLink document={PDFDoc(text)} fileName="Transcription.pdf" >
            {({ blob, url, loading, error }) =>
        loading ? <button disabled={true} className="btn btn-primary" >Cargando</button> : <button className="btn btn-primary" >Descargar Documento</button>
      }
              
            </PDFDownloadLink> 

            <p className="card-text text-justify text-wrap">{text}</p>
          </div>
        ) : (
          // Mostrar mensaje de selección de documento si no hay texto transcribido
          <h4 className="text-danger">Selecciona un documento</h4>
        )}
      </div>
    </div>
  );
};
