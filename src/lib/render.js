import Handlebars from "handlebars";

/** Merge declared variable defaults with provided values (values win). */
export function mergeValues(variables = [], values = {}) {
  const merged = {};
  for (const v of variables) {
    if (v && v.name) merged[v.name] = v.default ?? "";
  }
  return { ...merged, ...values };
}

/** Render a Handlebars body template. noEscape: it's code/markdown, not HTML.
 *  Pure function — safe to import from both server and client. */
export function renderTemplate(bodyTemplate = "", variables = [], values = {}) {
  const tmpl = Handlebars.compile(String(bodyTemplate || ""), { noEscape: true });
  return tmpl(mergeValues(variables, values));
}
