'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Clock, ChevronRight, User2, ArrowLeft, ChevronDown, ChevronUp } from 'lucide-react'

interface Service {
  id: number
  name: string
  duration: number | null
  description: string | null
  price: number | null
  photo: string | null
  type: string
}

interface Trainer {
  id: number
  name: string
  specialization: string
  photo: string | null
}

interface TimeSlot {
  id: number
  trainer_id: number
  service_id: number
  date: string
  times: string
  available: boolean
  created_at: string
}

type BookingStep = 'category' | 'service' | 'trainer' | 'datetime' | 'confirmation'

export default function IndividualBookingPage() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState<BookingStep>('category')
  const [selectedCategory, setSelectedCategory] = useState<string>('')
  const [selectedService, setSelectedService] = useState<Service | null>(null)
  const [selectedTrainer, setSelectedTrainer] = useState<Trainer | null>(null)
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined)
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<TimeSlot | null>(null)

  const [services, setServices] = useState<Service[]>([])
  const [trainers, setTrainers] = useState<Trainer[]>([])
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [expandedDescriptions, setExpandedDescriptions] = useState<{ [key: number]: boolean }>({})

  useEffect(() => {
    fetchServices()
  }, [])

  useEffect(() => {
    if (selectedTrainer && selectedService) {
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      setSelectedDate(today)
      fetchTimeSlots(selectedTrainer.id, today.toLocaleString().split(',')[0].split('.').reverse().join('-'), selectedService.id)
    }
  }, [selectedTrainer, selectedService])

  const formatDescription = (description: string) => {
    return description.split('\n').map((line, index) => (
      <span key={index}>
        {line}
        <br />
      </span>
    ))
  }

  const fetchServices = async () => {
    try {
      setLoading(true)
      const response = await fetch('http://localhost:8002/api/services?')
      if (!response.ok) throw new Error('Failed to fetch services')
      const data = await response.json()
      setServices(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch services')
    } finally {
      setLoading(false)
    }
  }

  const fetchTrainers = async (serviceId: number) => {
    try {
      setLoading(true)
      const response = await fetch(`http://localhost:8002/api/trainers?serviceId=${serviceId}`)
      if (!response.ok) throw new Error('Failed to fetch trainers')
      const data = await response.json()
      setTrainers(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch trainers')
    } finally {
      setLoading(false)
    }
  }

  const fetchTimeSlots = async (trainerId: number, dates: string, serviceID: number) => {
    try {
      setLoading(true)
      const response = await fetch(`http://localhost:8002/api/timeslots?trainerId=${trainerId}&date=${dates}&service_id=${serviceID}`)
      if (!response.ok) throw new Error('Failed to fetch time slots')
      const data = await response.json()
      setTimeSlots(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch time slots')
    } finally {
      setLoading(false)
    }
  }

  const handleCategorySelect = (category: string) => {
    setSelectedCategory(category)
    setCurrentStep('service')
  }

  const handleServiceSelect = (service: Service) => {
    setSelectedService(service)
    fetchTrainers(service.id)
    setCurrentStep('trainer')
  }

  const handleTrainerSelect = (trainer: Trainer) => {
    setSelectedTrainer(trainer)
    setCurrentStep('datetime')
  }

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      console.log(date)
      // Устанавливаем время в полночь для корректного сравнения дат
      const selectedDateMidnight = new Date(date)
      selectedDateMidnight.setHours(0, 0, 0, 0)
      setSelectedDate(selectedDateMidnight)

      if (selectedTrainer && selectedService) {
        // Используем ту же дату для API запроса
        const dateString = selectedDateMidnight.toLocaleString().split(',')[0].split('.').reverse().join('-')
        fetchTimeSlots(selectedTrainer.id, dateString, selectedService.id)
      }
    }
  }

  const handleTimeSlotSelect = (timeSlot: TimeSlot) => {
    setSelectedTimeSlot(timeSlot)
    setCurrentStep('confirmation')
  }

  const handleConfirmBooking = async () => {
    try {
      setLoading(true)
      const response = await fetch('http://localhost:8002/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        },
        body: JSON.stringify({
          serviceId: selectedService?.id,
          trainerId: selectedTrainer?.id,
          date: selectedDate?.toLocaleString().split(',')[0].split('.').reverse().join('-'),
          timeSlotId: selectedTimeSlot?.id,
        }),
      })
      if (!response.ok) throw new Error('Booking failed')
      router.push('/success')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while confirming the booking')
    } finally {
      setLoading(false)
    }
  }

  const toggleDescription = (serviceId: number) => {
    setExpandedDescriptions(prev => ({
      ...prev,
      [serviceId]: !prev[serviceId]
    }))
  }

  const renderCategorySelection = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {['training', 'massage'].map(category => (
        <Card 
          key={category}
          className="cursor-pointer hover:shadow-lg transition-shadow"
          onClick={() => handleCategorySelect(category)}
        >
          <CardContent className="flex items-center justify-between p-6">
            <div className="flex items-center gap-4">
              {category === 'training' ? <User2 className="h-8 w-8" /> : <Clock className="h-8 w-8" />}
              <div>
                <CardTitle>{category === 'training' ? 'Тренировки' : 'Массаж'}</CardTitle>
                <CardDescription>
                  {category === 'training' ? 'Персональные тренировочные сессии' : 'Терапевтические сеансы массажа'}
                </CardDescription>
              </div>
            </div>
            <ChevronRight className="h-5 w-5" />
          </CardContent>
        </Card>
      ))}
    </div>
  )

  const renderServiceSelection = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {services
        .filter(service => service.type === selectedCategory)
        .map((service) => (
          <Card 
            key={service.id}
            className="overflow-hidden hover:shadow-lg transition-shadow"
          >
            {service.photo && (
              <div className="aspect-[4/3] relative overflow-hidden">
                <img
                  src={service.photo}
                  alt={service.name}
                  className="object-cover w-full h-full"
                />
              </div>
            )}
            <CardContent className="p-6">
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                {service.duration && (
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 mr-1" />
                    {service.duration} мин.
                  </div>
                )}
                {service.price && (
                  <>
                    <span className="mx-2">•</span>
                    <div>{service.price} ₽</div>
                  </>
                )}
              </div>
              <h3 className="text-xl font-semibold mb-2">{service.name}</h3>
              {service.description && (
                <div>
                  <p className={`text-sm text-muted-foreground ${expandedDescriptions[service.id] ? '' : 'line-clamp-2'}`}>
                    {formatDescription(service.description)}
                  </p>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="mt-2"
                    onClick={(e) => {
                      e.stopPropagation()
                      toggleDescription(service.id)
                    }}
                  >
                    {expandedDescriptions[service.id] ? (
                      <>
                        <ChevronUp className="h-4 w-4 mr-2" />
                        Свернуть
                      </>
                    ) : (
                      <>
                        <ChevronDown className="h-4 w-4 mr-2" />
                        Подробнее
                      </>
                    )}
                  </Button>
                </div>
              )}
              <Button 
                className="w-full mt-4"
                onClick={() => handleServiceSelect(service)}
              >
                Выбрать
              </Button>
            </CardContent>
          </Card>
        ))}
    </div>
  )

  const renderTrainerSelection = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {trainers.map(trainer => (
        <Card 
          key={trainer.id}
          className="overflow-hidden cursor-pointer hover:shadow-lg transition-shadow"
          onClick={() => handleTrainerSelect(trainer)}
        >
          {trainer.photo && (
            <div className="aspect-[4/3] relative overflow-hidden">
              <img
                src={trainer.photo}
                alt={trainer.name}
                className="object-cover w-full h-full"
              />
            </div>
          )}
          <CardContent className="p-6">
            <h3 className="text-xl font-semibold mb-2">{trainer.name}</h3>
            <p className="text-sm text-muted-foreground">{trainer.specialization}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  )

  const renderDateTimeSelection = () => {
    const now = new Date()
    now.setSeconds(0, 0)

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Выберите дату</CardTitle>
          </CardHeader>
          <CardContent>
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={handleDateSelect}
              disabled={(date) => {
                const today = new Date()
                today.setHours(0, 0, 0, 0)
                return date < today
              }}
              className="rounded-md border"
            />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Выберите время</CardTitle>
          </CardHeader>
          <CardContent>
            {timeSlots.length > 0 ? (
              <div className="grid grid-cols-2 gap-2">
                {timeSlots
                  .filter((slot) => {
                    const isToday = selectedDate?.toDateString() === new Date().toDateString()
                    if (!isToday) return true

                    const [hours, minutes] = slot.times.split(':')
                    const slotTime = new Date()
                    slotTime.setHours(parseInt(hours), parseInt(minutes), 0, 0)
                    
                    return slotTime > now
                  })
                  .map((slot) => {
                    const [hours, minutes] = slot.times.split(':')
                    const timeString = new Date()
                    timeString.setHours(parseInt(hours), parseInt(minutes))
                    const formattedTime = timeString.toLocaleTimeString('ru-RU', {
                      hour: '2-digit',
                      minute: '2-digit'
                    })

                    return (
                      <Button
                        key={slot.id}
                        variant={slot.available ? 'outline' : 'ghost'}
                        disabled={!slot.available}
                        onClick={() => handleTimeSlotSelect(slot)}
                        className={selectedTimeSlot?.id === slot.id ? 'border-primary' : ''}
                      >
                        <Clock className="mr-2 h-4 w-4" />
                        {formattedTime}
                      </Button>
                    )
                  })}
              </div>
            ) : (
              <p className="text-center text-muted-foreground">
                {selectedDate ? 'Нет доступного времени на выбранную дату' : 'Пожалуйста, выберите дату'}
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    )
  }

  const renderConfirmation = () => (
    <Card>
      <CardHeader>
        <CardTitle>Подтверждение бронирования</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <p className="font-medium">Услуга:</p>
          <p className="text-muted-foreground">{selectedService?.name}</p>
        </div>
        <div className="space-y-2">
          <p className="font-medium">Тренер:</p>
          <p className="text-muted-foreground">{selectedTrainer?.name}</p>
        </div>
        <div className="space-y-2">
          <p className="font-medium">Дата и время:</p>
          <p className="text-muted-foreground">
            {selectedDate?.toLocaleDateString()} в {new Date(`1970-01-01T${selectedTimeSlot?.times}`).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}
          </p>
        </div>
        {error && <p className="text-red-500">{error}</p>}
        <Button 
          className="w-full"
          onClick={handleConfirmBooking}
          disabled={loading}
        >
          {loading ? 'Подтверждение...' : 'Подтвердить бронирование'}
        </Button>
      </CardContent>
    </Card>
  )

  const handleBack = () => {
    if (currentStep === 'service') setCurrentStep('category')
    else if (currentStep === 'trainer') setCurrentStep('service')
    else if (currentStep === 'datetime') setCurrentStep('trainer')
    else if (currentStep === 'confirmation') setCurrentStep('datetime')
  }

  if (loading) {
    return <div className="flex justify-center items-center min-h-screen">Загрузка...</div>
  }

  if (error) {
    return <div className="flex justify-center items-center min-h-screen text-red-500">{error}</div>
  }

  return (
    <main className="container mx-auto p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8 flex items-center">
          {currentStep !== 'category' && (
            <Button
              variant="ghost"
              onClick={handleBack}
              className="mr-4"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Назад
            </Button>
          )}
          <h1 className="text-3xl font-bold">Забронировать индивидуальную услугу</h1>
        </div>
        <div className="mb-4">
          <p className="text-muted-foreground">
            {currentStep === 'category' && "Выберите категорию услуги"}
            {currentStep === 'service' && "Выберите конкретную услугу"}
            {currentStep === 'trainer' && "Выберите тренера"}
            {currentStep === 'datetime' && "Выберите дату и время"}
            {currentStep === 'confirmation' && "Подтвердите ваше бронирование"}
          </p>
        </div>

        {currentStep === 'category' && renderCategorySelection()}
        {currentStep === 'service' && renderServiceSelection()}
        {currentStep === 'trainer' && renderTrainerSelection()}
        {currentStep === 'datetime' && renderDateTimeSelection()}
        {currentStep === 'confirmation' && renderConfirmation()}
      </div>
    </main>
  )
}