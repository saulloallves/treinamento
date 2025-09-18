
const Dashboard = () => {
  console.log('Dashboard - Component rendering - SIMPLE TEST');
  
  return (
    <div className="p-6 bg-white min-h-screen">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Dashboard Test</h1>
      <div className="bg-blue-100 p-4 rounded-lg">
        <p className="text-blue-800">Dashboard está funcionando!</p>
        <p className="text-sm text-gray-600 mt-2">Se você consegue ver isso, o problema estava na lógica complexa do dashboard.</p>
      </div>
    </div>
  );
};

export default Dashboard;
