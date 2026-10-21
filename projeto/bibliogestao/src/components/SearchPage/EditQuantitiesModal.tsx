import { useEffect, useState } from "react";
import ModalShell from "./ModalShell";
import {
    getBookDetails,
    updateBookConditions,
    type BookDetails,
} from "../../services/bookService";
import { BOOK_CONDITIONS, conditionsToArray } from "../../constants/bookConditions";
import { getErrorMessage } from "../../utils/errorMessages";

interface EditQuantitiesModalProps {
    bookId: number;
    onClose: () => void;
    onSaved: (message: string) => void;
}

function EditQuantitiesModal({ bookId, onClose, onSaved }: EditQuantitiesModalProps) {
    const [book, setBook] = useState<BookDetails | null>(null);
    const [quantities, setQuantities] = useState<number[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadError, setLoadError] = useState("");
    const [isSaving, setIsSaving] = useState(false);
    const [formError, setFormError] = useState("");

    useEffect(() => {
        let cancelled = false;

        async function load() {
            try {
                const details = await getBookDetails(bookId);
                if (cancelled) return;

                setBook(details);
                setQuantities(conditionsToArray(details.conditions));
            } catch (error) {
                console.error("Erro ao carregar as quantidades:", error);
                if (!cancelled) setLoadError("Não foi possível carregar o livro.");
            } finally {
                if (!cancelled) setLoading(false);
            }
        }

        load();

        return () => {
            cancelled = true;
        };
    }, [bookId]);

    const total = quantities.reduce((sum, quantity) => sum + quantity, 0);
    const hasInvalidQuantity = quantities.some(
        (quantity) => !Number.isInteger(quantity) || quantity < 0,
    );

    function handleChange(conditionNumber: number, value: string) {
        setQuantities((previous) =>
            previous.map((quantity, index) =>
                index === conditionNumber ? Number(value) : quantity,
            ),
        );
    }

    async function handleSubmit(event: React.SyntheticEvent) {
        event.preventDefault();

        if (isSaving) return;

        if (hasInvalidQuantity) {
            setFormError("As quantidades devem ser números inteiros maiores ou iguais a zero.");
            return;
        }

        setIsSaving(true);
        setFormError("");

        try {
            await updateBookConditions(bookId, quantities);
            onSaved("Quantidades atualizadas com sucesso!");
        } catch (error) {
            console.error("Erro ao editar quantidades:", error);
            setFormError(getErrorMessage(error));
            setIsSaving(false);
        }
    }

    return (
        <ModalShell
            title="Editar quantidades"
            onClose={onClose}
            busy={isSaving}
            footer={
                <>
                    <button
                        type="button"
                        className="btn btn-outline-secondary"
                        disabled={isSaving}
                        onClick={onClose}
                    >
                        Cancelar
                    </button>
                    <button
                        type="submit"
                        form="editQuantitiesForm"
                        className="btn btn-primary"
                        disabled={isSaving || loading || !!loadError}
                    >
                        {isSaving ? "Salvando..." : "Salvar quantidades"}
                    </button>
                </>
            }
        >
            {loading && <p className="mb-0">Carregando livro...</p>}

            {loadError && <div className="alert alert-danger mb-0">{loadError}</div>}

            {book && (
                <form id="editQuantitiesForm" onSubmit={handleSubmit}>
                    <p className="mb-3">
                        <strong>{book.title}</strong>
                        <br />
                        <span className="text-muted small">ISBN: {book.isbn}</span>
                    </p>

                    <div className="d-flex fw-bold mb-1">
                        <div className="flex-grow-1">Condição</div>
                        <div>Quantidade</div>
                    </div>

                    {BOOK_CONDITIONS.map((condition) => (
                        <div
                            key={condition.number}
                            className="d-flex align-items-center border-bottom py-2"
                        >
                            <span className="badge bg-primary fs-6">{condition.number}</span>

                            <div className="flex-grow-1 px-3" style={{ minWidth: 0 }}>
                                <strong>{condition.name}</strong>
                                <div className="text-muted small">{condition.description}</div>
                            </div>

                            <input
                                type="number"
                                min="0"
                                step="1"
                                className="form-control"
                                style={{ width: "90px" }}
                                aria-label={`Quantidade — ${condition.name}`}
                                value={quantities[condition.number] ?? 0}
                                onChange={(event) =>
                                    handleChange(condition.number, event.target.value)
                                }
                            />
                        </div>
                    ))}

                    <div className="text-end mt-3">
                        <strong>Quantidade total: {total}</strong>
                        <div className="text-muted small">
                            Antes: {book.stock_quantity}. O total é a soma das condições.
                        </div>
                        {total === 0 && (
                            <div className="text-warning small">
                                Com total zero, o livro ficará indisponível.
                            </div>
                        )}
                    </div>

                    {formError && (
                        <div role="alert" className="alert alert-danger mt-3 mb-0">
                            {formError}
                        </div>
                    )}
                </form>
            )}
        </ModalShell>
    );
}

export default EditQuantitiesModal;
