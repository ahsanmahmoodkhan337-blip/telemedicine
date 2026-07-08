import { useParams } from 'react-router-dom'
import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { LoadingSkeleton, EmptyState } from '@/components/ui/loading-states'
import { Apple, Sparkles, AlertTriangle, Plus, Save, ChevronRight, Utensils } from 'lucide-react'
import { toast } from 'sonner'

interface Meal {
  day: string
  breakfast: string
  lunch: string
  dinner: string
  snack: string
}

interface MacroTargets {
  calories: number
  protein: number
  carbs: number
  fat: number
}

const weekDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

const initialMeals: Meal[] = weekDays.map(day => ({
  day,
  breakfast: day === 'Monday' ? 'Oatmeal with berries' : day === 'Wednesday' ? 'Egg white omelette' : day === 'Friday' ? 'Smoothie bowl' : '',
  lunch: day === 'Monday' ? 'Grilled chicken salad' : day === 'Wednesday' ? 'Quinoa bowl' : day === 'Friday' ? 'Fish with vegetables' : '',
  dinner: day === 'Monday' ? 'Steamed fish with broccoli' : day === 'Wednesday' ? 'Lentil soup' : day === 'Friday' ? 'Chicken stir-fry' : '',
  snack: day === 'Monday' ? 'Greek yogurt' : day === 'Wednesday' ? 'Almonds' : day === 'Friday' ? 'Fruit salad' : '',
}))

const allergens = ['Gluten', 'Dairy', 'Eggs', 'Peanuts', 'Tree Nuts', 'Soy', 'Shellfish', 'Wheat']

