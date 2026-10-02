import { Navigate, useParams } from "react-router-dom";

export default function AcceptAdminInvite() {
  const { token } = useParams<{ token: string }>();
  return (
    <Navigate
      to={token ? `/login?invite=${encodeURIComponent(token)}` : "/login"}
      replace
    />
  );
}
