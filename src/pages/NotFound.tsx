import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    document.title = 'Página não encontrada - Cresci e Perdi';
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-purple-50/20 to-pink-50/20">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4 text-foreground">404</h1>
        <p className="text-xl text-muted-foreground mb-4">Página não encontrada</p>
        <Link to="/" className="text-primary hover:text-primary/80 underline font-medium">
          Voltar ao Início
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
