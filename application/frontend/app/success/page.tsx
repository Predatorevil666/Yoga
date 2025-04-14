'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle, AlertCircle } from 'lucide-react'

interface BookingDetails {
  serviceName: string
  trainerName: string
  date: string
  time: number
}

export default function Success() {
  const router = useRouter()
  const [bookingDetails, setBookingDetails] = useState<BookingDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchBookingDetails = async () => {
      try {
        const response = await fetch('http://localhost:8002/api/booking-details', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('access_token')}`
          }
        })
        if (!response.ok) {
          throw new Error('Failed to fetch booking details')
        }
        const data = await response.json()
        setBookingDetails(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred while fetching booking details')
      } finally {
        setLoading(false)
      }
    }

    fetchBookingDetails()
  }, [])

  const handleReturnHome = () => {
    router.push('/')
  }

  if (loading) {
    return <div className="flex justify-center items-center min-h-screen">Загрузка...</div>
  }

  if (error) {
    return (
      <main className="container mx-auto p-8">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-center mb-4">
                <AlertCircle className="w-16 h-16 text-red-500" />
              </div>
              <CardTitle className="text-3xl font-bold text-center">Ошибка</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <p className="text-center text-muted-foreground">
                {error}
              </p>
              <div className="flex justify-center">
                <Button onClick={handleReturnHome}>
                  Вернуться на главную
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    )
  }

  if (!bookingDetails) {
    return (
      <main className="container mx-auto p-8">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-center mb-4">
                <AlertCircle className="w-16 h-16 text-yellow-500" />
              </div>
              <CardTitle className="text-3xl font-bold text-center">Нет данных о бронировании</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <p className="text-center text-muted-foreground">
                К сожалению, мы не смогли найти информацию о вашем бронировании.
              </p>
              <div className="flex justify-center">
                <Button onClick={handleReturnHome}>
                  Вернуться на главную
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    )
  }

  return (
    <main className="container mx-auto p-8">
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-center mb-4">
              <CheckCircle className="w-16 h-16 text-green-500" />
            </div>
            <CardTitle className="text-3xl font-bold text-center">Бронирование успешно!</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <p className="text-center text-muted-foreground">
              Ваша запись успешно подтверждена. Вот детали вашего бронирования:
            </p>
            <div className="space-y-2">
              <p><strong>Услуга:</strong> {bookingDetails.serviceName}</p>
              <p><strong>Тренер:</strong> {bookingDetails.trainerName}</p>
              <p><strong>Дата:</strong> {new Date(bookingDetails.date).toLocaleDateString('ru-RU')}</p>
              <p><strong>Время:</strong> {new Date(`1970-01-01T${bookingDetails.time}`).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}</p>
            </div>
            <p className="text-center text-sm text-muted-foreground">
              Если у вас возникнут какие-либо вопросы, пожалуйста, свяжитесь с нами.
            </p>
            <div className="flex justify-center">
              <Button onClick={handleReturnHome}>
                Вернуться на главную
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  )
}