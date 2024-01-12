import { parseModule } from "./esprima.js"
import stringify from "./stringify.js"

const source = document.getElementById("source")
const tree = document.getElementById("tree")

function debounce(func, delay) {
  let timeoutId
  return function () {
    clearTimeout(timeoutId)
    timeoutId = setTimeout(func, delay)
  }
}

function handleInput() {
  try {
    tree.style.color = "black"
    tree.value = stringify(parseModule(source.value))
  } catch (err) {
    tree.style.color = "#a00"
    tree.value = err.message
  }
}

source.addEventListener("input", debounce(handleInput, 1000))
