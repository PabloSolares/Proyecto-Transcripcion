import React, {  useState } from "react";
import {useForm } from "react-hook-form";
import transcibedAudio from "../helpers/speech";

export const Inicio = () => {
  const { register, formState:{errors} ,handleSubmit} = useForm();
  const [text, setText] = useState(false);
  const getTranscription = async (data) => {
    await transcibedAudio(data)
      .then(results => {
        if(results !== undefined ){
          setText(results)
        }
    })
    .catch(error => {
      console.error('Ocurrió un error al enviar los segmentos:', error);
    })
  }
  const onSubmit = async(data) =>{
      getTranscription(data)
  }


 
  return (

    <div id="content">
      <h1>Transcripción</h1>

      <form onSubmit={handleSubmit(onSubmit)}  /*action="/upload" method="post"*/ >
        <label >Seleccionar documento:</label>
        <input  type="file" id="audio" name="audio" {...register('audio', {required: true}) } accept=".mp3, .wav, .ogg" />

        <button type="submit" value='Enviar'>Cargar Documento</button>
      </form>

      {
        errors.audio?.type === 'required' ? <p>El campo audio es requerido</p> : text ? <div><h3>Transcripción:</h3> <p>{text}</p> </div>  : <h4>Selecciona un documento</h4>
      }
      

    
    </div>
  );
};
