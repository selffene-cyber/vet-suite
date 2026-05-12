import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  Image,
  StyleSheet,
  Font,
} from "@react-pdf/renderer";

Font.register({
  family: "Helvetica",
  fonts: [
    { src: "Helvetica" },
    { src: "Helvetica-Bold", fontWeight: "bold" },
  ],
});

const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontSize: 9,
    fontFamily: "Helvetica",
    lineHeight: 1.4,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 15,
    borderBottomWidth: 2,
    borderBottomColor: "#16a34a",
    paddingBottom: 10,
  },
  clinicInfo: {
    flex: 1,
  },
  clinicName: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#16a34a",
    marginBottom: 3,
  },
  clinicDetail: {
    fontSize: 8,
    color: "#444",
    marginBottom: 1,
  },
  logo: {
    width: 60,
    height: 60,
    objectFit: "contain",
  },
  title: {
    fontSize: 12,
    fontWeight: "bold",
    textAlign: "center",
    marginVertical: 8,
    textTransform: "uppercase",
  },
  tipoReceta: {
    fontSize: 10,
    textAlign: "center",
    color: "#666",
    marginBottom: 10,
  },
  section: {
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 3,
    padding: 8,
  },
  sectionTitle: {
    fontSize: 9,
    fontWeight: "bold",
    color: "#16a34a",
    marginBottom: 4,
    textTransform: "uppercase",
  },
  row: {
    flexDirection: "row",
    marginBottom: 2,
  },
  label: {
    width: "30%",
    fontSize: 8,
    color: "#666",
  },
  value: {
    width: "70%",
    fontSize: 8,
    fontWeight: "bold",
  },
  medItem: {
    marginBottom: 8,
    paddingBottom: 6,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    borderBottomStyle: "dashed",
  },
  medName: {
    fontSize: 10,
    fontWeight: "bold",
    marginBottom: 2,
  },
  medDetail: {
    fontSize: 8,
    color: "#444",
    marginBottom: 1,
  },
  medBadge: {
    flexDirection: "row",
    gap: 4,
    marginTop: 2,
  },
  badge: {
    fontSize: 7,
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 2,
    backgroundColor: "#f0f0f0",
    color: "#333",
  },
  signatureSection: {
    marginTop: 15,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  signatureBox: {
    width: "45%",
    alignItems: "center",
  },
  signatureImage: {
    width: 120,
    height: 60,
    objectFit: "contain",
  },
  signatureLine: {
    width: "100%",
    borderWidth: 0.5,
    borderColor: "#333",
    marginTop: 5,
    marginBottom: 3,
  },
  signatureName: {
    fontSize: 8,
    fontWeight: "bold",
    textAlign: "center",
  },
  signatureInfo: {
    fontSize: 7,
    textAlign: "center",
    color: "#666",
  },
  qrSection: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 10,
    padding: 8,
    backgroundColor: "#f8f8f8",
    borderRadius: 3,
  },
  qrImage: {
    width: 70,
    height: 70,
  },
  verificationInfo: {
    flex: 1,
    marginLeft: 10,
  },
  verifyTitle: {
    fontSize: 8,
    fontWeight: "bold",
    color: "#16a34a",
    marginBottom: 2,
  },
  verifyCode: {
    fontSize: 7,
    fontFamily: "Courier",
    marginBottom: 2,
  },
  verifyText: {
    fontSize: 6,
    color: "#999",
  },
  hashText: {
    fontSize: 6,
    fontFamily: "Courier",
    color: "#999",
    marginTop: 2,
  },
  footer: {
    position: "absolute",
    bottom: 25,
    left: 30,
    right: 30,
    borderTopWidth: 0.5,
    borderTopColor: "#ddd",
    paddingTop: 5,
  },
  footerText: {
    fontSize: 6,
    color: "#999",
    textAlign: "center",
  },
});

interface PrescriptionPdfProps {
  clinica: {
    nombre: string;
    rut: string;
    direccion: string;
    telefono: string;
    correo: string;
    logoUrl?: string;
  };
  medico: {
    nombre: string;
    rut: string;
    registroProfesional: string;
    especialidad?: string;
    firmaUrl?: string;
  };
  tutor: {
    nombre: string;
    rut: string;
    telefono: string;
  };
  paciente: {
    nombre: string;
    especie: string;
    raza: string;
    sexo: string;
    peso?: number;
  };
  receta: {
    folio: string;
    tipo: string;
    fecha: string;
    hora: string;
    diagnostico: string;
    observaciones?: string;
    fechaVencimiento: string;
    codigoVerificacion: string;
    hash: string;
    qrUrl?: string;
  };
  medicamentos: Array<{
    nombre: string;
    principio: string;
    dosis: string;
    frecuencia: string;
    duracion: string;
    via: string;
    cantidad: number;
    indicaciones: string;
    advertencias?: string;
    condicion: string;
    antimicrobiano: boolean;
  }>;
  textoLegal?: string;
}

