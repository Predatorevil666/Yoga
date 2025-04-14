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
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [editingTimeSlot, setEditingTimeSlot] = useState<TimeSlot | null>(null)
  const [selectedDate, setSelectedDate] = useState<Date>(new Date()) // Added state for selected date
  const [selectedTrainerId, setSelectedTrainerId] = useState<number | null>(null);

  useEffect(() => {
    fetchTimeSlots()
    fetchTrainers()
    fetchServices()
    fetchGroupClasses()
  }, [])

  const fetchTimeSlots = async () => {
    if (!selectedTrainerId || !selectedDate) {
      setTimeSlots([]);
      return;
    }
    try {
      const formattedDate = selectedDate.toISOString().split('T')[0];
      const response = await fetch(`${BASE_URL}/times?trainer_id=${selectedTrainerId}&date=${formattedDate}`);
      if (!response.ok) throw new Error('Failed to fetch time slots');
      const data = await response.json();
      console.log(data)
      setTimeSlots(data);
    } catch (err) {
      setError('Произошла ошибка при загрузке временных слотов');
    }
  };

  const fetchTrainers = async () => {
    try {
      const response = await fetch(`${BASE_URL}/trainers`)
      if (!response.ok) throw new Error('Failed to fetch trainers')
      const data = await response.json()
      setTrainers(data)
    } catch (err) {
      setError('Произошла ошибка при загрузке тренеров')
    }
  }

  const fetchServices = async () => {
    try {
      const response = await fetch(`${BASE_URL}/services`)
      if (!response.ok) throw new Error('Failed to fetch services')
      const data = await response.json()
      setServices(data)
    } catch (err) {
      setError('Произошла ошибка при загрузке услуг')
    }
  }

  const fetchGroupClasses = async () => {
    try {
      const response = await fetch(`${BASE_URL}/groups`)
      if (!response.ok) throw new Error('Failed to fetch group classes')
      const data = await response.json()
      setGroupClasses(data)
    } catch (err) {
      setError('Произошла ошибка при загрузке групповых занятий')
    } finally {
      setIsLoading(false)
    }
  }

  const addTimeSlot = async (timeSlot: Omit<TimeSlot, 'timeslot_id'>) => {
    try {
      console.log('Отправляемый объект:', timeSlot);
      const response = await fetch(`${BASE_URL}/time/add`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(timeSlot),
      })
      if (!response.ok) {
        const errorData = await response.json();
        console.error('Ошибка от сервера:', errorData);
        throw new Error(errorData.detail || 'Failed to add time slot');
      }  
      await fetchTimeSlots()
      setIsAddDialogOpen(false)
      alert('Новый временной слот успешно добавлен')
    } catch (err) {
      alert('Ошибка при добавлении временного слота')
    }
  }

  const updateTimeSlot = async (timeSlot: TimeSlot) => {
    try {
      console.log('Updating time slot with data:', timeSlot);
      const response = await fetch(`${BASE_URL}/time/edit/${timeSlot.timeslot_id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(timeSlot),
      })
      if (!response.ok) throw new Error('Failed to update time slot')
      await fetchTimeSlots()
      setEditingTimeSlot(null)
      alert('Временной слот успешно обновлен')
    } catch (err) {
      alert('Ошибка при обновлении временного слота')
    }
  }

  const deleteTimeSlot = async (id: number) => {
    try {
      const response = await fetch(`${BASE_URL}/time/delete/${id}`, { method: 'DELETE' })
      if (!response.ok) throw new Error('Failed to delete time slot')
      await fetchTimeSlots()
      alert('Временной слот успешно удален')
    } catch (err) {
      alert('Ошибка при удалении временного слота')
    }
  }

  useEffect(() => {
    fetchTimeSlots();
  }, [selectedTrainerId, selectedDate]);

  if (isLoading) return <div>Загрузка...</div>
  if (error) return <div>{error}</div>

  return (
    <div className="container mx-auto p-4">
      <div className="mb-4">
        <Label htmlFor="trainer">Выберите тренера</Label>
        <Select onValueChange={(value) => setSelectedTrainerId(Number(value))}>
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
      </div>
      <div className="mb-4">
        <Label htmlFor="date">Выберите дату</Label>
        <Input
          id="date"
          type="date"
          value={selectedDate.toISOString().split('T')[0]}
          onChange={(e) => setSelectedDate(new Date(e.target.value))}
        />
      </div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Управление временными слотами</h1>
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
            />
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {timeSlots.map((timeSlot) => (
          <TimeSlotCard
            key={timeSlot.timeslot_id}
            timeSlot={timeSlot}
            onEdit={() => setEditingTimeSlot(timeSlot)}
            onDelete={() => deleteTimeSlot(timeSlot.timeslot_id)}
          />
        ))}
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
}

function TimeSlotForm({ initialData, onSubmit, trainers, services, groupClasses }: TimeSlotFormProps) {
  const [formData, setFormData] = useState<Omit<TimeSlot, 'timeslot_id'>>({
    trainer_name: initialData?.trainer_name || '',
    service_name: initialData?.service_name || '',
    group_name: initialData?.group_name || '',
    date: initialData?.date || '',
    time: initialData?.time || '',
    status: initialData?.status ?? true,
    available_spots: initialData?.available_spots || 0,
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
  }

  const handleServiceChange = (value: string) => {
    setFormData({
      ...formData,
      service_name: value === 'none' ? '' : value,
      group_name: '', // Clear group when service is selected
    });
  };

  const handleGroupChange = (value: string) => {
    setFormData({
      ...formData,
      group_name: value === 'none' ? '' : value,
      service_name: '', // Clear service when group is selected
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="trainer">Тренер</Label>
        <Select
          value={formData.trainer_name}
          onValueChange={(value) => {
            setFormData({
              ...formData,
              trainer_name: value,
              service_name: '', // Clear service and group when trainer changes
              group_name: '',
            });
          }}
        >
          <SelectTrigger>
            <SelectValue placeholder="Выберите тренера" />
          </SelectTrigger>
          <SelectContent>
            {trainers.map((trainer) => (
              <SelectItem key={trainer.id} value={trainer.name}>
                {trainer.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="service">Услуга</Label>
        <Select
          value={formData.service_name === '' ? 'none' : formData.service_name}
          onValueChange={handleServiceChange}
        >
          <SelectTrigger>
            <SelectValue placeholder="Выберите услугу" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">Нет услуги</SelectItem>
            {services.map((service) => (
              <SelectItem key={service.id} value={service.name}>
                {service.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="group">Групповое занятие</Label>
        <Select
          value={formData.group_name === '' ? 'none' : formData.group_name}
          onValueChange={handleGroupChange}
        >
          <SelectTrigger>
            <SelectValue placeholder="Выберите групповое занятие" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">Нет группового занятия</SelectItem>
            {groupClasses.map((groupClass) => (
              <SelectItem key={groupClass.id} value={groupClass.name}>
                {groupClass.name}
              </SelectItem>
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
          onChange={(e) => setFormData({ ...formData, available_spots: parseInt(e.target.value) })}
          required
        />
      </div>

      <Button type="submit">Сохранить</Button>
    </form>
  );
}

interface TimeSlotCardProps {
  timeSlot: TimeSlot
  onEdit: () => void
  onDelete: () => void
}

function TimeSlotCard({ timeSlot, onEdit, onDelete }: TimeSlotCardProps) {
  const isGroupClass = timeSlot.group_name !== "none";
  console.log(timeSlot.group_name)

  return (
    <Card className="mb-4">
      <CardHeader>
        <CardTitle className="font-bold">{isGroupClass? timeSlot.group_name : timeSlot.service_name}</CardTitle>
      </CardHeader>
      <CardContent>
        <p>Время: {timeSlot.time}</p>
        {isGroupClass && (
          <>
            <p>Доступные места: {timeSlot.available_spots}</p>
          </>
        )
        }
        <p>Статус: {timeSlot.status ? 'Доступно' : 'Недоступно'}</p>
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