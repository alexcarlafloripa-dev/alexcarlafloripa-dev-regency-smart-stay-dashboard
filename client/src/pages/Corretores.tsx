/**
 * Painel de Gestão de Corretores — Regency Square Smart Stay
 * Acessível apenas pelo gestor (admin).
 * Permite cadastrar, editar e remover corretores da lista.
 */

import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { UserPlus, Pencil, Trash2, Phone, Building2, Mail, Hash, CheckCircle2, XCircle } from "lucide-react";
type Corretor = {
  id: number;
  codigo: string;
  nome: string;
  telefone: string;
  imobiliaria: string | null;
  email: string | null;
  ativo: "sim" | "nao";
  createdAt: Date;
  updatedAt: Date;
};

export default function Corretores() {
  const { user } = useAuth();
  const { data: corretores = [], refetch } = trpc.corretor.list.useQuery();
  const createMut = trpc.corretor.create.useMutation({ onSuccess: () => { refetch(); setShowCreate(false); resetForm(); } });
  const updateMut = trpc.corretor.update.useMutation({ onSuccess: () => { refetch(); setEditTarget(null); } });
  const deleteMut = trpc.corretor.delete.useMutation({ onSuccess: () => { refetch(); setDeleteTarget(null); } });

  const [showCreate, setShowCreate] = useState(false);
  const [editTarget, setEditTarget] = useState<Corretor | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Corretor | null>(null);

  const [form, setForm] = useState({ nome: "", telefone: "", imobiliaria: "", email: "" });

  function resetForm() {
    setForm({ nome: "", telefone: "", imobiliaria: "", email: "" });
  }

  function handleCreate() {
    if (!form.nome.trim() || !form.telefone.trim()) {
      toast.error("Preencha nome e telefone.");
      return;
    }
    createMut.mutate(form);
  }

  function handleUpdate() {
    if (!editTarget) return;
    updateMut.mutate({ id: editTarget.id, ...form });
  }

  function openEdit(c: Corretor) {
    setEditTarget(c);
    setForm({ nome: c.nome, telefone: c.telefone, imobiliaria: c.imobiliaria ?? "", email: c.email ?? "" });
  }

  if (user?.role !== "admin") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <XCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-foreground mb-2">Acesso Restrito</h2>
          <p className="text-muted-foreground">Esta página é exclusiva para o gestor.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-20 bg-background/80 backdrop-blur-xl border-b border-white/10">
        <div className="px-4 lg:px-8 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-foreground">Gestão de Corretores</h1>
            <p className="text-sm text-muted-foreground">{corretores.length} corretor{corretores.length !== 1 ? "es" : ""} cadastrado{corretores.length !== 1 ? "s" : ""}</p>
          </div>
          <Button
            onClick={() => { resetForm(); setShowCreate(true); }}
            className="bg-primary text-white hover:bg-primary/90 flex items-center gap-2"
          >
            <UserPlus className="w-4 h-4" />
            Novo Corretor
          </Button>
        </div>
      </header>

      {/* Lista */}
      <main className="px-4 lg:px-8 py-8">
        {corretores.length === 0 ? (
          <div className="text-center py-20">
            <UserPlus className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Nenhum corretor cadastrado</h3>
            <p className="text-muted-foreground mb-6">Cadastre o primeiro corretor para começar.</p>
            <Button onClick={() => { resetForm(); setShowCreate(true); }}>Cadastrar Corretor</Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {corretores.map((c) => (
              <div
                key={c.id}
                className="glass-card rounded-xl p-5 flex flex-col gap-3"
              >
                {/* Cabeçalho do card */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-mono text-primary bg-primary/10 px-2 py-0.5 rounded">
                        {c.codigo}
                      </span>
                      {c.ativo === "sim" ? (
                        <span className="flex items-center gap-1 text-xs text-emerald-400">
                          <CheckCircle2 className="w-3 h-3" /> Ativo
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-xs text-red-400">
                          <XCircle className="w-3 h-3" /> Inativo
                        </span>
                      )}
                    </div>
                    <h3 className="font-semibold text-foreground truncate">{c.nome}</h3>
                  </div>
                  <div className="flex gap-1 shrink-0">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="w-8 h-8 text-muted-foreground hover:text-foreground"
                      onClick={() => openEdit(c)}
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="w-8 h-8 text-muted-foreground hover:text-red-400"
                      onClick={() => setDeleteTarget(c)}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>

                {/* Detalhes */}
                <div className="space-y-1.5 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 shrink-0" />
                    <span>{c.telefone}</span>
                  </div>
                  {c.imobiliaria && (
                    <div className="flex items-center gap-2">
                      <Building2 className="w-3.5 h-3.5 shrink-0" />
                      <span className="truncate">{c.imobiliaria}</span>
                    </div>
                  )}
                  {c.email && (
                    <div className="flex items-center gap-2">
                      <Mail className="w-3.5 h-3.5 shrink-0" />
                      <span className="truncate">{c.email}</span>
                    </div>
                  )}
                </div>

                {/* Botão de toggle ativo/inativo */}
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-1 text-xs"
                  onClick={() => updateMut.mutate({ id: c.id, ativo: c.ativo === "sim" ? "nao" : "sim" })}
                >
                  {c.ativo === "sim" ? "Desativar" : "Reativar"}
                </Button>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Modal: Criar corretor */}
      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent className="sm:max-w-md bg-card border-white/10">
          <DialogHeader>
            <DialogTitle>Novo Corretor</DialogTitle>
          </DialogHeader>
          <CorretorForm form={form} setForm={setForm} />
          <DialogFooter>
            <Button variant="ghost" onClick={() => setShowCreate(false)}>Cancelar</Button>
            <Button onClick={handleCreate} disabled={createMut.isPending}>
              {createMut.isPending ? "Salvando..." : "Cadastrar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal: Editar corretor */}
      <Dialog open={!!editTarget} onOpenChange={(o) => !o && setEditTarget(null)}>
        <DialogContent className="sm:max-w-md bg-card border-white/10">
          <DialogHeader>
            <DialogTitle>Editar Corretor</DialogTitle>
          </DialogHeader>
          {editTarget && (
            <div className="mb-2">
              <span className="text-xs font-mono text-primary bg-primary/10 px-2 py-0.5 rounded">
                <Hash className="inline w-3 h-3 mr-1" />{editTarget.codigo}
              </span>
            </div>
          )}
          <CorretorForm form={form} setForm={setForm} />
          <DialogFooter>
            <Button variant="ghost" onClick={() => setEditTarget(null)}>Cancelar</Button>
            <Button onClick={handleUpdate} disabled={updateMut.isPending}>
              {updateMut.isPending ? "Salvando..." : "Salvar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Alert: Confirmar exclusão */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(o) => !o && setDeleteTarget(null)}>
        <AlertDialogContent className="bg-card border-white/10">
          <AlertDialogHeader>
            <AlertDialogTitle>Remover Corretor</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja remover <strong>{deleteTarget?.nome}</strong>? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700"
              onClick={() => deleteTarget && deleteMut.mutate({ id: deleteTarget.id })}
            >
              Remover
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

// ── Formulário reutilizável ────────────────────────────────────────────────────
function CorretorForm({
  form,
  setForm,
}: {
  form: { nome: string; telefone: string; imobiliaria: string; email: string };
  setForm: React.Dispatch<React.SetStateAction<typeof form>>;
}) {
  return (
    <div className="space-y-4">
      <div className="space-y-1.5">
        <Label>Nome completo *</Label>
        <Input
          value={form.nome}
          onChange={(e) => setForm((f) => ({ ...f, nome: e.target.value }))}
          placeholder="Ex: Alex Sandro de Souza"
        />
      </div>
      <div className="space-y-1.5">
        <Label>Telefone / WhatsApp *</Label>
        <Input
          value={form.telefone}
          onChange={(e) => setForm((f) => ({ ...f, telefone: e.target.value }))}
          placeholder="Ex: +55 48 98874-9258"
        />
      </div>
      <div className="space-y-1.5">
        <Label>Imobiliária</Label>
        <Input
          value={form.imobiliaria}
          onChange={(e) => setForm((f) => ({ ...f, imobiliaria: e.target.value }))}
          placeholder="Ex: Calabria Negócios Imobiliários"
        />
      </div>
      <div className="space-y-1.5">
        <Label>E-mail</Label>
        <Input
          type="email"
          value={form.email}
          onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
          placeholder="corretor@imobiliaria.com.br"
        />
      </div>
    </div>
  );
}
