import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface UserApprovalInfo {
    status: ApprovalStatus;
    principal: Principal;
}
export type Time = bigint;
export interface UserProfile {
    principal: Principal;
    name: string;
    createdAt: Time;
    role: AppRole;
    qualifications: string;
    email: string;
    approvalStatus: string;
    phone: string;
}
export enum AppRole {
    checker = "checker",
    admin = "admin",
    teacher = "teacher"
}
export enum ApprovalStatus {
    pending = "pending",
    approved = "approved",
    rejected = "rejected"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    adminCreateUser(principal: Principal, name: string, email: string, phone: string, role: AppRole, qualifications: string): Promise<UserProfile>;
    adminDeleteUser(principal: Principal): Promise<void>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    getCallerUserRole(): Promise<UserRole>;
    getUserProfile(): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    isCallerApproved(): Promise<boolean>;
    listAllUsers(): Promise<Array<UserProfile>>;
    listApprovals(): Promise<Array<UserApprovalInfo>>;
    registerUser(name: string, email: string, phone: string, role: AppRole, qualifications: string): Promise<UserProfile>;
    requestApproval(): Promise<void>;
    setApproval(user: Principal, status: ApprovalStatus): Promise<void>;
}
