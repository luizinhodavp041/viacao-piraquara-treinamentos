// src/app/api/vimeo/config.ts
import { Vimeo } from "vimeo";

// Verificação de ambiente antes de inicializar
const clientId = process.env.VIMEO_CLIENT_ID;
const clientSecret = process.env.VIMEO_CLIENT_SECRET;
const accessToken = process.env.VIMEO_ACCESS_TOKEN;

// Verificar se as variáveis de ambiente estão definidas
if (!clientId || !clientSecret || !accessToken) {
  throw new Error(
    "Variáveis de ambiente do Vimeo não estão configuradas corretamente"
  );
}

// Criar o cliente do Vimeo com as variáveis verificadas
const client = new Vimeo(clientId, clientSecret, accessToken);

export default client;
