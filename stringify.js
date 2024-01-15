export default function stringify(root) {
  let lines = []

  function view(e) {
    // This local function will never be called with an object. We can
    // usually use JSON.stringify, but not always. There are a few special
    // cases to handle.
    if (typeof e === "function") return "<Function>"
    if (typeof e === "symbol") return e.valueOf()
    if (typeof e == "bigint") return e
    return JSON.stringify(e)
  }

  function ast(node, indent = 0, prefix = "") {
    if (node === null || typeof node !== "object") return

    // Esprima's type field is much nicer than the node's constructor name.
    let type = node?.type ?? node.constructor.name
    let simpleProps = {}
    let objectProps = {}
    for (let [k, v] of Object.entries(node)) {
      if (typeof v === "object" && v !== null) objectProps[k] = v
      else simpleProps[k] = v
    }

    // We want to print the simple properties first, then the object properties.
    // Let's keep the display rather light, eliding the display of many of the
    // falses and nulls that are basically default cases. Also we don't want to
    // show the type field since we're using that at the beginning of a line.
    simpleProps = Object.entries(simpleProps)
      .filter(([k, v]) => k !== "type" || v !== type)
      .filter(
        ([k, v]) =>
          ![
            "async",
            "generator",
            "optional",
            "computed",
            "delegate",
            "expression",
            "shorthand",
            "method",
            "static",
          ].includes(k) || v !== false
      )
      .filter(
        ([k, v]) => !["superClass", "decorators"].includes(k) || v !== null
      )
      .map(([k, v]) => `<span class='key'>${k}</span>=${view(v)}`)

    // Show the line for the current object with its simple properties...
    let line = `${" ".repeat(indent)}<span class='key'>${prefix}</span>`
    if (prefix) line += ": "
    line += `<strong>${type}</strong> ${simpleProps.join(" ")}`
    lines.push(`<div style='margin-left:${indent * 20}px'>${line}</div>`)

    // ...then for each object property, show indented on following lines.
    for (let [k, v] of Object.entries(objectProps)) {
      if (Array.isArray(v)) {
        for (let [i, e] of v.entries()) {
          // Manufacture property names for array elements.
          ast(e, indent + 1, `${k}[${i}]`)
        }
      } else {
        ast(v, indent + 1, k)
      }
    }
  }

  ast(root)
  return lines.join("\n")
}
