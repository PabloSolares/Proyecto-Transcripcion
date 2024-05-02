import { PDFDownloadLink } from "@react-pdf/renderer";
import React from "react";
import { PDFDoc } from "./PDFDoc";
import { useState } from "react";

export const ShowTranscripcion = ({text,model, comparation, titleName}) => {
  const [mostrarTexto, setMostrarTexto] = useState(false)

  const handleMostrarMasClick = () => {
    setMostrarTexto(!mostrarTexto);
  };

    return (
        <div className="card mb-5">

        <div className="card-body">
        <h3 className="card-title">{!comparation ? `Transcripción  ${model}` : titleName ?  `Transcripción corregida` : `Transcripción con errores`}</h3>
        <PDFDownloadLink
          document={PDFDoc(text)}
          fileName="Transcription.pdf"
        >
          {({ blob, url, loading, error }) =>
            loading ? (
              <button disabled={true} className="btn btn-primary">
                Cargando
              </button>
            ) : (
              <button className="btn btn-primary">
                Descargar Documento
              </button>
            )
          }
        </PDFDownloadLink>


          <button onClick={handleMostrarMasClick} type="button" className="btn btn-primary ms-3">
            {
              !mostrarTexto ? 'Mostrar transcripción' : 'Ocultar transcripción'
            }
          </button>
        
        {
          mostrarTexto ? !comparation ? <p className="card-text text-justify text-wrap mt-3">{text}</p> : <p className="card-text text-justify text-wrap mt-3" dangerouslySetInnerHTML={{__html: text}} ></p> : ''
        }

   
        
      </div>
      </div>

      )
}

