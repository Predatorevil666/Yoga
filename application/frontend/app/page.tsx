'use client'

import WebApp from '@twa-dev/sdk'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { User2, Users, Info, ChevronRight } from 'lucide-react'
import { useEffect } from 'react'

declare global {
  interface Window {
    Telegram?: {
      WebApp: {
        ready: () => void
        expand: () => void
        close: () => void
      }
    }
  }
}

export default function BlockPage() {
  useEffect(() => {
    if (window.Telegram) {
        // Initialize the Web App
        window.Telegram.WebApp.ready()
        
        // Expand the Web App to take up the full screen
        window.Telegram.WebApp.expand()
      }
         }, [])
  const router = useRouter()

  return (
    <main className="container mx-auto p-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Забронировать услугу</h1>
        <div className="space-y-6">
          <Button
            variant="outline"
            className="w-full flex justify-between items-center p-4"
            onClick={() => router.push('/info')}
          >
            <div className="flex items-center">
              <Info className="h-5 w-5 mr-2" />
              <span>Информация о филиале</span>
            </div>
            <ChevronRight className="h-5 w-5" />
          </Button>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card 
              className="cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => router.push('/individual')}
            >
              <CardContent className="flex items-center justify-between p-6">
                <div className="flex items-center gap-4">
                  <User2 className="h-8 w-8" />
                  <div>
                    <CardTitle>Индивидуальные услуги</CardTitle>
                    <CardDescription>Персональные тренировки и массаж</CardDescription>
                  </div>
                </div>
                <ChevronRight className="h-5 w-5" />
              </CardContent>
            </Card>
            <Card 
              className="cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => router.push('/group')}
            >
              <CardContent className="flex items-center justify-between p-6">
                <div className="flex items-center gap-4">
                  <Users className="h-8 w-8" />
                  <div>
                    <CardTitle>Групповые занятия</CardTitle>
                    <CardDescription>Присоединяйтесь к групповым фитнес-сессиям</CardDescription>
                  </div>
                </div>
                <ChevronRight className="h-5 w-5" />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </main>
  )
}