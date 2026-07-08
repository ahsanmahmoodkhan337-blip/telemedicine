import { useParams } from 'react-router-dom'
import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { LoadingSkeleton, EmptyState } from '@/components/ui/loading-states'
import {
  Apple, Sparkles, AlertTriangle, Save, Utensils, Clock, Flame,
  Drumstick, Wheat, Droplets, CheckCircle2, Plus, ChevronRight,
  ChefHat, ListChecks, ArrowLeft
} from 'lucide-react'
import { toast } from 'sonner'

// ─── Types ──────────────────────────────────────────────────────────────────
interface Meal {
  day: string
  breakfast: string
  lunch: string
  dinner: string
  snack: string
}

interface GeneratedRecipe {
  id: string
  name: string
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack'
  ingredients: string[]
  prepTime: string
  calories: number
  protein: number
  carbs: number
  fat: number
  tags: string[]
}

const weekDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

const initialMeals: Meal[] = weekDays.map(day => ({
  day,
  breakfast: day === 'Monday' ? 'Oatmeal with berries' : day === 'Wednesday' ? 'Egg white omelette' : day === 'Friday' ? 'Smoothie bowl' : '',
  lunch: day === 'Monday' ? 'Grilled chicken salad' : day === 'Wednesday' ? 'Quinoa bowl' : day === 'Friday' ? 'Fish with vegetables' : '',
  dinner: day === 'Monday' ? 'Steamed fish with broccoli' : day === 'Wednesday' ? 'Lentil soup' : day === 'Friday' ? 'Chicken stir-fry' : '',
  snack: day === 'Monday' ? 'Greek yogurt' : day === 'Wednesday' ? 'Almonds' : day === 'Friday' ? 'Fruit salad' : '',
}))

const allergens = ['Gluten', 'Dairy', 'Eggs', 'Peanuts', 'Tree Nuts', 'Soy', 'Shellfish', 'Wheat', 'Sesame', 'Mustard']