export default function NutritionistPatients() {
  const { id } = useParams()
  const [calories, setCalories] = useState('2000')
  const [protein, setProtein] = useState('50')
  const [carbs, setCarbs] = useState('250')
  const [fat, setFat] = useState('65')
  const [meals, setMeals] = useState<Meal[]>(initialMeals)
  const [restrictions, setRestrictions] = useState<string[]>([])
  const [generating, setGenerating] = useState(false)
  const [saving, setSaving] = useState(false)
  const [loading] = useState(false)

  const toggleRestriction = (allergen: string) => {
    setRestrictions(prev =>
      prev.includes(allergen) ? prev.filter(a => a !== allergen) : [...prev, allergen]
    )
  }

  const handleGenerateAI = () => {
    setGenerating(true)
    setTimeout(() => {
      const newMeals: Meal[] = weekDays.map((day, i) => ({
        day,
        breakfast: ['Oatmeal with banana & chia seeds', 'Scrambled eggs with spinach', 'Smoothie with protein powder', 'Whole grain toast with avocado', 'Greek yogurt parfait', 'Buckwheat pancakes', 'Mushroom & cheese omelette'][i],
        lunch: ['Grilled chicken with quinoa', 'Salmon with sweet potato', 'Lentil & vegetable stew', 'Turkey wrap with salad', 'Tuna salad with crackers', 'Chickpea curry with rice', 'Beef stir-fry with noodles'][i],
        dinner: ['Baked fish with asparagus', 'Chicken tikka with salad', 'Vegetable stir-fry with tofu', 'Lean beef with roasted veg', 'Pasta with turkey meatballs', 'Grilled shrimp with vegetables', 'Lamb chops with mint sauce'][i],
        snack: ['Apple with peanut butter', 'Mixed nuts', 'Protein bar', 'Celery with hummus', 'Cottage cheese with berries', 'Dark chocolate & almonds', 'Rice cakes with avocado'][i],
      }))
      setMeals(newMeals)
      setGenerating(false)
      toast.success('AI-generated meal plan created')
    }, 1500)
  }

  const handleSave = () => {
    setSaving(true)
    setTimeout(() => {
      setSaving(false)
      toast.success('Nutrition plan saved')
    }, 600)
  }

  if (loading) return <LoadingSkeleton title="Nutritionist Dashboard" />

  const totalCalories = parseInt(calories) || 0
  const totalProtein = parseInt(protein) || 0
  const totalCarbs = parseInt(carbs) || 0
  const totalFat = parseInt(fat) || 0

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Nutrition Plan</h1>
          <p className="text-gray-500 mt-1">Patient #{id} — Sana Tariq, 28 yrs</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handleGenerateAI} disabled={generating}>
            <Sparkles className="h-4 w-4 mr-1" />
            {generating ? 'Generating...' : 'Generate AI Menu'}
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            <Save className="h-4 w-4 mr-1" />
            {saving ? 'Saving...' : 'Save Plan'}
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Macro Targets */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Daily Macro Targets</CardTitle>
            <CardDescription>Adjust targets based on patient needs</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Daily Calories (kcal)</Label>
              <Input type="number" value={calories} onChange={(e) => setCalories(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Protein (g)</Label>
              <Input type="number" value={protein} onChange={(e) => setProtein(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Carbohydrates (g)</Label>
              <Input type="number" value={carbs} onChange={(e) => setCarbs(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Fat (g)</Label>
              <Input type="number" value={fat} onChange={(e) => setFat(e.target.value)} />
            </div>
            <div className="rounded-lg bg-gray-50 dark:bg-slate-800 p-3">
              <p className="text-sm font-medium">Distribution</p>
              <div className="mt-2 space-y-1 text-xs text-gray-500">
                <div className="flex justify-between">
                  <span>Protein:</span>
                  <span className="font-medium">{Math.round((totalProtein * 4 / totalCalories) * 100)}%</span>
                </div>
                <div className="flex justify-between">
                  <span>Carbs:</span>
                  <span className="font-medium">{Math.round((totalCarbs * 4 / totalCalories) * 100)}%</span>
                </div>
                <div className="flex justify-between">
                  <span>Fat:</span>
                  <span className="font-medium">{Math.round((totalFat * 9 / totalCalories) * 100)}%</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Allergen Restrictions */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Allergen Restrictions</CardTitle>
            <CardDescription>Toggle allergens to filter from meals</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {allergens.map((allergen) => (
                <button
                  key={allergen}
                  onClick={() => toggleRestriction(allergen)}
                  className={`inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-medium border transition-colors ${
                    restrictions.includes(allergen)
                      ? 'bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800 text-red-700 dark:text-red-400'
                      : 'bg-gray-50 dark:bg-slate-800 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-gray-300'
                  }`}
                >
                  {restrictions.includes(allergen) && <AlertTriangle className="h-3 w-3" />}
                  {allergen}
                </button>
              ))}
            </div>
            {restrictions.length > 0 && (
              <div className="mt-4 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 p-3">
                <p className="text-xs text-amber-700 dark:text-amber-400">
                  Meals will exclude: {restrictions.join(', ')}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Patient Info */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Patient Info</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10">
                <AvatarFallback className="bg-accent text-white">ST</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium">Sana Tariq</p>
                <p className="text-sm text-gray-500">28 yrs · Female</p>
              </div>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-gray-500">Height:</span><span>165 cm</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Weight:</span><span>68 kg</span></div>
              <div className="flex justify-between"><span className="text-gray-500">BMI:</span><span>25.0</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Goal:</span><span>Weight management</span></div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Weekly Meal Planner */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Weekly Meal Plan</CardTitle>
          <CardDescription>Plan meals for the upcoming week</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-24">Day</TableHead>
                  <TableHead>Breakfast</TableHead>
                  <TableHead>Lunch</TableHead>
                  <TableHead>Dinner</TableHead>
                  <TableHead>Snack</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {meals.map((meal) => (
                  <TableRow key={meal.day}>
                    <TableCell className="font-medium">{meal.day.slice(0, 3)}</TableCell>
                    <TableCell>
                      <Input
                        value={meal.breakfast}
                        onChange={(e) => setMeals(prev =>
                          prev.map(m => m.day === meal.day ? { ...m, breakfast: e.target.value } : m)
                        )}
                        className="h-8 text-sm"
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        value={meal.lunch}
                        onChange={(e) => setMeals(prev =>
                          prev.map(m => m.day === meal.day ? { ...m, lunch: e.target.value } : m)
                        )}
                        className="h-8 text-sm"
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        value={meal.dinner}
                        onChange={(e) => setMeals(prev =>
                          prev.map(m => m.day === meal.day ? { ...m, dinner: e.target.value } : m)
                        )}
                        className="h-8 text-sm"
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        value={meal.snack}
                        onChange={(e) => setMeals(prev =>
                          prev.map(m => m.day === meal.day ? { ...m, snack: e.target.value } : m)
                        )}
                        className="h-8 text-sm"
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}