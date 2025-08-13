import { useState, useEffect } from 'react';
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
import { Loader2, Save, RotateCcw } from 'lucide-react';
import { SystemSettings, useSystemSettings, useUpdateSystemSettings } from '@/hooks/useSettings';
import { useIsMobile } from '@/hooks/use-mobile';

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
  const isMobile = useIsMobile();

  const form = useForm<SettingsFormData>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      system_name: 'Cresci e Perdi',
      system_description: 'Sistema de Treinamentos',
      email_notifications: true,
      whatsapp_notifications: true,
      auto_certificate_generation: true,
      certificate_template: 'default',
      course_approval_required: false,
      max_enrollment_per_course: null,
      timezone: 'America/Sao_Paulo',
    },
  });

  // Update form when settings load
  useEffect(() => {
    if (settings) {
      form.reset({
        system_name: settings.system_name || 'Cresci e Perdi',
        system_description: settings.system_description || 'Sistema de Treinamentos',
        email_notifications: settings.email_notifications ?? true,
        whatsapp_notifications: settings.whatsapp_notifications ?? true,
        auto_certificate_generation: settings.auto_certificate_generation ?? true,
        certificate_template: settings.certificate_template || 'default',
        course_approval_required: settings.course_approval_required ?? false,
        max_enrollment_per_course: settings.max_enrollment_per_course || null,
        timezone: settings.timezone || 'America/Sao_Paulo',
      });
    }
  }, [settings, form]);

  const onSubmit = (data: SettingsFormData) => {
    updateSettings.mutate(data);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 md:space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg md:text-xl">Informações Gerais</CardTitle>
            <CardDescription>
              Configure as informações básicas do sistema
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="system_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome do Sistema</FormLabel>
                  <FormControl>
                    <Input {...field} className="w-full" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="system_description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descrição</FormLabel>
                  <FormControl>
                    <Textarea {...field} className="w-full resize-none" rows={3} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="timezone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Fuso Horário</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Selecione o fuso horário" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
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

        <Card>
          <CardHeader>
            <CardTitle className="text-lg md:text-xl">Notificações</CardTitle>
            <CardDescription>
              Configure como o sistema enviará notificações
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="email_notifications"
              render={({ field }) => (
                <FormItem className={`flex ${isMobile ? 'flex-col space-y-2' : 'flex-row items-center justify-between'} rounded-lg border p-3 md:p-4`}>
                  <div className="space-y-0.5 flex-1 min-w-0">
                    <FormLabel className="text-sm md:text-base">Notificações por Email</FormLabel>
                    <FormDescription className="text-xs md:text-sm">
                      Enviar notificações automáticas por email
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="whatsapp_notifications"
              render={({ field }) => (
                <FormItem className={`flex ${isMobile ? 'flex-col space-y-2' : 'flex-row items-center justify-between'} rounded-lg border p-3 md:p-4`}>
                  <div className="space-y-0.5 flex-1 min-w-0">
                    <FormLabel className="text-sm md:text-base">Notificações por WhatsApp</FormLabel>
                    <FormDescription className="text-xs md:text-sm">
                      Enviar notificações automáticas via WhatsApp
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg md:text-xl">Cursos e Certificados</CardTitle>
            <CardDescription>
              Configure o comportamento dos cursos e certificados
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="course_approval_required"
              render={({ field }) => (
                <FormItem className={`flex ${isMobile ? 'flex-col space-y-2' : 'flex-row items-center justify-between'} rounded-lg border p-3 md:p-4`}>
                  <div className="space-y-0.5 flex-1 min-w-0">
                    <FormLabel className="text-sm md:text-base">Aprovação Obrigatória</FormLabel>
                    <FormDescription className="text-xs md:text-sm">
                      Inscrições em cursos precisam de aprovação do administrador
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="auto_certificate_generation"
              render={({ field }) => (
                <FormItem className={`flex ${isMobile ? 'flex-col space-y-2' : 'flex-row items-center justify-between'} rounded-lg border p-3 md:p-4`}>
                  <div className="space-y-0.5 flex-1 min-w-0">
                    <FormLabel className="text-sm md:text-base">Geração Automática de Certificados</FormLabel>
                    <FormDescription className="text-xs md:text-sm">
                      Gerar certificados automaticamente ao concluir um curso
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="certificate_template"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Template do Certificado</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Selecione um template" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
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
                <FormItem>
                  <FormLabel>Máximo de Inscrições por Curso</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min="1"
                      className="w-full"
                      {...field}
                      value={field.value || ''}
                      onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : null)}
                    />
                  </FormControl>
                  <FormDescription className="text-xs md:text-sm">
                    Deixe em branco para permitir inscrições ilimitadas
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        <div className={`flex gap-3 ${isMobile ? 'flex-col' : 'justify-end'}`}>
          <Button 
            type="submit" 
            disabled={updateSettings.isPending}
            className={`${isMobile ? 'w-full' : 'min-w-[140px]'} flex items-center justify-center gap-2`}
          >
            {updateSettings.isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Salvando...
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                Salvar Configurações
              </>
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default SystemSettingsForm;