// ─── AI Recipe Database ─────────────────────────────────────────────────────
const recipeDatabase: GeneratedRecipe[] = [
  { id: 'r1', name: 'Grilled Chicken Quinoa Bowl', mealType: 'lunch', ingredients: ['Chicken breast', 'Quinoa', 'Avocado', 'Cherry tomatoes', 'Lemon juice', 'Olive oil'], prepTime: '25 min', calories: 480, protein: 42, carbs: 38, fat: 16, tags: ['High-Protein', 'Gluten-Free'] },
  { id: 'r2', name: 'Overnight Oats with Berries', mealType: 'breakfast', ingredients: ['Rolled oats', 'Mixed berries', 'Almond milk', 'Chia seeds', 'Honey', 'Greek yogurt'], prepTime: '10 min + overnight', calories: 340, protein: 14, carbs: 52, fat: 9, tags: ['High-Fiber', 'Vegetarian'] },
  { id: 'r3', name: 'Baked Salmon with Asparagus', mealType: 'dinner', ingredients: ['Salmon fillet', 'Asparagus', 'Lemon', 'Garlic', 'Dill', 'Olive oil'], prepTime: '30 min', calories: 420, protein: 38, carbs: 8, fat: 26, tags: ['Omega-3 Rich', 'Gluten-Free', 'Low-Carb'] },
  { id: 'r4', name: 'Greek Yogurt Protein Bowl', mealType: 'snack', ingredients: ['Greek yogurt', 'Mixed nuts', 'Honey', 'Banana', 'Cinnamon'], prepTime: '5 min', calories: 280, protein: 20, carbs: 32, fat: 10, tags: ['High-Protein', 'Quick'] },
  { id: 'r5', name: 'Lentil & Vegetable Soup', mealType: 'lunch', ingredients: ['Red lentils', 'Carrots', 'Celery', 'Onion', 'Garlic', 'Vegetable broth', 'Turmeric'], prepTime: '35 min', calories: 320, protein: 18, carbs: 48, fat: 4, tags: ['Vegan', 'High-Fiber', 'Low-Fat'] },
  { id: 'r6', name: 'Egg White & Spinach Omelette', mealType: 'breakfast', ingredients: ['Egg whites', 'Spinach', 'Mushrooms', 'Onion', 'Olive oil', 'Black pepper'], prepTime: '12 min', calories: 220, protein: 26, carbs: 6, fat: 10, tags: ['Low-Calorie', 'Keto-Friendly'] },
  { id: 'r7', name: 'Beef Stir-Fry with Vegetables', mealType: 'dinner', ingredients: ['Lean beef strips', 'Broccoli', 'Bell peppers', 'Soy sauce', 'Ginger', 'Garlic', 'Sesame oil'], prepTime: '20 min', calories: 450, protein: 35, carbs: 18, fat: 26, tags: ['High-Protein', 'Quick'] },
  { id: 'r8', name: 'Hummus & Veggie Wrap', mealType: 'lunch', ingredients: ['Whole wheat wrap', 'Hummus', 'Cucumber', 'Roasted red peppers', 'Arugula', 'Feta cheese'], prepTime: '10 min', calories: 380, protein: 16, carbs: 42, fat: 16, tags: ['Vegetarian', 'Quick', 'High-Fiber'] },
  { id: 'r9', name: 'Almond Butter Energy Balls', mealType: 'snack', ingredients: ['Almond butter', 'Dates', 'Oats', 'Coconut flakes', 'Dark chocolate chips'], prepTime: '15 min', calories: 180, protein: 7, carbs: 22, fat: 10, tags: ['No-Bake', 'Vegan'] },
  { id: 'r10', name: 'Turmeric Chicken & Rice', mealType: 'dinner', ingredients: ['Chicken thighs', 'Basmati rice', 'Turmeric', 'Cumin', 'Yogurt', 'Mint', 'Onion'], prepTime: '40 min', calories: 520, protein: 36, carbs: 52, fat: 14, tags: ['High-Protein', 'Anti-Inflammatory'] },
  { id: 'r11', name: 'Smoothie Power Bowl', mealType: 'breakfast', ingredients: ['Banana', 'Mixed berries', 'Spinach', 'Protein powder', 'Almond milk', 'Granola'], prepTime: '8 min', calories: 360, protein: 28, carbs: 44, fat: 8, tags: ['High-Protein', 'Quick'] },
  { id: 'r12', name: 'Chickpea & Spinach Curry', mealType: 'dinner', ingredients: ['Chickpeas', 'Spinach', 'Coconut milk', 'Curry powder', 'Onion', 'Garlic', 'Rice'], prepTime: '30 min', calories: 410, protein: 16, carbs: 48, fat: 18, tags: ['Vegan', 'High-Fiber'] },
  { id: 'r13', name: 'Tuna Salad with Crackers', mealType: 'lunch', ingredients: ['Canned tuna', 'Whole wheat crackers', 'Celery', 'Red onion', 'Lemon juice', 'Olive oil'], prepTime: '8 min', calories: 350, protein: 32, carbs: 28, fat: 12, tags: ['High-Protein', 'Quick', 'No-Cook'] },
  { id: 'r14', name: 'Cottage Cheese & Fruit Bowl', mealType: 'snack', ingredients: ['Cottage cheese', 'Pineapple', 'Strawberries', 'Mint leaves', 'Walnuts'], prepTime: '5 min', calories: 220, protein: 24, carbs: 18, fat: 8, tags: ['High-Protein', 'Quick', 'Low-Calorie'] },
  { id: 'r15', name: 'Sweet Potato & Black Bean Bowl', mealType: 'lunch', ingredients: ['Sweet potato', 'Black beans', 'Corn', 'Avocado', 'Lime', 'Cilantro', 'Cumin'], prepTime: '30 min', calories: 440, protein: 14, carbs: 58, fat: 16, tags: ['Vegan', 'High-Fiber', 'Gluten-Free'] },
  { id: 'r16', name: 'Mushroom & Cheese Frittata', mealType: 'breakfast', ingredients: ['Eggs', 'Mushrooms', 'Cheddar cheese', 'Bell peppers', 'Onion', 'Thyme'], prepTime: '20 min', calories: 310, protein: 22, carbs: 8, fat: 22, tags: ['Keto-Friendly', 'Low-Carb'] },
  { id: 'r17', name: 'Shrimp & Vegetable Stir-Fry', mealType: 'dinner', ingredients: ['Shrimp', 'Snow peas', 'Carrots', 'Soy sauce', 'Ginger', 'Garlic', 'Sesame oil'], prepTime: '15 min', calories: 380, protein: 34, carbs: 14, fat: 20, tags: ['High-Protein', 'Quick', 'Low-Calorie'] },
  { id: 'r18', name: 'Apple Slices with Peanut Butter', mealType: 'snack', ingredients: ['Apple', 'Natural peanut butter', 'Cinnamon'], prepTime: '3 min', calories: 200, protein: 7, carbs: 24, fat: 10, tags: ['Quick', 'Vegetarian', 'No-Cook'] },
]

