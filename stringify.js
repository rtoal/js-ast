export default function stringify(root) {
  let lines = []

  function view(e) {
    if (e === null || typeof e !== "object") return JSON.stringify(e)
    if (e.constructor === Function) return "<Function>"
    if (e.constructor === BigInt) return e
    if (e.type) return e.type
    return e.constructor.name
  }

  function ast(node, indent = 0, prefix = "") {
    if (node === null || typeof node !== "object") return

    let type = node?.type ?? node.constructor.name
    let simpleProps = {}
    let objectProps = {}
    for (let [k, v] of Object.entries(node)) {
      if (typeof v === "object" && v !== null) objectProps[k] = v
      else simpleProps[k] = v
    }

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

    let line = `${" ".repeat(indent)}<span class='key'>${prefix}</span>`
    if (prefix) line += ": "
    line += `<strong>${type}</strong> ${simpleProps.join(" ")}`
    lines.push(`<div style='margin-left:${indent * 20}px'>${line}</div>`)
    for (let [k, v] of Object.entries(objectProps)) {
      if (Array.isArray(v)) {
        for (let [i, e] of v.entries()) {
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
