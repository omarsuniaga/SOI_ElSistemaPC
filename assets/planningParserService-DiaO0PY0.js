import{n as e}from"./groqService-KWo346Hv.js";var t=`
Eres un arquitecto pedagógico experto en el sistema SOI (Sistema Operativo Institucional).
Tu tarea es analizar una planificación académica y extraer su estructura curricular en 4 niveles jerárquicos (que se colgarán de la Clase seleccionada).

Debes devolver un objeto JSON estrictamente formateado con esta estructura:
{
  "niveles": [
    {
      "nombre": "Nombre del nivel (ej: Nivel 1 - Iniciación)",
      "objetivo_general": "Objetivo principal del nivel",
      "numero_nivel": 1,
      "temas": [
        {
          "nombre": "Nombre del tema (ej: Postura y Embocadura)",
          "tipo": "TECNICA | SONIDO | AFINACION | ARCO | MANO_IZQ | REPERTORIO",
          "es_critico": true/false,
          "objetivos": [
            {
              "nombre": "Nombre del objetivo (ej: Mantener la espalda recta)",
              "indicadores": [
                {
                  "descripcion": "Descripción del indicador evaluable",
                  "es_requerido": true/false
                }
              ]
            }
          ]
        }
      ]
    }
  ]
}

Reglas CRÍTICAS:
1. Respeta los 4 niveles: Nivel -> Tema -> Objetivo -> Indicador.
2. Los indicadores son la unidad mínima de evaluación.
3. Clasifica cada Tema en uno de los tipos (TECNICA, SONIDO, AFINACION, etc.).
4. Responde ÚNICAMENTE con el bloque JSON.
`;async function n(e){window.pdfjsLib||(await o(`https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.min.js`),window.pdfjsLib.GlobalWorkerOptions.workerSrc=`https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.worker.min.js`);let t=await e.arrayBuffer(),n=await window.pdfjsLib.getDocument({data:t}).promise,r=``;for(let e=1;e<=n.numPages;e++){let t=await(await n.getPage(e)).getTextContent();r+=t.items.map(e=>e.str).join(` `)+`
`}return r}async function r(e){window.mammoth||await o(`https://cdnjs.cloudflare.com/ajax/libs/mammoth/1.4.0/mammoth.browser.min.js`);let t=await e.arrayBuffer();return(await window.mammoth.extractRawText({arrayBuffer:t})).value}async function i(e){return await e.text()}async function a(e,t){window.Tesseract||await o(`https://cdn.jsdelivr.net/npm/tesseract.js@4/dist/tesseract.min.js`);let n=await Tesseract.createWorker({logger:e=>{e.status===`recognizing`&&t&&t(Math.round(e.progress*100)),console.log(`[OCR Progress] ${e.status}: ${(e.progress*100).toFixed(1)}%`)}});await n.loadLanguage(`spa`),await n.initialize(`spa`);let{data:{text:r}}=await n.recognize(e);return await n.terminate(),r}function o(e){return new Promise((t,n)=>{let r=document.createElement(`script`);r.src=e,r.onload=t,r.onerror=n,document.head.appendChild(r)})}async function s(o,s){let c=``,l=o.name.split(`.`).pop().toLowerCase();try{if(l===`pdf`)c=await n(o);else if(l===`docx`)c=await r(o);else if(l===`md`||l===`txt`)c=await i(o);else if([`jpg`,`jpeg`,`png`].includes(l))c=await a(o,s);else throw Error(`Formato no soportado. Usa PDF, DOCX, MD o Imágenes.`);if(!c.trim())throw Error(`El archivo parece estar vacío o no contiene texto legible.`);let u=(await e([{role:`system`,content:t},{role:`user`,content:`Analiza esta planificación y devuelve SOLO el JSON:\n\n${c.substring(0,8e3)}`}])).match(/\{[\s\S]*\}/);if(!u)throw Error(`La IA no devolvió un formato de datos válido.`);let d=u[0].trim();return JSON.parse(d)}catch(e){throw console.error(`[PlanningParser] Error:`,e),e}}export{s as parsePlanningFile};