'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { PlusCircle, Pencil, Trash2 } from 'lucide-react'
import { toast, ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

interface User {
  id: number
  name: string
  email: string
  avatar: string
}

interface ApiResponse {
  users: User[]
}

export function BlockPage() {
  const router = useRouter()
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [newUser, setNewUser] = useState({ name: '', email: '', avatar: '' })
  const [editingUser, setEditingUser] = useState<User | null>(null)

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('access_token')
      if (!token) {
        throw new Error('No access token found')
      }
      const response = await fetch('http://localhost:8002/api/return', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      if (!response.ok) {
        throw new Error('Failed to fetch data')
      }
      const data: ApiResponse = await response.json()
      setUsers(data.users)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      if (err instanceof Error && err.message === 'No access token found') {
        router.push('/auth')
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>, isEditing: boolean = false) => {
    const { name, value } = e.target
    if (isEditing && editingUser) {
      setEditingUser({ ...editingUser, [name]: value })
    } else {
      setNewUser(prev => ({ ...prev, [name]: value }))
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('access_token')
    router.push('/auth')
  }

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const token = localStorage.getItem('access_token')
      const response = await fetch('http://localhost:8002/api/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(newUser),
      })
      if (!response.ok) {
        throw new Error('Failed to add user')
      }
      await fetchUsers()
      setNewUser({ name: '', email: '', avatar: '' })
      setIsAddDialogOpen(false)
      toast.success('User added successfully')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to add user')
    }
  }

  const handleEditUser = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingUser) return
    try {
      const token = localStorage.getItem('access_token')
      const response = await fetch(`http://localhost:8002/api/edit/${editingUser.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(editingUser),
      })
      if (!response.ok) {
        throw new Error('Failed to update user')
      }
      await fetchUsers()
      setIsEditDialogOpen(false)
      toast.success('User updated successfully')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to update user')
    }
  }

  const handleDeleteUser = async (userId: number) => {
    if (!confirm('Are you sure you want to delete this user?')) return
    try {
      const token = localStorage.getItem('access_token')
      const response = await fetch(`http://localhost:8002/api/delete/${userId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      if (!response.ok) {
        throw new Error('Failed to delete user')
      }
      await fetchUsers()
      toast.success('User deleted successfully')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to delete user')
    }
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Card className="w-[300px]">
          <CardHeader>
            <CardTitle className="text-center text-red-500">Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-center">{error}</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <main className="container mx-auto p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">User Management Dashboard</h1>
        <div className="space-x-2">
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="icon">
                <PlusCircle className="h-6 w-6" />
                <span className="sr-only">Add new user</span>
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New User</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleAddUser} className="space-y-4">
                <div>
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    name="name"
                    value={newUser.name}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={newUser.email}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="avatar">Avatar URL</Label>
                  <Input
                    id="avatar"
                    name="avatar"
                    type="url"
                    value={newUser.avatar}
                    onChange={handleInputChange}
                  />
                </div>
                <Button type="submit">Add User</Button>
              </form>
            </DialogContent>
          </Dialog>
          <Button onClick={handleLogout}>Logout</Button>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading
          ? Array(6).fill(0).map((_, index) => (
              <Card key={index} className="overflow-hidden">
                <CardHeader className="pb-0">
                  <Skeleton className="h-12 w-12 rounded-full mx-auto" />
                </CardHeader>
                <CardContent className="pb-6 space-y-2">
                  <Skeleton className="h-4 w-3/4 mx-auto" />
                  <Skeleton className="h-4 w-1/2 mx-auto" />
                </CardContent>
              </Card>
            ))
          : users.map((user) => (
              <Card key={user.id} className="overflow-hidden">
                <CardHeader className="pb-0">
                  <Avatar className="w-24 h-24 mx-auto">
                    <AvatarImage src={user.avatar} alt={`${user.name}'s avatar`} />
                    <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                </CardHeader>
                <CardContent className="text-center pb-6">
                  <CardTitle className="mb-2">{user.name}</CardTitle>
                  <p className="text-sm text-muted-foreground">{user.email}</p>
                </CardContent>
                <CardFooter className="flex justify-center space-x-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => {
                      setEditingUser(user)
                      setIsEditDialogOpen(true)
                    }}
                  >
                    <Pencil className="h-4 w-4" />
                    <span className="sr-only">Edit user</span>
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handleDeleteUser(user.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                    <span className="sr-only">Delete user</span>
                  </Button>
                </CardFooter>
              </Card>
            ))}
      </div>
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
          </DialogHeader>
          {editingUser && (
            <form onSubmit={handleEditUser} className="space-y-4">
              <div>
                <Label htmlFor="edit-name">Name</Label>
                <Input
                  id="edit-name"
                  name="name"
                  value={editingUser.name}
                  onChange={(e) => handleInputChange(e, true)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="edit-email">Email</Label>
                <Input
                  id="edit-email"
                  name="email"
                  type="email"
                  value={editingUser.email}
                  onChange={(e) => handleInputChange(e, true)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="edit-avatar">Avatar URL</Label>
                <Input
                  id="edit-avatar"
                  name="avatar"
                  type="url"
                  value={editingUser.avatar}
                  onChange={(e) => handleInputChange(e, true)}
                />
              </div>
              <Button type="submit">Update User</Button>
            </form>
          )}
        </DialogContent>
      </Dialog>
      <ToastContainer position="bottom-right" />
    </main>
  )
}