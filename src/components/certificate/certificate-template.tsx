// src/components/certificate/certificate-template.tsx
import { formatDate } from "@/lib/utils/date";

interface CertificateTemplateProps {
  studentName: string;
  courseName: string;
  completionDate: string;
  validationCode: string;
  quizScore: number;
  courseHours?: number;
}

export function CertificateTemplate({
  studentName,
  courseName,
  completionDate,
  validationCode,
  quizScore,
  courseHours = 10,
}: CertificateTemplateProps) {
  return (
    <div className="w-[1024px] h-[768px] bg-white p-16 relative text-center">
      {/* Border decorativa */}
      <div className="absolute inset-8 border-8 border-double border-blue-200" />

      {/* Cabeçalho */}
      <div className="mb-12">
        <h1 className="text-4xl font-serif text-blue-950 mb-4">
          Certificado de Conclusão
        </h1>
        <div className="h-1 w-32 bg-blue-950 mx-auto" />
      </div>

      {/* Conteúdo principal */}
      <div className="space-y-8 text-gray-800">
        <p className="text-2xl font-light">Certificamos que</p>

        <p className="text-3xl font-semibold text-blue-950">{studentName}</p>

        <p className="text-xl">concluiu com êxito o curso</p>

        <p className="text-3xl font-semibold text-blue-950">{courseName}</p>

        <p className="text-xl">
          com carga horária de {courseHours} horas
          <br />
          obtendo aproveitamento de {quizScore}%
        </p>
      </div>

      {/* Rodapé */}
      <div className="absolute bottom-16 left-16 right-16">
        <div className="flex justify-between items-end">
          <div>
            <p className="text-sm text-gray-600">Data de conclusão</p>
            <p className="text-lg">{formatDate(completionDate)}</p>
          </div>

          <div className="text-center">
            <div className="w-48 h-px bg-gray-400 mb-2" />
            <p className="text-sm text-gray-600">Nome do Diretor</p>
            <p className="text-xs text-gray-500">Diretor Acadêmico</p>
          </div>

          <div className="text-right">
            <p className="text-sm text-gray-600">Código de validação</p>
            <p className="text-lg font-mono">{validationCode}</p>
          </div>
        </div>
      </div>

      {/* QR Code URL */}
      <div className="absolute bottom-4 right-4 text-xs text-gray-500">
        Validar em: {process.env.NEXT_PUBLIC_APP_URL}/validate/{validationCode}
      </div>
    </div>
  );
}
