import { create } from "zustand";
import type { Patient, Tutor, Veterinarian, PrescriptionItem } from "@/types/database";

export interface PrescriptionItemFormData {
  medicineId: string;
  nombre: string;
  principio: string;
  dosis: string;
  frecuencia: string;
  duracion: string;
  via: string;
  cantidad: number;
  indicaciones: string;
  advertencias: string;
  condicion: string;
  antimicrobiano: boolean;
}

export interface PrescriptionDraft {
  patientId: string | null;
  patient: Patient | null;
  tutorId: string | null;
  tutor: Tutor | null;
  veterinarianId: string | null;
  veterinarian: Veterinarian | null;
  diagnostico: string;
  tipoReceta: string;
  observaciones: string;
  items: PrescriptionItemFormData[];
}

interface PrescriptionStore {
  draft: PrescriptionDraft;
  currentStep: number;
  setStep: (step: number) => void;
  nextStep: () => void;
  prevStep: () => void;
  setPatient: (patient: Patient, tutor: Tutor) => void;
  setVeterinarian: (vet: Veterinarian) => void;
  setDiagnostico: (diag: string) => void;
  setTipoReceta: (tipo: string) => void;
  setObservaciones: (obs: string) => void;
  addItem: (item: PrescriptionItemFormData) => void;
  removeItem: (index: number) => void;
  updateItem: (index: number, item: Partial<PrescriptionItemFormData>) => void;
  reset: () => void;
}

const initialDraft: PrescriptionDraft = {
  patientId: null,
  patient: null,
  tutorId: null,
  tutor: null,
  veterinarianId: null,
  veterinarian: null,
  diagnostico: "",
  tipoReceta: "receta_simple",
  observaciones: "",
  items: [],
};

export const usePrescriptionStore = create<PrescriptionStore>((set, get) => ({
  draft: { ...initialDraft },
  currentStep: 0,
  setStep: (step) => set({ currentStep: step }),
  nextStep: () => set((s) => ({ currentStep: Math.min(s.currentStep + 1, 5) })),
  prevStep: () => set((s) => ({ currentStep: Math.max(s.currentStep - 1, 0) })),
  setPatient: (patient, tutor) =>
    set((s) => ({
      draft: {
        ...s.draft,
        patientId: patient.id,
        patient,
        tutorId: tutor.id,
        tutor,
      },
    })),
  setVeterinarian: (veterinarian) =>
    set((s) => ({
      draft: { ...s.draft, veterinarianId: veterinarian.id, veterinarian },
    })),
  setDiagnostico: (diagnostico) =>
    set((s) => ({ draft: { ...s.draft, diagnostico } })),
  setTipoReceta: (tipoReceta) =>
    set((s) => ({ draft: { ...s.draft, tipoReceta } })),
  setObservaciones: (observaciones) =>
    set((s) => ({ draft: { ...s.draft, observaciones } })),
  addItem: (item) =>
    set((s) => ({ draft: { ...s.draft, items: [...s.draft.items, item] } })),
  removeItem: (index) =>
    set((s) => ({
      draft: { ...s.draft, items: s.draft.items.filter((_, i) => i !== index) },
    })),
  updateItem: (index, updates) =>
    set((s) => ({
      draft: {
        ...s.draft,
        items: s.draft.items.map((item, i) =>
          i === index ? { ...item, ...updates } : item
        ),
      },
    })),
  reset: () => set({ draft: { ...initialDraft }, currentStep: 0 }),
}));