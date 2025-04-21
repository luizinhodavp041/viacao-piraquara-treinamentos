// src/app/api/vimeo/config.ts (corrigido)
import Vimeo from 'vimeo';

const clientId = process.env.VIMEO_CLIENT_ID || '';
const clientSecret = process.env.VIMEO_CLIENT_SECRET || '';
const accessToken = process.env.VIMEO_ACCESS_TOKEN || '';

if (!clientId || !clientSecret || !accessToken) {
  console.error("Credenciais do Vimeo não configuradas corretamente");
}

// @ts-ignore - Ignorando erros de tipagem do cliente Vimeo
const vimeoClient = new Vimeo.Vimeo(clientId, clientSecret, accessToken);

export default vimeoClient;