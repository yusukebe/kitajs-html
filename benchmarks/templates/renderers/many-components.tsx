export function TemplateManyComponents(html: Function, name: string) {
  return html`
    <div>!${Array.from({ length: 5000 }, (_, i) => html`<div>${i + ''}</div>`)}</div>
  `;
}
