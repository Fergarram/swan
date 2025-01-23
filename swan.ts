import { randomUUID } from "crypto";

interface Props {
	is?: string;
	[key: string]: any;
}

type TagResult = {
	html: string;
	js: string;
};

type TagFunction = (props?: Props, ...children: any[]) => TagResult;

interface StringHandler {
	get: (target: any, name: string) => TagFunction;
}

const string_handler = (ns?: string): StringHandler => ({
	get:
		(_, name: string): TagFunction =>
		(...args: any[]): TagResult => {
			let [{ is, ...props }, ...children] =
				Object.getPrototypeOf(args[0] ?? 0) === Object.prototype ? args : [{} as Props, ...args];

			let html = `<${name}`;
			let js = "";
			const element_id = randomUUID();

			// Add props/attributes
			for (const [k, v] of Object.entries(props)) {
				if (v === true) {
					html += ` ${k}`;
				} else if (v !== false && v != null) {
					if (k.startsWith("on")) {
						// Handle event handlers
						html += ` data-swan-id="${element_id}"`;
						const event_name = k.toLowerCase().slice(2); // remove 'on' prefix
						js += `
                            document.querySelector('[data-swan-id="${element_id}"]')
                                .addEventListener('${event_name}', (e) => {
                                    ${v}
                                });
                        `;
					} else {
						// Handle regular attributes
						const char_map: { [key: string]: string } = {
							"&": "&amp;",
							"<": "&lt;",
							">": "&gt;",
							'"': "&quot;",
							"'": "&#39;",
						};

						const safe_value = String(v).replace(/[&<>"']/g, (c: string) => char_map[c]);
						html += ` ${k}="${safe_value}"`;
					}
				}
			}

			// Self-closing tags
			const void_elements: Set<string> = new Set([
				"area",
				"base",
				"br",
				"col",
				"embed",
				"hr",
				"img",
				"input",
				"link",
				"meta",
				"param",
				"source",
				"track",
				"wbr",
			]);

			if (void_elements.has(name)) {
				return { html: html + "/>", js };
			}

			html += ">";

			// Add children
			const add_children = (items: any[]): void => {
				for (const child of items.flat(Infinity)) {
					if (child != null) {
						if (typeof child === "object" && "html" in child && "js" in child) {
							html += child.html;
							js += child.js;
						} else {
							html += String(child);
						}
					}
				}
			};

			add_children(children);

			return {
				html: html + `</${name}>`,
				js,
			};
		},
});

type TagsProxy = {
	[key: string]: TagFunction;
} & ((ns?: string) => TagsProxy);

const tags: TagsProxy = new Proxy(((ns?: string) => new Proxy({}, string_handler(ns))) as TagsProxy, string_handler());

const js = (strings: TemplateStringsArray, ...values: any[]) =>
	strings.reduce((result, str, i) => {
		const value = values[i];
		if (value === undefined) return result + str;

		const formatted =
			typeof value === "string"
				? `"${value.replace(/"/g, '\\"')}"` // Escape quotes in strings
				: String(value);

		return result + str + formatted;
	}, "");

export { tags, js };
