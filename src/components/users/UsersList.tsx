import { useState, useMemo, useEffect } from "react";
import { Plus, Search, Edit, Trash2, Building2, User, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { toast } from "sonner";
import CreateUserDialog from "./CreateUserDialog";
import { StudentProfileDialog } from "./StudentProfileDialog";
const UsersList = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUnit, setSelectedUnit] = useState("todas");
  const [editOpen, setEditOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<any | null>(null);
  const [unitCode, setUnitCode] = useState("");
  const [userType, setUserType] = useState("Aluno");
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [profileOpen, setProfileOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<any | null>(null);

  useEffect(() => {
    document.title = "Gerenciar Usuários | Admin";
  }, []);

  // Unidades (nome obtido via unit_id -> units.name)
  const unitsQuery = useQuery({
    queryKey: ["units"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("units")
        .select("id,name,code,active")
        .order("name", { ascending: true });
      if (error) throw error;
      return data ?? [];
    },
  });

  // Tabela 'unidades' (fallback via código)
  const unidadesQuery = useQuery({
    queryKey: ["unidades"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("unidades")
        .select("codigo_grupo,grupo");
      if (error) throw error;
      return data ?? [];
    },
  });

  // Apenas alunos e administradores (para mostrar tipo real)
  const usersQuery = useQuery({
    queryKey: ["users", "all"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("users")
        .select("id,name,cpf,position,unit_id,unit_code,phone,active,user_type,updated_at,created_at")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  const units = unitsQuery.data ?? [];
  const unitNameById = useMemo(() => {
    const m = new Map<string, string>();
    for (const u of (units as any[])) {
      if (u?.id) m.set(u.id as string, (u.name as string) ?? "—");
    }
    return m;
  }, [units]);

  const unidades = unidadesQuery.data ?? [];
  const unidadeNameByCode = useMemo(() => {
    const m = new Map<string, string>();
    for (const u of (unidades as any[])) {
      const codeRaw = u?.codigo_grupo;
      const key = String(codeRaw ?? '').trim();
      if (key) m.set(key, (u.grupo as string) ?? "—");
    }
    return m;
  }, [unidades]);

// Cargo fixo, filtro de cargo removido

  const users = useMemo(() => {
    return ((usersQuery.data ?? []) as any[]).map((u) => ({
      id: u.id,
      name: u.name ?? "Sem nome",
      type: u.user_type ?? "Aluno",
      role: "Franqueado",
      unitId: u.unit_id ?? null,
      unitName: unitNameById.get(u.unit_id) ?? unidadeNameByCode.get(String(u.unit_code ?? '').trim()) ?? "—",
      unitCode: String(u.unit_code ?? '').trim(),
      status: u.active ? "Ativo" : "Inativo",
      lastAccess: "—",
    }));
  }, [usersQuery.data, unitNameById, unidadeNameByCode]);

  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const matchesSearch = (user.name || "").toLowerCase().includes(searchTerm.toLowerCase());
      const matchesUnit = selectedUnit === "todas" || String(user.unitId ?? "") === selectedUnit;
      return matchesSearch && matchesUnit;
    });
  }, [users, searchTerm, selectedUnit]);

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-brand-black">Alunos</h1>
          <p className="text-brand-gray-dark">Gerencie colaboradores e franqueados</p>
        </div>
        <div className="flex gap-2">
          <CreateUserDialog 
            allowedUserTypes={["Aluno"]} 
            buttonText="Novo Aluno"
            dialogTitle="Criar Novo Aluno"
          />
        </div>
      </div>

      {/* Filtros */}
      <div className="card-clean p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-brand-black mb-1">
              Buscar usuário
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-brand-gray-dark w-4 h-4" />
              <Input
                placeholder="Nome..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-brand-black mb-1">
              Unidade
            </label>
            <select
              value={selectedUnit}
              onChange={(e) => setSelectedUnit(e.target.value)}
              className="w-full h-10 px-3 rounded-md border border-gray-300 bg-brand-white text-brand-black focus:outline-none focus:ring-2 focus:ring-brand-blue"
            >
              <option value="todas">Todas as unidades</option>
              {units.map(unit => (
                <option key={unit.id} value={unit.id.toString()}>
                  {unit.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Lista de Usuários */}
      <div className="card-clean overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left p-4 font-medium text-brand-black">Usuário</th>
                <th className="text-left p-4 font-medium text-brand-black">Tipo</th>
                <th className="text-left p-4 font-medium text-brand-black">Cargo</th>
                <th className="text-left p-4 font-medium text-brand-black">Unidade</th>
                <th className="text-left p-4 font-medium text-brand-black">Status</th>
                <th className="text-left p-4 font-medium text-brand-black">Último Acesso</th>
                <th className="text-left p-4 font-medium text-brand-black">Ações</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <tr key={user.id} className="border-b hover:bg-gray-50">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-brand-blue flex items-center justify-center">
                        <User className="w-4 h-4 text-brand-white" />
                      </div>
                      <span className="font-medium text-brand-black">{user.name}</span>
                    </div>
                  </td>
                  
                  <td className="p-4">
                    <span className={`px-2 py-1 text-xs rounded-full ${user.type === 'Admin' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                      {user.type}
                    </span>
                  </td>
                  <td className="p-4">
                    <span className="px-2 py-1 text-xs rounded-full bg-brand-blue-light text-brand-blue">
                      {user.role}
                    </span>
                  </td>
                  <td className="p-4 text-brand-gray-dark">
                    <div className="flex items-center gap-1">
                      <Building2 className="w-4 h-4" />
                      <span className="text-sm">{user.unitName}</span>
                    </div>
                  </td>
                  <td className="p-4">
                    <span
                      className={`px-2 py-1 text-xs rounded-full ${
                        user.status === "Ativo"
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {user.status}
                    </span>
                  </td>
                  <td className="p-4 text-brand-gray-dark text-sm">{user.lastAccess}</td>
                  <td className="p-4">
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => { 
                          setSelectedStudent(user); 
                          setProfileOpen(true); 
                        }}
                        title="Ver ficha completa"
                      >
                        <FileText className="w-4 h-4" />
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => { setEditingUser(user); setUnitCode(user.unitCode ?? ""); setUserType(user.type ?? "Aluno"); setEditOpen(true); }}>
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        disabled={deleting === user.id}
                        onClick={async () => {
                          if (confirm(`Tem certeza que deseja excluir o usuário ${user.name}?`)) {
                            try {
                              setDeleting(user.id);
                              const { error } = await supabase
                                .from('users')
                                .delete()
                                .eq('id', user.id);
                              
                              if (error) throw error;
                              
                              toast.success("Usuário excluído com sucesso!");
                              await usersQuery.refetch();
                            } catch (e) {
                              console.error('Erro ao excluir usuário:', e);
                              toast.error("Erro ao excluir usuário");
                            } finally {
                              setDeleting(null);
                            }
                          }
                        }}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Paginação */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-brand-gray-dark">
          Mostrando {filteredUsers.length} de {users.length} usuários
        </p>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" disabled>
            Anterior
          </Button>
          <Button variant="outline" size="sm">
            1
          </Button>
          <Button variant="outline" size="sm" disabled>
            Próxima
          </Button>
        </div>
      </div>

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Usuário</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-brand-black mb-1">Código da Unidade</label>
              <Input value={unitCode} onChange={(e) => setUnitCode(e.target.value)} placeholder="Ex: 1659" />
            </div>
            <div>
              <label className="block text-sm font-medium text-brand-black mb-1">Tipo</label>
              <select
                className="w-full h-10 px-3 rounded-md border border-gray-300 bg-brand-white text-brand-black focus:outline-none focus:ring-2 focus:ring-brand-blue"
                value={userType}
                onChange={(e) => setUserType(e.target.value)}
              >
                <option value="Aluno">Aluno</option>
                <option value="Admin">Admin</option>
              </select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditOpen(false)}>Cancelar</Button>
            <Button
              className="btn-primary"
              disabled={saving || !editingUser}
              onClick={async () => {
                if (!editingUser) return;
                try {
                  setSaving(true);
                  const { error } = await supabase
                    .from('users')
                    .update({ unit_code: unitCode || null, user_type: userType })
                    .eq('id', editingUser.id);
                  if (error) throw error;
                  await usersQuery.refetch();
                  setEditOpen(false);
                } catch (e) {
                  console.error('Erro ao salvar usuário:', e);
                } finally {
                  setSaving(false);
                }
              }}
            >
              Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Ficha do Aluno Dialog */}
      <StudentProfileDialog
        student={selectedStudent}
        open={profileOpen}
        onOpenChange={setProfileOpen}
      />
    </div>
  );
};

export default UsersList;