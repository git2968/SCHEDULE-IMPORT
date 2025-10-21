import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { toast } from 'react-toastify';
import * as echarts from 'echarts';
import { useFitness } from '../hooks/useFitness';
import { FoodItem } from '../types';
import GlassCard from './GlassCard';
import GlassButton from './GlassButton';
import GlassInput from './GlassInput';
import GlassSelect from './GlassSelect';
import DatePicker from './DatePicker';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const Section = styled(GlassCard)`
  padding: 1.5rem;
`;

const FormSection = styled(GlassCard)`
  padding: 1.5rem;
  position: relative;
  z-index: 100;
`;

const SectionTitle = styled.h3`
  font-size: 1.25rem;
  font-weight: 600;
  color: rgba(0, 0, 0, 0.85);
  margin: 0 0 1rem 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  position: relative;
  z-index: 1;
`;

const Label = styled.label`
  font-size: 0.9rem;
  font-weight: 500;
  color: rgba(0, 0, 0, 0.7);
`;

const FoodList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-top: 1rem;
`;

const FoodItemCard = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 1rem;
  background: rgba(255, 255, 255, 0.5);
  border-radius: 10px;
  border: 1px solid rgba(10, 132, 255, 0.1);
`;

const FoodInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
`;

const FoodName = styled.div`
  font-weight: 600;
  color: rgba(0, 0, 0, 0.85);
`;

const FoodDetails = styled.div`
  font-size: 0.85rem;
  color: rgba(0, 0, 0, 0.6);
`;

const RemoveButton = styled.button`
  background: transparent;
  border: none;
  color: rgba(255, 69, 58, 0.8);
  cursor: pointer;
  padding: 0.25rem 0.5rem;
  border-radius: 6px;
  transition: all 0.2s;
  
  &:hover {
    background: rgba(255, 69, 58, 0.1);
    color: rgba(255, 69, 58, 1);
  }
`;

const CaloriesSummary = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 1rem;
  margin-top: 1rem;
`;

const CalorieCard = styled.div`
  padding: 1rem;
  background: linear-gradient(135deg, rgba(10, 132, 255, 0.1), rgba(64, 210, 255, 0.05));
  border-radius: 12px;
  text-align: center;
`;

const CalorieValue = styled.div`
  font-size: 2rem;
  font-weight: 700;
  background: linear-gradient(135deg, #0A84FF, #64D2FF);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
`;

const CalorieLabel = styled.div`
  font-size: 0.85rem;
  color: rgba(0, 0, 0, 0.6);
  margin-top: 0.25rem;
`;

const ChartContainer = styled.div`
  width: 100%;
  height: 350px;
  margin-top: 1rem;
  
  @media (max-width: 768px) {
    height: 300px;
  }
`;

const DailyRecords = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const DayRecord = styled.div`
  padding: 1rem;
  background: rgba(255, 255, 255, 0.5);
  border-radius: 12px;
  border: 1px solid rgba(10, 132, 255, 0.1);
`;

const DayHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.75rem;
`;

const DayDate = styled.div`
  font-weight: 600;
  color: rgba(10, 132, 255, 0.9);
`;

const DayCalories = styled.div`
  font-size: 1.1rem;
  font-weight: 700;
  color: rgba(255, 149, 0, 0.9);
`;

const MealSection = styled.div`
  margin-top: 0.5rem;
  padding: 0.75rem;
  background: rgba(0, 0, 0, 0.02);
  border-radius: 8px;
`;

const MealTitle = styled.div`
  font-weight: 600;
  color: rgba(0, 0, 0, 0.75);
  margin-bottom: 0.5rem;
  font-size: 0.9rem;
