function palavras(nome) {
  return String(nome || '')
    .trim()
    .split(/\s+/)
    .filter(Boolean);
}

export function primeiroNome(nome) {
  return palavras(nome)[0] || '';
}

export function nomeCurto(nome) {
  return palavras(nome).slice(0, 2).join(' ');
}
