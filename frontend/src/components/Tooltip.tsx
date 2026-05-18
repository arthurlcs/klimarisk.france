import { useState, useRef } from "react";
import "./Tooltip.css";
import {
  useFloating,
  offset,
  flip,
  shift,
  autoUpdate,
  FloatingPortal,
  arrow,
} from "@floating-ui/react";

interface Props {
  children: React.ReactNode;
  text: string | undefined | null | React.ReactNode;
}

function Tooltip({ children, text }: Props) {

  const [open, setOpen] = useState<boolean>(false);

  const arrowRef = useRef<HTMLDivElement>(null);

  const { 
    refs,
    floatingStyles,
    placement,
    middlewareData,
  } = useFloating({
    open,
    placement: "top",

    middleware: [
      offset(8),
      flip(),
      shift({ padding: 8 }),
      arrow({
        element: arrowRef,
      }),
    ],

    whileElementsMounted: autoUpdate,
  });

  const staticSide = {
    top: "bottom",
    bottom: "top",
    left: "right",
    right: "left",
  }[placement.split("-")[0]];

  const timeoutRef = useRef<number | null>(null);

  const handleMouseEnter = () => {
    timeoutRef.current = window.setTimeout(() => {
      setOpen(true);
    }, 500);
  };
  const handleMouseLeave = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
    setOpen(false);
  }

  return (
    <>
      <div
        ref={refs.setReference}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onFocus={handleMouseEnter}
        onBlur={handleMouseLeave}
        className={`tooltipReference ${text ? "hasText" : ""}`}
      >
        {children}
      </div>
      {open && text && (
        <FloatingPortal>
          <div 
            ref={refs.setFloating}
            style={floatingStyles}
            className="tooltip"
          >
            {text}
            <div
              ref={arrowRef}
              className="tooltipArrow"
              style={{
                left: middlewareData.arrow?.x,
                top: middlewareData.arrow?.y,
                right: "",
                bottom: "",

                [staticSide!]: -4,
              }}
            />
          </div>
        </FloatingPortal>
      )}
    </>
  )
}

export default Tooltip;