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
  return (
    <div className="space-y-3">
      {admins.map((admin) => (
        <Card key={admin.id} className="hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            {/* Header with name and status */}
            <div className="flex items-start justify-between gap-3 mb-3">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <User className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-sm truncate">
                    {admin.name}
                  </h3>
                  <p className="text-xs text-muted-foreground truncate">
                    {admin.email}
                  </p>
                </div>
              </div>
              
              {/* Status and Actions */}
              <div className="flex items-center gap-2 shrink-0">
                <Badge 
                  variant={admin.status === 'approved' ? 'default' : 'secondary'}
                  className="text-xs"
                >
                  {admin.status === 'approved' ? 'Ativo' : admin.status}
                </Badge>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      onClick={() => onDeleteAdmin(admin.id)}
                      className="text-destructive"
                    >
                      Remover
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
            
            {/* Creation date */}
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Calendar className="w-3 h-3" />
              <span>Criado em {safeFormatDateTimeDetailed(admin.created_at)}</span>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default AdminsListMobile;