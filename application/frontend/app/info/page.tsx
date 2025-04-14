'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, MapPin, Phone, Clock } from 'lucide-react'

interface BranchInfo {
  name: string
  address: string
  phone: string
  workingHours: string
  description: string
  photos: string[]
}

export default function Info() {
  const [branchInfo, setBranchInfo] = useState<BranchInfo | null>(null)
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchBranchInfo()
  }, [])

  const fetchBranchInfo = async () => {
    try {
      setLoading(true)
      const response = await fetch('http://localhost:8002/api/branch-info')
      if (!response.ok) throw new Error('Failed to fetch branch info')
      const data = await response.json()
      if (Array.isArray(data) && data.length > 0) {
        setBranchInfo(data[0])  // Используем первый элемент массива
      } else {
        setBranchInfo(null)  // Если данных нет, устанавливаем null
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while fetching branch info')
    } finally {
      setLoading(false)
    }
  }

  const nextPhoto = () => {
    if (branchInfo?.photos?.length) {
      setCurrentPhotoIndex((prevIndex) => (prevIndex + 1) % branchInfo.photos.length);
    }
  }

  const prevPhoto = () => {
    if (branchInfo?.photos?.length) {
      setCurrentPhotoIndex((prevIndex) => (prevIndex - 1 + branchInfo.photos.length) % branchInfo.photos.length);
    }
  }

  const formatDescription = (description: string) => {
    return description.split('\n').map((line, index) => (
      <span key={index}>
        {line}
        <br />
      </span>
    ));
  };

  if (loading) {
    return <div className="flex justify-center items-center min-h-screen">Загрузка...</div>
  }

  if (error) {
    return <div className="flex justify-center items-center min-h-screen text-red-500">{error}</div>
  }

  if (!branchInfo) {
    return <div className="flex justify-center items-center min-h-screen">Информация о филиале не найдена</div>
  }

  return (
    <div className="container mx-auto p-4 md:p-8">
      <h1 className="text-3xl font-bold mb-8 text-center">{branchInfo.name}</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="order-2 md:order-1">
          <Card>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="flex items-start">
                  <MapPin className="h-5 w-5 mr-2 mt-1 flex-shrink-0" />
                  <p>{branchInfo.address}</p>
                </div>
                <div className="flex items-center">
                  <Phone className="h-5 w-5 mr-2 flex-shrink-0" />
                  <p>{branchInfo.phone}</p>
                </div>
                <div className="flex items-start">
                  <Clock className="h-5 w-5 mr-2 mt-1 flex-shrink-0" />
                  <p>{branchInfo.workingHours}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="mt-6">
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold mb-4">О филиале</h2>
              <p className="text-muted-foreground">{formatDescription(branchInfo.description)}</p>
            </CardContent>
          </Card>
        </div>

        <div className="order-1 md:order-2">
          <Card>
            <CardContent className="p-6">
              <div className="relative aspect-[3/2] mb-4">
                <img
                  src={branchInfo?.photos?.[currentPhotoIndex] || '/placeholder.svg'}
                  alt={`Branch photo ${currentPhotoIndex + 1}`}
                  className="object-cover w-full h-full rounded-md"
                />
                <Button
                  variant="secondary"
                  size="icon"
                  className="absolute top-1/2 left-2 transform -translate-y-1/2"
                  onClick={prevPhoto}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="secondary"
                  size="icon"
                  className="absolute top-1/2 right-2 transform -translate-y-1/2"
                  onClick={nextPhoto}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex justify-center">
                <p className="text-sm text-muted-foreground">
                  {currentPhotoIndex + 1} / {branchInfo.photos.length}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}