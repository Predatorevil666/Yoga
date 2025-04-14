'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { toast, ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

export function BlockPage() {
  const router = useRouter()
  const [credentials, setCredentials] = useState({ 
    username: '', 
    telegramId: '' 
  })
  const [otpCode, setOtpCode] = useState('')
  const [isOtpSent, setIsOtpSent] = useState(false)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setCredentials(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const response = await fetch('http://localhost:8001/api/auth/admin/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: credentials.username,
          telegram_id: parseInt(credentials.telegramId)
        }),
      })
      
      if (!response.ok) {
        throw new Error('Ошибка входа')
      }
      
      const data = await response.json()
      setCredentials(prev => ({ ...prev, telegram_id: data.telegram_id }))
      setIsOtpSent(true)
      toast.info('Пожалуйста, проверьте код подтверждения в Telegram')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Ошибка входа')
    }
  }

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const response = await fetch('http://localhost:8001/api/auth/admin/verify-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          telegram_id: credentials.telegramId, 
          otp: otpCode 
        }),
      })
      
      if (!response.ok) {
        throw new Error('Ошибка проверки кода')
      }
      
      const data = await response.json()
      if (data.access_token) {
        localStorage.setItem('access_token', data.access_token)
        toast.success('Вход выполнен успешно')
        router.push('http://localhost/admin')
      } else {
        throw new Error('Токен не получен')
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Ошибка проверки кода')
    }
  }

  const handleClientLogin = () => {
    router.push('/auth/client')
  }

  return (
    <div className="container flex items-center justify-center min-h-screen py-12">
      <Card className="w-full max-w-md shadow-none border-none">
        <CardContent className="pt-6">
          <CardTitle className="text-2xl font-bold mb-8 text-center">
            Вход для администратора
          </CardTitle>
          
          {!isOtpSent ? (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <div className="text-lg font-medium">Имя пользователя</div>
                <Input
                  name="username"
                  placeholder="Заполните это поле"
                  value={credentials.username}
                  onChange={handleInputChange}
                  className="h-12 rounded-2xl"
                  required
                />
              </div>
              <div className="space-y-2">
                <div className="text-lg font-medium">Telegram ID</div>
                <Input
                  name="telegramId"
                  placeholder="Заполните это поле"
                  value={credentials.telegramId}
                  onChange={handleInputChange}
                  className="h-12 rounded-2xl"
                  required
                />
              </div>
              <Button 
                type="submit" 
                className="w-full h-12 rounded-2xl bg-[#15191C] hover:bg-[#2C3238]"
              >
                Продолжить
              </Button>
              <Button
                type="button"
                variant="link"
                className="w-full"
                onClick={handleClientLogin}
              >
                Войти как клиент
              </Button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp} className="space-y-6">
              <div className="space-y-2">
                <div className="text-lg font-medium">Код подтверждения</div>
                <Input
                  placeholder="Введите код из Telegram"
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value)}
                  className="h-12 rounded-2xl"
                  required
                />
              </div>
              <Button 
                type="submit" 
                className="w-full h-12 rounded-2xl bg-[#15191C] hover:bg-[#2C3238]"
              >
                Подтвердить
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
      <ToastContainer position="bottom-right" />
    </div>
  )
}