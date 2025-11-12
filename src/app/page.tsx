"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Check, Droplets, Flame, Target, TrendingDown, Zap, Shield, CreditCard, Copy, Mail } from "lucide-react";
import { PAYMENT_CONFIG, generatePixPayment } from "@/lib/payment";

type Step = "welcome" | "quiz" | "results" | "payment" | "pix";

interface QuizData {
  hasAccount: string;
  gender: string;
  age: string;
  weight: string;
  height: string;
  goal: string;
  activityLevel: string;
  email: string;
}

export default function Home() {
  const [step, setStep] = useState<Step>("welcome");
  const [quizStep, setQuizStep] = useState(1);
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'annual' | null>(null);
  const [pixCopied, setPixCopied] = useState(false);
  const [quizData, setQuizData] = useState<QuizData>({
    hasAccount: "",
    gender: "",
    age: "",
    weight: "",
    height: "",
    goal: "",
    activityLevel: "",
    email: "",
  });

  const totalQuizSteps = 8; // Adicionado passo do email
  const progress = (quizStep / totalQuizSteps) * 100;

  // Cálculos de macros baseados nos dados do usuário
  const calculateMacros = () => {
    const weight = parseFloat(quizData.weight);
    const height = parseFloat(quizData.height);
    const age = parseInt(quizData.age);

    // Cálculo de TMB (Taxa Metabólica Basal) - Fórmula de Harris-Benedict
    let tmb = 0;
    if (quizData.gender === "masculino") {
      tmb = 88.362 + (13.397 * weight) + (4.799 * height) - (5.677 * age);
    } else {
      tmb = 447.593 + (9.247 * weight) + (3.098 * height) - (4.330 * age);
    }

    // Multiplicador de atividade
    const activityMultipliers: { [key: string]: number } = {
      sedentario: 1.2,
      leve: 1.375,
      moderado: 1.55,
      intenso: 1.725,
    };

    const tdee = tmb * (activityMultipliers[quizData.activityLevel] || 1.2);
    
    // Déficit calórico para perda de peso
    const caloriesForWeightLoss = tdee - 500;

    // Macros
    const protein = weight * 2; // 2g por kg
    const fat = (caloriesForWeightLoss * 0.25) / 9; // 25% das calorias
    const carbs = (caloriesForWeightLoss - (protein * 4) - (fat * 9)) / 4;
    const water = weight * 0.035; // 35ml por kg
    const fiber = 25; // Recomendação padrão

    return {
      calories: Math.round(caloriesForWeightLoss),
      protein: Math.round(protein),
      carbs: Math.round(carbs),
      fat: Math.round(fat),
      water: water.toFixed(1),
      fiber,
    };
  };

  const macros = quizData.weight && quizData.height && quizData.age 
    ? calculateMacros() 
    : null;

  const handleQuizNext = () => {
    if (quizStep < totalQuizSteps) {
      setQuizStep(quizStep + 1);
    } else {
      setStep("results");
    }
  };

  const handleQuizBack = () => {
    if (quizStep > 1) {
      setQuizStep(quizStep - 1);
    }
  };

  const handlePlanSelection = (plan: 'monthly' | 'annual') => {
    setSelectedPlan(plan);
    setStep("pix");
  };

  const copyPixKey = () => {
    navigator.clipboard.writeText(PAYMENT_CONFIG.sellerEmail);
    setPixCopied(true);
    setTimeout(() => setPixCopied(false), 2000);
  };

  // Tela de Boas-vindas
  if (step === "welcome") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50 flex items-center justify-center p-4">
        <div className="max-w-2xl w-full text-center space-y-8">
          <div className="space-y-4">
            <div className="inline-block p-4 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-3xl shadow-2xl mb-4">
              <TrendingDown className="w-16 h-16 text-white" />
            </div>
            <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
              Transforme Seu Corpo
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 max-w-xl mx-auto">
              Descubra exatamente quantas proteínas, fibras e água você precisa para emagrecer de forma saudável
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-3xl mx-auto">
            <Card className="border-2 border-emerald-100 hover:border-emerald-300 transition-all">
              <CardContent className="pt-6 text-center">
                <Flame className="w-10 h-10 text-orange-500 mx-auto mb-3" />
                <h3 className="font-semibold text-gray-800 mb-1">Calorias Precisas</h3>
                <p className="text-sm text-gray-600">Calculadas para seu objetivo</p>
              </CardContent>
            </Card>
            <Card className="border-2 border-emerald-100 hover:border-emerald-300 transition-all">
              <CardContent className="pt-6 text-center">
                <Target className="w-10 h-10 text-emerald-500 mx-auto mb-3" />
                <h3 className="font-semibold text-gray-800 mb-1">Macros Personalizados</h3>
                <p className="text-sm text-gray-600">Proteínas, carbos e gorduras</p>
              </CardContent>
            </Card>
            <Card className="border-2 border-emerald-100 hover:border-emerald-300 transition-all">
              <CardContent className="pt-6 text-center">
                <Droplets className="w-10 h-10 text-blue-500 mx-auto mb-3" />
                <h3 className="font-semibold text-gray-800 mb-1">Hidratação Ideal</h3>
                <p className="text-sm text-gray-600">Quantidade exata de água</p>
              </CardContent>
            </Card>
          </div>

          <Button 
            onClick={() => setStep("quiz")}
            size="lg"
            className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white px-12 py-6 text-lg rounded-full shadow-xl hover:shadow-2xl transition-all transform hover:scale-105"
          >
            <Zap className="w-5 h-5 mr-2" />
            Começar Agora - É Grátis!
          </Button>

          <p className="text-sm text-gray-500">
            ✨ Mais de 10.000 pessoas já transformaram seus corpos
          </p>
        </div>
      </div>
    );
  }

  // Quiz
  if (step === "quiz") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50 flex items-center justify-center p-4">
        <Card className="max-w-2xl w-full shadow-2xl border-2 border-emerald-100">
          <CardHeader>
            <div className="space-y-4">
              <Progress value={progress} className="h-2" />
              <CardTitle className="text-2xl md:text-3xl text-center bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                Passo {quizStep} de {totalQuizSteps}
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {quizStep === 1 && (
              <div className="space-y-4">
                <Label className="text-xl font-semibold text-gray-800">Você já tem uma conta?</Label>
                <RadioGroup value={quizData.hasAccount} onValueChange={(value) => setQuizData({...quizData, hasAccount: value})}>
                  <div className="flex items-center space-x-3 p-4 border-2 rounded-xl hover:border-emerald-400 cursor-pointer transition-all">
                    <RadioGroupItem value="sim" id="sim" />
                    <Label htmlFor="sim" className="cursor-pointer flex-1 text-lg">Sim, já tenho conta</Label>
                  </div>
                  <div className="flex items-center space-x-3 p-4 border-2 rounded-xl hover:border-emerald-400 cursor-pointer transition-all">
                    <RadioGroupItem value="nao" id="nao" />
                    <Label htmlFor="nao" className="cursor-pointer flex-1 text-lg">Não, é minha primeira vez</Label>
                  </div>
                </RadioGroup>
              </div>
            )}

            {quizStep === 2 && (
              <div className="space-y-4">
                <Label className="text-xl font-semibold text-gray-800">Qual é o seu sexo?</Label>
                <RadioGroup value={quizData.gender} onValueChange={(value) => setQuizData({...quizData, gender: value})}>
                  <div className="flex items-center space-x-3 p-4 border-2 rounded-xl hover:border-emerald-400 cursor-pointer transition-all">
                    <RadioGroupItem value="masculino" id="masculino" />
                    <Label htmlFor="masculino" className="cursor-pointer flex-1 text-lg">Masculino</Label>
                  </div>
                  <div className="flex items-center space-x-3 p-4 border-2 rounded-xl hover:border-emerald-400 cursor-pointer transition-all">
                    <RadioGroupItem value="feminino" id="feminino" />
                    <Label htmlFor="feminino" className="cursor-pointer flex-1 text-lg">Feminino</Label>
                  </div>
                </RadioGroup>
              </div>
            )}

            {quizStep === 3 && (
              <div className="space-y-4">
                <Label htmlFor="age" className="text-xl font-semibold text-gray-800">Qual é a sua idade?</Label>
                <Input 
                  id="age"
                  type="number" 
                  placeholder="Ex: 28"
                  value={quizData.age}
                  onChange={(e) => setQuizData({...quizData, age: e.target.value})}
                  className="text-lg p-6 border-2 focus:border-emerald-400"
                />
              </div>
            )}

            {quizStep === 4 && (
              <div className="space-y-4">
                <Label htmlFor="weight" className="text-xl font-semibold text-gray-800">Qual é o seu peso atual? (kg)</Label>
                <Input 
                  id="weight"
                  type="number" 
                  placeholder="Ex: 75"
                  value={quizData.weight}
                  onChange={(e) => setQuizData({...quizData, weight: e.target.value})}
                  className="text-lg p-6 border-2 focus:border-emerald-400"
                />
              </div>
            )}

            {quizStep === 5 && (
              <div className="space-y-4">
                <Label htmlFor="height" className="text-xl font-semibold text-gray-800">Qual é a sua altura? (cm)</Label>
                <Input 
                  id="height"
                  type="number" 
                  placeholder="Ex: 170"
                  value={quizData.height}
                  onChange={(e) => setQuizData({...quizData, height: e.target.value})}
                  className="text-lg p-6 border-2 focus:border-emerald-400"
                />
              </div>
            )}

            {quizStep === 6 && (
              <div className="space-y-4">
                <Label className="text-xl font-semibold text-gray-800">Qual é o seu objetivo?</Label>
                <RadioGroup value={quizData.goal} onValueChange={(value) => setQuizData({...quizData, goal: value})}>
                  <div className="flex items-center space-x-3 p-4 border-2 rounded-xl hover:border-emerald-400 cursor-pointer transition-all">
                    <RadioGroupItem value="perder" id="perder" />
                    <Label htmlFor="perder" className="cursor-pointer flex-1 text-lg">Perder peso</Label>
                  </div>
                  <div className="flex items-center space-x-3 p-4 border-2 rounded-xl hover:border-emerald-400 cursor-pointer transition-all">
                    <RadioGroupItem value="manter" id="manter" />
                    <Label htmlFor="manter" className="cursor-pointer flex-1 text-lg">Manter peso</Label>
                  </div>
                  <div className="flex items-center space-x-3 p-4 border-2 rounded-xl hover:border-emerald-400 cursor-pointer transition-all">
                    <RadioGroupItem value="ganhar" id="ganhar" />
                    <Label htmlFor="ganhar" className="cursor-pointer flex-1 text-lg">Ganhar massa muscular</Label>
                  </div>
                </RadioGroup>
              </div>
            )}

            {quizStep === 7 && (
              <div className="space-y-4">
                <Label className="text-xl font-semibold text-gray-800">Qual é o seu nível de atividade física?</Label>
                <RadioGroup value={quizData.activityLevel} onValueChange={(value) => setQuizData({...quizData, activityLevel: value})}>
                  <div className="flex items-center space-x-3 p-4 border-2 rounded-xl hover:border-emerald-400 cursor-pointer transition-all">
                    <RadioGroupItem value="sedentario" id="sedentario" />
                    <Label htmlFor="sedentario" className="cursor-pointer flex-1">
                      <div className="text-lg font-medium">Sedentário</div>
                      <div className="text-sm text-gray-600">Pouco ou nenhum exercício</div>
                    </Label>
                  </div>
                  <div className="flex items-center space-x-3 p-4 border-2 rounded-xl hover:border-emerald-400 cursor-pointer transition-all">
                    <RadioGroupItem value="leve" id="leve" />
                    <Label htmlFor="leve" className="cursor-pointer flex-1">
                      <div className="text-lg font-medium">Levemente ativo</div>
                      <div className="text-sm text-gray-600">Exercício 1-3 dias/semana</div>
                    </Label>
                  </div>
                  <div className="flex items-center space-x-3 p-4 border-2 rounded-xl hover:border-emerald-400 cursor-pointer transition-all">
                    <RadioGroupItem value="moderado" id="moderado" />
                    <Label htmlFor="moderado" className="cursor-pointer flex-1">
                      <div className="text-lg font-medium">Moderadamente ativo</div>
                      <div className="text-sm text-gray-600">Exercício 3-5 dias/semana</div>
                    </Label>
                  </div>
                  <div className="flex items-center space-x-3 p-4 border-2 rounded-xl hover:border-emerald-400 cursor-pointer transition-all">
                    <RadioGroupItem value="intenso" id="intenso" />
                    <Label htmlFor="intenso" className="cursor-pointer flex-1">
                      <div className="text-lg font-medium">Muito ativo</div>
                      <div className="text-sm text-gray-600">Exercício 6-7 dias/semana</div>
                    </Label>
                  </div>
                </RadioGroup>
              </div>
            )}

            {quizStep === 8 && (
              <div className="space-y-4">
                <Label htmlFor="email" className="text-xl font-semibold text-gray-800">Qual é o seu melhor email?</Label>
                <Input 
                  id="email"
                  type="email" 
                  placeholder="seu@email.com"
                  value={quizData.email}
                  onChange={(e) => setQuizData({...quizData, email: e.target.value})}
                  className="text-lg p-6 border-2 focus:border-emerald-400"
                />
                <p className="text-sm text-gray-600">
                  Enviaremos seu plano personalizado e acesso ao app
                </p>
              </div>
            )}

            <div className="flex gap-3 pt-4">
              {quizStep > 1 && (
                <Button 
                  onClick={handleQuizBack}
                  variant="outline"
                  className="flex-1 py-6 text-lg"
                >
                  Voltar
                </Button>
              )}
              <Button 
                onClick={handleQuizNext}
                className="flex-1 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white py-6 text-lg"
                disabled={
                  (quizStep === 1 && !quizData.hasAccount) ||
                  (quizStep === 2 && !quizData.gender) ||
                  (quizStep === 3 && !quizData.age) ||
                  (quizStep === 4 && !quizData.weight) ||
                  (quizStep === 5 && !quizData.height) ||
                  (quizStep === 6 && !quizData.goal) ||
                  (quizStep === 7 && !quizData.activityLevel) ||
                  (quizStep === 8 && !quizData.email)
                }
              >
                {quizStep === totalQuizSteps ? "Ver Meus Resultados" : "Próximo"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Resultados
  if (step === "results" && macros) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50 p-4 py-12">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="text-center space-y-4">
            <div className="inline-block p-4 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-3xl shadow-2xl mb-4">
              <Check className="w-12 h-12 text-white" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
              Seu Plano Personalizado Está Pronto!
            </h1>
            <p className="text-xl text-gray-600">
              Baseado nas suas informações, aqui está o que você precisa:
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="border-2 border-orange-200 bg-gradient-to-br from-orange-50 to-white shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-2xl">
                  <Flame className="w-8 h-8 text-orange-500" />
                  Calorias Diárias
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-5xl font-bold text-orange-600">{macros.calories}</p>
                <p className="text-gray-600 mt-2">kcal por dia</p>
              </CardContent>
            </Card>

            <Card className="border-2 border-red-200 bg-gradient-to-br from-red-50 to-white shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-2xl">
                  <Target className="w-8 h-8 text-red-500" />
                  Proteínas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-5xl font-bold text-red-600">{macros.protein}g</p>
                <p className="text-gray-600 mt-2">por dia</p>
              </CardContent>
            </Card>

            <Card className="border-2 border-amber-200 bg-gradient-to-br from-amber-50 to-white shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-2xl">
                  <Zap className="w-8 h-8 text-amber-500" />
                  Carboidratos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-5xl font-bold text-amber-600">{macros.carbs}g</p>
                <p className="text-gray-600 mt-2">por dia</p>
              </CardContent>
            </Card>

            <Card className="border-2 border-yellow-200 bg-gradient-to-br from-yellow-50 to-white shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-2xl">
                  <Flame className="w-8 h-8 text-yellow-500" />
                  Gorduras
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-5xl font-bold text-yellow-600">{macros.fat}g</p>
                <p className="text-gray-600 mt-2">por dia</p>
              </CardContent>
            </Card>

            <Card className="border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-white shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-2xl">
                  <Droplets className="w-8 h-8 text-blue-500" />
                  Água
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-5xl font-bold text-blue-600">{macros.water}L</p>
                <p className="text-gray-600 mt-2">por dia</p>
              </CardContent>
            </Card>

            <Card className="border-2 border-green-200 bg-gradient-to-br from-green-50 to-white shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-2xl">
                  <Target className="w-8 h-8 text-green-500" />
                  Fibras
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-5xl font-bold text-green-600">{macros.fiber}g</p>
                <p className="text-gray-600 mt-2">por dia</p>
              </CardContent>
            </Card>
          </div>

          <Card className="border-2 border-emerald-200 bg-gradient-to-br from-emerald-50 to-white shadow-xl">
            <CardContent className="pt-6">
              <div className="text-center space-y-4">
                <h3 className="text-2xl font-bold text-gray-800">
                  🎉 Parabéns! Você está a um passo de transformar seu corpo!
                </h3>
                <p className="text-lg text-gray-600">
                  Desbloqueie acesso completo ao app com planos de refeição, receitas e acompanhamento diário
                </p>
                <Button 
                  onClick={() => setStep("payment")}
                  size="lg"
                  className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white px-12 py-6 text-xl rounded-full shadow-xl hover:shadow-2xl transition-all transform hover:scale-105 mt-4"
                >
                  Garantir Meu Acesso Agora
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Página de Pagamento
  if (step === "payment") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50 p-4 py-12">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="text-center space-y-4">
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
              Escolha Seu Plano
            </h1>
            <p className="text-xl text-gray-600">
              Comece sua transformação hoje mesmo!
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Plano Mensal */}
            <Card className="border-2 border-emerald-200 hover:border-emerald-400 transition-all shadow-xl hover:shadow-2xl transform hover:scale-105">
              <CardHeader className="bg-gradient-to-br from-emerald-50 to-teal-50">
                <CardTitle className="text-2xl text-center">Plano Mensal</CardTitle>
                <CardDescription className="text-center text-lg">Flexibilidade total</CardDescription>
              </CardHeader>
              <CardContent className="pt-6 space-y-6">
                <div className="text-center">
                  <p className="text-5xl font-bold text-emerald-600">R$ 12,90</p>
                  <p className="text-gray-600 mt-2">por mês</p>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Check className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                    <span className="text-gray-700">Plano alimentar personalizado</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Check className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                    <span className="text-gray-700">Receitas saudáveis ilimitadas</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Check className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                    <span className="text-gray-700">Acompanhamento diário</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Check className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                    <span className="text-gray-700">Calculadora de macros</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Shield className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                    <span className="text-gray-700 font-semibold">Garantia de 7 dias</span>
                  </div>
                </div>

                <Button 
                  className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white py-6 text-lg rounded-xl"
                  onClick={() => handlePlanSelection('monthly')}
                >
                  <CreditCard className="w-5 h-5 mr-2" />
                  Assinar Agora
                </Button>
              </CardContent>
            </Card>

            {/* Plano Anual - DESTAQUE */}
            <Card className="border-4 border-emerald-400 shadow-2xl relative overflow-hidden transform hover:scale-105 transition-all">
              <div className="absolute top-0 right-0 bg-gradient-to-r from-orange-500 to-red-500 text-white px-6 py-2 text-sm font-bold transform rotate-12 translate-x-8 translate-y-2">
                MAIS POPULAR
              </div>
              <CardHeader className="bg-gradient-to-br from-emerald-100 to-teal-100">
                <CardTitle className="text-2xl text-center">Plano Anual</CardTitle>
                <CardDescription className="text-center text-lg">Melhor custo-benefício</CardDescription>
              </CardHeader>
              <CardContent className="pt-6 space-y-6">
                <div className="text-center">
                  <p className="text-gray-500 line-through text-xl">R$ 154,80</p>
                  <p className="text-5xl font-bold text-emerald-600">R$ 25,00</p>
                  <p className="text-gray-600 mt-2">pagamento único</p>
                  <p className="text-sm text-emerald-600 font-semibold mt-2">
                    💰 Economize R$ 129,80 (84% OFF)
                  </p>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Check className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                    <span className="text-gray-700">Plano alimentar personalizado</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Check className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                    <span className="text-gray-700">Receitas saudáveis ilimitadas</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Check className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                    <span className="text-gray-700">Acompanhamento diário</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Check className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                    <span className="text-gray-700">Calculadora de macros</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Check className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                    <span className="text-gray-700 font-semibold">Acesso vitalício</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Shield className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                    <span className="text-gray-700 font-semibold">Garantia de 7 dias</span>
                  </div>
                </div>

                <Button 
                  className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white py-6 text-lg rounded-xl shadow-xl"
                  onClick={() => handlePlanSelection('annual')}
                >
                  <CreditCard className="w-5 h-5 mr-2" />
                  Garantir Oferta Especial
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Garantia */}
          <Card className="border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-white">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4 text-center md:text-left">
                <Shield className="w-16 h-16 text-blue-500 flex-shrink-0" />
                <div>
                  <h3 className="text-xl font-bold text-gray-800 mb-2">
                    Garantia de 7 Dias - Risco Zero!
                  </h3>
                  <p className="text-gray-600">
                    Se você não estiver satisfeito por qualquer motivo, devolvemos 100% do seu dinheiro. Sem perguntas, sem complicações.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Informações de Pagamento */}
          <div className="text-center text-sm text-gray-500 space-y-2">
            <p>🔒 Pagamento 100% seguro via PIX</p>
            <p>📧 Dúvidas? Entre em contato: pana74269@gmail.com</p>
          </div>
        </div>
      </div>
    );
  }

  // Tela PIX
  if (step === "pix" && selectedPlan) {
    const pixData = generatePixPayment(selectedPlan);
    const planData = PAYMENT_CONFIG.plans[selectedPlan];

    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50 p-4 py-12">
        <div className="max-w-2xl mx-auto space-y-8">
          <div className="text-center space-y-4">
            <div className="inline-block p-4 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-3xl shadow-2xl mb-4">
              <CreditCard className="w-12 h-12 text-white" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
              Finalize Seu Pagamento
            </h1>
            <p className="text-xl text-gray-600">
              {planData.name} - R$ {planData.price.toFixed(2)}
            </p>
          </div>

          <Card className="border-2 border-emerald-200 shadow-2xl">
            <CardHeader className="bg-gradient-to-br from-emerald-50 to-teal-50">
              <CardTitle className="text-2xl text-center flex items-center justify-center gap-3">
                <CreditCard className="w-8 h-8 text-emerald-600" />
                Pagamento via PIX
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
              <div className="bg-white p-6 rounded-xl border-2 border-emerald-200">
                <p className="text-center text-gray-700 mb-4 font-semibold">
                  Escaneie o QR Code ou copie a chave PIX:
                </p>
                
                <div className="bg-gray-100 p-4 rounded-lg mb-4">
                  <p className="text-center text-sm text-gray-600 mb-2">Chave PIX (Email):</p>
                  <div className="flex items-center gap-2">
                    <Input 
                      value={pixData.pixKey}
                      readOnly
                      className="text-center font-mono text-sm"
                    />
                    <Button
                      onClick={copyPixKey}
                      variant="outline"
                      size="icon"
                      className="flex-shrink-0"
                    >
                      {pixCopied ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
                    </Button>
                  </div>
                  {pixCopied && (
                    <p className="text-center text-sm text-green-600 mt-2">
                      ✓ Chave PIX copiada!
                    </p>
                  )}
                </div>

                <div className="space-y-3 text-sm text-gray-600">
                  <div className="flex justify-between">
                    <span>Valor:</span>
                    <span className="font-bold text-emerald-600">R$ {pixData.amount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Destinatário:</span>
                    <span className="font-semibold">{pixData.pixKey}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Descrição:</span>
                    <span>{pixData.description}</span>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <h4 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
                  <Mail className="w-5 h-5" />
                  Após o pagamento:
                </h4>
                <ol className="text-sm text-blue-800 space-y-2 ml-6 list-decimal">
                  <li>Envie o comprovante para: <strong>pana74269@gmail.com</strong></li>
                  <li>Inclua seu email cadastrado: <strong>{quizData.email}</strong></li>
                  <li>Você receberá acesso em até 24 horas</li>
                </ol>
              </div>

              <div className="flex gap-3">
                <Button
                  onClick={() => setStep("payment")}
                  variant="outline"
                  className="flex-1 py-6"
                >
                  Voltar
                </Button>
                <Button
                  onClick={() => window.location.href = `mailto:pana74269@gmail.com?subject=Comprovante de Pagamento - ${planData.name}&body=Olá! Segue meu comprovante de pagamento.%0A%0AEmail cadastrado: ${quizData.email}%0APlano: ${planData.name}%0AValor: R$ ${planData.price.toFixed(2)}`}
                  className="flex-1 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white py-6"
                >
                  <Mail className="w-5 h-5 mr-2" />
                  Enviar Comprovante
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 border-green-200 bg-gradient-to-br from-green-50 to-white">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <Shield className="w-12 h-12 text-green-500 flex-shrink-0" />
                <div>
                  <h3 className="font-bold text-gray-800 mb-1">
                    Garantia de 7 Dias
                  </h3>
                  <p className="text-sm text-gray-600">
                    Não gostou? Devolvemos 100% do seu dinheiro, sem perguntas!
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return null;
}
