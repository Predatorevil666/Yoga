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

const BASE_URL = 'http://localhost:5001/api/admin';

interface Trainer {
  id: number;
  name: string;
  description: string | null;
  specialization: string;
  photo: string | null;
}

export default function Trainers() {
  const [trainers, setTrainers] = useState<Trainer[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [editingTrainer, setEditingTrainer] = useState<Trainer | null>(null)

  useEffect(() => {
    fetchTrainers()
  }, [])

  const fetchTrainers = async () => {
    try {
      setIsLoading(true)
      const response = await fetch(`${BASE_URL}/trainers`)
      if (!response.ok) {
        throw new Error('Failed to fetch trainers')
      }
      const data = await response.json()
      setTrainers(data)
    } catch (err) {
      setError('Произошла ошибка при загрузке данных')
      console.log(err)
    } finally {
      setIsLoading(false)
    }
  }

  const addTrainer = async (trainer: Omit<Trainer, 'id'>) => {
    try {
      const response = await fetch(`${BASE_URL}/trainer/add`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(trainer),
      })
      if (!response.ok) {
        throw new Error('Failed to add trainer')
      }
      await fetchTrainers()
      setIsAddDialogOpen(false)
      alert('Новый тренер успешно добавлен')
    } catch (err) {
      alert('Ошибка при добавлении тренера')
    }
  }

  const updateTrainer = async (trainer: Trainer) => {
    try {
      const response = await fetch(`${BASE_URL}/trainer/edit/${trainer.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(trainer),
      })
      if (!response.ok) {
        throw new Error('Failed to update trainer')
      }
      await fetchTrainers()
      setEditingTrainer(null)
      alert('Данные тренера успешно обновлены')
    } catch (err) {
      alert('Ошибка при обновлении данных тренера')
    }
  }

  const deleteTrainer = async (id: number) => {
    try {
      const response = await fetch(`${BASE_URL}/trainer/delete/${id}`, {
        method: 'DELETE',
      })
      if (!response.ok) {
        throw new Error('Failed to delete trainer')
      }
      await fetchTrainers()
      alert('Тренер успешно удален из системы')
    } catch (err) {
      alert('Ошибка при удалении тренера')
    }
  }

  if (isLoading) return <div>Загрузка...</div>
  if (error) return <div>{error}</div>

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Управление тренерами</h1>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>Добавить тренера</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Добавить нового тренера</DialogTitle>
            </DialogHeader>
            <TrainerForm onSubmit={addTrainer} />
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {trainers.map((trainer) => (
          <TrainerCard
            key={trainer.id}
            trainer={trainer}
            onEdit={() => setEditingTrainer(trainer)}
            onDelete={() => deleteTrainer(trainer.id)}
          />
        ))}
      </div>

      {editingTrainer && (
        <Dialog open={!!editingTrainer} onOpenChange={() => setEditingTrainer(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Редактировать тренера</DialogTitle>
            </DialogHeader>
            <TrainerForm
              initialData={editingTrainer}
              onSubmit={(data) => updateTrainer({ ...data, id: editingTrainer.id })}
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}

interface TrainerFormProps {
  initialData?: Trainer
  onSubmit: (data: Omit<Trainer, 'id'>) => void
}

function TrainerForm({ initialData, onSubmit }: TrainerFormProps) {
  const [formData, setFormData] = useState<Omit<Trainer, 'id'>>({
    name: initialData?.name || '',
    description: initialData?.description || '',
    specialization: initialData?.specialization || '',
    photo: initialData?.photo || '',
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="name">Имя</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          required
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
        <Label htmlFor="specialization">Специализация</Label>
        <Input
          id="specialization"
          value={formData.specialization}
          onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
          required
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
      <Button type="submit">Сохранить</Button>
    </form>
  )
}

interface TrainerCardProps {
  trainer: Trainer
  onEdit: () => void
  onDelete: () => void
}

function TrainerCard({ trainer, onEdit, onDelete }: TrainerCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{trainer.name}</CardTitle>
      </CardHeader>
      <CardContent>
        {trainer.photo && (
          <Image 
            src={trainer.photo} 
            alt={trainer.name} 
            width={300} 
            height={200} 
            className="w-full h-48 object-cover mb-4 rounded-md" 
          />
        )}
        <p className="text-sm text-muted-foreground mb-2">{trainer.specialization}</p>
        <p className="text-sm">{trainer.description}</p>
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
                Это действие нельзя отменить. Тренер будет удален из системы.
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