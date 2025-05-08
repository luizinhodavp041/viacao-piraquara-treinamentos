// src/lib/vimeo-client.ts
import Vimeo from "vimeo";

// Certifique-se de que estas variáveis estão definidas no seu arquivo .env.local
const clientId = process.env.VIMEO_CLIENT_ID;
const clientSecret = process.env.VIMEO_CLIENT_SECRET;
const accessToken = process.env.VIMEO_ACCESS_TOKEN;

if (!clientId || !clientSecret || !accessToken) {
  console.error(
    "⚠️ Credenciais do Vimeo não configuradas. Configure as variáveis de ambiente VIMEO_CLIENT_ID, VIMEO_CLIENT_SECRET e VIMEO_ACCESS_TOKEN"
  );
}

// Inicializar o cliente da API do Vimeo
const vimeoClient = new Vimeo.Vimeo(
  clientId as string,
  clientSecret as string,
  accessToken as string
);

export default vimeoClient;
