
import { useEffect } from "react";
import BaseLayout from "@/components/BaseLayout";
import UsersList from "@/components/users/UsersList";
import AdminApprovalsList from "@/components/users/AdminApprovalsList";
import { useAuth } from "@/hooks/useAuth";
import { useIsAdmin } from "@/hooks/useIsAdmin";

const UsersPage = () => {
  const { user } = useAuth();
  const { data: isAdmin } = useIsAdmin(user?.id);

  useEffect(() => {
    document.title = "Usuários | Sistema";
  }, []);

  return (
    <BaseLayout title="Gerenciar Usuários">
      <div className="space-y-6">
        {isAdmin && <AdminApprovalsList />}
        <UsersList />
      </div>
    </BaseLayout>
  );
};

export default UsersPage;