`;

// 常见食物热量数据库（每100克）
const FOOD_DATABASE: Record<string, { calories: number; protein: number; carbs: number; fat: number }> = {
  // 主食类
  '米饭': { calories: 116, protein: 2.6, carbs: 25.9, fat: 0.3 },
  '馒头': { calories: 221, protein: 7.0, carbs: 47.0, fat: 1.0 },
  '面条': { calories: 284, protein: 8.3, carbs: 61.9, fat: 0.7 },
  '面包': { calories: 312, protein: 8.3, carbs: 58.6, fat: 5.1 },
  '包子': { calories: 227, protein: 7.1, carbs: 34.0, fat: 6.6 },
  
  // 肉类
  '鸡胸肉': { calories: 133, protein: 19.4, carbs: 2.5, fat: 5.0 },
  '猪肉': { calories: 395, protein: 13.2, carbs: 2.4, fat: 37.0 },
  '牛肉': { calories: 125, protein: 19.9, carbs: 2.0, fat: 4.2 },
  '鱼肉': { calories: 98, protein: 17.6, carbs: 3.8, fat: 1.3 },
  '虾': { calories: 79, protein: 18.0, carbs: 0.0, fat: 0.5 },
  
  // 蔬菜类
  '西兰花': { calories: 36, protein: 4.1, carbs: 4.3, fat: 0.6 },
  '菠菜': { calories: 28, protein: 2.6, carbs: 4.5, fat: 0.3 },
  '番茄': { calories: 19, protein: 0.9, carbs: 4.0, fat: 0.2 },
  '黄瓜': { calories: 15, protein: 0.8, carbs: 2.9, fat: 0.2 },
  '生菜': { calories: 13, protein: 1.0, carbs: 1.8, fat: 0.4 },
  
  // 水果类
  '苹果': { calories: 53, protein: 0.3, carbs: 13.5, fat: 0.2 },
  '香蕉': { calories: 91, protein: 1.4, carbs: 22.0, fat: 0.2 },
  '橙子': { calories: 48, protein: 0.8, carbs: 11.7, fat: 0.2 },
  '西瓜': { calories: 25, protein: 0.6, carbs: 5.8, fat: 0.1 },
  
  // 蛋奶类
  '鸡蛋': { calories: 147, protein: 13.3, carbs: 2.8, fat: 8.8 },
  '牛奶': { calories: 54, protein: 3.0, carbs: 3.4, fat: 3.2 },
  '酸奶': { calories: 72, protein: 2.5, carbs: 9.3, fat: 2.7 },
  
  // 零食类
  '薯片': { calories: 548, protein: 5.6, carbs: 52.9, fat: 34.2 },
  '巧克力': { calories: 586, protein: 4.3, carbs: 51.9, fat: 40.1 },
  '饼干': { calories: 433, protein: 7.1, carbs: 76.2, fat: 10.6 },
  
  // 饮料
  '可乐': { calories: 43, protein: 0.0, carbs: 10.6, fat: 0.0 },
  '果汁': { calories: 45, protein: 0.4, carbs: 10.5, fat: 0.1 }
};

const MEAL_TYPES = [
  { value: 'breakfast', label: '早餐' },
  { value: 'lunch', label: '午餐' },
  { value: 'dinner', label: '晚餐' },
  { value: 'snack', label: '加餐' }
];

const getTodayString = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const FoodDiary: React.FC = () => {
  const { foodRecords, addFoodRecord, deleteFoodRecord } = useFitness();
  const chartRef = useRef<HTMLDivElement>(null);
  const chartInstance = useRef<echarts.ECharts | null>(null);

  const [selectedDate, setSelectedDate] = useState(getTodayString());
  const [selectedMeal, setSelectedMeal] = useState<'breakfast' | 'lunch' | 'dinner' | 'snack'>('breakfast');
  const [selectedFood, setSelectedFood] = useState('');
  const [foodAmount, setFoodAmount] = useState('100');
  const [currentFoods, setCurrentFoods] = useState<FoodItem[]>([]);

  // 准备食物选项
  const foodOptions = [
    { value: '', label: '请选择食物' },
    ...Object.keys(FOOD_DATABASE).map(food => ({
      value: food,
      label: `${food} (${FOOD_DATABASE[food].calories}kcal/100g)`
    }))
  ];

  const todayRecords = foodRecords.filter(r => r.date === selectedDate);
  const totalCalories = todayRecords.reduce((sum, r) => sum + r.totalCalories, 0);
  const totalProtein = todayRecords.reduce((sum, r) => 
    sum + r.foods.reduce((s, f) => s + (f.protein || 0), 0), 0
  );
  const totalCarbs = todayRecords.reduce((sum, r) => 
    sum + r.foods.reduce((s, f) => s + (f.carbs || 0), 0), 0
  );
  const totalFat = todayRecords.reduce((sum, r) => 
    sum + r.foods.reduce((s, f) => s + (f.fat || 0), 0), 0
  );

  const addFoodToList = () => {
    if (!selectedFood) {
      toast.error('请选择食物');
      return;
    }

    const amount = parseFloat(foodAmount);
    if (isNaN(amount) || amount <= 0) {
      toast.error('请输入有效的食物量');
      return;
    }

    const foodData = FOOD_DATABASE[selectedFood];
    const multiplier = amount / 100; // 数据库是每100克的数据

    const foodItem: FoodItem = {
      name: `${selectedFood} ${amount}g`,
      amount: amount,
      calories: Math.round(foodData.calories * multiplier),
      protein: Math.round(foodData.protein * multiplier * 10) / 10,
      carbs: Math.round(foodData.carbs * multiplier * 10) / 10,
      fat: Math.round(foodData.fat * multiplier * 10) / 10
    };

    setCurrentFoods([...currentFoods, foodItem]);
    setSelectedFood('');
    setFoodAmount('100');
  };

  const removeFoodFromList = (index: number) => {
    setCurrentFoods(currentFoods.filter((_, i) => i !== index));
  };

  const submitMeal = async () => {
    if (currentFoods.length === 0) {
      toast.error('请至少添加一个食物');
      return;
    }

    const totalCalories = currentFoods.reduce((sum, f) => sum + f.calories, 0);

    try {
      await addFoodRecord({
        date: selectedDate,
        mealType: selectedMeal,
        foods: currentFoods,
        totalCalories
      });

      toast.success('饮食记录添加成功');
      setCurrentFoods([]);
    } catch (error) {
      toast.error('添加记录失败');
    }
  };

  const deleteRecord = async (recordId: string) => {
    if (window.confirm('确定要删除这条记录吗？')) {
      try {
        await deleteFoodRecord(recordId);
        toast.success('记录已删除');
      } catch (error) {
        toast.error('删除记录失败');
      }
    }
  };

  // 初始化图表
  useEffect(() => {
    if (chartRef.current && !chartInstance.current) {
      chartInstance.current = echarts.init(chartRef.current);
    }

    return () => {
      if (chartInstance.current) {
        chartInstance.current.dispose();
        chartInstance.current = null;
      }
    };
  }, []);

  // 更新图表
  useEffect(() => {
    if (!chartInstance.current) return;

    const option = {
      title: {
        text: '今日营养摄入',
        left: 'center',
        textStyle: {
          color: 'rgba(0, 0, 0, 0.85)',
          fontSize: 16,
          fontWeight: 600
        }
      },
      tooltip: {
        trigger: 'item',
        formatter: '{b}: {c}g ({d}%)',
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        borderColor: 'rgba(10, 132, 255, 0.2)',
        borderWidth: 1,
        textStyle: {
          fontSize: 14
        }
      },
      legend: {
        bottom: 10,
        textStyle: {
          color: 'rgba(0, 0, 0, 0.7)',
          fontSize: 13
        }
      },
      series: [
        {
          name: '营养构成',
          type: 'pie',
          radius: '55%',
          center: ['50%', '50%'],
          data: [
            { value: totalProtein, name: '蛋白质', itemStyle: { color: '#0A84FF' } },
            { value: totalCarbs, name: '碳水化合物', itemStyle: { color: '#FF9500' } },
            { value: totalFat, name: '脂肪', itemStyle: { color: '#FF453A' } }
          ],
          emphasis: {
            itemStyle: {
              shadowBlur: 10,
              shadowOffsetX: 0,
              shadowColor: 'rgba(0, 0, 0, 0.5)'
            }
          },
          label: {
            show: true,
            position: 'outside',
            formatter: '{b}: {d}%',
            fontSize: 13,
            color: 'rgba(0, 0, 0, 0.85)'
          },
          labelLine: {
            show: true,
            length: 15,
            length2: 10,
            lineStyle: {
              color: 'rgba(0, 0, 0, 0.3)',
              width: 1
            }
          }
        }
      ]
    };

    chartInstance.current.setOption(option);
  }, [totalProtein, totalCarbs, totalFat]);

  return (
    <Container>
      <FormSection>
        <SectionTitle>🍽️ 记录饮食</SectionTitle>
        
        <div style={{ 
          padding: '0.75rem 1rem', 
          background: 'rgba(255, 149, 0, 0.08)', 
          borderRadius: '10px',
          marginBottom: '1rem',
          fontSize: '0.9rem',
          color: 'rgba(0, 0, 0, 0.7)'
        }}>
          💡 <strong>使用说明：</strong>可以添加多个食物到一餐，每次选择食物→输入克数→点击"添加"，最后点击"保存本餐记录"即可
        </div>
        
        <FormGroup style={{ marginBottom: '1rem' }}>
          <Label>日期</Label>
          <DatePicker
            value={selectedDate}
            onChange={setSelectedDate}
            placeholder="选择日期"
          />
        </FormGroup>

        <FormGroup style={{ marginBottom: '1rem' }}>
          <Label>餐次</Label>
          <GlassSelect
            value={selectedMeal}
            onChange={(value) => setSelectedMeal(value as any)}
            options={MEAL_TYPES}
            placeholder="选择餐次"
          />
        </FormGroup>

        <FormGroup style={{ marginBottom: '1rem' }}>
          <Label>选择食物（可添加多个）</Label>
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr auto', gap: '0.5rem' }}>
            <GlassSelect
              value={selectedFood}
              onChange={setSelectedFood}
              options={foodOptions}
              placeholder="请选择食物"
              maxHeight={200}
            />
            
            <GlassInput
              type="number"
              value={foodAmount}
              onChange={(e) => setFoodAmount(e.target.value)}
              placeholder="克数"
              min="1"
            />
            
            <GlassButton type="button" onClick={addFoodToList}>
              添加
            </GlassButton>
          </div>
        </FormGroup>

        {currentFoods.length > 0 && (
          <>
            <div style={{
              marginTop: '1.5rem',
              paddingTop: '1.5rem',
              borderTop: '2px dashed rgba(10, 132, 255, 0.2)'
            }}>
              <Label>当前餐次食物列表 ({currentFoods.length}种食物)</Label>
              <FoodList>
                {currentFoods.map((food, index) => (
                  <FoodItemCard key={index}>
                    <FoodInfo>
                      <FoodName>{food.name}</FoodName>
                      <FoodDetails>
                        {food.calories}kcal | 
                        蛋白质{food.protein}g | 
                        碳水{food.carbs}g | 
                        脂肪{food.fat}g
                      </FoodDetails>
                    </FoodInfo>
                    <RemoveButton onClick={() => removeFoodFromList(index)}>
                      移除
                    </RemoveButton>
                  </FoodItemCard>
                ))}
              </FoodList>
              
              <div style={{
                padding: '0.75rem 1rem',
                background: 'rgba(52, 199, 89, 0.08)',
                borderRadius: '10px',
                marginTop: '1rem',
                marginBottom: '1rem',
                fontSize: '0.9rem',
                color: 'rgba(0, 0, 0, 0.7)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                <span style={{ fontSize: '1.2rem' }}>✅</span>
                <span>
                  已添加 <strong>{currentFoods.length}</strong> 种食物，
                  共计 <strong>{currentFoods.reduce((sum, f) => sum + f.calories, 0)}</strong> kcal
                </span>
              </div>
              
              <GlassButton 
                onClick={submitMeal} 
                style={{ 
                  width: '100%',
                  padding: '1rem',
                  fontSize: '1.05rem',
                  fontWeight: '600'
                }}
              >
                💾 保存本餐记录
              </GlassButton>
            </div>
          </>
        )}
      </FormSection>

      <Section>
        <SectionTitle>📊 今日营养摄入统计</SectionTitle>
        <CaloriesSummary>
          <CalorieCard>
            <CalorieValue>{totalCalories}</CalorieValue>
            <CalorieLabel>总热量 (kcal)</CalorieLabel>
          </CalorieCard>
          <CalorieCard>
            <CalorieValue>{Math.round(totalProtein)}</CalorieValue>
            <CalorieLabel>蛋白质 (g)</CalorieLabel>
          </CalorieCard>
          <CalorieCard>
            <CalorieValue>{Math.round(totalCarbs)}</CalorieValue>
            <CalorieLabel>碳水化合物 (g)</CalorieLabel>
          </CalorieCard>
          <CalorieCard>
            <CalorieValue>{Math.round(totalFat)}</CalorieValue>
            <CalorieLabel>脂肪 (g)</CalorieLabel>
          </CalorieCard>
        </CaloriesSummary>

        {(totalProtein > 0 || totalCarbs > 0 || totalFat > 0) && (
          <ChartContainer ref={chartRef} />
        )}
      </Section>

      {todayRecords.length > 0 && (
        <Section>
          <SectionTitle>📋 今日记录详情</SectionTitle>
          <DailyRecords>
            <DayRecord>
              <DayHeader>
                <DayDate>{selectedDate}</DayDate>
                <DayCalories>{totalCalories} kcal</DayCalories>
              </DayHeader>
              
              {MEAL_TYPES.map(mealType => {
                const mealRecords = todayRecords.filter(r => r.mealType === mealType.value);
                if (mealRecords.length === 0) return null;

                return (
                  <MealSection key={mealType.value}>
                    <MealTitle>{mealType.label}</MealTitle>
                    {mealRecords.map(record => (
                      <div key={record.id} style={{ marginBottom: '0.5rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
                          <span style={{ fontSize: '0.85rem', color: 'rgba(255, 149, 0, 0.9)', fontWeight: 600 }}>
                            {record.totalCalories} kcal
                          </span>
                          <RemoveButton onClick={() => deleteRecord(record.id)}>
                            删除
                          </RemoveButton>
                        </div>
                        {record.foods.map((food, idx) => (
                          <FoodDetails key={idx}>{food.name}</FoodDetails>
                        ))}
                      </div>
                    ))}
                  </MealSection>
                );
              })}
            </DayRecord>
          </DailyRecords>
        </Section>
      )}
    </Container>
  );
};

export default FoodDiary;

