import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreVertical, User, Mail, Calendar } from "lucide-react";
import { safeFormatDateTimeDetailed } from "@/lib/dateUtils";

interface AdminsListMobileProps {
  admins: any[];
  onDeleteAdmin: (adminId: string) => void;
}

const AdminsListMobile = ({ admins, onDeleteAdmin }: AdminsListMobileProps) => {
  if (admins.length === 0) {
    return (
      <div className="text-center py-8">
        <User className="mx-auto w-12 h-12 text-muted-foreground mb-4" />
        <p className="text-muted-foreground">Nenhum administrador encontrado.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3 w-full max-w-full overflow-hidden">
      {admins.map((admin) => (
        <Card key={admin.id} className="border border-border/50 shadow-sm hover:shadow-md transition-all duration-200 w-full max-w-full overflow-hidden">
          <CardContent className="p-4 w-full max-w-full overflow-hidden">
            {/* Header com avatar, info e status */}
            <div className="flex items-start gap-3 mb-3 w-full max-w-full min-w-0">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center shrink-0 ring-1 ring-primary/20">
                <User className="w-6 h-6 text-primary" />
              </div>
              
              <div className="flex-1 min-w-0 overflow-hidden">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-foreground text-base leading-tight break-anywhere truncate">
                      {admin.name}
                    </h3>
                  </div>
                  
                  <div className="flex items-center gap-2 shrink-0">
                    <Badge 
                      className="text-xs px-2 py-1 bg-green-100 text-green-700 border-green-200 whitespace-nowrap"
                    >
                      Ativo
                    </Badge>
                    
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-muted shrink-0">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-40">
                        <DropdownMenuItem
                          onClick={() => onDeleteAdmin(admin.id)}
                          className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                        >
                          Remover
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
                
                <div className="flex items-center gap-1 text-sm text-muted-foreground mb-3 min-w-0">
                  <Mail className="w-4 h-4 shrink-0" />
                  <span className="truncate break-anywhere">{admin.email}</span>
                </div>
              </div>
            </div>
            
            {/* Footer com data de criação */}
            <div className="pt-3 border-t border-border/50">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Calendar className="w-4 h-4 text-muted-foreground shrink-0" />
                <span className="truncate">Criado em {safeFormatDateTimeDetailed(admin.created_at)}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default AdminsListMobile;