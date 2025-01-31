//
// Swan 1.0.0
// by fergarram
//

// A lightweight system for generating HTML and JS with a component-like syntax

//
// Index:
//

// — Dependencies
// — Core Types
// — HTML Tag Generation
// — Code Literals
// — File Renderer (optional)

//
// Dependencies
//

// compatible with NodeJS, Bun and Deno.

// For uuid generation
import { randomUUID } from "crypto";

// For render function which writes html and js files to a path
import { mkdir, writeFile } from "fs/promises";
import { join, dirname } from "path";

// NOTE:
// If the render function get's removed it would make this module
// compatible with Cloudflare Workers and Browser environments.

//
// Core Types
//

export type RenderOptions = {
	out: string;
	slug: string;
	html: string;
	js: string;
};

export type Props = {
	is?: string;
	[key: string]: any;
};

export type TagResult = {
	html: string;
	js: string;
};

export type TagFunction = (props?: Props | string | TagResult, ...children: (TagResult | string)[]) => TagResult;

export type TagsProxy = {
	[key: string]: TagFunction;
} & ((ns?: string) => TagsProxy);

//
// HTML Tag Generation
//

export const tag_generator =
	(_, name: string): TagFunction =>
	(...args: any[]): TagResult => {
		let props: Props = {};
		let children: (TagResult | string)[] = args;

		if (args.length > 0) {
			const first_arg = args[0];

			// If first argument is a string or TagResult, all args are children
			if (typeof first_arg === "string" || (typeof first_arg === "object" && "html" in first_arg)) {
				children = args;
			}

			// If first argument is a plain object, treat it as props
			else if (Object.getPrototypeOf(first_arg ?? 0) === Object.prototype) {
				const [props_arg, ...rest_args] = args;
				const { is, ...rest_props } = props_arg;
				props = rest_props;
				children = rest_args;
			}
		}

		let html = `<${name}`;
		let js = "";
		const element_id = randomUUID();

		// Handle props/attributes
		for (const [k, v] of Object.entries(props)) {
			// Evaluate the prop value if it's a function
			const value = typeof v === "function" ? v() : v;

			if (value === true) {
				html += ` ${k}`;
			} else if (value !== false && value != null) {
				if (k.startsWith("on")) {
					html += ` data-swan-id="${element_id}"`;
					const event_name = k.toLowerCase().slice(2);
					js += `document.querySelector('[data-swan-id="${element_id}"]').addEventListener('${event_name}',(e)=>{${value}});
		            `;
				} else {
					const char_map: { [key: string]: string } = {
						"&": "&amp;",
						"<": "&lt;",
						">": "&gt;",
						'"': "&quot;",
						"'": "&#39;",
					};

					const safe_value = String(value).replace(/[&<>"']/g, (c: string) => char_map[c]);
					html += ` ${k}="${safe_value}"`;
				}
			}
		}

		// Self-closing tags handling
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
		const add_children = (items: (TagResult | string)[]): void => {
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
	};

// Yeah it looks funny...
export const tags: TagsProxy = new Proxy(
	() =>
		new Proxy(
			{},
			{
				get: tag_generator,
			},
		),
	{
		get: tag_generator,
	},
);

//
// Code Literals
//

export const js = (strings: TemplateStringsArray, ...values: any[]) =>
	strings.reduce((result, str, i) => {
		const value = values[i];
		if (value === undefined) return result + str;
		return result + str + String(value);
	}, "");

export const css = (strings: TemplateStringsArray, ...values: any[]) =>
	strings.reduce((result, str, i) => {
		const value = values[i];
		if (value === undefined) return result + str;
		return result + str + String(value);
	}, "");


//
// File Renderer (optional)
//

export async function render({ out: out_dir, slug, html, js }: RenderOptions): Promise<void> {
	// Convert "/" to "index"
	const normalized_slug = slug === "/" ? "index" : slug;

	const html_path = join(out_dir, `${normalized_slug}.html`);
	const js_path = join(out_dir, `${normalized_slug}.js`);

	try {
		// Ensure directories exist
		await mkdir(dirname(html_path), { recursive: true });
		await mkdir(dirname(js_path), { recursive: true });

		// Write HTML file
		await writeFile(html_path, html, "utf-8");

		// Only write JS file if there's JS content
		if (js.trim()) {
			await writeFile(js_path, js, "utf-8");
		}

		console.log(`✓ Generated ${html_path}`);
		if (js.trim()) {
			console.log(`✓ Generated ${js_path}`);
		}
	} catch (error) {
		console.error(`Error generating files for "${normalized_slug}":`, error);
		throw error;
	}
}
