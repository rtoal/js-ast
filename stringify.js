export default function stringify(root) {
  const tags = new Map();

  function tag(node) {
    if (tags.has(node) || typeof node !== "object" || node === null) return;
    tags.set(node, tags.size + 1);
    for (const child of Object.values(node)) {
      Array.isArray(child) ? child.forEach(tag) : tag(child);
    }
  }

  function* lines() {
    function view(e) {
      if (tags.has(e)) return `#${tags.get(e)}`;
      if (Array.isArray(e)) return `[${e.map(view)}]`;
      if (e?.constructor === Function) return "<Function>";
      if (e?.constructor === BigInt) return e;
      return JSON.stringify(e);
    }
    for (let [node, id] of [...tags.entries()].sort((a, b) => a[1] - b[1])) {
      let type = node?.type ?? node.constructor.name;
      let props = Object.entries(node)
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
        .map(([k, v]) => `${k}=${view(v)}`);
      yield `${String(id).padStart(4, " ")} | ${type} ${props.join(" ")}`;
    }
  }

  tag(root);
  return [...lines()].join("\n");
}
