// 'use client'

// import { useEffect, useState } from 'react'
// import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
// import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
// import { Skeleton } from "@/components/ui/skeleton"
// import { Button } from "@/components/ui/button"
// import { Input } from "@/components/ui/input"
// import { Label } from "@/components/ui/label"
// import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
// import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
// import { PlusCircle, Pencil, Trash2 } from "lucide-react"
// import { toast, ToastContainer } from 'react-toastify'
// import 'react-toastify/dist/ReactToastify.css'

// interface User {
//   id: number
//   name: string
//   email: string
//   avatar: string
// }

// interface ApiResponse {
//   users: User[]
// }

// const isTokenExpired = (token: string): boolean => {
//   const decodedToken = JSON.parse(atob(token.split('.')[1])) // декодируем JWT
//   const currentTime = Date.now() / 1000 // текущее время в секундах
//   return decodedToken.exp < currentTime
// }

// export function PageComponent() {
//   const [users, setUsers] = useState<User[]>([])
//   const [loading, setLoading] = useState(true)
//   const [error, setError] = useState<string | null>(null)
//   const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
//   const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
//   const [newUser, setNewUser] = useState({ name: '', email: '', avatar: '' })
//   const [editingUser, setEditingUser] = useState<User | null>(null)
//   const [isLoggedIn, setIsLoggedIn] = useState(false)
//   const [loginCredentials, setLoginCredentials] = useState({ username: '', password: '' })
//   const [registrationData, setRegistrationData] = useState({ username: '', telegramId: '' })
//   const [emailRegistrationData, setEmailRegistrationData] = useState({ username: '', email: '', password: '', confirmPassword: '' })
//   const [otpCode, setOtpCode] = useState('')
//   const [isOtpSent, setIsOtpSent] = useState(false)
//   const [registrationType, setRegistrationType] = useState<'telegram' | 'email'>('telegram')

//   const fetchUsers = async () => {
//     try {
//       const response = await fetch('http://localhost:8002/api/return')
//       if (!response.ok) {
//         throw new Error('Failed to fetch data')
//       }
//       const data: ApiResponse = await response.json()
//       setUsers(data.users)
//     } catch (err) {
//       setError(err instanceof Error ? err.message : 'An error occurred')
//     } finally {
//       setLoading(false)
//     }
//   }

//   useEffect(() => {
//     const token = localStorage.getItem('access_token');
//     if (!token || isTokenExpired(token)) {
//       setIsLoggedIn(false);
//     } else {
//       setIsLoggedIn(true);
//       fetchUsers();
//     }
//   }, [isLoggedIn]);
//   //   if (isLoggedIn) {
//   //     fetchUsers()
//   //   }
//   // }, [isLoggedIn])

//   const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>, isEditing: boolean = false) => {
//     const { name, value } = e.target
//     if (isEditing && editingUser) {
//       setEditingUser({ ...editingUser, [name]: value })
//     } else {
//       setNewUser(prev => ({ ...prev, [name]: value }))
//     }
//   }

//   const handleLoginInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const { name, value } = e.target
//     setLoginCredentials(prev => ({ ...prev, [name]: value }))
//   }

//   const handleRegistrationInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const { name, value } = e.target
//     setRegistrationData(prev => ({ ...prev, [name]: value }))
//   }

//   const handleEmailRegistrationInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const { name, value } = e.target
//     setEmailRegistrationData(prev => ({ ...prev, [name]: value }))
//   }

//   const handleLogin = async (e: React.FormEvent) => {
//     e.preventDefault()
//     try {
//       const formData = new URLSearchParams()
//       formData.append('username', loginCredentials.username)
//       formData.append('password', loginCredentials.password)
//       const response = await fetch('http://localhost:8001/api/auth/login', {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/x-www-form-urlencoded',
//         },
//         body: formData.toString(),
//       })
//       if (!response.ok) {
//         throw new Error('Login failed')
//       }
//       const data = await response.json();
//       localStorage.setItem('access_token', data.access_token);
//       setIsLoggedIn(true)
//       toast.success('Logged in successfully')
//     } catch (err) {
//       toast.error(err instanceof Error ? err.message : 'Login failed')
//     }
//   }