// ─── Allergen-to-ingredient mapping ─────────────────────────────────────────
const allergenKeywords: Record<string, string[]> = {
  'Gluten': ['wheat', 'bread', 'pasta', 'flour', 'crackers', 'wrap', 'tortilla', 'oats', 'soy sauce', 'granola'],
  'Dairy': ['milk', 'cheese', 'yogurt', 'cream', 'butter', 'feta', 'cheddar', 'cottage cheese', 'greek yogurt'],
  'Eggs': ['eggs', 'egg whites', 'omelette', 'frittata', 'mayonnaise'],
  'Peanuts': ['peanut butter', 'peanuts', 'peanut'],
  'Tree Nuts': ['almond', 'walnuts', 'cashew', 'pecan', 'almond butter', 'mixed nuts', 'coconut', 'pecans'],
  'Soy': ['soy sauce', 'tofu', 'edamame', 'tempeh'],
  'Shellfish': ['shrimp', 'prawn', 'crab', 'lobster', 'mussel'],
  'Wheat': ['wheat', 'bread', 'pasta', 'flour', 'crackers', 'wrap', 'tortilla', 'couscous'],
  'Sesame': ['sesame oil', 'tahini', 'sesame seeds', 'hummus'],
  'Mustard': ['mustard', 'mustard seeds'],
}

// ─── Filter recipes by restrictions ─────────────────────────────────────────
function filterRecipesByRestrictions(recipes: GeneratedRecipe[], restrictions: string[]): GeneratedRecipe[] {
  if (restrictions.length === 0) return recipes
  return recipes.filter(recipe => {
    const allIngredients = recipe.ingredients.map(i => i.toLowerCase())
    const allTags = recipe.tags.map(t => t.toLowerCase())
    return !restrictions.some(allergen => {
      const keywords = allergenKeywords[allergen] || []
      return keywords.some(keyword =>
        allIngredients.some(ing => ing.includes(keyword)) ||
        allTags.some(tag => tag.includes(keyword))
      )
    })
  })
}

// ─── Score recipes by macro alignment ───────────────────────────────────────
function scoreRecipe(recipe: GeneratedRecipe, targetCal: number, targetProtein: number, targetCarbs: number, targetFat: number): number {
  let score = 0
  // Calorie proximity (max 40 pts)
  score += Math.max(0, 40 - Math.abs(recipe.calories - targetCal) * 0.15)
  // Protein proximity (max 20 pts)
  score += Math.max(0, 20 - Math.abs(recipe.protein - targetProtein) * 0.8)
  // Carb proximity (max 20 pts)
  score += Math.max(0, 20 - Math.abs(recipe.carbs - targetCarbs) * 0.15)
  // Fat proximity (max 20 pts)
  score += Math.max(0, 20 - Math.abs(recipe.fat - targetFat) * 0.5)
  return Math.round(score)
}

// ─── Categorize recipes by meal type ────────────────────────────────────────
const mealTypeMap: Record<string, 'breakfast' | 'lunch' | 'dinner' | 'snack'> = {
  'breakfast': 'breakfast',
  'lunch': 'lunch',
  'dinner': 'dinner',
  'snack': 'snack',
}

