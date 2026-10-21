import { useState } from "react";
import ModalShell from "./ModalShell";
import { deleteBook } from "../../services/bookService";
import { getErrorMessage } from "../../utils/errorMessages";

interface DeleteBookModalProps {
    bookId: number;
    title: string;
    isbn: string;
    onClose: () => void;
    onDeleted: (message: string) => void;
}

function DeleteBookModal({ bookId, title, isbn, onClose, onDeleted }: DeleteBookModalProps) {
    const [isDeleting, setIsDeleting] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");

    async function handleDelete() {
        if (isDeleting) return;

        setIsDeleting(true);
        setErrorMessage("");

        try {
            await deleteBook(bookId);
            onDeleted(`O cadastro de "${title}" foi excluído.`);
        } catch (error) {
            console.error("Erro ao excluir livro:", error);
            setErrorMessage(getErrorMessage(error));
            setIsDeleting(false);
        }
    }

    return (
        <ModalShell
            title="Excluir cadastro"
            onClose={onClose}
            busy={isDeleting}
            footer={
                <>
                    <button
                        type="button"
                        className="btn btn-outline-secondary"
                        disabled={isDeleting}
                        onClick={onClose}
                    >
                        Cancelar
                    </button>
                    <button
                        type="button"
                        className="btn btn-danger"
                        disabled={isDeleting}
                        onClick={handleDelete}
                    >
                        {isDeleting ? "Excluindo..." : "Excluir definitivamente"}
                    </button>
                </>
            }
        >
            <p>Tem certeza de que deseja excluir o cadastro deste livro?</p>

            <p className="mb-3">
                <strong>{title}</strong>
                <br />
                <span className="text-muted small">ISBN: {isbn}</span>
            </p>

            <p className="text-danger small mb-0">
                Esta ação não pode ser desfeita. Autores, gêneros e editoras continuam
                cadastrados para os outros livros.
            </p>

            {errorMessage && (
                <div role="alert" className="alert alert-danger mt-3 mb-0">
                    {errorMessage}
                </div>
            )}
        </ModalShell>
    );
}

export default DeleteBookModal;
