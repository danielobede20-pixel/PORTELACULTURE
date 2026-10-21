// CAPAS-20261021: desfaz, so em memoria, as trocas de capa registradas em scripts/dados/capas-aplicadas.json.
// Usado pelos testes de hash (published-baseline, v7-catalog-integrity, rescued-assets) para descontar SOMENTE
// a mudanca autorizada de capa; todos os outros produtos continuam travados pelo hash original.
// Registro: {"PC-123": {capa_original, nova_capa, tipo: "LIMPA_OK"|"TROCAR", indice?}}
//   LIMPA_OK: fotos[0] original foi substituida pela capa limpa (media/capas-limpas/<id>.webp).
//   TROCAR:   fotos[indice] da galeria original foi movida para a posicao 0 (nenhuma foto perdida).
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

export const ARQ_APLICADAS = 'scripts/dados/capas-aplicadas.json';

export function lerAplicadas(raiz = '.') {
  const arq = join(raiz, ARQ_APLICADAS);
  return existsSync(arq) ? JSON.parse(readFileSync(arq, 'utf8').replace(/^﻿/, '')) : {};
}

// Galeria original de um produto, dado o estado atual e o registro. Se a capa atual nao for a "nova_capa"
// (catalogo ja revertido / registro velho), devolve a galeria como esta.
export function reverterFotos(fotos, reg) {
  if (!reg || !Array.isArray(fotos) || fotos[0] !== reg.nova_capa) return fotos;
  if (reg.tipo === 'LIMPA_OK') return [reg.capa_original, ...fotos.slice(1)];
  if (reg.tipo === 'TROCAR') { const resto = fotos.slice(1); resto.splice(reg.indice, 0, reg.nova_capa); return resto; }
  throw new Error(`capas-aplicadas: tipo invalido "${reg.tipo}"`);
}

export function reverterCapas(catalog, aplicadas) {
  return catalog.map(p => {
    const reg = aplicadas[p.id];
    if (!reg || !Array.isArray(p.fotos)) return p;
    const fotos = reverterFotos(p.fotos, reg);
    return fotos === p.fotos ? p : { ...p, fotos };
  });
}
