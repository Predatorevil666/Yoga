'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"

const BASE_URL = 'http://localhost:5001/api/admin';

interface GroupClass {
  id: number;
  name: string;
  duration: number | null;
  description: string | null;
  price: number | null;
}

export default function Groups() {
  const [groupClasses, setGroupClasses] = useState<GroupClass[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [editingGroupClass, setEditingGroupClass] = useState<GroupClass | null>(null)

  useEffect(() => {
    fetchGroupClasses()
  }, [])

  const fetchGroupClasses = async () => {
    try {
      setIsLoading(true)
      const response = await fetch(`${BASE_URL}/groups`)
      if (!response.ok) {
        throw new Error('Failed to fetch group classes')
      }
      const data = await response.json()
      setGroupClasses(data)
    } catch (err) {
      setError('Произошла ошибка при загрузке данных')
    } finally {
      setIsLoading(false)
    }
  }

  const addGroupClass = async (groupClass: Omit<GroupClass, 'id'>) => {
    try {
      const response = await fetch(`${BASE_URL}/group/add`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(groupClass),
      })
      if (!response.ok) {
        throw new Error('Failed to add group class')
      }
      await fetchGroupClasses()
      setIsAddDialogOpen(false)
      alert('Новое групповое занятие успешно добавлено')
    } catch (err) {
      alert('Ошибка при добавлении группового занятия')
    }
  }

  const updateGroupClass = async (groupClass: GroupClass) => {
    try {
      const response = await fetch(`${BASE_URL}/group/edit/${groupClass.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(groupClass),
      })
      if (!response.ok) {
        throw new Error('Failed to update group class')
      }
      await fetchGroupClasses()
      setEditingGroupClass(null)
      alert('Данные группового занятия успешно обновлены')
    } catch (err) {
      alert('Ошибка при обновлении данных группового занятия')
    }
  }

  const deleteGroupClass = async (id: number) => {
    try {
      const response = await fetch(`${BASE_URL}/group/delete/${id}`, {
        method: 'DELETE',
      })
      if (!response.ok) {
        throw new Error('Failed to delete group class')
      }
      await fetchGroupClasses()
      alert('Групповое занятие успешно удалено из системы')
    } catch (err) {
      alert('Ошибка при удалении группового занятия')
    }
  }

  if (isLoading) return <div>Загрузка...</div>
  if (error) return <div>{error}</div>

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Управление групповыми занятиями</h1>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>Добавить групповое занятие</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Добавить новое групповое занятие</DialogTitle>
            </DialogHeader>
            <GroupClassForm onSubmit={addGroupClass} />
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {groupClasses.map((groupClass) => (
          <GroupClassCard
            key={groupClass.id}
            groupClass={groupClass}
            onEdit={() => setEditingGroupClass(groupClass)}
            onDelete={() => deleteGroupClass(groupClass.id)}
          />
        ))}
      </div>

      {editingGroupClass && (
        <Dialog open={!!editingGroupClass} onOpenChange={() => setEditingGroupClass(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Редактировать групповое занятие</DialogTitle>
            </DialogHeader>
            <GroupClassForm
              initialData={editingGroupClass}
              onSubmit={(data) => updateGroupClass({ ...data, id: editingGroupClass.id })}
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}

interface GroupClassFormProps {
  initialData?: GroupClass
  onSubmit: (data: Omit<GroupClass, 'id'>) => void
}

function GroupClassForm({ initialData, onSubmit }: GroupClassFormProps) {
  const [formData, setFormData] = useState<Omit<GroupClass, 'id'>>({
    name: initialData?.name || '',
    duration: initialData?.duration || null,
    description: initialData?.description || '',
    price: initialData?.price || null,
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
      <Button type="submit">Сохранить</Button>
    </form>
  )
}

interface GroupClassCardProps {
  groupClass: GroupClass
  onEdit: () => void
  onDelete: () => void
}

function GroupClassCard({ groupClass, onEdit, onDelete }: GroupClassCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{groupClass.name}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm mb-2">
          {groupClass.duration ? `Продолжительность: ${groupClass.duration} мин.` : 'Продолжительность не указана'}
        </p>
        <p className="text-sm mb-2">
          {groupClass.price ? `Цена: ${groupClass.price} руб.` : 'Цена не указана'}
        </p>
        <p className="text-sm">{groupClass.description}</p>
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
                Это действие нельзя отменить. Групповое занятие будет удалено из системы.
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