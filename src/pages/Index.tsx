import BaseLayout from "@/components/BaseLayout";
import Dashboard from "./Dashboard";

const Index = () => {
  console.log('🎯 Index component loaded');
  
  return (
    <BaseLayout title="Dashboard de Treinamentos">
      <Dashboard />
    </BaseLayout>
  );
};

export default Index;