import Anthropic from "@anthropic-ai/sdk";

let _client: Anthropic | null = null;

export function getAnthropic(): Anthropic {
  if (!_client) {
    _client = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY!,
    });
  }
  return _client;
}

export interface CvInput {
  nombre: string;
  titulo: string;
  email: string;
  telefono: string;
  ciudad: string;
  pais: string;
  resumen: string;
  experiencia: Array<{
    empresa: string;
    cargo: string;
    fechaInicio: string;
    fechaFin: string;
    descripcion: string;
  }>;
  educacion: Array<{
    institucion: string;
    titulo: string;
    fechaInicio: string;
    fechaFin: string;
  }>;
  habilidades: string[];
  idiomas: Array<{ idioma: string; nivel: string }>;
  industria: string;
}

export interface CvOutput {
  resumen: string;
  experiencia: Array<{
    empresa: string;
    cargo: string;
    fechaInicio: string;
    fechaFin: string;
    logros: string[];
  }>;
  educacion: Array<{
    institucion: string;
    titulo: string;
    fechaInicio: string;
    fechaFin: string;
  }>;
  habilidades: string[];
  idiomas: Array<{ idioma: string; nivel: string }>;
  nombre: string;
  titulo: string;
  email: string;
  telefono: string;
  ciudad: string;
  pais: string;
}

export async function generateCv(input: CvInput): Promise<CvOutput> {
  const client = getAnthropic();

  const prompt = `Eres un experto en redacción de currículums vitae para el mercado laboral latinoamericano.

Con base en la siguiente información del candidato, genera un CV profesional optimizado para el mercado de ${input.pais || "LATAM"} en español. El CV debe tener un tono profesional, usar verbos de acción fuertes, y cuantificar logros cuando sea posible.

INFORMACIÓN DEL CANDIDATO:
Nombre: ${input.nombre}
Título profesional: ${input.titulo}
Email: ${input.email}
Teléfono: ${input.telefono}
Ciudad: ${input.ciudad}, ${input.pais}
Industria objetivo: ${input.industria}
Resumen (raw): ${input.resumen}

EXPERIENCIA LABORAL:
${input.experiencia.map((e) => `- ${e.cargo} en ${e.empresa} (${e.fechaInicio} - ${e.fechaFin}): ${e.descripcion}`).join("\n")}

EDUCACIÓN:
${input.educacion.map((e) => `- ${e.titulo} en ${e.institucion} (${e.fechaInicio} - ${e.fechaFin})`).join("\n")}

HABILIDADES: ${input.habilidades.join(", ")}

IDIOMAS: ${input.idiomas.map((i) => `${i.idioma} (${i.nivel})`).join(", ")}

Responde ÚNICAMENTE con un objeto JSON válido con esta estructura exacta (sin texto adicional, sin markdown):
{
  "nombre": "nombre completo",
  "titulo": "título profesional optimizado",
  "email": "email",
  "telefono": "teléfono",
  "ciudad": "ciudad",
  "pais": "país",
  "resumen": "resumen profesional de 3-4 oraciones impactantes que posicionen al candidato para la industria ${input.industria}",
  "experiencia": [
    {
      "empresa": "nombre empresa",
      "cargo": "cargo optimizado",
      "fechaInicio": "mes/año",
      "fechaFin": "mes/año o Actualidad",
      "logros": ["logro 1 con verbo de acción y métricas si aplica", "logro 2", "logro 3"]
    }
  ],
  "educacion": [
    {
      "institucion": "nombre institución",
      "titulo": "título",
      "fechaInicio": "año",
      "fechaFin": "año"
    }
  ],
  "habilidades": ["habilidad 1", "habilidad 2"],
  "idiomas": [{"idioma": "nombre", "nivel": "nivel"}]
}`;

  const message = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 2048,
    messages: [{ role: "user", content: prompt }],
  });

  const content = message.content[0];
  if (content.type !== "text") throw new Error("Unexpected response type");

  return JSON.parse(content.text) as CvOutput;
}
