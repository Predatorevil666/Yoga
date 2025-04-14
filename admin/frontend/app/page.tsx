'use client'

import Link from 'next/link'
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday } from 'date-fns'
import { ru } from 'date-fns/locale'
import { Users, Clock, Settings2, GraduationCap, ChevronLeft, ChevronRight } from 'lucide-react'
import { useState } from 'react'

const CustomCalendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date())
  const firstDayOfMonth = startOfMonth(currentDate)
  const lastDayOfMonth = endOfMonth(currentDate)
  const daysInMonth = eachDayOfInterval({ start: firstDayOfMonth, end: lastDayOfMonth })
  
  // Get start of week for the first day of month
  const startDate = new Date(firstDayOfMonth)
  startDate.setDate(firstDayOfMonth.getDate() - firstDayOfMonth.getDay() + 1)
  
  // Get end of week for the last day of month
  const endDate = new Date(lastDayOfMonth)
  endDate.setDate(lastDayOfMonth.getDate() + (7 - lastDayOfMonth.getDay()))
  
  const allDays = eachDayOfInterval({ start: startDate, end: endDate })
  
  const weekDays = ['пн', 'вт', 'ср', 'чт', 'пт', 'сб', 'вс']

  return (
    <div className="w-full p-4">
      <div className="flex items-center justify-between mb-4">
        <Button
          variant="ghost"
          className="p-0 hover:bg-transparent"
          onClick={() => setCurrentDate(subMonths(currentDate, 1))}
        >
          <ChevronLeft className="h-4 w-4 text-muted-foreground" />
        </Button>
        <div className="text-base font-medium">
          {format(currentDate, 'LLLL yyyy', { locale: ru })}
        </div>
        <Button
          variant="ghost"
          className="p-0 hover:bg-transparent"
          onClick={() => setCurrentDate(addMonths(currentDate, 1))}
        >
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
        </Button>
      </div>
      
      <div className="grid grid-cols-7 gap-0 text-center mb-2">
        {weekDays.map((day) => (
          <div key={day} className="text-sm text-muted-foreground py-2">
            {day}
          </div>
        ))}
      </div>
      
      <div className="grid grid-cols-7 gap-0 text-center">
        {allDays.map((day, index) => (
          <div
            key={day.toISOString()}
            className={cn(
              "py-2 text-sm relative",
              !isSameMonth(day, currentDate) && "text-muted-foreground/40",
              isToday(day) && "bg-accent rounded-md",
              "hover:bg-accent/50 cursor-pointer rounded-md"
            )}
          >
            {format(day, 'd')}
          </div>
        ))}
      </div>
    </div>
  )
}

export default function Home() {
  return (
    <div className="flex min-h-screen bg-gray-100 dark:bg-gray-900">
      {/* Sidebar */}
      <aside className="w-64 border-r bg-background">
        <div className="flex flex-col h-full">
          <div className="p-4 border-b">
            <h2 className="text-lg font-semibold">Админ панель</h2>
          </div>
          <CustomCalendar />
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 p-8">
        <div className="max-w-5xl mx-auto">
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="text-2xl flex items-center gap-2">
                <Settings2 className="h-6 w-6" />
                Настройки записи
              </CardTitle>
              <CardDescription>
                Управление тренерами, услугами и расписанием
              </CardDescription>
            </CardHeader>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Trainers */}
            <Link href="/trainers">
              <Card className="hover:bg-accent transition-colors cursor-pointer">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Тренеры
                  </CardTitle>
                  <CardDescription>
                    Управление тренерами и их специализациями
                  </CardDescription>
                </CardHeader>
              </Card>
            </Link>

            {/* Services */}
            <Link href="/services">
              <Card className="hover:bg-accent transition-colors cursor-pointer">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <GraduationCap className="h-5 w-5" />
                    Услуги
                  </CardTitle>
                  <CardDescription>
                    Индивидуальные услуги и их настройки
                  </CardDescription>
                </CardHeader>
              </Card>
            </Link>

            {/* Group Classes */}
            <Link href="/groups">
              <Card className="hover:bg-accent transition-colors cursor-pointer">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Групповые занятия
                  </CardTitle>
                  <CardDescription>
                    Управление групповыми классами
                  </CardDescription>
                </CardHeader>
              </Card>
            </Link>

            {/* Time Slots */}
            <Link href="/times">
              <Card className="hover:bg-accent transition-colors cursor-pointer">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    Расписание
                  </CardTitle>
                  <CardDescription>
                    Управление временными слотами
                  </CardDescription>
                </CardHeader>
              </Card>
            </Link>
          </div>
        </div>
      </main>
    </div>
  )
}