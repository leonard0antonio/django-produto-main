// App.tsx
import React, { useEffect, useState } from "react";
import type { FormEvent } from "react";
import styled, { css, keyframes } from "styled-components";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

/* ---------------- TYPES ---------------- */
interface Produto {
  id: number;
  nome: string;
  quantidade: number;
  preco: number | string;
  data_validade: string;
  data_cadastro: string;
}

interface ProdutoForm {
  nome: string;
  quantidade: string;
  preco: string;
  data_validade: string;
}

/* ---------------- STYLES ---------------- */
const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 2rem 1.5rem;
  min-height: 100vh;
  background: #f3f5f7;
  font-family: "Poppins", sans-serif;
`;

const Title = styled.h1`
  font-size: 2.4rem;
  font-weight: 700;
  color: #222;
  letter-spacing: -1px;
  margin-bottom: 1.5rem;
`;

const Form = styled.form`
  background: white;
  padding: 2rem;
  border-radius: 14px;
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.08);
  width: 100%;
  max-width: 480px;
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const Label = styled.label`
  font-size: 0.95rem;
  color: #333;
  font-weight: 500;
`;

const Input = styled.input`
  padding: 0.75rem 1rem;
  border-radius: 8px;
  border: 1px solid #cfd3d8;
  font-size: 1rem;
  transition: 0.2s;

  &:focus {
    outline: none;
    border-color: #1e88e5;
    box-shadow: 0 0 0 2px rgba(30, 136, 229, 0.2);
  }
`;

const ButtonRow = styled.div`
  display: flex;
  gap: 0.75rem;
  align-items: center;
`;

const Button = styled.button<{ secondary?: boolean }>`
  background: ${(p) => (p.secondary ? "#ccc" : "#1e88e5")};
  color: ${(p) => (p.secondary ? "#222" : "white")};
  font-size: 1.05rem;
  border: none;
  padding: 0.85rem;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  transition: 0.25s ease;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;

  &:hover {
    background: ${(p) => (p.secondary ? "#bbb" : "#1669c1")};
    transform: translateY(-1px);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
`;

const Grid = styled.div`
  display: grid;
  margin-top: 2.5rem;
  width: 100%;
  max-width: 1100px;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1.4rem;
`;

/* card remove animation */
const fadeOut = keyframes`
  from { opacity: 1; transform: translateY(0) scale(1); }
  to   { opacity: 0; transform: translateY(-10px) scale(0.98); height: 0; margin: 0; padding: 0; }
`;

const Card = styled.div<{ removing?: boolean }>`
  background: #ffffff;
  border-radius: 16px;
  padding: 1.6rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  transition: transform 0.25s ease, box-shadow 0.25s ease;
  display: flex;
  flex-direction: column;

  ${(p) =>
    p.removing &&
    css`
      animation: ${fadeOut} 300ms forwards;
      overflow: hidden;
    `}

  &:hover {
    transform: translateY(-6px);
    box-shadow: 0 6px 18px rgba(0, 0, 0, 0.12);
  }
`;

const Nome = styled.h2`
  font-size: 1.35rem;
  margin-bottom: 0.5rem;
  font-weight: 600;
  color: #111;
`;

const Info = styled.p`
  margin: 0.25rem 0;
  color: #444;
  font-size: 0.95rem;
`;

const ActionRow = styled.div`
  margin-top: 12px;
  display: flex;
  gap: 8px;
  align-items: center;
`;

const EditButton = styled(Button)`
  background: #ffa726;
  color: #fff;

  &:hover {
    background: #fb8c00;
  }
`;

const DeleteButton = styled(Button)`
  background: #e53935;
  color: #fff;

  &:hover {
    background: #c62828;
  }
`;

/* small spinner */
const Spinner = styled.span`
  width: 14px;
  height: 14px;
  border-radius: 50%;
  border: 2px solid rgba(255, 255, 255, 0.4);
  border-top-color: rgba(255, 255, 255, 1);
  animation: spin 0.9s linear infinite;

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
`;

/* ---------------- MODAL ---------------- */

const ModalOverlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 999;
`;

const ModalBox = styled.div`
  background: white;
  padding: 1.6rem;
  border-radius: 12px;
  width: 100%;
  max-width: 420px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
`;

const ModalTitle = styled.h3`
  margin: 0 0 8px;
  font-size: 1.15rem;
`;

const ModalText = styled.p`
  margin: 0 0 16px;
  color: #444;
`;

/* ---------------- APP ---------------- */

function App(): JSX.Element {
  const [produtoEditando, setProdutoEditando] = useState<Produto | null>(null);
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [novoProduto, setNovoProduto] = useState<ProdutoForm>({
    nome: "",
    quantidade: "",
    preco: "",
    data_validade: "",
  });

  // modal state
  const [saveLoading, setSaveLoading] = useState(false);
  const [confirmSaveOpen, setConfirmSaveOpen] = useState(false);

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [toDeleteId, setToDeleteId] = useState<number | null>(null);

  // deleting state (id currently deleting)
  const [deletingId, setDeletingId] = useState<number | null>(null);

  // ids currently animating removal (so we can play animation before removing from array)
  const [removingIds, setRemovingIds] = useState<number[]>([]);

  /* ---------------- FUNÇÃO EDITAR ---------------- */

  function carregarProdutoParaEdicao(p: Produto) {
    setProdutoEditando(p);
    setNovoProduto({
      nome: p.nome,
      quantidade: String(p.quantidade),
      preco: String(p.preco),
      data_validade: p.data_validade.substring(0, 10),
    });
  }

  /* ---------------- CARREGAR LISTA ---------------- */

  useEffect(() => {
    fetch("http://127.0.0.1:8000/api/produtos/")
      .then((r) => r.json())
      .then((data) =>
        setProdutos(
          data.map((p: any) => ({
            ...p,
            preco: Number(p.preco),
            quantidade: Number(p.quantidade),
          }))
        )
      )
      .catch(() => toast.error("Erro ao carregar produtos 😕"));
  }, []);

  /* ---------------- SALVAR (CADASTRAR / EDITAR) ---------------- */

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setConfirmSaveOpen(true);

    const url = produtoEditando
      ? `http://127.0.0.1:8000/api/produtos/${produtoEditando.id}/`
      : "http://127.0.0.1:8000/api/produtos/";

    const body = {
      nome: novoProduto.nome,
      quantidade: Number(novoProduto.quantidade),
      preco: Number(novoProduto.preco),
      data_validade: novoProduto.data_validade,
    };

    const response = await fetch(url, {
      method: produtoEditando ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      toast.error("❌ Erro ao salvar produto!");
      return;
    }

    const result = await response.json();

    // normalize result numeric fields (backend may send strings)
    const normalized: Produto = {
      ...result,
      preco: Number(result.preco),
      quantidade: Number(result.quantidade),
    };

    if (produtoEditando) {
      setProdutos((prev) =>
        prev.map((p) => (p.id === normalized.id ? normalized : p))
      );
      toast.success("✏️ Produto atualizado!");
    } else {
      setProdutos((prev) => [...prev, normalized]);
      toast.success("✅ Produto cadastrado!");
    }

    setNovoProduto({ nome: "", quantidade: "", preco: "", data_validade: "" });
    setProdutoEditando(null);
  }

  /* ---------------- OPEN CONFIRM ---------------- */

  function openConfirm(id: number) {
    setToDeleteId(id);
    setConfirmOpen(true);
  }

  /* ---------------- DELETE ---------------- */

  async function handleConfirmDelete() {
    if (toDeleteId == null) return;
    const id = toDeleteId;

    // lock UI: set deleting id, disable buttons
    setDeletingId(id);

    try {
      const response = await fetch(
        `http://127.0.0.1:8000/api/produtos/${id}/`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        toast.error("❌ Erro ao excluir produto!");
        setDeletingId(null);
        setConfirmOpen(false);
        return;
      }

      // play removal animation: add id to removingIds
      setRemovingIds((s) => [...s, id]);

      // close modal
      setConfirmOpen(false);

      // wait animation duration then remove from state
      const ANIM = 300;
      setTimeout(() => {
        setProdutos((prev) => prev.filter((p) => p.id !== id));
        // remove id from removingIds and deletingId
        setRemovingIds((s) => s.filter((x) => x !== id));
        setDeletingId(null);
        toast.success("🗑️ Produto excluído!");
      }, ANIM + 30);
    } catch (err) {
      console.error(err);
      toast.error("❌ Erro inesperado ao excluir!");
      setDeletingId(null);
      setConfirmOpen(false);
    }
  }

  /* ---------------- RENDER ---------------- */

  return (
    <Container>
      <ToastContainer />
      <Title>🛍️ Gerenciar Produtos</Title>

      <Form onSubmit={handleSubmit}>
        <Label>Nome</Label>
        <Input
          type="text"
          value={novoProduto.nome}
          onChange={(e) =>
            setNovoProduto({ ...novoProduto, nome: e.target.value })
          }
          required
        />

        <Label>Quantidade</Label>
        <Input
          type="number"
          value={novoProduto.quantidade}
          onChange={(e) =>
            setNovoProduto({ ...novoProduto, quantidade: e.target.value })
          }
          required
        />

        <Label>Preço</Label>
        <Input
          type="number"
          step="0.01"
          value={novoProduto.preco}
          onChange={(e) =>
            setNovoProduto({ ...novoProduto, preco: e.target.value })
          }
          required
        />

        <Label>Data de Validade</Label>
        <Input
          type="date"
          value={novoProduto.data_validade}
          onChange={(e) =>
            setNovoProduto({ ...novoProduto, data_validade: e.target.value })
          }
          required
        />

        <ButtonRow>
          <Button type="submit">
            {produtoEditando ? "✏️ Atualizar Produto" : "➕ Cadastrar Produto"}
          </Button>
          {produtoEditando && (
            <Button
              secondary
              type="button"
              onClick={() => {
                setProdutoEditando(null);
                setNovoProduto({
                  nome: "",
                  quantidade: "",
                  preco: "",
                  data_validade: "",
                });
              }}
            >
              ❌ Cancelar Edição
            </Button>
          )}
        </ButtonRow>
      </Form>

      <Grid>
        {produtos.map((p) => (
          <Card key={p.id} removing={removingIds.includes(p.id)}>
            <Nome>{p.nome}</Nome>
            <Info>Quantidade: {p.quantidade}</Info>
            <Info>
              Preço: <strong>R$ {Number(p.preco).toFixed(2)}</strong>
            </Info>
            <Info>
              Validade: {new Date(p.data_validade).toLocaleDateString()}
            </Info>
            <Info>
              Cadastro: {new Date(p.data_cadastro).toLocaleDateString()} às{" "}
              {new Date(p.data_cadastro).toLocaleTimeString()}
            </Info>

            <ActionRow>
              <EditButton
                onClick={() => carregarProdutoParaEdicao(p)}
                disabled={deletingId !== null}
              >
                ✏️ Editar
              </EditButton>

              <DeleteButton
                onClick={() => openConfirm(p.id)}
                disabled={deletingId !== null}
              >
                {deletingId === p.id ? <Spinner /> : "🗑️ Excluir"}
              </DeleteButton>
            </ActionRow>
          </Card>
        ))}
      </Grid>

      {/* Modal */}
      {confirmOpen && (
        <ModalOverlay
          onClick={() => (deletingId ? null : setConfirmOpen(false))}
        >
          <ModalBox onClick={(e) => e.stopPropagation()}>
            <ModalTitle>Confirmar exclusão</ModalTitle>
            <ModalText>
              Tem certeza que deseja excluir este produto? Essa ação não pode
              ser desfeita.
            </ModalText>

            <ButtonRow>
              <Button
                secondary
                onClick={() => setConfirmOpen(false)}
                disabled={deletingId !== null}
              >
                Cancelar
              </Button>
              <Button
                onClick={handleConfirmDelete}
                disabled={deletingId !== null}
              >
                {deletingId ? <Spinner /> : "Excluir"}
              </Button>
            </ButtonRow>
          </ModalBox>
        </ModalOverlay>
      )}
    </Container>
  );
}

export default App;
