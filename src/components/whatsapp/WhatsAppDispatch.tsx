
import { useState } from "react";
import { Send, MessageSquare, Users, Clock, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const WhatsAppDispatch = () => {
  const [selectedType, setSelectedType] = useState("curso");
  const [selectedItem, setSelectedItem] = useState("");
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [message, setMessage] = useState("");

  const courses = [
    { id: 1, name: "Segurança no Trabalho" },
    { id: 2, name: "Atendimento ao Cliente" },
    { id: 3, name: "Gestão Franqueado" }
  ];

  const lessons = [
    { id: 1, name: "Introdução à Segurança", courseName: "Segurança no Trabalho" },
    { id: 2, name: "Técnicas de Abordagem", courseName: "Atendimento ao Cliente" }
  ];

  const users = [
    { id: 1, name: "João Silva", whatsapp: "(11) 99999-0001", unit: "SP-001" },
    { id: 2, name: "Maria Santos", whatsapp: "(11) 99999-0002", unit: "SP-001" },
    { id: 3, name: "Carlos Oliveira", whatsapp: "(21) 99999-0003", unit: "RJ-002" }
  ];

  const dispatchHistory = [
    {
      id: 1,
      type: "Curso",
      item: "Segurança no Trabalho",
      recipients: 45,
      sentDate: "2024-01-10 14:30",
      status: "Enviado",
      delivered: 42,
      failed: 3
    },
    {
      id: 2,
      type: "Aula",
      item: "Workshop - Primeiros Socorros",
      recipients: 28,
      sentDate: "2024-01-09 09:15",
      status: "Enviado",
      delivered: 26,
      failed: 2
    },
    {
      id: 3,
      type: "Curso",
      item: "Atendimento ao Cliente",
      recipients: 67,
      sentDate: "2024-01-08 16:45",
      status: "Enviado",
      delivered: 65,
      failed: 2
    }
  ];

  const messageVariables = [
    { var: "{nome}", description: "Nome do usuário" },
    { var: "{curso}", description: "Nome do curso" },
    { var: "{aula}", description: "Nome da aula" },
    { var: "{link}", description: "Link da aula/curso" },
    { var: "{data}", description: "Data atual" },
    { var: "{unidade}", description: "Nome da unidade" }
  ];

  const insertVariable = (variable: string) => {
    setMessage(prev => prev + variable);
  };

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-brand-black">Disparos WhatsApp</h1>
          <p className="text-brand-gray-dark">Envie notificações automáticas via Z-API</p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Formulário de Disparo */}
        <div className="xl:col-span-2 space-y-6">
          <div className="card-clean p-6">
            <h2 className="text-lg font-semibold text-brand-black mb-4">
              Novo Disparo
            </h2>
            
            <div className="space-y-4">
              {/* Tipo de Disparo */}
              <div>
                <label className="block text-sm font-medium text-brand-black mb-2">
                  Tipo de Disparo
                </label>
                <div className="flex gap-4">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      value="curso"
                      checked={selectedType === "curso"}
                      onChange={(e) => setSelectedType(e.target.value)}
                      className="mr-2"
                    />
                    <span className="text-brand-gray-dark">Curso</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      value="aula"
                      checked={selectedType === "aula"}
                      onChange={(e) => setSelectedType(e.target.value)}
                      className="mr-2"
                    />
                    <span className="text-brand-gray-dark">Aula</span>
                  </label>
                </div>
              </div>

              {/* Seleção de Curso/Aula */}
              <div>
                <label className="block text-sm font-medium text-brand-black mb-1">
                  {selectedType === "curso" ? "Selecionar Curso" : "Selecionar Aula"}
                </label>
                <select
                  value={selectedItem}
                  onChange={(e) => setSelectedItem(e.target.value)}
                  className="w-full h-10 px-3 rounded-md border border-gray-300 bg-brand-white text-brand-black focus:outline-none focus:ring-2 focus:ring-brand-blue"
                >
                  <option value="">Selecione...</option>
                  {selectedType === "curso" 
                    ? courses.map(course => (
                        <option key={course.id} value={course.id.toString()}>
                          {course.name}
                        </option>
                      ))
                    : lessons.map(lesson => (
                        <option key={lesson.id} value={lesson.id.toString()}>
                          {lesson.name} ({lesson.courseName})
                        </option>
                      ))
                  }
                </select>
              </div>

              {/* Seleção de Usuários */}
              <div>
                <label className="block text-sm font-medium text-brand-black mb-1">
                  Destinatários
                </label>
                <div className="border border-gray-300 rounded-md max-h-40 overflow-y-auto p-2">
                  {users.map(user => (
                    <label key={user.id} className="flex items-center p-2 hover:bg-gray-50 rounded">
                      <input
                        type="checkbox"
                        checked={selectedUsers.includes(user.id.toString())}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedUsers(prev => [...prev, user.id.toString()]);
                          } else {
                            setSelectedUsers(prev => prev.filter(id => id !== user.id.toString()));
                          }
                        }}
                        className="mr-3"
                      />
                      <div className="flex-1">
                        <div className="text-sm font-medium text-brand-black">{user.name}</div>
                        <div className="text-xs text-brand-gray-dark">{user.whatsapp} - {user.unit}</div>
                      </div>
                    </label>
                  ))}
                </div>
                <p className="text-xs text-brand-gray-dark mt-1">
                  {selectedUsers.length} usuários selecionados
                </p>
              </div>

              {/* Mensagem */}
              <div>
                <label className="block text-sm font-medium text-brand-black mb-1">
                  Mensagem
                </label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Digite sua mensagem aqui..."
                  rows={4}
                  className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-blue resize-none"
                />
                <p className="text-xs text-brand-gray-dark mt-1">
                  Use variáveis para personalizar a mensagem
                </p>
              </div>

              {/* Botão de Envio */}
              <Button 
                className="btn-primary w-full" 
                disabled={!selectedItem || selectedUsers.length === 0 || !message.trim()}
              >
                <Send className="w-4 h-4" />
                Disparar via Z-API
              </Button>
            </div>
          </div>
        </div>

        {/* Variáveis e Histórico */}
        <div className="space-y-6">
          {/* Variáveis Disponíveis */}
          <div className="card-clean p-4">
            <h3 className="font-semibold text-brand-black mb-3">Variáveis Disponíveis</h3>
            <div className="space-y-2">
              {messageVariables.map((variable, index) => (
                <div 
                  key={index}
                  className="flex items-center justify-between p-2 bg-gray-50 rounded cursor-pointer hover:bg-gray-100"
                  onClick={() => insertVariable(variable.var)}
                >
                  <div>
                    <code className="text-xs font-mono text-brand-blue">{variable.var}</code>
                    <p className="text-xs text-brand-gray-dark">{variable.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Histórico de Disparos */}
      <div className="card-clean p-6">
        <h2 className="text-lg font-semibold text-brand-black mb-4">
          Histórico de Disparos
        </h2>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left p-3 font-medium text-brand-black">Tipo</th>
                <th className="text-left p-3 font-medium text-brand-black">Item</th>
                <th className="text-left p-3 font-medium text-brand-black">Destinatários</th>
                <th className="text-left p-3 font-medium text-brand-black">Data/Hora</th>
                <th className="text-left p-3 font-medium text-brand-black">Status</th>
                <th className="text-left p-3 font-medium text-brand-black">Entregues</th>
              </tr>
            </thead>
            <tbody>
              {dispatchHistory.map((dispatch) => (
                <tr key={dispatch.id} className="border-b hover:bg-gray-50">
                  <td className="p-3">
                    <div className="flex items-center gap-2">
                      <MessageSquare className="w-4 h-4 text-brand-blue" />
                      <span className="text-brand-gray-dark">{dispatch.type}</span>
                    </div>
                  </td>
                  <td className="p-3 text-brand-black font-medium">{dispatch.item}</td>
                  <td className="p-3">
                    <div className="flex items-center gap-1">
                      <Users className="w-4 h-4 text-brand-blue" />
                      <span className="text-brand-gray-dark">{dispatch.recipients}</span>
                    </div>
                  </td>
                  <td className="p-3">
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4 text-brand-blue" />
                      <span className="text-brand-gray-dark text-sm">{dispatch.sentDate}</span>
                    </div>
                  </td>
                  <td className="p-3">
                    <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-700 flex items-center gap-1">
                      <CheckCircle className="w-3 h-3" />
                      {dispatch.status}
                    </span>
                  </td>
                  <td className="p-3 text-sm">
                    <span className="text-green-600 font-medium">{dispatch.delivered}</span>
                    <span className="text-brand-gray-dark"> / </span>
                    <span className="text-red-600">{dispatch.failed}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default WhatsAppDispatch;
