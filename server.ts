import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || '',
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// System prompt as senior Tax Law opposition preparer (AEAT C2 & C1)
const SYSTEM_PROMPT = `Eres un preparador de élite de oposiciones de Hacienda Pública en España, especializado en:
1. Agentes de la Hacienda Pública (Subgrupo C2) - Convocatoria urgente objetivo Noviembre.
2. Técnicos de Hacienda (Cuerpo Técnico de Hacienda - A2/C1) - Plan a largo plazo objetivo 2028.

Tu misión es preparar al opositor con máximo rigor técnico-jurídico basado en la normativa tributaria española vigente:
- Ley 58/2003 General Tributaria (LGT) y sus modificaciones (incluyendo Ley 11/2021 de medidas de prevención y lucha contra el fraude fiscal).
- Real Decreto 1065/2007 (Reglamento General de Gestión e Inspección - RGGI).
- Real Decreto 939/2005 (Reglamento General de Recaudación - RGR).
- Real Decreto 2063/2004 (Reglamento General del Régimen Sancionador Tributario - RGST).
- Real Decreto 520/2005 (Reglamento General de Revisión en Vía Administrativa - RGRVA).
- Ley 39/2015 del Procedimiento Administrativo Común (LPACAP) y Ley 40/2015 (LRJSP).
- Ley del IRPF (35/2006), Ley del IVA (37/1992), Ley del IS (27/2014) para C1.

Cumple estrictamente con las 4 reglas del opositor:
1. RESÚMENES: Extrae ÚNICAMENTE artículos, plazos exactos (distinguiendo días hábiles, naturales y meses de fecha a fecha), sanciones (leves, graves, muy graves, cuantías y reducciones del art. 188 LGT) y conceptos clave. Emplea tablas Markdown y viñetas nemotécnicas directas sin paja ni relleno.
2. TESTS: Genera baterías de 20 preguntas tipo test con 4 opciones (A, B, C, D) y solo 1 correcta. Estilo exacto de las comisiones de selección de la AEAT/INAP (enunciados rigurosos, opciones trampa sutiles pero legales). Al final entrega la plantilla de respuestas (1: A, 2: C...) y la JUSTIFICACIÓN minuciosa de cada respuesta citando el artículo literal y reglamento.
3. FLASHCARDS: Tarjetas de memoria (Concepto -> Definición/Plazo/Artículo/Sanción) enfocadas a fijar datos numéricos, artículos y órganos competentes.
4. TRAMPAS: Sección exhaustiva de "Cuidado con la trampa del Tribunal": Qué suelen preguntar con malicia los examinadores, palabras trampa ("podrá" vs "deberá", "días naturales" vs "hábiles", "notificación" vs "publicación", "suspensión" vs "interrupción") y los errores más frecuentes cometidos por los opositores.`;