export function PrescriptionPdfDocument(props: PrescriptionPdfProps) {
  const { clinica, medico, tutor, paciente, receta, medicamentos, textoLegal } = props;

  return (
    <Document>
      <Page size="LETTER" style={styles.page}>
        <View style={styles.header}>
          <View style={styles.clinicInfo}>
            <Text style={styles.clinicName}>{clinica.nombre}</Text>
            <Text style={styles.clinicDetail}>RUT: {clinica.rut}</Text>
            <Text style={styles.clinicDetail}>{clinica.direccion}</Text>
            <Text style={styles.clinicDetail}>Tel: {clinica.telefono} | {clinica.correo}</Text>
          </View>
          {clinica.logoUrl && <Image src={clinica.logoUrl} style={styles.logo} />}
        </View>

        <Text style={styles.title}>RECETA MÉDICO VETERINARIA</Text>
        <Text style={styles.tipoReceta}>{receta.tipo}</Text>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Datos de la Prescripción</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Folio:</Text>
            <Text style={styles.value}>{receta.folio}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Fecha Emisión:</Text>
            <Text style={styles.value}>{receta.fecha} — {receta.hora}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Vigencia hasta:</Text>
            <Text style={styles.value}>{receta.fechaVencimiento}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Tutor</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Nombre:</Text>
            <Text style={styles.value}>{tutor.nombre}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>RUT:</Text>
            <Text style={styles.value}>{tutor.rut}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Teléfono:</Text>
            <Text style={styles.value}>{tutor.telefono}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Paciente</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Nombre:</Text>
            <Text style={styles.value}>{paciente.nombre}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Especie / Raza:</Text>
            <Text style={styles.value}>{paciente.especie} — {paciente.raza}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Sexo / Peso:</Text>
            <Text style={styles.value}>{paciente.sexo}{paciente.peso ? ` — ${paciente.peso} kg` : ""}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Diagnóstico</Text>
          <Text>{receta.diagnostico}</Text>
          {receta.observaciones && (
            <Text style={{ fontSize: 8, color: "#666", marginTop: 2 }}>
              Obs: {receta.observaciones}
            </Text>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Medicamentos Prescritos</Text>
          {medicamentos.map((med, i) => (
            <View key={i} style={styles.medItem}>
              <Text style={styles.medName}>
                {i + 1}. {med.nombre}
              </Text>
              <Text style={styles.medDetail}>Principio activo: {med.principio}</Text>
              <Text style={styles.medDetail}>
                Dosis: {med.dosis} | Frecuencia: {med.frecuencia} | Duración: {med.duracion}
              </Text>
              <Text style={styles.medDetail}>
                Vía: {med.via} | Cantidad: {med.cantidad}
              </Text>
              <Text style={styles.medDetail}>Indicaciones: {med.indicaciones}</Text>
              {med.advertencias && (
                <Text style={styles.medDetail}>
                  Advertencias: {med.advertencias}
                </Text>
              )}
              <View style={styles.medBadge}>
                <Text style={styles.badge}>{med.condicion}</Text>
                {med.antimicrobiano && (
                  <Text style={[styles.badge, { backgroundColor: "#e9d5ff", color: "#6b21a8" }]}>
                    ANTIMICROBIANO
                  </Text>
                )}
              </View>
            </View>
          ))}
        </View>

        <View style={styles.signatureSection}>
          <View style={styles.signatureBox}>
            {medico.firmaUrl && (
              <Image src={medico.firmaUrl} style={styles.signatureImage} />
            )}
            <View style={styles.signatureLine} />
            <Text style={styles.signatureName}>{medico.nombre}</Text>
            <Text style={styles.signatureInfo}>
              RUT: {medico.rut}
            </Text>
            <Text style={styles.signatureInfo}>
              Reg. Prof.: {medico.registroProfesional}
            </Text>
            {medico.especialidad && (
              <Text style={styles.signatureInfo}>
                {medico.especialidad}
              </Text>
            )}
          </View>
        </View>

        <View style={styles.qrSection}>
          {receta.qrUrl && <Image src={receta.qrUrl} style={styles.qrImage} />}
          <View style={styles.verificationInfo}>
            <Text style={styles.verifyTitle}>
              Documento verificable electrónicamente
            </Text>
            <Text style={styles.verifyCode}>
              Código: {receta.codigoVerificacion}
            </Text>
            <Text style={styles.verifyText}>
              Verifique en: https://piwisuite.cl/verify?key={receta.codigoVerificacion}
            </Text>
            <Text style={styles.hashText}>
              SHA-256: {receta.hash}
            </Text>
            <Text style={{ fontSize: 6, color: "#999", marginTop: 2 }}>
              Conforme a Ley 19.799 y Decreto N°25/2005 SAG
            </Text>
          </View>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            {textoLegal ||
              "Documento emitido conforme al Reglamento de Productos Farmacéuticos de Uso Veterinario, Decreto N°25/2005 del SAG. La firma contenida en este documento corresponde a una imagen de firma manuscrita y no constituye firma electrónica avanzada conforme a la Ley N°19.799."}
          </Text>
        </View>
      </Page>
    </Document>
  );
}