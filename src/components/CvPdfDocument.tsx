import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
} from "@react-pdf/renderer";
import type { CvOutput } from "@/lib/anthropic";


const styles = StyleSheet.create({
  page: {
    fontSize: 10,
    paddingTop: 40,
    paddingBottom: 40,
    paddingLeft: 50,
    paddingRight: 50,
    color: "#1a1a1a",
  },
  header: {
    marginBottom: 20,
    borderBottomWidth: 2,
    borderBottomColor: "#1a1a1a",
    paddingBottom: 12,
  },
  name: {
    fontSize: 22,
    fontFamily: "Helvetica-Bold",
    marginBottom: 4,
  },
  titulo: {
    fontSize: 12,
    color: "#444",
    marginBottom: 4,
  },
  contactRow: {
    flexDirection: "row",
    gap: 16,
    fontSize: 9,
    color: "#555",
  },
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 11,
    fontFamily: "Helvetica-Bold",
    textTransform: "uppercase",
    letterSpacing: 1,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
    paddingBottom: 4,
    marginBottom: 8,
  },
  expHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 2,
  },
  expCargo: {
    fontFamily: "Helvetica-Bold",
    fontSize: 10,
  },
  expEmpresa: {
    color: "#444",
    fontSize: 10,
  },
  expFecha: {
    fontSize: 9,
    color: "#666",
  },
  logro: {
    marginLeft: 10,
    marginBottom: 2,
    fontSize: 9.5,
    lineHeight: 1.4,
  },
  bullet: {
    marginLeft: 10,
    marginBottom: 2,
    fontSize: 9.5,
  },
  resumen: {
    fontSize: 10,
    lineHeight: 1.5,
    color: "#333",
  },
  skillsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  skillTag: {
    backgroundColor: "#f0f0f0",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 3,
    fontSize: 9,
  },
});

interface Props {
  cv: CvOutput;
}

export function CvPdfDocument({ cv }: Props) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.name}>{cv.nombre}</Text>
          <Text style={styles.titulo}>{cv.titulo}</Text>
          <View style={styles.contactRow}>
            <Text>{cv.email}</Text>
            <Text>•</Text>
            <Text>{cv.telefono}</Text>
            <Text>•</Text>
            <Text>
              {cv.ciudad}, {cv.pais}
            </Text>
          </View>
        </View>

        {/* Resumen */}
        {cv.resumen && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Perfil Profesional</Text>
            <Text style={styles.resumen}>{cv.resumen}</Text>
          </View>
        )}

        {/* Experiencia */}
        {cv.experiencia?.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Experiencia Laboral</Text>
            {cv.experiencia.map((exp, i) => (
              <View key={i} style={{ marginBottom: 10 }}>
                <View style={styles.expHeader}>
                  <Text style={styles.expCargo}>{exp.cargo}</Text>
                  <Text style={styles.expFecha}>
                    {exp.fechaInicio} – {exp.fechaFin}
                  </Text>
                </View>
                <Text style={styles.expEmpresa}>{exp.empresa}</Text>
                {exp.logros?.map((logro, j) => (
                  <Text key={j} style={styles.logro}>
                    • {logro}
                  </Text>
                ))}
              </View>
            ))}
          </View>
        )}

        {/* Educación */}
        {cv.educacion?.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Educación</Text>
            {cv.educacion.map((edu, i) => (
              <View key={i} style={{ marginBottom: 6 }}>
                <View style={styles.expHeader}>
                  <Text style={styles.expCargo}>{edu.titulo}</Text>
                  <Text style={styles.expFecha}>
                    {edu.fechaInicio} – {edu.fechaFin}
                  </Text>
                </View>
                <Text style={styles.expEmpresa}>{edu.institucion}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Habilidades */}
        {cv.habilidades?.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Habilidades</Text>
            <View style={styles.skillsRow}>
              {cv.habilidades.map((h, i) => (
                <Text key={i} style={styles.skillTag}>
                  {h}
                </Text>
              ))}
            </View>
          </View>
        )}

        {/* Idiomas */}
        {cv.idiomas?.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Idiomas</Text>
            {cv.idiomas.map((lang, i) => (
              <Text key={i} style={styles.bullet}>
                {lang.idioma} — {lang.nivel}
              </Text>
            ))}
          </View>
        )}
      </Page>
    </Document>
  );
}
