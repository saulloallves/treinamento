
import BaseLayout from "@/components/BaseLayout";
import UsersList from "@/components/users/UsersList";

const UsersPage = () => {
  return (
    <BaseLayout title="Gerenciar Usuários">
      <UsersList />
    </BaseLayout>
  );
};

export default UsersPage;