// ─── Nutritionist Dashboard Component ───────────────────────────────────────
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
  const [generatedRecipes, setGeneratedRecipes] = useState<GeneratedRecipe[]>([])
  const [showRecipeDialog, setShowRecipeDialog] = useState(false)
  const [selectedMealType, setSelectedMealType] = useState<'breakfast' | 'lunch' | 'dinner' | 'snack'>('breakfast')
  const [appliedRecipes, setAppliedRecipes] = useState<string[]>([])

  const toggleRestriction = (allergen: string) => {
    setRestrictions(prev =>
      prev.includes(allergen) ? prev.filter(a => a !== allergen) : [...prev, allergen]
    )
  }

  // ── AI Recipe Generation ──────────────────────────────────────────────────
  const handleGenerateAI = () => {
    setGenerating(true)
    // Simulate AI processing delay
    setTimeout(() => {
      const targetCal = parseInt(calories) || 2000
      const targetProtein = parseInt(protein) || 50
      const targetCarbs = parseInt(carbs) || 250
      const targetFat = parseInt(fat) || 65

      // Filter by restrictions
      let available = filterRecipesByRestrictions([...recipeDatabase], restrictions)

      // Score & sort by macro alignment
      const scored = available.map(r => ({
        recipe: r,
        score: scoreRecipe(r, targetCal, targetProtein, targetCarbs, targetFat),
      }))
      scored.sort((a, b) => b.score - a.score)

      // Take top results
      const results = scored.slice(0, 10).map(s => s.recipe)

      // Ensure at least 1 per meal type
      const mealTypes: ('breakfast' | 'lunch' | 'dinner' | 'snack')[] = ['breakfast', 'lunch', 'dinner', 'snack']
      mealTypes.forEach(type => {
        if (!results.some(r => r.mealType === type)) {
          const fallback = recipeDatabase.find(r => r.mealType === type)
          if (fallback) results.push(fallback)
        }
      })

      setGeneratedRecipes(results)
      setGenerating(false)
      setShowRecipeDialog(true)
      toast.success(`AI generated ${results.length} recipes based on your targets`)
    }, 1800)
  }

  // ── Apply a recipe to the meal plan ───────────────────────────────────────
  const handleApplyRecipe = (recipe: GeneratedRecipe) => {
    if (appliedRecipes.includes(recipe.id)) return

    // Pick a day that has an empty slot for this meal type
    const dayKey = recipe.mealType as keyof Meal
    const emptyDay = meals.find(m => !m[dayKey])
    if (!emptyDay) {
      toast.error('All days already have meals for this type. Clear a slot first.')
      return
    }

    setMeals(prev =>
      prev.map(m =>
        m.day === emptyDay.day
          ? { ...m, [dayKey]: `${recipe.name} (${recipe.calories} kcal)` }
          : m
      )
    )
    setAppliedRecipes(prev => [...prev, recipe.id])
    toast.success(`"${recipe.name}" added to ${emptyDay.day}'s ${recipe.mealType}`)
  }

  // ── Apply full AI-generated meal plan ─────────────────────────────────────
  const handleApplyAllRecipes = () => {
    const newMeals = [...meals]
    const mealTypes: ('breakfast' | 'lunch' | 'dinner' | 'snack')[] = ['breakfast', 'lunch', 'dinner', 'snack']

    generatedRecipes.forEach((recipe, i) => {
      const dayIdx = i % 7
      if (newMeals[dayIdx]) {
        newMeals[dayIdx] = {
          ...newMeals[dayIdx],
          [recipe.mealType]: `${recipe.name} (${recipe.calories} kcal)`,
        }
      }
    })

    setMeals(newMeals)
    setAppliedRecipes(generatedRecipes.map(r => r.id))
    setShowRecipeDialog(false)
    toast.success('Full AI-generated meal plan applied!')
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
            {generating ? (
              <span className="flex items-center gap-1">
                <span className="animate-pulse">AI Generating...</span>
              </span>
            ) : 'Generate AI Menu'}
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
              <p className="text-sm font-medium">Macro Distribution</p>
              <div className="mt-2 space-y-1 text-xs text-gray-500">
                <div className="flex justify-between">
                  <span>Protein:</span>
                  <span className="font-medium">{totalCalories > 0 ? Math.round((totalProtein * 4 / totalCalories) * 100) : 0}%</span>
                </div>
                <div className="flex justify-between">
                  <span>Carbs:</span>
                  <span className="font-medium">{totalCalories > 0 ? Math.round((totalCarbs * 4 / totalCalories) * 100) : 0}%</span>
                </div>
                <div className="flex justify-between">
                  <span>Fat:</span>
                  <span className="font-medium">{totalCalories > 0 ? Math.round((totalFat * 9 / totalCalories) * 100) : 0}%</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Allergen Restrictions */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Allergen Restrictions</CardTitle>
            <CardDescription>Toggle to filter AI-generated recipes</CardDescription>
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
                  <strong>{restrictions.length}</strong> restriction{restrictions.length > 1 ? 's' : ''} active — AI will exclude these allergens
                </p>
              </div>
            )}
            {restrictions.length === 0 && (
              <div className="mt-4 text-xs text-gray-400 text-center">
                No restrictions set. AI will use all recipes.
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
              <div className="flex justify-between"><span className="text-gray-500">Daily target:</span><span>{totalCalories} kcal</span></div>
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
                        placeholder="—"
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        value={meal.lunch}
                        onChange={(e) => setMeals(prev =>
                          prev.map(m => m.day === meal.day ? { ...m, lunch: e.target.value } : m)
                        )}
                        className="h-8 text-sm"
                        placeholder="—"
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        value={meal.dinner}
                        onChange={(e) => setMeals(prev =>
                          prev.map(m => m.day === meal.day ? { ...m, dinner: e.target.value } : m)
                        )}
                        className="h-8 text-sm"
                        placeholder="—"
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        value={meal.snack}
                        onChange={(e) => setMeals(prev =>
                          prev.map(m => m.day === meal.day ? { ...m, snack: e.target.value } : m)
                        )}
                        className="h-8 text-sm"
                        placeholder="—"
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* ── AI Recipe Dialog ────────────────────────────────────────────────── */}
      <Dialog open={showRecipeDialog} onOpenChange={setShowRecipeDialog}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl">
              <ChefHat className="h-6 w-6 text-accent" />
              AI-Generated Recipes
            </DialogTitle>
            <DialogDescription>
              Based on {totalCalories} kcal target
              {restrictions.length > 0 && ` · Excluding: ${restrictions.join(', ')}`}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            {/* Meal Type Tabs */}
            <div className="flex gap-2 overflow-x-auto pb-2">
              {(['breakfast', 'lunch', 'dinner', 'snack'] as const).map((type) => {
                const count = generatedRecipes.filter(r => r.mealType === type).length
                return (
                  <button
                    key={type}
                    onClick={() => setSelectedMealType(type)}
                    className={`shrink-0 rounded-full px-4 py-1.5 text-sm font-medium capitalize transition-colors ${
                      selectedMealType === type
                        ? 'bg-accent text-white'
                        : 'bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-gray-400'
                    }`}
                  >
                    {type} ({count})
                  </button>
                )
              })}
            </div>

            {/* Recipe Cards */}
            <div className="grid gap-3 sm:grid-cols-2">
              {generatedRecipes
                .filter(r => r.mealType === selectedMealType)
                .map((recipe) => {
                  const isApplied = appliedRecipes.includes(recipe.id)
                  return (
                    <Card key={recipe.id} className={`${isApplied ? 'border-emerald-300 dark:border-emerald-700 bg-emerald-50/50 dark:bg-emerald-950/20' : ''}`}>
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-slate-900 dark:text-white text-sm truncate">{recipe.name}</h4>
                            <div className="flex items-center gap-2 mt-1">
                              <Clock className="h-3 w-3 text-gray-400" />
                              <span className="text-xs text-gray-500">{recipe.prepTime}</span>
                            </div>
                          </div>
                          {isApplied && <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />}
                        </div>

                        {/* Macro badges */}
                        <div className="flex gap-2 mt-2">
                          <Badge variant="outline" className="text-[10px] gap-1">
                            <Flame className="h-3 w-3 text-orange-500" /> {recipe.calories}
                          </Badge>
                          <Badge variant="outline" className="text-[10px] gap-1">
                            <Drumstick className="h-3 w-3 text-red-500" /> {recipe.protein}g
                          </Badge>
                          <Badge variant="outline" className="text-[10px] gap-1">
                            <Wheat className="h-3 w-3 text-amber-500" /> {recipe.carbs}g
                          </Badge>
                          <Badge variant="outline" className="text-[10px] gap-1">
                            <Droplets className="h-3 w-3 text-blue-500" /> {recipe.fat}g
                          </Badge>
                        </div>

                        {/* Ingredients */}
                        <div className="mt-2">
                          <p className="text-xs text-gray-500 flex items-center gap-1">
                            <Utensils className="h-3 w-3" />
                            {recipe.ingredients.join(', ')}
                          </p>
                        </div>

                        {/* Tags */}
                        <div className="flex gap-1 mt-2 flex-wrap">
                          {recipe.tags.map(tag => (
                            <span key={tag} className="text-[10px] px-1.5 py-0.5 rounded bg-gray-100 dark:bg-slate-800 text-gray-500">
                              {tag}
                            </span>
                          ))}
                        </div>

                        <Button
                          size="sm"
                          variant={isApplied ? 'outline' : 'default'}
                          className="mt-3 w-full"
                          onClick={() => handleApplyRecipe(recipe)}
                          disabled={isApplied}
                        >
                          {isApplied ? (
                            <><CheckCircle2 className="h-3.5 w-3.5 mr-1" /> Applied</>
                          ) : (
                            <><Plus className="h-3.5 w-3.5 mr-1" /> Add to {selectedMealType}</>
                          )}
                        </Button>
                      </CardContent>
                    </Card>
                  )
                })}
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setShowRecipeDialog(false)}>
              Close
            </Button>
            <Button onClick={handleApplyAllRecipes} disabled={appliedRecipes.length >= generatedRecipes.length}>
              <ListChecks className="h-4 w-4 mr-1" /> Apply All to Plan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}