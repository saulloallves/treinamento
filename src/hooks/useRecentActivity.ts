import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

export type ActivityType = "course" | "user" | "certificate" | "whatsapp";

export interface ActivityItem {
  id: string;
  type: ActivityType;
  action: string;
  description: string;
  time: string; // humanized, e.g., "2 horas atrás"
  created_at: string; // ISO for sorting if needed by consumers
}

export const useRecentActivity = () => {
  return useQuery<ActivityItem[]>({
    queryKey: ["recent_activity"],
    queryFn: async () => {
      const [coursesRes, usersRes, certsRes, waRes] = await Promise.all([
        supabase
          .from("courses")
          .select("id,name,created_at")
          .order("created_at", { ascending: false })
          .limit(10),
        supabase
          .from("users")
          .select("id,name,created_at")
          .order("created_at", { ascending: false })
          .limit(10),
        supabase
          .from("certificates")
          .select("id,generated_at")
          .order("generated_at", { ascending: false })
          .limit(10),
        supabase
          .from("whatsapp_dispatches")
          .select("id,recipients_count,created_at")
          .order("created_at", { ascending: false })
          .limit(10),
      ]);

      const items: ActivityItem[] = [];

      // Courses -> Novo curso criado
      if (coursesRes.data) {
        for (const c of coursesRes.data as any[]) {
          const date = new Date(c.created_at);
          items.push({
            id: c.id,
            type: "course",
            action: "Novo curso criado",
            description: `${c.name} foi adicionado ao sistema`,
            time: `${formatDistanceToNow(date, { locale: ptBR })} atrás`,
            created_at: date.toISOString(),
          });
        }
      }

      // Users -> Usuário cadastrado
      if (usersRes.data) {
        for (const u of usersRes.data as any[]) {
          const date = new Date(u.created_at);
          items.push({
            id: u.id,
            type: "user",
            action: "Usuário cadastrado",
            description: `${u.name} foi cadastrado`,
            time: `${formatDistanceToNow(date, { locale: ptBR })} atrás`,
            created_at: date.toISOString(),
          });
        }
      }

      // Certificates -> Certificado emitido
      if (certsRes.data) {
        for (const cert of certsRes.data as any[]) {
          const date = new Date(cert.generated_at);
          items.push({
            id: cert.id,
            type: "certificate",
            action: "Certificado emitido",
            description: `Certificado emitido`,
            time: `${formatDistanceToNow(date, { locale: ptBR })} atrás`,
            created_at: date.toISOString(),
          });
        }
      }

      // WhatsApp -> Disparo WhatsApp
      if (waRes.data) {
        for (const w of waRes.data as any[]) {
          const date = new Date(w.created_at);
          items.push({
            id: w.id,
            type: "whatsapp",
            action: "Disparo WhatsApp",
            description: `${w.recipients_count ?? 0} usuários foram notificados`,
            time: `${formatDistanceToNow(date, { locale: ptBR })} atrás`,
            created_at: date.toISOString(),
          });
        }
      }

      // Sort by created_at desc and limit
      items.sort((a, b) => (a.created_at < b.created_at ? 1 : -1));
      return items.slice(0, 8);
    },
  });
};
