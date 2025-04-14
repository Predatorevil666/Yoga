'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast, ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

export function BlockPage() {
  const router = useRouter()
  const [loginCredentials, setLoginCredentials] = useState({ username: '', password: '' })
  const [registrationData, setRegistrationData] = useState({ username: '', telegramId: '' })
  const [emailRegistrationData, setEmailRegistrationData] = useState({ username: '', email: '', password: '', confirmPassword: '' })
  const [otpCode, setOtpCode] = useState('')
  const [isOtpSent, setIsOtpSent] = useState(false)
  const [registrationType, setRegistrationType] = useState<'telegram' | 'email'>('telegram')

  const handleLoginInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setLoginCredentials(prev => ({ ...prev, [name]: value }))
  }

  const handleRegistrationInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setRegistrationData(prev => ({ ...prev, [name]: value }))
  }

  const handleEmailRegistrationInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setEmailRegistrationData(prev => ({ ...prev, [name]: value }))
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const formData = new URLSearchParams()
      formData.append('username', loginCredentials.username)
      formData.append('password', loginCredentials.password)
      const response = await fetch('http://localhost:8001/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formData.toString(),
      })
      if (!response.ok) {
        throw new Error('Login failed')
      }
      const data = await response.json();
      localStorage.setItem('access_token', data.access_token);
      toast.success('Logged in successfully')
      router.push('http://localhost/')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Login failed')
    }
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      let response;
      if (registrationType === 'telegram') {
        response = await fetch('http://localhost:8001/api/auth/register', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            username: registrationData.username,
            telegram_id: parseInt(registrationData.telegramId)
          }),
        })
        const data = await response.json();
        setRegistrationData(prev => ({ ...prev, telegram_id: data.telegram_id }));
      } else {
        if (emailRegistrationData.password !== emailRegistrationData.confirmPassword) {
          throw new Error('Passwords do not match')
        }
        response = await fetch('http://localhost:8001/api/auth/register-email', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            username: emailRegistrationData.username,
            email: emailRegistrationData.email,
            password: emailRegistrationData.password,
          }),
        })
      }
      if (!response.ok) {
        throw new Error('Registration failed')
      }
      
      if (registrationType === 'telegram') {
        setIsOtpSent(true)
      } else {
        const data = await response.json();
        if (data.access_token) {
          localStorage.setItem('access_token', data.access_token);
          toast.success('Registration successful. You are now logged in.');
          router.push('http://localhost/')
        } else {
          throw new Error('Token not received');
        }
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Registration failed')
    }
  }

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const response = await fetch('http://localhost:8001/api/auth/verify-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ telegram_id: registrationData.telegramId, otp: otpCode }),
      })
      if (!response.ok) {
        throw new Error('OTP verification failed')
      }
      const data = await response.json(); 
      if (data.access_token) {
        localStorage.setItem('access_token', data.access_token); 
        toast.success('Registration successful. You are now logged in.');
        router.push('http://localhost/')
      } else {
        throw new Error('Token not received');
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'OTP verification failed')
    }
  }

  return (
    <main className="container mx-auto p-8">
      <Card className="w-[400px] mx-auto">
        <CardHeader>
          <CardTitle>Welcome</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="login">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="register">Register</TabsTrigger>
            </TabsList>
            <TabsContent value="login">
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <Label htmlFor="username">Username</Label>
                  <Input
                    id="username"
                    name="username"
                    value={loginCredentials.username}
                    onChange={handleLoginInputChange}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    value={loginCredentials.password}
                    onChange={handleLoginInputChange}
                    required
                  />
                </div>
                <Button type="submit" className="w-full">Login</Button>
              </form>
            </TabsContent>
            <TabsContent value="register">
              <Tabs value={registrationType} onValueChange={(value) => setRegistrationType(value as 'telegram' | 'email')}>
                <TabsList className="grid w-full grid-cols-2 mb-4">
                  <TabsTrigger value="telegram">Telegram</TabsTrigger>
                  <TabsTrigger value="email">Email</TabsTrigger>
                </TabsList>
                <TabsContent value="telegram">
                  {!isOtpSent ? (
                    <form onSubmit={handleRegister} className="space-y-4">
                      <div>
                        <Label htmlFor="reg-username">Username</Label>
                        <Input
                          id="reg-username"
                          name="username"
                          value={registrationData.username}
                          onChange={handleRegistrationInputChange}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="telegram-id">Telegram ID</Label>
                        <Input
                          id="telegram-id"
                          name="telegramId"
                          value={registrationData.telegramId}
                          onChange={handleRegistrationInputChange}
                          required
                        />
                      </div>
                      <Button type="submit" className="w-full">Register with Telegram</Button>
                    </form>
                  ) : (
                    <form onSubmit={handleVerifyOtp} className="space-y-4">
                      <div>
                        <Label htmlFor="otp">Enter OTP from Telegram</Label>
                        <Input
                          id="otp"
                          name="otp"
                          value={otpCode}
                          onChange={(e) => setOtpCode(e.target.value)}
                          required
                        />
                      </div>
                      <Button type="submit" className="w-full">Verify OTP</Button>
                    </form>
                  )}
                </TabsContent>
                <TabsContent value="email">
                  <form onSubmit={handleRegister} className="space-y-4">
                    <div>
                      <Label htmlFor="reg-username">Username</Label>
                      <Input
                        id="reg-username"
                        name="username"
                        value={emailRegistrationData.username}
                        onChange={handleEmailRegistrationInputChange}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="reg-email">Email</Label>
                      <Input
                        id="reg-email"
                        name="email"
                        type="email"
                        value={emailRegistrationData.email}
                        onChange={handleEmailRegistrationInputChange}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="reg-password">Password</Label>
                      <Input
                        id="reg-password"
                        name="password"
                        type="password"
                        value={emailRegistrationData.password}
                        onChange={handleEmailRegistrationInputChange}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="reg-confirm-password">Confirm Password</Label>
                      <Input
                        id="reg-confirm-password"
                        name="confirmPassword"
                        type="password"
                        value={emailRegistrationData.confirmPassword}
                        onChange={handleEmailRegistrationInputChange}
                        required
                      />
                    </div>
                    <Button type="submit" className="w-full">Register with Email</Button>
                  </form>
                </TabsContent>
              </Tabs>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
      <ToastContainer position="bottom-right" />
    </main>
  )
}