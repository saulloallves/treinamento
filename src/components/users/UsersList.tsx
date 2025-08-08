
import { useState } from "react";
import { Plus, Search, Edit, Trash2, Building2, Phone, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const UsersList = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUnit, setSelectedUnit] = useState("todas");
  const [selectedRole, setSelectedRole] = useState("todos");

  const users = [
    {
      id: 1,
      name: "João Silva",
      cpf: "123.456.789-00",
      role: "Gerente",
      unitId: 1,
      unitName: "Unidade São Paulo - Centro",
      whatsapp: "(11) 99999-0001",
      status: "Ativo",
      lastAccess: "2024-01-10"
    },
    {
      id: 2,
      name: "Maria Santos",
      cpf: "987.654.321-00",
      role: "Vendedora",
      unitId: 1,
      unitName: "Unidade São Paulo - Centro",
      whatsapp: "(11) 99999-0002",
      status: "Ativo",
      lastAccess: "2024-01-09"
    },
    {
      id: 3,
      name: "Carlos Oliveira",
      cpf: "456.789.123-00",
      role: "Franqueado",
      unitId: 2,
      unitName: "Unidade Rio de Janeiro - Zona Sul",
      whatsapp: "(21) 99999-0003",
      status: "Ativo",
      lastAccess: "2024-01-08"
    },
    {
      id: 4,
      name: "Ana Costa",
      cpf: "789.123.456-00",
      role: "Assistente",
      unitId: 2,
      unitName: "Unidade Rio de Janeiro - Zona Sul",
      whatsapp: "(21) 99999-0004",
      status: "Inativo",
      lastAccess: "2023-12-15"
    }
  ];

  const units = [
    { id: 1, name: "Unidade São Paulo - Centro" },
    { id: 2, name: "Unidade Rio de Janeiro - Zona Sul" },
    { id: 3, name: "Unidade Belo Horizonte - Centro" }
  ];

  const roles = ["Franqueado", "Gerente", "Vendedor", "Assistente", "Supervisor"];

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.cpf.includes(searchTerm);
    const matchesUnit = selectedUnit === "todas" || user.unitId.toString() === selectedUnit;
    const matchesRole = selectedRole === "todos" || user.role === selectedRole;
    return matchesSearch && matchesUnit && matchesRole;
  });

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-brand-black">Usuários</h1>
          <p className="text-brand-gray-dark">Gerencie colaboradores e franqueados</p>
        </div>
        <Button className="btn-primary">
          <Plus className="w-4 h-4" />
          Novo Usuário
        </Button>
      </div>

      {/* Filtros */}
      <div className="card-clean p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-brand-black mb-1">
              Buscar usuário
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-brand-gray-dark w-4 h-4" />
              <Input
                placeholder="Nome ou CPF..."
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
          <div>
            <label className="block text-sm font-medium text-brand-black mb-1">
              Cargo
            </label>
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              className="w-full h-10 px-3 rounded-md border border-gray-300 bg-brand-white text-brand-black focus:outline-none focus:ring-2 focus:ring-brand-blue"
            >
              <option value="todos">Todos os cargos</option>
              {roles.map(role => (
                <option key={role} value={role}>
                  {role}
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
                <th className="text-left p-4 font-medium text-brand-black">CPF</th>
                <th className="text-left p-4 font-medium text-brand-black">Cargo</th>
                <th className="text-left p-4 font-medium text-brand-black">Unidade</th>
                <th className="text-left p-4 font-medium text-brand-black">WhatsApp</th>
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
                  <td className="p-4 text-brand-gray-dark">{user.cpf}</td>
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
                  <td className="p-4 text-brand-gray-dark">
                    <div className="flex items-center gap-1">
                      <Phone className="w-4 h-4" />
                      <span className="text-sm">{user.whatsapp}</span>
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
                      <Button variant="outline" size="sm">
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button variant="outline" size="sm">
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
    </div>
  );
};

export default UsersList;
