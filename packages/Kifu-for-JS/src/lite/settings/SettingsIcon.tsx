import FocusTrap from "focus-trap-react";
import React, { forwardRef, RefObject, useCallback, useEffect, useState } from "react";
import KifuStore from "../../common/stores/KifuStore";
import { SettingsModal } from "./SettingsModal";

const BUTTON_SIZE = 19;

interface IProps {
    width: number;
    height: number;
    kifuStore: KifuStore;
}
const SettingsIcon = forwardRef<SVGSVGElement, IProps>(({ width, height, kifuStore }, ref) => {
    const [isIconShown, setIconShown] = useState(false);

    const [isOpen, setOpen] = useState(false);

    useEffect(() => {
        if ("current" in ref && ref.current) {
            const mouseEnter = () => {
                setIconShown(true);
            };
            ref.current.addEventListener("mouseenter", mouseEnter);
            ref.current.addEventListener("focusin", mouseEnter);
            const mouseLeave = () => {
                setIconShown(false);
            };
            ref.current.addEventListener("mouseleave", mouseLeave);
            ref.current.addEventListener("focusout", mouseLeave);

            const touchStart = () => {
                setIconShown(true);
            };
            ref.current.addEventListener("touchstart", touchStart);

            return () => {
                ref.current?.removeEventListener("mouseenter", mouseEnter);
                ref.current?.removeEventListener("focusin", mouseEnter);
                ref.current?.removeEventListener("mouseleave", mouseLeave);
                ref.current?.removeEventListener("focusout", mouseLeave);
                ref.current?.removeEventListener("touchstart", touchStart);
            };
        }
    }, [(ref as RefObject<SVGSVGElement>).current]);

    useEffect(() => {
        const closeIfOutsideIsClicked = (e) => {
            if ("current" in ref && ref.current?.contains(e.target)) {
                return;
            }

            setOpen(false);
        };
        document.body.addEventListener("click", closeIfOutsideIsClicked);
        const hideIconIfOutsideIsTouched = (e) => {
            if ("current" in ref && ref.current?.contains(e.target)) {
                return;
            }

            setIconShown(false);
        };
        document.body.addEventListener("touchstart", hideIconIfOutsideIsTouched);

        return () => {
            document.body.removeEventListener("click", closeIfOutsideIsClicked);
            document.body.removeEventListener("touchstart", hideIconIfOutsideIsTouched);
        };
    }, [(ref as RefObject<SVGSVGElement>).current]);

    const onClickIcon = useCallback(() => {
        if (isIconShown) {
            setOpen(true);
        }
    }, [isIconShown]);

    return (
        <>
            <g>
                {/* place image outside foreignObject to prevent Safari bug */}
                <svg
                    viewBox="0 -960 960 960"
                    fill="currentColor"
                    fillOpacity={0.5}
                    style={{
                        opacity: isIconShown ? 1 : 0,
                        transition: "opacity 0.5s ease",
                    }}
                    x={9}
                    y={232}
                    width={15}
                    height={15} /*onClick={onClickIcon}*/
                >
                    <path d="m384.694-100.001-14.231-119.846q-13.077-6.385-30.462-16.077-17.385-9.693-29.693-18.77l-110.846 46.692L104.156-373l94.615-71.769q-.385-7.923-.962-17.423-.577-9.5-.577-17.423 0-7.539.577-16.847.577-9.308.962-18.769L104.156-587l95.306-164.229 110.461 46.308q13.462-9.462 29.885-18.962 16.424-9.501 30.27-16.27l14.616-119.846h190.612l14.231 120.231q15 7.538 30.078 16.269 15.077 8.731 28.923 18.578l112-46.308L855.844-587l-95.153 72.922q1.154 8.693 1.346 17.616.192 8.923.192 16.462 0 7.154-.384 16.077-.385 8.923-.77 18.77L855.46-373l-95.307 164.998-111.615-47.077q-13.846 9.847-29.308 18.962-15.462 9.116-29.693 15.885l-14.231 120.231H384.694Zm93.767-257q50.923 0 86.961-36.038Q601.46-429.078 601.46-480t-36.038-86.961q-36.038-36.038-86.961-36.038-50.537 0-86.768 36.038-36.23 36.039-36.23 86.961t36.23 86.961q36.231 36.038 86.768 36.038Zm0-63.999q-24 0-41.5-17.5t-17.5-41.5q0-24 17.5-41.5t41.5-17.5q24 0 41.5 17.5t17.5 41.5q0 24-17.5 41.5t-41.5 17.5ZM481-480Zm-41 316h79.615L532-269.154q28.615-8 54.461-23.231 25.846-15.23 49.385-38.384L733.231-289l40.384-66-85.769-65.385q5-15.538 6.808-29.961 1.807-14.423 1.807-29.654 0-13.615-1.807-27.154-1.808-13.538-5.808-30.692L775.385-605 735-671l-98.539 42.385q-21.076-21.462-49.115-37.923-28.039-16.462-54.731-23.308L520-796h-80.385l-12.23 105.769q-28.616 7.231-54.539 22.154-25.923 14.923-49.461 38.462L226-671l-40.385 66L270-539.615q-4 15.23-6 30.615-2 15.385-2 29.385 0 13.615 2 28.115 2 14.5 5.615 30.115l-84 66.385L226-289l97-41q22.769 22.385 48.692 37.308 25.923 14.923 55.308 22.923L440-164Z" />
                </svg>
                <foreignObject x={7} y={230} width={BUTTON_SIZE} height={BUTTON_SIZE}>
                    <button
                        onClick={onClickIcon}
                        style={{
                            width: BUTTON_SIZE,
                            height: BUTTON_SIZE,
                            background: "none",
                            border: "none",
                        }}
                    />
                </foreignObject>
            </g>
            <foreignObject
                x="0"
                y="0"
                width={width}
                height={height}
                style={{
                    transform: `scale(${isOpen ? 1 : 0})`,
                    opacity: isOpen ? 1 : 0,
                    display: isOpen ? "block" : "none",
                    transition: "transform 0.16s ease, opacity 0.16s ease",
                }}
            >
                {isOpen && (
                    <FocusTrap focusTrapOptions={{ clickOutsideDeactivates: true }}>
                        <SettingsModal onClose={() => setOpen(false)} kifuStore={kifuStore} />
                    </FocusTrap>
                )}
            </foreignObject>
        </>
    );
});

export default SettingsIcon;
