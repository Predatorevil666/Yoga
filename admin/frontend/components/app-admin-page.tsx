'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Calendar } from "@/components/ui/calendar"

const BASE_URL = 'http://localhost:5001/api/admin';

interface TimeSlot {
  timeslot_id: number;
  trainer_name: string;
  service_name: string;
  group_name: string;
  date: string;
  time: string;
  status: boolean;
  available_spots: number;
}

interface Trainer {
  id: number;
  name: string;
}

interface Service {
  id: number;
  name: string;
}

interface GroupClass {
  id: number;
  name: string;
}

export default function Times() {
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([])
  const [trainers, setTrainers] = useState<Trainer[]>([])
  const [services, setServices] = useState<Service[]>([])
  const [groupClasses, setGroupClasses] = useState<GroupClass[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined)
  const [selectedTrainer, setSelectedTrainer] = useState<number | null>(null)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [editingTimeSlot, setEditingTimeSlot] = useState<TimeSlot | null>(null)

  useEffect(() => {
    fetchTrainers()
    fetchServices()
    fetchGroupClasses()
  }, [])

  useEffect(() => {
    if (selectedTrainer && selectedDate) {
      fetchTimeSlotsByTrainerAndDate(selectedTrainer, selectedDate)
    }
  }, [selectedTrainer, selectedDate])

  const fetchTrainers = async () => {
    try {
      const response = await fetch(`${BASE_URL}/trainers`)
      if (!response.ok) throw new Error('Failed to fetch trainers')
      const data = await response.json()
      setTrainers(data)
    } catch (err) {
      console.error('Error fetching trainers:', err)
      setError('Ошибка при загрузке тренеров')
    }
  }

  const fetchServices = async () => {
    try {
      const response = await fetch(`${BASE_URL}/services`)
      if (!response.ok) throw new Error('Failed to fetch services')
      const data = await response.json()
      setServices(data)
    } catch (err) {
      console.error('Error fetching services:', err)
      setError('Ошибка при загрузке услуг')
    }
  }

  const fetchGroupClasses = async () => {
    try {
      const response = await fetch(`${BASE_URL}/groups`)
      if (!response.ok) throw new Error('Failed to fetch group classes')
      const data = await response.json()
      setGroupClasses(data)
    } catch (err) {
      console.error('Error fetching group classes:', err)
      setError('Ошибка при загрузке групповых занятий')
    }
  }

  const fetchTimeSlotsByTrainerAndDate = async (trainerId: number, date: Date) => {
    setIsLoading(true)
    setError(null)
    try {
      const formattedDate = date.toISOString().split('T')[0]
      const response = await fetch(`${BASE_URL}/times?trainer_id=${trainerId}&date=${formattedDate}`)
      if (!response.ok) throw new Error('Failed to fetch time slots')
      const data = await response.json()
      console.log(data)
      setTimeSlots(data)
    } catch (err) {
      console.error('Error fetching time slots:', err)
      setError('Ошибка при загрузке временных слотов')
    } finally {
      setIsLoading(false)
    }
  }

  const addTimeSlot = async (timeSlot: Omit<TimeSlot, 'timeslot_id'>) => {
    try {
      const response = await fetch(`${BASE_URL}/times`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(timeSlot),
      })
      if (!response.ok) throw new Error('Failed to add time slot')
      if (selectedTrainer && selectedDate) {
        await fetchTimeSlotsByTrainerAndDate(selectedTrainer, selectedDate)
      }
      setIsAddDialogOpen(false)
      alert('Новый временной слот успешно добавлен')
    } catch (err) {
      alert('Ошибка при добавлении временного слота')
    }
  }

  const updateTimeSlot = async (timeSlot: TimeSlot) => {
    try {
      const response = await fetch(`${BASE_URL}/times/${timeSlot.timeslot_id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(timeSlot),
      })
      if (!response.ok) throw new Error('Failed to update time slot')
      if (selectedTrainer && selectedDate) {
        await fetchTimeSlotsByTrainerAndDate(selectedTrainer, selectedDate)
      }
      setEditingTimeSlot(null)
      alert('Временной слот успешно обновлен')
    } catch (err) {
      alert('Ошибка при обновлении временного слота')
    }
  }

  const deleteTimeSlot = async (id: number) => {
    try {
      const response = await fetch(`${BASE_URL}/times/${id}`, { method: 'DELETE' })
      if (!response.ok) throw new Error('Failed to delete time slot')
      if (selectedTrainer && selectedDate) {
        await fetchTimeSlotsByTrainerAndDate(selectedTrainer, selectedDate)
      }
      alert('Временной слот успешно удален')
    } catch (err) {
      alert('Ошибка при удалении временного слота')
    }
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Управление временными слотами</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Выберите дату</CardTitle>
          </CardHeader>
          <CardContent>
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              className="rounded-md border"
            />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Выберите тренера</CardTitle>
          </CardHeader>
          <CardContent>
            <Select onValueChange={(value) => setSelectedTrainer(Number(value))}>
              <SelectTrigger>
                <SelectValue placeholder="Выберите тренера" />
              </SelectTrigger>
              <SelectContent>
                {trainers.map((trainer) => (
                  <SelectItem key={trainer.id} value={trainer.id.toString()}>
                    {trainer.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Временные слоты</CardTitle>
          </CardHeader>
          <CardContent>
            {!selectedTrainer || !selectedDate ? (
              <p>Выберите тренера и дату для отображения временных слотов</p>
            ) : isLoading ? (
              <p>Загрузка временных слотов...</p>
            ) : error ? (
              <p className="text-red-500">{error}</p>
            ) : (
              <>
                <div className="flex justify-end mb-4">
                  <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                    <DialogTrigger asChild>
                      <Button>Добавить временной слот</Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Добавить новый временной слот</DialogTitle>
                      </DialogHeader>
                      <TimeSlotForm 
                        onSubmit={addTimeSlot}
                        trainers={trainers}
                        services={services}
                        groupClasses={groupClasses}
                        initialDate={selectedDate}
                        initialTrainerId={selectedTrainer}
                      />
                    </DialogContent>
                  </Dialog>
                </div>
                {timeSlots.length === 0 ? (
                  <p>Нет доступных временных слотов</p>
                ) : (
                  <ul className="space-y-2">
                    {timeSlots.map((timeSlot) => (
                      <TimeSlotCard
                        key={timeSlot.timeslot_id}
                        timeSlot={timeSlot}
                        onEdit={() => setEditingTimeSlot(timeSlot)}
                        onDelete={() => deleteTimeSlot(timeSlot.timeslot_id)}
                      />
                    ))}
                  </ul>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {editingTimeSlot && (
        <Dialog open={!!editingTimeSlot} onOpenChange={() => setEditingTimeSlot(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Редактировать временной слот</DialogTitle>
            </DialogHeader>
            <TimeSlotForm
              initialData={editingTimeSlot}
              onSubmit={(data) => updateTimeSlot({ ...data, timeslot_id: editingTimeSlot.timeslot_id })}
              trainers={trainers}
              services={services}
              groupClasses={groupClasses}
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}

interface TimeSlotFormProps {
  initialData?: TimeSlot
  onSubmit: (data: Omit<TimeSlot, 'timeslot_id'>) => void
  trainers: Trainer[]
  services: Service[]
  groupClasses: GroupClass[]
  initialDate?: Date
  initialTrainerId?: number | null
}

function TimeSlotForm({ initialData, onSubmit, trainers, services, groupClasses, initialDate, initialTrainerId }: TimeSlotFormProps) {
  const [formData, setFormData] = useState<Omit<TimeSlot, 'timeslot_id'>>({
    trainer_name: initialData?.trainer_name || '',
    service_name: initialData?.service_name || '',
    group_name: initialData?.group_name || '',
    date: initialData?.date || initialDate?.toISOString().split('T')[0] || '',
    time: initialData?.time || '',
    status: initialData?.status ?? true,
    available_spots: initialData?.available_spots || 0,
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="trainer_name">Тренер</Label>
        <Select
          value={formData.trainer_name}
          onValueChange={(value) => setFormData({ ...formData, trainer_name: value })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Выберите тренера" />
          </SelectTrigger>
          <SelectContent>
            {trainers.map((trainer) => (
              <SelectItem key={trainer.id} value={trainer.name}>{trainer.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label htmlFor="service_name">Услуга</Label>
        <Select
          value={formData.service_name}
          onValueChange={(value) => setFormData({ ...formData, service_name: value })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Выберите услугу" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">Нет услуги</SelectItem>
            {services.map((service) => (
              <SelectItem key={service.id} value={service.name}>{service.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label htmlFor="group_name">Групповое занятие</Label>
        <Select
          value={formData.group_name}
          onValueChange={(value) => setFormData({ ...formData, group_name: value })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Выберите групповое занятие" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">Нет группового занятия</SelectItem>
            {groupClasses.map((groupClass) => (
              <SelectItem key={groupClass.id} value={groupClass.name}>{groupClass.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label htmlFor="date">Дата</Label>
        <Input
          id="date"
          type="date"
          value={formData.date}
          onChange={(e) => setFormData({ ...formData, date: e.target.value })}
          required
        />
      </div>
      <div>
        <Label htmlFor="time">Время</Label>
        <Input
          id="time"
          type="time"
          value={formData.time}
          onChange={(e) => setFormData({ ...formData, time: e.target.value })}
          required
        />
      </div>
      <div className="flex items-center space-x-2">
        <Checkbox
          id="status"
          checked={formData.status}
          onCheckedChange={(checked) => setFormData({ ...formData, status: checked as boolean })}
        />
        <Label htmlFor="status">Доступно</Label>
      </div>
      <div>
        <Label htmlFor="available_spots">Доступные места</Label>
        <Input
          id="available_spots"
          type="number"
          value={formData.available_spots}
          onChange={(e) => setFormData({ ...formData, available_spots: parseInt(e.target.value) || 0 })}
          required
        />
      </div>
      <Button type="submit">Сохранить</Button>
    </form>
  )
}

interface TimeSlotCardProps {
  timeSlot: TimeSlot
  onEdit: () => void
  onDelete: () => void
}

function TimeSlotCard({ timeSlot, onEdit, onDelete }: TimeSlotCardProps) {
  return (
    <Card className="mb-4">
      <CardHeader>
        <CardTitle>{timeSlot.trainer_name}</CardTitle>
      </CardHeader>
      <CardContent>
        <p>Дата: {timeSlot.date}</p>
        <p>Время: {timeSlot.time}</p>
        <p>Услуга: {timeSlot.service_name}</p>
        <p>Групповое занятие: {timeSlot.group_name}</p>
        <p>Статус: {timeSlot.status ? 'Доступно' : 'Недоступно'}</p>
        <p>Доступные места: {timeSlot.available_spots}</p>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={onEdit}>Редактировать</Button>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive">Удалить</Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Вы уверены?</AlertDialogTitle>
              <AlertDialogDescription>
                Это действие нельзя отменить. Временной слот будет удален из системы.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Отмена</AlertDialogCancel>
              <AlertDialogAction onClick={onDelete}>Удалить</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardFooter>
    </Card>
  )
}