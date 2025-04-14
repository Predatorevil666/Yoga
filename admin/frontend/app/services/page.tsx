'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

const BASE_URL = 'http://localhost:5001/api/admin';

interface Service {
  id: number;
  name: string;
  duration: number | null;
  description: string | null;
  price: number | null;
  photo: string | null;
  type: string;
}

export default function Services() {
  const [services, setServices] = useState<Service[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [editingService, setEditingService] = useState<Service | null>(null)

  useEffect(() => {
    fetchServices()
  }, [])

  const fetchServices = async () => {
    try {
      setIsLoading(true)
      const response = await fetch(`${BASE_URL}/services`)
      if (!response.ok) {
        throw new Error('Failed to fetch services')
      }
      const data = await response.json()
      setServices(data)
    } catch (err) {
      setError('Произошла ошибка при загрузке данных')
    } finally {
      setIsLoading(false)
    }
  }

  const addService = async (service: Omit<Service, 'id'>) => {
    try {
      const response = await fetch(`${BASE_URL}/service/add`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(service),
      })
      if (!response.ok) {
        throw new Error('Failed to add service')
      }
      await fetchServices()
      setIsAddDialogOpen(false)
      alert('Новый сервис успешно добавлен')
    } catch (err) {
      alert('Ошибка при добавлении сервиса')
    }
  }

  const updateService = async (service: Service) => {
    try {
      const response = await fetch(`${BASE_URL}/service/edit/${service.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(service),
      })
      if (!response.ok) {
        throw new Error('Failed to update service')
      }
      await fetchServices()
      setEditingService(null)
      alert('Данные сервиса успешно обновлены')
    } catch (err) {
      alert('Ошибка при обновлении данных сервиса')
    }
  }

  const deleteService = async (id: number) => {
    try {
      const response = await fetch(`${BASE_URL}/service/delete/${id}`, {
        method: 'DELETE',
      })
      if (!response.ok) {
        throw new Error('Failed to delete service')
      }
      await fetchServices()
      alert('Сервис успешно удален из системы')
    } catch (err) {
      alert('Ошибка при удалении сервиса')
    }
  }

  if (isLoading) return <div>Загрузка...</div>
  if (error) return <div>{error}</div>

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Управление сервисами</h1>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>Добавить сервис</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Добавить новый сервис</DialogTitle>
            </DialogHeader>
            <ServiceForm onSubmit={addService} />
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {services.map((service) => (
          <ServiceCard
            key={service.id}
            service={service}
            onEdit={() => setEditingService(service)}
            onDelete={() => deleteService(service.id)}
          />
        ))}
      </div>

      {editingService && (
        <Dialog open={!!editingService} onOpenChange={() => setEditingService(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Редактировать сервис</DialogTitle>
            </DialogHeader>
            <ServiceForm
              initialData={editingService}
              onSubmit={(data) => updateService({ ...data, id: editingService.id })}
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}

interface ServiceFormProps {
  initialData?: Service
  onSubmit: (data: Omit<Service, 'id'>) => void
}

function ServiceForm({ initialData, onSubmit }: ServiceFormProps) {
  const [formData, setFormData] = useState<Omit<Service, 'id'>>({
    name: initialData?.name || '',
    duration: initialData?.duration || null,
    description: initialData?.description || '',
    price: initialData?.price || null,
    photo: initialData?.photo || '',
    type: initialData?.type || '',
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="name">Название</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          required
        />
      </div>
      <div>
        <Label htmlFor="duration">Продолжительность (в минутах)</Label>
        <Input
          id="duration"
          type="number"
          value={formData.duration || ''}
          onChange={(e) => setFormData({ ...formData, duration: parseFloat(e.target.value) || null })}
        />
      </div>
      <div>
        <Label htmlFor="description">Описание</Label>
        <Textarea
          id="description"
          value={formData.description || ''}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
        />
      </div>
      <div>
        <Label htmlFor="price">Цена</Label>
        <Input
          id="price"
          type="number"
          value={formData.price || ''}
          onChange={(e) => setFormData({ ...formData, price: parseInt(e.target.value) || null })}
        />
      </div>
      <div>
        <Label htmlFor="photo">Фото (URL)</Label>
        <Input
          id="photo"
          value={formData.photo || ''}
          onChange={(e) => setFormData({ ...formData, photo: e.target.value })}
        />
      </div>
      <div>
        <Label htmlFor="type">Тип</Label>
        <Select
          value={formData.type}
          onValueChange={(value) => setFormData({ ...formData, type: value })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Выберите тип" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="training">Тренировка</SelectItem>
            <SelectItem value="massage">Массаж</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <Button type="submit">Сохранить</Button>
    </form>
  )
}

interface ServiceCardProps {
  service: Service
  onEdit: () => void
  onDelete: () => void
}

function ServiceCard({ service, onEdit, onDelete }: ServiceCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{service.name}</CardTitle>
      </CardHeader>
      <CardContent>
        {service.photo && (
          <Image 
            src={service.photo} 
            alt={service.name} 
            width={300} 
            height={200} 
            className="w-full h-48 object-cover mb-4 rounded-md" 
          />
        )}
        <p className="text-sm text-muted-foreground mb-2">
          Тип: {service.type}
        </p>
        <p className="text-sm mb-2">
          {service.duration ? `Продолжительность: ${service.duration} мин.` : 'Продолжительность не указана'}
        </p>
        <p className="text-sm mb-2">
          {service.price ? `Цена: ${service.price} руб.` : 'Цена не указана'}
        </p>
        <p className="text-sm">{service.description}</p>
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
                Это действие нельзя отменить. Сервис будет удален из системы.
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