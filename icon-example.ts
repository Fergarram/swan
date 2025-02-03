import { tags, Props } from "../swan.ts";
const { span } = tags;

export type IconProps = Props & {
  class?: string;
};

export function Icon(props: IconProps | string, icon?: string) {
  if (typeof props === 'string') {
    return span(
      {
        class: 'icon w-[1em] h-[1em]',
        "aria-hidden": "true",
      },
      props
    );
  }

  const { class: className, ...restProps } = props;

  if (!icon) {
		throw new Error("Icon prop is required");
	}

  return span(
    {
      ...restProps,
      class: `icon ${className || ''} w-[1em] h-[1em]`,
      "aria-hidden": "true",
    },
    icon
  );
}
