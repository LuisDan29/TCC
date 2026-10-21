import { useEffect, type ReactNode } from "react";

interface ModalShellProps {
    title: string;
    onClose: () => void;
    // enquanto uma operação está em andamento não deixa fechar
    busy?: boolean;
    size?: "md" | "lg";
    children: ReactNode;
    footer?: ReactNode;
}

// Modal do Bootstrap controlado só por estado do React
// (não depende do JavaScript do Bootstrap).
function ModalShell({
    title,
    onClose,
    busy = false,
    size = "md",
    children,
    footer,
}: ModalShellProps) {
    useEffect(() => {
        document.body.classList.add("modal-open");

        function handleKeyDown(event: KeyboardEvent) {
            if (event.key === "Escape" && !busy) onClose();
        }

        document.addEventListener("keydown", handleKeyDown);

        return () => {
            document.body.classList.remove("modal-open");
            document.removeEventListener("keydown", handleKeyDown);
        };
    }, [busy, onClose]);

    return (
        <>
            <div
                className="modal d-block"
                tabIndex={-1}
                role="dialog"
                aria-modal="true"
                aria-label={title}
                onMouseDown={(event) => {
                    if (event.target === event.currentTarget && !busy) onClose();
                }}
            >
                <div
                    className={`modal-dialog modal-dialog-scrollable modal-dialog-centered ${
                        size === "lg" ? "modal-lg" : ""
                    }`}
                >
                    <div className="modal-content">
                        <div className="modal-header">
                            <h2 className="modal-title h5 fw-bold">{title}</h2>
                            <button
                                type="button"
                                className="btn-close"
                                aria-label="Fechar"
                                disabled={busy}
                                onClick={onClose}
                            />
                        </div>

                        <div className="modal-body">{children}</div>

                        {footer && <div className="modal-footer">{footer}</div>}
                    </div>
                </div>
            </div>
            <div className="modal-backdrop show" />
        </>
    );
}

export default ModalShell;
