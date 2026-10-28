export const fontStacks: Record<string,string> = {
  system: 'system-ui, "Segoe UI", sans-serif',
  segoe: '"Segoe UI Variable", "Segoe UI", sans-serif',
  inter: 'Inter, "Segoe UI", sans-serif',
  arial: 'Arial, sans-serif',
  georgia: 'Georgia, "Times New Roman", serif',
  verdana: 'Verdana, Geneva, sans-serif',
  trebuchet: '"Trebuchet MS", "Segoe UI", sans-serif',
};
export function applyFont(value: string) {
  document.documentElement.style.setProperty('--user-font-family', fontStacks[value] ?? fontStacks.system);
}
