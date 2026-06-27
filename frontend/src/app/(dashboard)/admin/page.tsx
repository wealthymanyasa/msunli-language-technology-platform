"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Loader2,
  Shield,
  ShieldOff,
  UserCog,
  AlertCircle,
} from "lucide-react"
import { adminApi } from "@/services/api"
import { useAuthStore } from "@/store/auth"
import type { User } from "@/types"

export default function AdminPage() {
  const router = useRouter()
  const queryClient = useQueryClient()
  const currentUser = useAuthStore((s) => s.user)

  useEffect(() => {
    if (currentUser && currentUser.role !== "admin") {
      router.push("/dashboard")
    }
  }, [currentUser, router])

  const {
    data: users,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["admin", "users"],
    queryFn: () => adminApi.listUsers().then((r) => r.data as User[]),
    enabled: currentUser?.role === "admin",
  })

  const roleMutation = useMutation({
    mutationFn: ({ userId, role }: { userId: string; role: string }) =>
      adminApi.updateRole(userId, role),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin", "users"] }),
  })

  const activeMutation = useMutation({
    mutationFn: ({ userId }: { userId: string }) =>
      adminApi.toggleActive(userId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin", "users"] }),
  })

  if (!currentUser || currentUser.role !== "admin") return null

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <UserCog className="h-8 w-8 text-primary" />
          User Management
        </h1>
        <p className="text-muted-foreground mt-1">
          Manage users, roles, and account status
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Users</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading && (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          )}

          {isError && (
            <div className="flex items-center gap-2 text-red-500 py-8 justify-center">
              <AlertCircle className="h-5 w-5" />
              <p className="text-sm">Failed to load users</p>
            </div>
          )}

          {users && users.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-8">
              No users found
            </p>
          )}

          {users && users.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-muted-foreground text-xs uppercase tracking-wider">
                    <th className="text-left py-3 px-2 font-medium">User</th>
                    <th className="text-left py-3 px-2 font-medium">Email</th>
                    <th className="text-left py-3 px-2 font-medium">Role</th>
                    <th className="text-left py-3 px-2 font-medium">Status</th>
                    <th className="text-right py-3 px-2 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user: User) => (
                    <tr
                      key={user.id}
                      className="border-b border-border/50 hover:bg-secondary/30 transition-colors"
                    >
                      <td className="py-3 px-2 font-medium">{user.username}</td>
                      <td className="py-3 px-2 text-muted-foreground">
                        {user.email}
                      </td>
                      <td className="py-3 px-2">
                        <Select
                          value={user.role}
                          onValueChange={(role) => {
                            if (role) roleMutation.mutate({ userId: user.id, role })
                          }}
                        >
                          <SelectTrigger className="h-7 w-24 text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="user">user</SelectItem>
                            <SelectItem value="admin">admin</SelectItem>
                          </SelectContent>
                        </Select>
                      </td>
                      <td className="py-3 px-2">
                        <Badge
                          variant={user.is_active ? "default" : "secondary"}
                          className="text-xs"
                        >
                          {user.is_active ? "Active" : "Inactive"}
                        </Badge>
                      </td>
                      <td className="py-3 px-2 text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            activeMutation.mutate({ userId: user.id })
                          }
                          disabled={activeMutation.isPending}
                          title={user.is_active ? "Deactivate" : "Activate"}
                        >
                          {user.is_active ? (
                            <ShieldOff className="h-4 w-4 text-red-500" />
                          ) : (
                            <Shield className="h-4 w-4 text-emerald-500" />
                          )}
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