//   const handleRegister = async (e: React.FormEvent) => {
//     e.preventDefault()
//     try {
//       let response;
//       if (registrationType === 'telegram') {
//         response = await fetch('http://localhost:8001/api/auth/register', {
//           method: 'POST',
//           headers: {
//             'Content-Type': 'application/json',
//           },
//           body: JSON.stringify({
//             username: registrationData.username,
//             telegram_id: parseInt(registrationData.telegramId)
//           }),
//         })
//         const data = await response.json();
//         setRegistrationData(prev => ({ ...prev, telegram_id: data.telegram_id }));
//       } else {
//         if (emailRegistrationData.password !== emailRegistrationData.confirmPassword) {
//           throw new Error('Passwords do not match')
//         }
//         response = await fetch('http://localhost:8001/api/auth/register-email', {
//           method: 'POST',
//           headers: {
//             'Content-Type': 'application/json',
//           },
//           body: JSON.stringify({
//             username: emailRegistrationData.username,
//             email: emailRegistrationData.email,
//             password: emailRegistrationData.password,
//           }),
//         })
//       }
//       if (!response.ok) {
//         throw new Error('Registration failed')
//       }
      
//       if (registrationType === 'telegram') {
//         setIsOtpSent(true)
//         // toast.success('OTP sent to your Telegram. Please check and enter the code.')
//       } else {
//         const data = await response.json(); // Получаем данные из ответа сервера
//         if (data.access_token) {
//           localStorage.setItem('access_token', data.access_token); // Сохраняем токен в localStorage
//           toast.success('Registration successful. You are now logged in.');
//           // Перенаправление или обновление состояния для входа
//           setIsLoggedIn(true) // Переход на нужную страницу
//           fetchUsers()
//         } else {
//           throw new Error('Token not received');
//         }
//       }
//     } catch (err) {
//       toast.error(err instanceof Error ? err.message : 'Registration failed')
//     }
//   }

//   const handleVerifyOtp = async (e: React.FormEvent) => {
//     e.preventDefault()
//     try {
//       const response = await fetch('http://localhost:8001/api/auth/verify-otp', {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({ telegram_id: registrationData.telegramId, otp: otpCode }),
//       })
//       if (!response.ok) {
//         throw new Error('OTP verification failed')
//       }
//       const data = await response.json(); 
//       if (data.access_token) {
//         localStorage.setItem('access_token', data.access_token); 
//         toast.success('Registration successful. You are now logged in.');
//         setIsLoggedIn(true) 
//         fetchUsers()
//       } else {
//         throw new Error('Token not received');
//       }
//     } catch (err) {
//       toast.error(err instanceof Error ? err.message : 'OTP verification failed')
//     }
//   }

//   const handleLogout = () => {
//     localStorage.removeItem('access_token');
//     setIsLoggedIn(false)
//     setUsers([])
//     toast.info('Logged out successfully')
//   }

//   const handleAddUser = async (e: React.FormEvent) => {
//     e.preventDefault()
//     try {
//       const response = await fetch('http://localhost:8002/api/add', {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify(newUser),
//       })
//       if (!response.ok) {
//         throw new Error('Failed to add user')
//       }
//       await fetchUsers()
//       setNewUser({ name: '', email: '', avatar: '' })
//       setIsAddDialogOpen(false)
//       toast.success('User added successfully')
//     } catch (err) {
//       toast.error(err instanceof Error ? err.message : 'Failed to add user')
//     }
//   }

//   const handleEditUser = async (e: React.FormEvent) => {
//     e.preventDefault()
//     if (!editingUser) return
//     try {
//       const response = await fetch(`http://localhost:8002/api/edit/${editingUser.id}`, {
//         method: 'PUT',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify(editingUser),
//       })
//       if (!response.ok) {
//         throw new Error('Failed to update user')
//       }
//       await fetchUsers()
//       setIsEditDialogOpen(false)
//       toast.success('User updated successfully')
//     } catch (err) {
//       toast.error(err instanceof Error ? err.message : 'Failed to update user')
//     }
//   }

//   const handleDeleteUser = async (userId: number) => {
//     if (!confirm('Are you sure you want to delete this user?')) return
//     try {
//       const response = await fetch(`http://localhost:8002/api/delete/${userId}`, {
//         method: 'DELETE',
//       })
//       if (!response.ok) {
//         throw new Error('Failed to delete user')
//       }
//       await fetchUsers()
//       toast.success('User deleted successfully')
//     } catch (err) {
//       toast.error(err instanceof Error ? err.message : 'Failed to delete user')
//     }
//   }

//   if (error) {
//     return (
//       <div className="flex items-center justify-center h-screen">
//         <Card className="w-[300px]">
//           <CardHeader>
//             <CardTitle className="text-center text-red-500">Error</CardTitle>
//           </CardHeader>
//           <CardContent>
//             <p className="text-center">{error}</p>
//           </CardContent>
//         </Card>
//       </div>
//     )
//   }

