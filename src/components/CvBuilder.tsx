"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { usePostHog } from "posthog-js/react";
import type { CvInput, CvOutput } from "@/lib/anthropic";

interface Props {
  isPaid: boolean;
}

const EMPTY_INPUT: CvInput = {
  nombre: "",
  titulo: "",
  email: "",
  telefono: "",
  ciudad: "",
  pais: "México",
  resumen: "",
  experiencia: [{ empresa: "", cargo: "", fechaInicio: "", fechaFin: "", descripcion: "" }],
  educacion: [{ institucion: "", titulo: "", fechaInicio: "", fechaFin: "" }],
  habilidades: [],
  idiomas: [{ idioma: "Español", nivel: "Nativo" }],
  industria: "",
};

export function CvBuilder({ isPaid }: Props) {
  const posthog = usePostHog();
  const [input, setInput] = useState<CvInput>(EMPTY_INPUT);
  const [habilidadesRaw, setHabilidadesRaw] = useState("");
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [result, setResult] = useState<CvOutput | null>(null);

  async function handleGenerate(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    posthog?.capture("cv_generate_clicked");

    const payload: CvInput = {
      ...input,
      habilidades: habilidadesRaw.split(",").map((h) => h.trim()).filter(Boolean),
    };

    try {
      const res = await fetch("/api/cv/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();

      if (!res.ok) {
        if (data.rateLimited) {
          toast.error(data.error);
        } else {
          toast.error(data.error ?? "Error al generar el CV");
        }
        return;
      }

      setResult(data.cv);
      toast.success("¡CV generado exitosamente!");
      posthog?.capture("cv_generated_success");
    } catch {
      toast.error("Error de conexión. Por favor intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  }

  async function handleExport() {
    if (!result) return;
    if (!isPaid) {
      toast.error("Desbloquea tu CV por $9 USD para descargar el PDF.");
      return;
    }
    setExporting(true);
    posthog?.capture("cv_export_clicked");

    try {
      const res = await fetch("/api/cv/export", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cv: result }),
      });

      if (!res.ok) {
        const data = await res.json();
        toast.error(data.error ?? "Error al exportar el PDF");
        return;
      }

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `cv-${result.nombre.replace(/\s+/g, "-").toLowerCase()}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
      posthog?.capture("cv_pdf_downloaded");
    } catch {
      toast.error("Error al exportar. Por favor intenta de nuevo.");
    } finally {
      setExporting(false);
    }
  }

  function updateExp(index: number, field: string, value: string) {
    setInput((prev) => {
      const exp = [...prev.experiencia];
      exp[index] = { ...exp[index], [field]: value };
      return { ...prev, experiencia: exp };
    });
  }

  function addExp() {
    setInput((prev) => ({
      ...prev,
      experiencia: [
        ...prev.experiencia,
        { empresa: "", cargo: "", fechaInicio: "", fechaFin: "", descripcion: "" },
      ],
    }));
  }

  function updateEdu(index: number, field: string, value: string) {
    setInput((prev) => {
      const edu = [...prev.educacion];
      edu[index] = { ...edu[index], [field]: value };
      return { ...prev, educacion: edu };
    });
  }

  if (result) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Tu CV generado</h2>
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => setResult(null)}>
              Editar datos
            </Button>
            {isPaid ? (
              <Button onClick={handleExport} disabled={exporting}>
                {exporting ? "Exportando..." : "Descargar PDF"}
              </Button>
            ) : (
              <form action="/api/stripe/checkout" method="POST">
                <Button type="submit">
                  Desbloquear PDF — $9 USD
                </Button>
              </form>
            )}
          </div>
        </div>

        {!isPaid && (
          <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
            Vista previa gratuita. Desbloquea el PDF con un pago único de $9 USD.
          </div>
        )}

        <div className="rounded-xl border border-gray-200 bg-white p-8 space-y-6 font-serif">
          <div className="border-b-2 border-gray-900 pb-4">
            <h1 className="text-3xl font-bold">{result.nombre}</h1>
            <p className="text-gray-600 mt-1">{result.titulo}</p>
            <p className="text-sm text-gray-500 mt-1">
              {result.email} • {result.telefono} • {result.ciudad}, {result.pais}
            </p>
          </div>

          {result.resumen && (
            <div>
              <h3 className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">
                Perfil Profesional
              </h3>
              <p className="text-sm leading-relaxed">{result.resumen}</p>
            </div>
          )}

          {result.experiencia?.length > 0 && (
            <div>
              <h3 className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-3">
                Experiencia Laboral
              </h3>
              <div className="space-y-4">
                {result.experiencia.map((exp, i) => (
                  <div key={i}>
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-semibold">{exp.cargo}</p>
                        <p className="text-sm text-gray-600">{exp.empresa}</p>
                      </div>
                      <p className="text-xs text-gray-400 whitespace-nowrap">
                        {exp.fechaInicio} – {exp.fechaFin}
                      </p>
                    </div>
                    <ul className="mt-2 space-y-1">
                      {exp.logros?.map((l, j) => (
                        <li key={j} className="text-sm text-gray-700 pl-3 before:content-['•'] before:mr-2">
                          {l}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          )}

          {result.educacion?.length > 0 && (
            <div>
              <h3 className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-3">
                Educación
              </h3>
              <div className="space-y-2">
                {result.educacion.map((edu, i) => (
                  <div key={i} className="flex justify-between">
                    <div>
                      <p className="font-semibold text-sm">{edu.titulo}</p>
                      <p className="text-xs text-gray-500">{edu.institucion}</p>
                    </div>
                    <p className="text-xs text-gray-400">
                      {edu.fechaInicio} – {edu.fechaFin}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {result.habilidades?.length > 0 && (
            <div>
              <h3 className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">
                Habilidades
              </h3>
              <div className="flex flex-wrap gap-2">
                {result.habilidades.map((h, i) => (
                  <span
                    key={i}
                    className="px-2 py-1 bg-gray-100 rounded text-xs text-gray-700"
                  >
                    {h}
                  </span>
                ))}
              </div>
            </div>
          )}

          {result.idiomas?.length > 0 && (
            <div>
              <h3 className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">
                Idiomas
              </h3>
              <div className="space-y-1">
                {result.idiomas.map((lang, i) => (
                  <p key={i} className="text-sm">
                    {lang.idioma} — {lang.nivel}
                  </p>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleGenerate} className="space-y-8">
      {/* Datos personales */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Datos personales</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1">
            <Label htmlFor="nombre">Nombre completo *</Label>
            <Input
              id="nombre"
              required
              value={input.nombre}
              onChange={(e) => setInput((p) => ({ ...p, nombre: e.target.value }))}
              placeholder="Ana García López"
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="titulo">Título profesional *</Label>
            <Input
              id="titulo"
              required
              value={input.titulo}
              onChange={(e) => setInput((p) => ({ ...p, titulo: e.target.value }))}
              placeholder="Desarrolladora Full Stack"
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={input.email}
              onChange={(e) => setInput((p) => ({ ...p, email: e.target.value }))}
              placeholder="ana@ejemplo.com"
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="telefono">Teléfono</Label>
            <Input
              id="telefono"
              value={input.telefono}
              onChange={(e) => setInput((p) => ({ ...p, telefono: e.target.value }))}
              placeholder="+52 55 1234 5678"
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="ciudad">Ciudad</Label>
            <Input
              id="ciudad"
              value={input.ciudad}
              onChange={(e) => setInput((p) => ({ ...p, ciudad: e.target.value }))}
              placeholder="Ciudad de México"
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="pais">País</Label>
            <Input
              id="pais"
              value={input.pais}
              onChange={(e) => setInput((p) => ({ ...p, pais: e.target.value }))}
              placeholder="México"
            />
          </div>
          <div className="space-y-1 sm:col-span-2">
            <Label htmlFor="industria">Industria objetivo *</Label>
            <Input
              id="industria"
              required
              value={input.industria}
              onChange={(e) => setInput((p) => ({ ...p, industria: e.target.value }))}
              placeholder="Tecnología, Finanzas, Marketing..."
            />
          </div>
          <div className="space-y-1 sm:col-span-2">
            <Label htmlFor="resumen">Breve resumen de tu perfil</Label>
            <textarea
              id="resumen"
              className="w-full min-h-[80px] rounded-md border border-input bg-background px-3 py-2 text-sm"
              value={input.resumen}
              onChange={(e) => setInput((p) => ({ ...p, resumen: e.target.value }))}
              placeholder="Soy desarrolladora con 5 años de experiencia en..."
            />
          </div>
        </div>
      </div>

      {/* Experiencia */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Experiencia laboral</h3>
        <div className="space-y-6">
          {input.experiencia.map((exp, i) => (
            <div key={i} className="border border-gray-200 rounded-lg p-4 space-y-3">
              <p className="text-sm font-medium text-gray-500">Empleo {i + 1}</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label>Empresa *</Label>
                  <Input
                    required
                    value={exp.empresa}
                    onChange={(e) => updateExp(i, "empresa", e.target.value)}
                    placeholder="Empresa S.A. de C.V."
                  />
                </div>
                <div className="space-y-1">
                  <Label>Cargo *</Label>
                  <Input
                    required
                    value={exp.cargo}
                    onChange={(e) => updateExp(i, "cargo", e.target.value)}
                    placeholder="Desarrolladora Backend"
                  />
                </div>
                <div className="space-y-1">
                  <Label>Fecha inicio</Label>
                  <Input
                    value={exp.fechaInicio}
                    onChange={(e) => updateExp(i, "fechaInicio", e.target.value)}
                    placeholder="Ene 2022"
                  />
                </div>
                <div className="space-y-1">
                  <Label>Fecha fin</Label>
                  <Input
                    value={exp.fechaFin}
                    onChange={(e) => updateExp(i, "fechaFin", e.target.value)}
                    placeholder="Dic 2024 o Actualidad"
                  />
                </div>
                <div className="space-y-1 sm:col-span-2">
                  <Label>Descripción de responsabilidades</Label>
                  <textarea
                    className="w-full min-h-[80px] rounded-md border border-input bg-background px-3 py-2 text-sm"
                    value={exp.descripcion}
                    onChange={(e) => updateExp(i, "descripcion", e.target.value)}
                    placeholder="Desarrollé APIs REST con Node.js, lideré equipo de 3 personas..."
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
        <Button
          type="button"
          variant="outline"
          className="mt-3"
          onClick={addExp}
        >
          + Agregar empleo
        </Button>
      </div>

      {/* Educación */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Educación</h3>
        <div className="space-y-4">
          {input.educacion.map((edu, i) => (
            <div key={i} className="border border-gray-200 rounded-lg p-4 space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label>Institución</Label>
                  <Input
                    value={edu.institucion}
                    onChange={(e) => updateEdu(i, "institucion", e.target.value)}
                    placeholder="UNAM, Tec de Monterrey..."
                  />
                </div>
                <div className="space-y-1">
                  <Label>Título o grado</Label>
                  <Input
                    value={edu.titulo}
                    onChange={(e) => updateEdu(i, "titulo", e.target.value)}
                    placeholder="Ingeniería en Sistemas"
                  />
                </div>
                <div className="space-y-1">
                  <Label>Año inicio</Label>
                  <Input
                    value={edu.fechaInicio}
                    onChange={(e) => updateEdu(i, "fechaInicio", e.target.value)}
                    placeholder="2018"
                  />
                </div>
                <div className="space-y-1">
                  <Label>Año fin</Label>
                  <Input
                    value={edu.fechaFin}
                    onChange={(e) => updateEdu(i, "fechaFin", e.target.value)}
                    placeholder="2022"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Habilidades e idiomas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div>
          <h3 className="text-lg font-semibold mb-4">Habilidades</h3>
          <div className="space-y-1">
            <Label>Separadas por coma</Label>
            <Input
              value={habilidadesRaw}
              onChange={(e) => setHabilidadesRaw(e.target.value)}
              placeholder="Python, SQL, Excel, Liderazgo..."
            />
          </div>
        </div>
        <div>
          <h3 className="text-lg font-semibold mb-4">Idiomas</h3>
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <Label>Idioma</Label>
              <Input
                value={input.idiomas[0]?.idioma ?? ""}
                onChange={(e) =>
                  setInput((p) => {
                    const ids = [...p.idiomas];
                    ids[0] = { ...ids[0], idioma: e.target.value };
                    return { ...p, idiomas: ids };
                  })
                }
                placeholder="Inglés"
              />
            </div>
            <div className="space-y-1">
              <Label>Nivel</Label>
              <Input
                value={input.idiomas[0]?.nivel ?? ""}
                onChange={(e) =>
                  setInput((p) => {
                    const ids = [...p.idiomas];
                    ids[0] = { ...ids[0], nivel: e.target.value };
                    return { ...p, idiomas: ids };
                  })
                }
                placeholder="Avanzado (C1)"
              />
            </div>
          </div>
        </div>
      </div>

      <Button type="submit" disabled={loading} className="w-full py-6 text-base">
        {loading ? "Generando tu CV con IA..." : "Generar CV con IA →"}
      </Button>

      <p className="text-xs text-center text-gray-400">
        {isPaid
          ? "Incluye descarga en PDF"
          : "Vista previa gratuita. PDF disponible por $9 USD (pago único)"}
      </p>
    </form>
  );
}