// Endpoint to generate study materials via Gemini
app.post('/api/generate', async (req, res) => {
  try {
    const {
      fileBase64,
      fileMimeType,
      files, // Array<{ fileBase64: string, fileMimeType: string, fileName: string }>
      text,
      mode = 'all', // 'all', 'summary', 'test', 'flashcards', 'traps', 'chat'
      targetLevel = 'C2', // 'C2' or 'C1'
      topicTitle = 'Temario Tributario',
      userQuestion = '',
      selectedTopicTitles = [],
      numQuestions = 20,
    } = req.body;

    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({
        error: 'No se detectó GEMINI_API_KEY en el entorno. Verifica la configuración.',
      });
    }

    let contentsParts: any[] = [];

    // Support single file or array of multiple files
    if (Array.isArray(files) && files.length > 0) {
      for (const f of files) {
        if (f.fileBase64 && f.fileMimeType) {
          contentsParts.push({
            inlineData: {
              mimeType: f.fileMimeType,
              data: f.fileBase64.replace(/^data:[^;]+;base64,/, ''),
            },
          });
          if (f.fileName) {
            contentsParts.push({ text: `[Archivo/Tema: ${f.fileName}]` });
          }
        }
      }
    } else if (fileBase64 && fileMimeType) {
      contentsParts.push({
        inlineData: {
          mimeType: fileMimeType,
          data: fileBase64.replace(/^data:[^;]+;base64,/, ''),
        },
      });
    }

    if (text) {
      contentsParts.push({
        text: `TEXTO / APUNTES PROPORCIONADOS POR EL OPOSITOR:\n"""\n${text}\n"""`,
      });
    }

    if (selectedTopicTitles && selectedTopicTitles.length > 0) {
      contentsParts.push({
        text: `TEMAS SELECCIONADOS PARA ESTE TEST MULTITEMA: ${selectedTopicTitles.join(', ')}`,
      });
    }

    let taskInstruction = '';
    let responseSchemaDescription = '';

    if (mode === 'chat') {
      taskInstruction = `El opositor pregunta: "${userQuestion}".
Responde como su preparador de oposiciones de Hacienda (nivel ${targetLevel}). Sé conciso, ultra riguroso, cita siempre los artículos exactos de la LGT o reglamentos de desarrollo, y añade un consejo táctico para no caer en trampas de examen.`;
    } else if (mode === 'summary') {
      taskInstruction = `Genera el RESUMEN DE ALTO RENDIMIENTO para nivel ${targetLevel} sobre el material aportado (Tema: ${topicTitle}).
Cumple la regla 1: Extrae solo artículos, plazos (días hábiles, naturales, meses), sanciones (calificación, cuantía, reducciones art. 188 LGT) y conceptos clave.
Utiliza tablas y viñetas limpias. Responde en formato JSON con la siguiente estructura:
{
  "summary": {
    "topicTitle": "${topicTitle}",
    "level": "${targetLevel}",
    "articles": [{"article": "Art. ... LGT / RGGI", "title": "Nombre", "content": "Resumen directo"}],
    "deadlinesTable": [{"process": "Trámite / Actuación", "deadline": "Plazo exacto", "type": "Hábiles / Naturales / Meses", "regulation": "Artículo", "notes": "Cómputo o particularidad"}],
    "sanctionsTable": [{"infraction": "Infracción", "classification": "Leve / Grave / Muy Grave", "base": "Porcentaje o fijo", "reductions": "Reducciones aplicables art. 188 LGT"}],
    "keyConcepts": [{"concept": "Término", "definition": "Definición técnica oficial"}],
    "markdownContent": "Resumen completo formateado en Markdown con tablas y viñetas para lectura rápida"
  }
}`;
    } else if (mode === 'test') {
      const qCount = numQuestions || 20;
      taskInstruction = `Genera una BATERÍA OFICIAL DE EXACTAMENTE ${qCount} PREGUNTAS TIPO TEST para nivel ${targetLevel} sobre el material aportado (Tema: ${topicTitle}).
Cumple la regla 2:
- Exactamente ${qCount} preguntas de 4 opciones (A, B, C, D) con SOLO UNA correcta.
- Si se han seleccionado varios temas o documentos, distribuye las preguntas de forma equilibrada entre todos los temas.
- Estilo idéntico a las preguntas de las oposiciones de la AEAT / INAP.
- Plantilla de respuestas completa (1-${qCount}).
- Explicación y justificación técnica exhaustiva de cada una de las ${qCount} preguntas con el artículo y reglamento aplicable.
Responde en formato JSON:
{
  "test": {
    "title": "Batería Oficial (${qCount} Preguntas): ${topicTitle} (${targetLevel})",
    "level": "${targetLevel}",
    "questions": [
      {
        "id": 1,
        "question": "Texto de la pregunta...",
        "options": ["A) ...", "B) ...", "C) ...", "D) ..."],
        "correctIndex": 0, // 0 para A, 1 para B, 2 para C, 3 para D
        "answerLetter": "A",
        "legalArticle": "Art. ... LGT / RD ...",
        "explanation": "Explicación detallada del porqué es la opción correcta y por qué se descartan las demás."
      }
    ]
  }
}`;
    } else if (mode === 'flashcards') {
      taskInstruction = `Crea un lote de 15 a 25 FLASHCARDS DE MEMORIZACIÓN RÁPIDA para nivel ${targetLevel} sobre el material aportado (Tema: ${topicTitle}).
Cumple la regla 3: Tarjetas (Concepto -> Definición/Plazo/Sanción/Artículo).
Responde en formato JSON:
{
  "flashcards": [
    {
      "id": 1,
      "category": "Plazo" | "Artículo" | "Sanción" | "Concepto",
      "front": "¿Cuál es el plazo para... / ¿Qué dice el art. ...?",
      "back": "Respuesta exacta con artículo y cómputo.",
      "regulation": "Art. ... LGT / RGGI / RGR"
    }
  ]
}`;
    } else if (mode === 'traps') {
      taskInstruction = `Genera el análisis de TRAMPAS DE EXAMEN Y ERRORES DE OPOSITORES para nivel ${targetLevel} sobre el material aportado (Tema: ${topicTitle}).
Cumple la regla 4: Qué suelen preguntar con mala intención los examinadores y qué errores cometen habitualmente los aspirantes en los exámenes oficiales.
Responde en formato JSON:
{
  "traps": {
    "topicTitle": "${topicTitle}",
    "level": "${targetLevel}",
    "items": [
      {
        "title": "Nombre de la trampa / confusión clásica",
        "examinerTrap": "Cómo formula la trampa el tribunal examinador",
        "commonError": "El error que comete el opositor al responder apresuradamente",
        "legalReality": "La regla jurídica exacta y cómo desmontarla",
        "goldenRule": "Regla de oro nemotécnica para no fallar",
        "sampleQuestion": "Ejemplo de pregunta trampa típica",
        "correctOption": "Opción correcta explicada"
      }
    ]
  }
}`;
    } else {
      // mode === 'all'
      taskInstruction = `Genera el PAQUETE COMPLETO DE PREPARACIÓN DE OPOSICIÓN para nivel ${targetLevel} sobre el material aportado (Tema: ${topicTitle}).
Debes generar rigurosamente las 4 herramientas solicitadas:
1. Resumen: Artículos, plazos, sanciones y conceptos clave en tablas estructuradas y texto markdown.
2. Batería de 20 preguntas tipo test oficiales (A, B, C, D, solo 1 correcta) con plantilla y justificación artículo a artículo.
3. Flashcards de memorización (15-20 tarjetas Concepto -> Definición).
4. Trampas del examinador y errores de opositor (4-6 trampas críticas con regla de oro).

Responde en formato JSON estricto:
{
  "summary": {
    "topicTitle": "${topicTitle}",
    "level": "${targetLevel}",
    "articles": [{"article": "Art. ...", "title": "...", "content": "..."}],
    "deadlinesTable": [{"process": "...", "deadline": "...", "type": "Hábiles/Naturales/Meses", "regulation": "...", "notes": "..."}],
    "sanctionsTable": [{"infraction": "...", "classification": "...", "base": "...", "reductions": "..."}],
    "keyConcepts": [{"concept": "...", "definition": "..."}],
    "markdownContent": "..."
  },
  "test": {
    "title": "Batería Oficial 20 Preguntas: ${topicTitle}",
    "level": "${targetLevel}",
    "questions": [
      {
        "id": 1,
        "question": "...",
        "options": ["A) ...", "B) ...", "C) ...", "D) ..."],
        "correctIndex": 0,
        "answerLetter": "A",
        "legalArticle": "...",
        "explanation": "..."
      }
    ]
  },
  "flashcards": [
    {
      "id": 1,
      "category": "Plazo",
      "front": "...",
      "back": "...",
      "regulation": "..."
    }
  ],
  "traps": {
    "topicTitle": "${topicTitle}",
    "level": "${targetLevel}",
    "items": [
      {
        "title": "...",
        "examinerTrap": "...",
        "commonError": "...",
        "legalReality": "...",
        "goldenRule": "...",
        "sampleQuestion": "...",
        "correctOption": "..."
      }
    ]
  }
}`;
    }

    contentsParts.push({ text: taskInstruction });

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: contentsParts,
      config: {
        systemInstruction: SYSTEM_PROMPT,
        responseMimeType: mode === 'chat' ? 'text/plain' : 'application/json',
      },
    });

    const responseText = response.text || '';

    if (mode === 'chat') {
      return res.json({ reply: responseText });
    }

    try {
      const parsedData = JSON.parse(responseText);
      return res.json(parsedData);
    } catch (parseError) {
      // If direct parse fails, try extracting JSON from markdown fences
      const jsonMatch = responseText.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[1]);
        return res.json(parsed);
      }
      return res.json({ rawText: responseText });
    }
  } catch (error: any) {
    console.error('Error in /api/generate:', error);
    res.status(500).json({
      error: error?.message || 'Error procesando el temario con el preparador IA.',
    });
  }
});

// Setup Vite middleware in dev or static files in production
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[OpoHacienda Preparador Pro] Server running on port ${PORT}`);
  });
}

startServer();
