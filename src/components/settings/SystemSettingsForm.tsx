import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Loader2, Settings, Bell, Award, Users, Globe } from 'lucide-react';
import { SystemSettings, useSystemSettings, useUpdateSystemSettings } from '@/hooks/useSettings';

const settingsSchema = z.object({
  system_name: z.string().min(1, 'Nome do sistema é obrigatório'),
  system_description: z.string().min(1, 'Descrição é obrigatória'),
  email_notifications: z.boolean(),
  whatsapp_notifications: z.boolean(),
  auto_certificate_generation: z.boolean(),
  certificate_template: z.string(),
  course_approval_required: z.boolean(),
  max_enrollment_per_course: z.number().nullable(),
  timezone: z.string(),
});

type SettingsFormData = z.infer<typeof settingsSchema>;

const SystemSettingsForm = () => {
  const { data: settings, isLoading } = useSystemSettings();
  const updateSettings = useUpdateSystemSettings();

  const form = useForm<SettingsFormData>({
    resolver: zodResolver(settingsSchema),
    values: {
      system_name: settings?.system_name || 'Cresci e Perdi',
      system_description: settings?.system_description || 'Sistema de Treinamentos',
      email_notifications: settings?.email_notifications ?? true,
      whatsapp_notifications: settings?.whatsapp_notifications ?? true,
      auto_certificate_generation: settings?.auto_certificate_generation ?? true,
      certificate_template: settings?.certificate_template || 'default',
      course_approval_required: settings?.course_approval_required ?? false,
      max_enrollment_per_course: settings?.max_enrollment_per_course || null,
      timezone: settings?.timezone || 'America/Sao_Paulo',
    },
  });

  const onSubmit = (data: SettingsFormData) => {
    updateSettings.mutate(data);
  };

  if (isLoading) {
    return (
      <div className="loading-overlay">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Carregando configurações...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          {/* Informações Gerais */}
          <Card className="card-modern">
            <CardHeader className="flex flex-row items-center gap-3">
              <Settings className="w-6 h-6 text-primary" />
              <div>
                <CardTitle className="font-heading">Informações Gerais</CardTitle>
                <CardDescription>
                  Configure as informações básicas do sistema
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <FormField
                control={form.control}
                name="system_name"
                render={({ field }) => (
                  <FormItem className="form-field">
                    <FormLabel className="form-label">Nome do Sistema</FormLabel>
                    <FormControl>
                      <Input 
                        {...field} 
                        className="form-input"
                        placeholder="Digite o nome do sistema"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="system_description"
                render={({ field }) => (
                  <FormItem className="form-field">
                    <FormLabel className="form-label">Descrição</FormLabel>
                    <FormControl>
                      <Textarea 
                        {...field} 
                        className="form-input min-h-[100px]"
                        placeholder="Descreva o propósito do sistema"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="timezone"
                render={({ field }) => (
                  <FormItem className="form-field">
                    <FormLabel className="form-label">
                      <Globe className="w-4 h-4 inline mr-2" />
                      Fuso Horário
                    </FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="form-input">
                          <SelectValue placeholder="Selecione o fuso horário" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-popover border border-border shadow-lg rounded-lg">
                        <SelectItem value="America/Sao_Paulo">América/São Paulo (GMT-3)</SelectItem>
                        <SelectItem value="America/Manaus">América/Manaus (GMT-4)</SelectItem>
                        <SelectItem value="America/Rio_Branco">América/Rio Branco (GMT-5)</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Notificações */}
          <Card className="card-modern">
            <CardHeader className="flex flex-row items-center gap-3">
              <Bell className="w-6 h-6 text-primary" />
              <div>
                <CardTitle className="font-heading">Notificações</CardTitle>
                <CardDescription>
                  Configure como o sistema enviará notificações
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <FormField
                control={form.control}
                name="email_notifications"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-xl border border-border p-6 bg-card/50">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base font-medium">Notificações por Email</FormLabel>
                      <FormDescription>
                        Enviar notificações automáticas por email para usuários
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch 
                        checked={field.value} 
                        onCheckedChange={field.onChange}
                        className="data-[state=checked]:bg-primary"
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="whatsapp_notifications"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-xl border border-border p-6 bg-card/50">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base font-medium">Notificações por WhatsApp</FormLabel>
                      <FormDescription>
                        Enviar notificações automáticas via WhatsApp
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch 
                        checked={field.value} 
                        onCheckedChange={field.onChange}
                        className="data-[state=checked]:bg-primary"
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Cursos e Certificados */}
          <Card className="card-modern">
            <CardHeader className="flex flex-row items-center gap-3">
              <Award className="w-6 h-6 text-primary" />
              <div>
                <CardTitle className="font-heading">Cursos e Certificados</CardTitle>
                <CardDescription>
                  Configure o comportamento dos cursos e certificados
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <FormField
                control={form.control}
                name="course_approval_required"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-xl border border-border p-6 bg-card/50">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base font-medium">
                        <Users className="w-4 h-4 inline mr-2" />
                        Aprovação Obrigatória
                      </FormLabel>
                      <FormDescription>
                        Inscrições em cursos precisam de aprovação do administrador
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch 
                        checked={field.value} 
                        onCheckedChange={field.onChange}
                        className="data-[state=checked]:bg-primary"
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="auto_certificate_generation"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-xl border border-border p-6 bg-card/50">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base font-medium">Geração Automática de Certificados</FormLabel>
                      <FormDescription>
                        Gerar certificados automaticamente ao concluir um curso
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch 
                        checked={field.value} 
                        onCheckedChange={field.onChange}
                        className="data-[state=checked]:bg-primary"
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="certificate_template"
                  render={({ field }) => (
                    <FormItem className="form-field">
                      <FormLabel className="form-label">Template do Certificado</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="form-input">
                            <SelectValue placeholder="Selecione um template" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="bg-popover border border-border shadow-lg rounded-lg">
                          <SelectItem value="default">Padrão</SelectItem>
                          <SelectItem value="modern">Moderno</SelectItem>
                          <SelectItem value="classic">Clássico</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="max_enrollment_per_course"
                  render={({ field }) => (
                    <FormItem className="form-field">
                      <FormLabel className="form-label">Máximo de Inscrições por Curso</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="1"
                          className="form-input"
                          placeholder="Deixe em branco para ilimitado"
                          {...field}
                          value={field.value || ''}
                          onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : null)}
                        />
                      </FormControl>
                      <FormDescription>
                        Deixe em branco para permitir inscrições ilimitadas
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          {/* Botão de Salvar */}
          <div className="flex justify-end pt-6">
            <Button 
              type="submit" 
              disabled={updateSettings.isPending}
              className="min-w-[160px] font-semibold"
              size="lg"
            >
              {updateSettings.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Salvando...
                </>
              ) : (
                'Salvar Configurações'
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default SystemSettingsForm;