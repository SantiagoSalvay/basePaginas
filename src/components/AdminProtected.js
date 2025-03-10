import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { useEffect } from "react";

const AdminProtected = ({ children }) => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const loading = status === "loading";

  useEffect(() => {
    if (!loading && (!session || session.user.role !== "admin")) {
      router.push("/");
    }
  }, [session, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!session || session.user.role !== "admin") {
    return null;
  }

  return <>{children}</>;
};

export default AdminProtected;
