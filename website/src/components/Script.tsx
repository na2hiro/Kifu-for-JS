import React, { useEffect, useRef } from "react";

type Props = {
  src?: string;
  async?: boolean;
  id?: string;
  crossOrigin?: "anonymous" | "use-credentials";
};
const Script: React.FC<Props> = ({ crossOrigin, src, async, id }) => {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const script = document.createElement("script");
    if (src) {
      script.src = src;
    }
    if (async) {
      script.async = true;
    }
    if (crossOrigin) {
      script.crossOrigin = crossOrigin;
    }
    if (id) {
      script.id = id;
    }
    ref.current?.appendChild(script);

    return () => {
      ref.current?.removeChild(ref.current.firstElementChild!);
    };
  }, []);
  return <div ref={ref} />;
};

export default Script;
