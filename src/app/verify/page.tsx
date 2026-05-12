"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";

type VerifyResult = {
  valid: boolean;
  folio?: string;
  fecha?: string;
  paciente?: string;
  medico?: string;
  clinica?: string;
  estado?: string;
} | null;

export default function VerifyPage() {
  const [code, setCode] = useState("");
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState<VerifyResult>(null);
  const [loading, setLoading] = useState(false);

  const handleVerify = async () => {
    if (!code.trim()) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/verify?code=${encodeURIComponent(code.trim())}`);
      if (res.ok) {
        const data = await res.json();
        setResult(data);
      } else {
        setResult({ valid: false });
      }
    } catch {
      setResult({ valid: false });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 py-8 bg-background">
      <div className="w-full max-w-sm space-y-6">
        <div className="flex flex-col items-center gap-2 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold">Verificar Receta</h1>
          <p className="text-sm text-muted-foreground">
            Ingresa el código o escanea el QR para verificar la autenticidad de
            una receta veterinaria
          </p>
        </div>

        <div className="space-y-3">
          <Input
            label="Código de verificación"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="VET-XXXXXX-XXXXXXXX"
            className="text-center font-mono text-lg"
          />
          <Button
            className="w-full"
            onClick={handleVerify}
            disabled={!code.trim() || loading}
          >
            {loading ? "Verificando..." : "Verificar"}
          </Button>
          <Button
            variant="outline"
            className="w-full"
            onClick={() => setScanning(true)}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="mr-2">
              <rect x="3" y="3" width="7" height="7" />
              <rect x="14" y="3" width="7" height="7" />
              <rect x="3" y="14" width="7" height="7" />
              <rect x="14" y="14" width="7" height="7" />
            </svg>
            Escanear QR
          </Button>
        </div>

        {result && (
          <Card className={result.valid ? "border-green-500" : "border-red-500"}>
            <CardContent className="pt-4">
              {result.valid ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <div className="h-10 w-10 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-green-600 dark:text-green-400">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    </div>
                    <div>
                      <p className="font-bold text-green-800 dark:text-green-200">
                        Receta Válida
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Documento verificado
                      </p>
                    </div>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Folio</span>
                      <span className="font-mono">{result.folio}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Fecha</span>
                      <span>{result.fecha}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Paciente</span>
                      <span>{result.paciente}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Médico</span>
                      <span>{result.medico}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Clínica</span>
                      <span>{result.clinica}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Estado</span>
                      <span
                        className={`font-medium ${
                          result.estado === "vigente"
                            ? "text-green-600"
                            : result.estado === "vencida"
                            ? "text-yellow-600"
                            : "text-red-600"
                        }`}
                      >
                        {result.estado}
                      </span>
                    </div>
                  </div>
                  <p className="text-[10px] text-muted-foreground text-center mt-3">
                    Documento verificable electrónicamente conforme a Ley 19.799
                  </p>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2 py-4">
                  <div className="h-12 w-12 rounded-full bg-red-100 dark:bg-red-900 flex items-center justify-center">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-red-600 dark:text-red-400">
                      <path d="M18 6L6 18M6 6l12 12" />
                    </svg>
                  </div>
                  <p className="font-bold text-red-800 dark:text-red-200">
                    Receta No Válida
                  </p>
                  <p className="text-xs text-muted-foreground text-center">
                    El código no corresponde a una receta válida o ha sido anulada
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}