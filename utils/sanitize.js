/**
 * Sanitiza um texto para usar como nome de pasta/arquivo.
 * - Remove acentos
 * - Remove caracteres especiais
 * - Espaços viram underscore
 * - Tudo minúsculo
 */
export function sanitizarIdentificador(texto) {
  if (!texto) return 'temp';

  return texto
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')       // remove acentos: çáo → cao
    .replace(/\s+/g, '_')                   // espaços → underscore
    .replace(/[^a-z0-9_-]/g, '')            // remove qualquer caractere não seguro
    .replace(/_+/g, '_')                    // underscores duplicados → um só
    .replace(/^_|_$/g, '');                 // remove underscore no início/fim
}