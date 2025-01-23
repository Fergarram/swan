# Swan
A tiny typescript template engine inspired by [Van.js](https://github.com/vanjs-org/van) with JavaScript event handling.

## Description
Swan is a minimalistic template engine that takes inspiration from Van.js's approach to building web interfaces, but focuses specifically on generating static HTML with associated JavaScript handlers. Unlike Van.js which is a reactive UI framework, Swan specializes in producing separate HTML and JavaScript output, making it particularly suitable for server-side rendering scenarios.

## Features
- No dependencies
- No runtime dependencies
- Tiny and readable

## Example Usage

### Basic Example with Event Handler
```typescript
import { tags, js } from "./swan.ts";

const { div, button } = tags;

const app = div(
  { class: "container" },
  button(
    { 
      onclick: js`console.log("Clicked!", e)` 
    },
    "Click me"
  )
);
```

Output:

```html
<div class="container"><button data-swan-id="39d7322b-66e6-4332-9004-436f946ac50a">Click me</button></div>
```

```javascript
document.querySelector('[data-swan-id="39d7322b-66e6-4332-9004-436f946ac50a"]')
.addEventListener('click', (e) => {
    console.log("Clicked!", e)
});
```

### List Rendering
```typescript
const { ul, li } = tags;

const items = ["Apple", "Banana", "Orange"];

const list = ul(
  { class: "fruits" },
  ...items.map((fruit, i) => 
    li(
      { 
        onclick: js`console.log("Selected:", ${fruit})` 
      },
      `${i + 1}. ${fruit}`
    )
  )
);
```

### Conditional Rendering
```typescript
const { div, p } = tags;

const isLoggedIn = true;
const username = "John";

const welcome = div(
  isLoggedIn && p(
    { class: "welcome" },
    `Welcome back, ${username}!`
  )
);
```

### About the `js` Template Literal
The `js` template literal is used to properly escape strings in JavaScript event handlers. For example:

```typescript
js`console.log(${username})` 
// becomes: console.log("John")

js`alert(${`Hello ${username}!`})`
// becomes: alert("Hello John!")
```

The main reason behind this decision is to not break the syntax highlighting of code editors.

## License
MIT
