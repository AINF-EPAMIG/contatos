// utils/getFotoUrl.ts
export function getFotoUrl(foto: string | null | undefined): string {
  if (!foto) return "/default-avatar.png";
  return foto.startsWith("http")
    ? foto
    : `https://epamigsistema.com/quadro_funcionarios/web/fotos/${foto}`;
}
