import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Video, Users, MessageCircle, Mic, Monitor, Play, Square } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const StreamingDemo = () => {
  const navigate = useNavigate();
  const [isDemo, setIsDemo] = useState(true);

  const features = [
    {
      icon: <Video className="h-6 w-6" />,
      title: "Vídeo HD",
      description: "Streaming de vídeo em alta definição com ajuste automático de qualidade"
    },
    {
      icon: <Mic className="h-6 w-6" />,
      title: "Áudio Cristalino", 
      description: "Áudio com cancelamento de ruído e eco para melhor experiência"
    },
    {
      icon: <Monitor className="h-6 w-6" />,
      title: "Compartilhamento de Tela",
      description: "Compartilhe sua tela para apresentações e demonstrações"
    },
    {
      icon: <MessageCircle className="h-6 w-6" />,
      title: "Chat Integrado",
      description: "Sistema de chat em tempo real durante as aulas"
    },
    {
      icon: <Users className="h-6 w-6" />,
      title: "Múltiplos Participantes",
      description: "Participantes ilimitados em suas aulas ao vivo"
    },
    {
      icon: <Play className="h-6 w-6" />,
      title: "Gravação Automática",
      description: "Grave automaticamente suas aulas para disponibilizar depois"
    }
  ];

  const handleStartDemo = () => {
    // Navigate to a demo lesson ID
    navigate('/aula-ao-vivo/demo-lesson');
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <Badge variant="secondary" className="mb-4">
            🚀 Novo Sistema de Streaming
          </Badge>
          <h1 className="text-4xl font-bold mb-4">
            Sistema de Streaming Interno
          </h1>
          <p className="text-xl text-muted-foreground mb-6">
            Conduza suas aulas ao vivo diretamente no sistema, sem dependência de ferramentas externas
          </p>
          <div className="flex items-center justify-center gap-4">
            <Button onClick={handleStartDemo} size="lg" className="gap-2">
              <Play className="h-5 w-5" />
              Testar Demo
            </Button>
            <Button variant="outline" size="lg" onClick={() => navigate('/lessons')}>
              Criar Aula
            </Button>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {features.map((feature, index) => (
            <Card key={index} className="text-center">
              <CardHeader>
                <div className="mx-auto mb-2 text-primary">
                  {feature.icon}
                </div>
                <CardTitle className="text-lg">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>{feature.description}</CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Comparison */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Comparação: Zoom vs Sistema Interno</CardTitle>
            <CardDescription>
              Veja as vantagens do nosso sistema de streaming próprio
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              {/* Zoom */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <div className="w-8 h-8 bg-blue-100 rounded flex items-center justify-center">
                    <Video className="h-4 w-4 text-blue-600" />
                  </div>
                  Zoom
                </h3>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <span className="text-red-500">•</span>
                    Abre em nova aba/aplicativo
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-500">•</span>
                    Depende de serviço externo
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-500">•</span>
                    Experiência fragmentada
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500">•</span>
                    Estável e testado
                  </li>
                </ul>
              </div>

              {/* Sistema Interno */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <div className="w-8 h-8 bg-green-100 rounded flex items-center justify-center">
                    <Monitor className="h-4 w-4 text-green-600" />
                  </div>
                  Sistema Interno
                </h3>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <span className="text-green-500">•</span>
                    Integrado ao sistema
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500">•</span>
                    Sem dependências externas
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500">•</span>
                    Experiência unificada
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500">•</span>
                    Controle total sobre dados
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500">•</span>
                    Interface personalizada
                  </li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* How to Use */}
        <Card>
          <CardHeader>
            <CardTitle>Como Usar</CardTitle>
            <CardDescription>
              Passos simples para criar e conduzir aulas ao vivo
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-primary font-bold text-lg">1</span>
                </div>
                <h4 className="font-semibold mb-2">Criar Aula</h4>
                <p className="text-sm text-muted-foreground">
                  Na seção "Aulas", escolha "Streaming Interno" ao criar uma nova aula
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-primary font-bold text-lg">2</span>
                </div>
                <h4 className="font-semibold mb-2">Entrar na Sala</h4>
                <p className="text-sm text-muted-foreground">
                  Clique em "Entrar na Sala" para acessar a interface de streaming
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-primary font-bold text-lg">3</span>
                </div>
                <h4 className="font-semibold mb-2">Iniciar Transmissão</h4>
                <p className="text-sm text-muted-foreground">
                  Use os controles para gerenciar áudio, vídeo e iniciar a transmissão
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default StreamingDemo;