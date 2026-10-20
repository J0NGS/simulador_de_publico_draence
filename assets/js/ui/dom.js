/**
 * ============================================
 * DRAENCE — AUXILIARES DE DOM
 * ============================================
 */

export const $ = (selector, root = document) => root.querySelector(selector);

/** Ícone do sprite (assets/js/icons.js) como string HTML. */
export const icon = (name, extraClass = '') => (
  `<svg class="icon${extraClass ? ` ${extraClass}` : ''}" aria-hidden="true"><use href="#i-${name}"></use></svg>`
);

/**
 * Cria um elemento: h('button', { class: 'btn', onclick: fn }, 'Texto', filho).
 * Atributos viram propriedades quando existem no elemento (value, min, disabled...)
 * e atributos comuns nos demais casos (aria-*, data-*).
 */
export function h(tag, attrs = {}, ...children) {
  const node = document.createElement(tag);
  let value;

  for (const [key, val] of Object.entries(attrs)) {
    if (val === null || val === undefined || val === false) continue;
    if (key === 'value') value = val; // por último, depois de min/max/step
    else if (key === 'class') node.className = val;
    else if (key === 'for') node.htmlFor = val;
    else if (key.startsWith('on')) node.addEventListener(key.slice(2), val);
    else if (key in node) node[key] = val;
    else node.setAttribute(key, val === true ? '' : val);
  }
  if (value !== undefined) node.value = value;

  children.flat().forEach((child) => {
    if (child === null || child === undefined || child === false) return;
    node.append(child.nodeType ? child : document.createTextNode(child));
  });
  return node;
}

export const clamp = (n, min, max) => Math.min(max, Math.max(min, n));
