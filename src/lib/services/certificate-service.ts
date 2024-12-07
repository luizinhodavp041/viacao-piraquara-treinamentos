// src/lib/services/certificate-service.ts
import puppeteer from "puppeteer";

export async function generateCertificatePDF({
  studentName,
  courseName,
  completionDate,
  validationCode,
  quizScore,
  courseHours = 10,
}: {
  studentName: string;
  courseName: string;
  completionDate: string;
  validationCode: string;
  quizScore: number;
  courseHours?: number;
}) {
  try {
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <style>
            body {
              margin: 0;
              padding: 0;
              font-family: system-ui, -apple-system, sans-serif;
            }
            .certificate {
              width: 1024px;
              height: 768px;
              padding: 64px;
              position: relative;
              background: white;
              text-align: center;
            }
            .border {
              position: absolute;
              inset: 32px;
              border: 8px double #BFDBFE;
            }
            .header {
              margin-bottom: 48px;
            }
            .header h1 {
              color: #1E3A8A;
              font-size: 36px;
              margin-bottom: 16px;
              font-family: serif;
            }
            .divider {
              height: 2px;
              width: 128px;
              background: #1E3A8A;
              margin: 0 auto;
            }
            .content {
              margin: 32px 0;
              color: #1F2937;
            }
            .student-name {
              font-size: 32px;
              font-weight: 600;
              color: #1E3A8A;
              margin: 16px 0;
            }
            .course-name {
              font-size: 28px;
              font-weight: 600;
              color: #1E3A8A;
              margin: 16px 0;
            }
            .details {
              font-size: 20px;
              margin: 16px 0;
            }
            .footer {
              position: absolute;
              bottom: 64px;
              left: 64px;
              right: 64px;
              display: flex;
              justify-content: space-between;
              align-items: flex-end;
            }
            .footer-item {
              text-align: center;
            }
            .footer-label {
              color: #6B7280;
              font-size: 14px;
            }
            .footer-value {
              font-size: 18px;
            }
            .signature-line {
              width: 192px;
              height: 1px;
              background: #9CA3AF;
              margin-bottom: 8px;
            }
            .validation {
              position: absolute;
              bottom: 16px;
              right: 16px;
              font-size: 12px;
              color: #6B7280;
            }
          </style>
        </head>
        <body>
          <div class="certificate">
            <div class="border"></div>
            
            <div class="header">
              <h1>Certificado de Conclusão</h1>
              <div class="divider"></div>
            </div>

            <div class="content">
              <p>Certificamos que</p>
              <p class="student-name">${studentName}</p>
              <p>concluiu com êxito o curso</p>
              <p class="course-name">${courseName}</p>
              <p class="details">
                com carga horária de ${courseHours} horas<br/>
                obtendo aproveitamento de ${quizScore}%
              </p>
            </div>

            <div class="footer">
              <div class="footer-item">
                <p class="footer-label">Data de conclusão</p>
                <p class="footer-value">${new Date(
                  completionDate
                ).toLocaleDateString("pt-BR")}</p>
              </div>

              <div class="footer-item">
                <div class="signature-line"></div>
                <p class="footer-label">Nome do Diretor</p>
                <small>Diretor Acadêmico</small>
              </div>

              <div class="footer-item">
                <p class="footer-label">Código de validação</p>
                <p class="footer-value">${validationCode}</p>
              </div>
            </div>

            <div class="validation">
              Validar em: ${
                process.env.NEXT_PUBLIC_APP_URL
              }/validate/${validationCode}
            </div>
          </div>
        </body>
      </html>
    `;

    // Inicia o Puppeteer
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    // Define o conteúdo e as configurações da página
    await page.setContent(html, {
      waitUntil: "networkidle0",
    });

    // Configura o tamanho da página
    await page.setViewport({
      width: 1024,
      height: 768,
      deviceScaleFactor: 2,
    });

    // Gera o PDF
    const pdf = await page.pdf({
      format: "A4",
      landscape: true,
      printBackground: true,
      margin: { top: "0", right: "0", bottom: "0", left: "0" },
    });

    await browser.close();

    return pdf;
  } catch (error) {
    console.error("Erro ao gerar certificado:", error);
    throw new Error("Falha ao gerar o certificado");
  }
}