//   if (!isLoggedIn) {
//     return (
//       <main className="container mx-auto p-8">
//         <Card className="w-[400px] mx-auto">
//           <CardHeader>
//             <CardTitle>Welcome</CardTitle>
//           </CardHeader>
//           <CardContent>
//             <Tabs defaultValue="login">
//               <TabsList className="grid w-full grid-cols-2">
//                 <TabsTrigger value="login">Login</TabsTrigger>
//                 <TabsTrigger value="register">Register</TabsTrigger>
//               </TabsList>
//               <TabsContent value="login">
//                 <form onSubmit={handleLogin} className="space-y-4">
//                   <div>
//                     <Label htmlFor="username">Username</Label>
//                     <Input
//                       id="username"
//                       name="username"
//                       value={loginCredentials.username}
//                       onChange={handleLoginInputChange}
//                       required
//                     />
//                   </div>
//                   <div>
//                     <Label htmlFor="password">Password</Label>
//                     <Input
//                       id="password"
//                       name="password"
//                       type="password"
//                       value={loginCredentials.password}
//                       onChange={handleLoginInputChange}
//                       required
//                     />
//                   </div>
//                   <Button type="submit" className="w-full">Login</Button>
//                 </form>
//               </TabsContent>
//               <TabsContent value="register">
//                 <Tabs value={registrationType} onValueChange={(value) => setRegistrationType(value as 'telegram' | 'email')}>
//                   <TabsList className="grid w-full grid-cols-2 mb-4">
//                     <TabsTrigger value="telegram">Telegram</TabsTrigger>
//                     <TabsTrigger value="email">Email</TabsTrigger>
//                   </TabsList>
//                   <TabsContent value="telegram">
//                     {!isOtpSent ? (
//                       <form onSubmit={handleRegister} className="space-y-4">
//                         <div>
//                           <Label htmlFor="reg-username">Username</Label>
//                           <Input
//                             id="reg-username"
//                             name="username"
//                             value={registrationData.username}
//                             onChange={handleRegistrationInputChange}
//                             required
//                           />
//                         </div>
//                         <div>
//                           <Label htmlFor="telegram-id">Telegram ID</Label>
//                           <Input
//                             id="telegram-id"
//                             name="telegramId"
//                             value={registrationData.telegramId}
//                             onChange={handleRegistrationInputChange}
//                             required
//                           />
//                         </div>
//                         <Button type="submit" className="w-full">Register with Telegram</Button>
//                       </form>
//                     ) : (
//                       <form onSubmit={handleVerifyOtp} className="space-y-4">
//                         <div>
//                           <Label htmlFor="otp">Enter OTP from Telegram</Label>
//                           <Input
//                             id="otp"
//                             name="otp"
//                             value={otpCode}
//                             onChange={(e) => setOtpCode(e.target.value)}
//                             required
//                           />
//                         </div>
//                         <Button type="submit" className="w-full">Verify OTP</Button>
//                       </form>
//                     )}
//                   </TabsContent>
//                   <TabsContent value="email">
//                     <form onSubmit={handleRegister} className="space-y-4">
//                       <div>
//                         <Label htmlFor="reg-username">Username</Label>
//                         <Input
//                           id="reg-username"
//                           name="username"
//                           value={emailRegistrationData.username}
//                           onChange={handleEmailRegistrationInputChange}
//                           required
//                         />
//                       </div>
//                       <div>
//                         <Label htmlFor="reg-email">Email</Label>
//                         <Input
//                           id="reg-email"
//                           name="email"
//                           type="email"
//                           value={emailRegistrationData.email}
//                           onChange={handleEmailRegistrationInputChange}
//                           required
//                         />
//                       </div>
//                       <div>
//                         <Label htmlFor="reg-password">Password</Label>
//                         <Input
//                           id="reg-password"
//                           name="password"
//                           type="password"
//                           value={emailRegistrationData.password}
//                           onChange={handleEmailRegistrationInputChange}
//                           required
//                         />
//                       </div>
//                       <div>
//                         <Label htmlFor="reg-confirm-password">Confirm Password</Label>
//                         <Input
//                           id="reg-confirm-password"
//                           name="confirmPassword"
//                           type="password"
//                           value={emailRegistrationData.confirmPassword}
//                           onChange={handleEmailRegistrationInputChange}
//                           required
//                         />
//                       </div>
//                       <Button type="submit" className="w-full">Register with Email</Button>
//                     </form>
//                   </TabsContent>
//                 </Tabs>
//               </TabsContent>
//             </Tabs>
//           </CardContent>
//         </Card>
//       </main>
//     )
//   }

