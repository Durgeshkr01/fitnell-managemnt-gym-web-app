"use client";

import type { ButtonHTMLAttributes, MouseEvent } from "react";
import { useAction } from "./action-provider";

type ActionButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  actionName: string;
  actionMeta?: Record<string, unknown>;
};

export default function ActionButton({
  actionName,
  actionMeta,
  onClick,
  type = "button",
  ...props
}: ActionButtonProps) {
  const { runAction } = useAction();
  const className = ["btn-base", props.className].filter(Boolean).join(" ");

  const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
    onClick?.(event);

    if (!event.defaultPrevented) {
      runAction(actionName, actionMeta);
    }
  };

  return (
    <button {...props} className={className} onClick={handleClick} type={type} />
  );
}
