import { useState } from "react";

const Dashboard = () => {
  console.log('🎯 Dashboard component loaded');
  
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Dashboard Test</h1>
      <p>Se você está vendo isso, o componente carregou!</p>
      
      {/* Métricas básicas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold">Usuários</h3>
          <p className="text-3xl font-bold text-blue-600">100</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold">Cursos</h3>
          <p className="text-3xl font-bold text-green-600">25</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold">Certificados</h3>
          <p className="text-3xl font-bold text-purple-600">50</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold">Taxa de Conclusão</h3>
          <p className="text-3xl font-bold text-orange-600">85%</p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;