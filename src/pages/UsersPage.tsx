
import { useEffect } from "react";
import BaseLayout from "@/components/BaseLayout";
import UsersList from "@/components/users/UsersList";
import AdminApprovalsList from "@/components/users/AdminApprovalsList";
import CollaboratorApprovals from "@/components/collaboration/CollaboratorApprovals";
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
        {isAdmin && <CollaboratorApprovals />}
        <UsersList />
      </div>
    </BaseLayout>
  );
};

export default UsersPage;
