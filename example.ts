import { tags, js } from "./swan.ts";

const { div, button, img, ul, li, p } = tags;

const is_admin = true;
const user_list = ["Alice", "Bob", "Charlie", "David"];
const message_count = 5;

const app = div(
	{
		id: "app",
		class: "p-4",
	},
	// Original content
	div(
		{
			id: "child",
			class: "bg-white",
		},
		"Hello, world!",
		button(
			{
				onclick: js`
                console.log("clicked", e);
            `,
			},
			"Click me",
			img({ src: "test.svg", alt: "" }),
		),
	),

	// Conditional rendering
	is_admin &&
		div(
			{
				class: "admin_panel",
			},
			"Admin Panel",
			p(
				{
					class: "admin_message",
				},
				`You have ${message_count} new messages`,
			),
		),

	// List rendering with for loop
	ul(
		{ class: "user_list" },
		...user_list.map((user_name, index) =>
			li(
				{
					class: "user_item",
					onclick: js`
			            console.log("Selected user:", ${user_name});
			            console.log(${`Hello, ${user_name}!`});
			        `,
				},
				`${index + 1}. ${user_name}`,
				index % 2 === 0 &&
					img({
						src: "verified.svg",
						alt: "verified user",
						class: "verified_badge",
					}),
			),
		),
	),
);

console.log("HTML:");
console.log(app.html);
console.log("\nJavaScript:");
console.log(app.js);