//   return (
//     <main className="container mx-auto p-8">
//       <div className="flex justify-between items-center mb-6">
//         <h1 className="text-3xl font-bold">Users</h1>
//         <div className="space-x-2">
//           <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
//             <DialogTrigger asChild>
//               <Button variant="outline" size="icon">
//                 <PlusCircle className="h-6 w-6" />
//                 <span className="sr-only">Add new user</span>
//               </Button>
//             </DialogTrigger>
//             <DialogContent>
//               <DialogHeader>
//                 <DialogTitle>Add New User</DialogTitle>
//               </DialogHeader>
//               <form onSubmit={handleAddUser} className="space-y-4">
//                 <div>
//                   <Label htmlFor="name">Name</Label>
//                   <Input
//                     id="name"
//                     name="name"
//                     value={newUser.name}
//                     onChange={handleInputChange}
//                     required
//                   />
//                 </div>
//                 <div>
//                   <Label htmlFor="email">Email</Label>
//                   <Input
//                     id="email"
//                     name="email"
//                     type="email"
//                     value={newUser.email}
//                     onChange={handleInputChange}
//                     required
//                   />
//                 </div>
//                 <div>
//                   <Label htmlFor="avatar">Avatar URL</Label>
//                   <Input
//                     id="avatar"
//                     name="avatar"
//                     type="url"
//                     value={newUser.avatar}
//                     onChange={handleInputChange}
//                   />
//                 </div>
//                 <Button type="submit">Add User</Button>
//               </form>
//             </DialogContent>
//           </Dialog>
//           <Button onClick={handleLogout}>Logout</Button>
//         </div>
//       </div>
//       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//         {loading
//           ? Array(6).fill(0).map((_, index) => (
//               <Card key={index} className="overflow-hidden">
//                 <CardHeader className="pb-0">
//                   <Skeleton className="h-12 w-12 rounded-full mx-auto" />
//                 </CardHeader>
//                 <CardContent className="pb-6 space-y-2">
//                   <Skeleton className="h-4 w-3/4 mx-auto" />
//                   <Skeleton className="h-4 w-1/2 mx-auto" />
//                 </CardContent>
//               </Card>
//             ))
//           : users.map((user) => (
//               <Card key={user.id} className="overflow-hidden">
//                 <CardHeader className="pb-0">
//                   <Avatar className="w-24 h-24 mx-auto">
//                     <AvatarImage src={user.avatar} alt={`${user.name}'s avatar`} />
//                     <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
//                   </Avatar>
//                 </CardHeader>
//                 <CardContent className="text-center pb-6">
//                   <CardTitle className="mb-2">{user.name}</CardTitle>
//                   <p className="text-sm text-muted-foreground">{user.email}</p>
//                 </CardContent>
//                 <CardFooter className="flex justify-center space-x-2">
//                   <Button
//                     variant="outline"
//                     size="icon"
//                     onClick={() => {
//                       setEditingUser(user)
//                       setIsEditDialogOpen(true)
//                     }}
//                   >
//                     <Pencil className="h-4 w-4" />
//                     <span className="sr-only">Edit user</span>
//                   </Button>
//                   <Button
//                     variant="outline"
//                     size="icon"
//                     onClick={() => handleDeleteUser(user.id)}
//                   >
//                     <Trash2 className="h-4 w-4" />
//                     <span className="sr-only">Delete user</span>
//                   </Button>
//                 </CardFooter>
//               </Card>
//             ))}
//       </div>
//       <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
//         <DialogContent>
//           <DialogHeader>
//             <DialogTitle>Edit User</DialogTitle>
//           </DialogHeader>
//           {editingUser && (
//             <form onSubmit={handleEditUser} className="space-y-4">
//               <div>
//                 <Label htmlFor="edit-name">Name</Label>
//                 <Input
//                   id="edit-name"
//                   name="name"
//                   value={editingUser.name}
//                   onChange={(e) => handleInputChange(e, true)}
//                   required
//                 />
//               </div>
//               <div>
//                 <Label htmlFor="edit-email">Email</Label>
//                 <Input
//                   id="edit-email"
//                   name="email"
//                   type="email"
//                   value={editingUser.email}
//                   onChange={(e) => handleInputChange(e, true)}
//                   required
//                 />
//               </div>
//               <div>
//                 <Label htmlFor="edit-avatar">Avatar URL</Label>
//                 <Input
//                   id="edit-avatar"
//                   name="avatar"
//                   type="url"
//                   value={editingUser.avatar}
//                   onChange={(e) => handleInputChange(e, true)}
//                 />
//               </div>
//               <Button type="submit">Update User</Button>
//             </form>
//           )}
//         </DialogContent>
//       </Dialog>
//       <ToastContainer position="bottom-right" />
//     </main>
//   )
// }