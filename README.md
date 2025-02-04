# Swan
A tiny typescript template engine inspired by [Van.js](https://github.com/vanjs-org/van).

### Demo at [fernando.works](https://fernando.works)

---

## Description
Unlike Van.js which is a reactive UI framework, Swan focuses on just helping you create an interface tree that renders into strings of html and javascript. It provides a simple render function that writes html and js files to files under a directory.

## Features
- No dependencies
- No runtime dependencies
- Tiny, readable and hackable.
- Fast

It took about 215,000ms for 200,000 pages with static data.

215000ms / 200000 pages = 1.075ms per page
≈ 930 pages per second

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
        onclick: js`console.log("Selected:", "${fruit}")` 
      },
      `${i + 1}. ${fruit}`
    )
  )
);
```

### Conditional Rendering
```typescript
const { div, p } = tags;

const is_logged_in = true;
const username = "John";

const welcome = div(
  is_logged_in && p(
    { class: "welcome" },
    `Welcome back, ${username}!`
  )
);
```

## License
MIT
