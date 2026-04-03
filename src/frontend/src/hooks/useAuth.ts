import { useQuery } from "@tanstack/react-query";
import { UserRole } from "../backend";
import { useActor } from "./useActor";
import { useInternetIdentity } from "./useInternetIdentity";

export type AppRole = "admin" | "teacher" | "checker" | "guest";

export interface AuthState {
  isAuthenticated: boolean;
  isInitializing: boolean;
  principalId: string | null;
  appRole: AppRole;
  isApproved: boolean;
  login: () => void;
  logout: () => void;
}

export function useAuth(): AuthState {
  const { identity, login, clear, isInitializing } = useInternetIdentity();
  const { actor, isFetching } = useActor();

  const isAuthenticated = !!identity;
  const principalId = identity?.getPrincipal().toString() ?? null;

  const roleQuery = useQuery<UserRole>({
    queryKey: ["userRole", principalId],
    queryFn: async () => {
      if (!actor) return UserRole.guest;
      try {
        return await actor.getCallerUserRole();
      } catch {
        return UserRole.guest;
      }
    },
    enabled: !!actor && !isFetching && isAuthenticated,
    staleTime: 30_000,
  });

  const approvalQuery = useQuery<boolean>({
    queryKey: ["isApproved", principalId],
    queryFn: async () => {
      if (!actor) return false;
      try {
        return await actor.isCallerApproved();
      } catch {
        return false;
      }
    },
    enabled: !!actor && !isFetching && isAuthenticated,
    staleTime: 30_000,
  });

  const backendRole = roleQuery.data;
  let appRole: AppRole = "guest";
  if (backendRole === UserRole.admin) appRole = "admin";
  else if (backendRole === UserRole.user) appRole = "teacher";
  else if (backendRole === UserRole.guest) appRole = "checker";

  return {
    isAuthenticated,
    isInitializing: isInitializing || isFetching,
    principalId,
    appRole,
    isApproved: approvalQuery.data ?? false,
    login,
    logout: clear,
  };
}
