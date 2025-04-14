'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { format, parse, isBefore, startOfDay, endOfDay } from 'date-fns'
import { ru } from 'date-fns/locale'
import { ChevronLeft, ChevronRight, Clock, User } from 'lucide-react'

interface GroupClass {
  id: number
  name: string
  duration: number
  description: string
  price: number
}

interface Trainer {
  id: number
  name: string
  description: string | null
  photo: string | null
}

interface TimeSlot {
  id: number
  trainer_id: number
  date: string
  times: string
  available: boolean
  available_spots: number
  created_at: string
}

interface ClassData {
  GroupClass: GroupClass
  Trainer: Trainer
  TimeSlot: TimeSlot
}

interface BookingFormData {
  name: string
  phone: string
  email: string
}

export default function Group() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [classes, setClasses] = useState<ClassData[]>([])
  const [selectedClass, setSelectedClass] = useState<ClassData | null>(null)
  const [showDetails, setShowDetails] = useState(false)
  const [showBookingForm, setShowBookingForm] = useState(false)
  const [showConfirmation, setShowConfirmation] = useState(false)
  const [formData, setFormData] = useState<BookingFormData>({
    name: '',
    phone: '',
    email: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const currentDate = startOfDay(new Date())

  useEffect(() => {
    fetchClasses(selectedDate)
  }, [selectedDate])

  const formattedTime = (time: string) => {
    const parsedTime = parse(time, 'HH:mm:ss', new Date())
    return format(parsedTime, 'HH:mm')
  }

  const fetchClasses = async (date: Date) => {
    try {
      setLoading(true)
      const formattedDate = format(date, 'yyyy-MM-dd')
      const response = await fetch(`http://localhost:8002/api/group-classes?date=${formattedDate}`)
      if (!response.ok) throw new Error('Failed to fetch classes')
      const data: ClassData[] = await response.json()
      setClasses(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch classes')
    } finally {
      setLoading(false)
    }
  }

  const handleClassClick = (classData: ClassData) => {
    setSelectedClass(classData)
    setShowDetails(true)
  }

  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      setLoading(true)
      const payload = {
        classId: selectedClass?.GroupClass.id,
        timeSlotId: selectedClass?.TimeSlot.id,
        date: selectedClass?.TimeSlot.date,
        time: selectedClass?.TimeSlot.times,
        ...formData
      }
      console.log('Booking payload:', payload)
      const response = await fetch('http://localhost:8002/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          classId: selectedClass?.GroupClass.id,
          timeSlotId: selectedClass?.TimeSlot.id,
          date: selectedClass?.TimeSlot.date,
          time: selectedClass?.TimeSlot.times,
          ...formData
        }),
      })
      if (!response.ok) throw new Error('Booking failed')
      setShowBookingForm(false)
      setShowConfirmation(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while confirming the booking')
    } finally {
      setLoading(false)
    }
  }

  const renderCalendarHeader = () => (
    <div className="flex items-center justify-between p-4 border-b">
      <Button
        variant="ghost"
        onClick={() => {
          const prevMonth = new Date(selectedDate)
          prevMonth.setMonth(prevMonth.getMonth() - 1)
          setSelectedDate(prevMonth)
        }}
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>
      <h2 className="text-lg font-semibold">
        {format(selectedDate, 'LLLL yyyy', { locale: ru })}
      </h2>
      <Button
        variant="ghost"
        onClick={() => {
          const nextMonth = new Date(selectedDate)
          nextMonth.setMonth(nextMonth.getMonth() + 1)
          setSelectedDate(nextMonth)
        }}
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  )

  const isClassAvailable = (classData: ClassData) => {
    const now = new Date()
    const classDate = parse(classData.TimeSlot.date, 'yyyy-MM-dd', new Date())
    const classTime = parse(classData.TimeSlot.times, 'HH:mm:ss', classDate)
    
    if (isBefore(classDate, startOfDay(now))) {
      return false
    }
    
    if (isBefore(classTime, now)) {
      return false
    }
    
    return true
  }

  const renderClassCard = (classData: ClassData) => {
    const { GroupClass: groupClass, Trainer: trainer, TimeSlot: timeSlot } = classData
    const isAvailable = isClassAvailable(classData)

    return (
      <Card 
        key={`${groupClass.id}-${timeSlot.id}`}
        className={`cursor-pointer transition-colors ${isAvailable ? 'hover:bg-accent' : 'opacity-50'}`}
        onClick={() => isAvailable && handleClassClick(classData)}
      >
        <CardContent className="p-4">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                <Clock className="h-4 w-4" />
                {formattedTime(timeSlot.times)} • {groupClass.duration} мин
              </div>
              <h3 className="font-semibold mb-1">{groupClass.name}</h3>
              <div className="flex items-center gap-2">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={trainer.photo || ''} alt={trainer.name} />
                  <AvatarFallback><User className="h-4 w-4" /></AvatarFallback>
                </Avatar>
                <div className="text-sm">
                  <div>{trainer.name}</div>
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm font-medium">{groupClass.price} ₽</div>
              <div className="text-sm text-muted-foreground mt-1">
                Осталось {timeSlot.available_spots} мест
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  const renderClassDetails = () => {
    if (!selectedClass) return null
    const { GroupClass: groupClass, Trainer: trainer, TimeSlot: timeSlot } = selectedClass
    return (
      <Dialog open={showDetails} onOpenChange={setShowDetails}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{groupClass.name}</DialogTitle>
            <DialogDescription>
              <div className="grid gap-4 py-4">
                <div className="flex items-center gap-4">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={trainer.photo || ''} alt={trainer.name} />
                    <AvatarFallback><User className="h-6 w-6" /></AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-medium">{trainer.name}</div>
                    <div className="text-sm text-muted-foreground">{trainer.description}</div>
                  </div>
                </div>
                <div className="grid gap-2">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    <span>{formattedTime(timeSlot.times)} • {groupClass.duration} мин</span>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Осталось {timeSlot.available_spots} мест
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">{groupClass.description}</p>
                <div className="flex justify-between items-center">
                  <div className="text-lg font-semibold">{groupClass.price} ₽</div>
                  <Button onClick={() => {
                    setShowDetails(false)
                    setShowBookingForm(true)
                  }}>
                    Продолжить
                  </Button>
                </div>
              </div>
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    )
  }

  const renderBookingForm = () => (
    <Dialog open={showBookingForm} onOpenChange={setShowBookingForm}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Заполните данные для записи</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleBookingSubmit} className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="name">Имя</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              required
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="phone">Телефон</Label>
            <Input
              id="phone"
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
              required
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              required
            />
          </div>
          <Button type="submit" disabled={loading}>
            {loading ? 'Отправка...' : 'Записаться'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )

  const renderConfirmation = () => (
    <Dialog open={showConfirmation} onOpenChange={setShowConfirmation}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Запись подтверждена</DialogTitle>
          <DialogDescription>
            <div className="grid gap-4 py-4">
              <p>Вы успешно записаны на {selectedClass?.GroupClass.name}</p>
              <p>Дата: {selectedClass?.TimeSlot.date}</p>
              <p>Время: {selectedClass?.TimeSlot.times}</p>
              <p>Длительность: {selectedClass?.GroupClass.duration} мин</p>
              <Button onClick={() => setShowConfirmation(false)}>
                Закрыть
              </Button>
            </div>
          </DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  )

  if (loading && classes.length === 0) {
    return <div className="flex justify-center items-center min-h-screen">Загрузка...</div>
  }

  if (error) {
    return <div className="flex justify-center items-center min-h-screen text-red-500">{error}</div>
  }

  return (
    <main className="container mx-auto p-4 max-w-3xl">
      {renderCalendarHeader()}
      <Calendar
        mode="single"
        selected={selectedDate}
        onSelect={(date) => {
          if (date) {
            setSelectedDate(date)
            fetchClasses(date)
          }
        }}
        disabled={(date) => {
          const currentDate = new Date()
          currentDate.setHours(0, 0, 0, 0)
          return date < currentDate
        }}
        className="rounded-md border"
        locale={ru}
      />
      <div className="space-y-4 mt-6">
        {classes.map(renderClassCard)}
      </div>
      {selectedClass && renderClassDetails()}
      {renderBookingForm()}
      {renderConfirmation()}
    </main>
  )
}