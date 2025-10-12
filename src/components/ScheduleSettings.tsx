import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { toast } from 'react-toastify';
import { useSchedule } from '../hooks/useSchedule';
import { useSettings } from '../hooks/useSettings';
import GlassButton from './GlassButton';
import GlassInput from './GlassInput';
import { getTodayString, isValidDateString, calculateSemesterStartDate, validateReverseCalculation } from '../utils/dateUtils';

const SettingsContainer = styled.div`
  margin-bottom: 2rem;
`;

const FormGroup = styled.div`
  margin-bottom: 1.5rem;
`;

const FormLabel = styled.label`
  display: block;
  margin-bottom: 0.5rem;
  color: var(--text-color);
`;

const FormActions = styled.div`
  margin-top: 1.5rem;
`;

const SectionTitle = styled.h4`
  color: var(--text-color);
  margin-bottom: 1rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
`;

const CheckboxGroup = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 0.5rem;
`;

const CheckboxInput = styled.input`
  margin-right: 0.5rem;
`;

const CheckboxLabel = styled.label`
  color: var(--text-color);
  cursor: pointer;
`;

const SettingDescription = styled.p`
  font-size: 0.9rem;
  color: var(--light-text);
  margin-top: 0.5rem;
  line-height: 1.4;
`;

const ModeToggle = styled.div`
  display: flex;
  background: rgba(255, 255, 255, 0.3);
  border-radius: 12px;
  padding: 0.3rem;
  margin-bottom: 1rem;
`;

const ModeButton = styled.button<{ active: boolean }>`
  flex: 1;
  padding: 0.6rem 1rem;
  border: none;
  border-radius: 8px;
  background: ${props => props.active ? 'rgba(10, 132, 255, 0.6)' : 'transparent'};
  color: ${props => props.active ? 'white' : 'rgba(0, 0, 0, 0.7)'};
  font-weight: ${props => props.active ? '600' : '400'};
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: ${props => props.active ? 'rgba(10, 132, 255, 0.7)' : 'rgba(255, 255, 255, 0.4)'};
  }
`;

const ReverseCalculationContainer = styled.div`
  background: rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  padding: 1rem;
  margin-bottom: 1rem;
`;

const CalculateButton = styled(GlassButton)`
  margin-top: 0.5rem;
  padding: 0.5rem 1rem;
  font-size: 0.9rem;
`;

const ResultDisplay = styled.div`
  margin-top: 1rem;
  padding: 0.8rem;
  background: rgba(10, 132, 255, 0.1);
  border-radius: 8px;
  border-left: 4px solid rgba(10, 132, 255, 0.6);
`;

const ResultText = styled.p`
  margin: 0;
  color: rgba(10, 132, 255, 0.9);
  font-weight: 500;
`;

const ScheduleSettings: React.FC = () => {
  const { currentSchedule, updateSchedule } = useSchedule();
  const { settings, updateSettings, getCurrentWeek } = useSettings();
  
  const [scheduleName, setScheduleName] = useState(currentSchedule?.name || '');
  const [totalWeeks, setTotalWeeks] = useState(currentSchedule?.totalWeeks?.toString() || '20');
  const [currentWeek, setCurrentWeek] = useState(settings?.currentWeek?.toString() || '1');
  const [semesterStartDate, setSemesterStartDate] = useState(settings?.semesterStartDate || getTodayString());
  const [autoUpdateWeek, setAutoUpdateWeek] = useState(settings?.autoUpdateWeek ?? true);
  const [saving, setSaving] = useState(false);
  
  // 逆推功能相关状态
  const [calculationMode, setCalculationMode] = useState<'forward' | 'reverse'>('forward');
  const [currentWeekInput, setCurrentWeekInput] = useState('');
  const [calculatedStartDate, setCalculatedStartDate] = useState('');
  const [showCalculationResult, setShowCalculationResult] = useState(false);

  // 同步设置数据
  useEffect(() => {
    if (settings) {
      setCurrentWeek(settings.currentWeek?.toString() || '1');
      setSemesterStartDate(settings.semesterStartDate || getTodayString());
      setAutoUpdateWeek(settings.autoUpdateWeek ?? true);
    }
  }, [settings]);

  // 同步课表数据
  useEffect(() => {
    if (currentSchedule) {
      setScheduleName(currentSchedule.name);
      setTotalWeeks(currentSchedule.totalWeeks?.toString() || '20');
    }
  }, [currentSchedule]);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!scheduleName.trim()) {
      toast.error('请输入课表名称');
      return;
    }
    
    const parsedTotalWeeks = parseInt(totalWeeks, 10);
    if (isNaN(parsedTotalWeeks) || parsedTotalWeeks < 1 || parsedTotalWeeks > 30) {
      toast.error('总周数应为1-30之间的整数');
      return;
    }

    const parsedCurrentWeek = parseInt(currentWeek, 10);
    if (isNaN(parsedCurrentWeek) || parsedCurrentWeek < 1 || parsedCurrentWeek > parsedTotalWeeks) {
      toast.error(`当前周数应为1-${parsedTotalWeeks}之间的整数`);
      return;
    }

    if (!isValidDateString(semesterStartDate)) {
      toast.error('请输入正确的学期开始日期');
      return;
    }
    
    try {
      setSaving(true);
      
      // 保存课表设置
      if (currentSchedule) {
        await updateSchedule({
          name: scheduleName.trim(),
          totalWeeks: parsedTotalWeeks
        });
      }

      // 保存应用设置
      await updateSettings({
        currentWeek: parsedCurrentWeek,
        semesterStartDate: semesterStartDate,
        autoUpdateWeek: autoUpdateWeek
      });
      
      toast.success('设置已保存');
    } catch (error) {
      console.error('Failed to save settings', error);
      toast.error('保存设置失败');
    } finally {
      setSaving(false);
    }
  };

  // 处理逆推计算
  const handleReverseCalculation = () => {
    const weekNumber = parseInt(currentWeekInput, 10);
    
    if (isNaN(weekNumber) || weekNumber < 1 || weekNumber > 30) {
      toast.error('请输入有效的周数（1-30）');
      return;
    }
    
    try {
      const calculatedDate = calculateSemesterStartDate(weekNumber);
      
      // 验证计算结果
      if (validateReverseCalculation(calculatedDate, weekNumber)) {
        setCalculatedStartDate(calculatedDate);
        setShowCalculationResult(true);
        toast.success('计算成功！您可以选择应用这个日期');
      } else {
        toast.error('计算结果可能不准确，请检查输入的周数');
      }
    } catch (error) {
      console.error('Reverse calculation failed:', error);
      toast.error('计算失败，请重试');
    }
  };

  // 应用逆推计算的结果
  const applyCalculatedDate = () => {
    setSemesterStartDate(calculatedStartDate);
    setShowCalculationResult(false);
    toast.success('已应用计算结果');
  };

  // 切换计算模式
  const handleModeChange = (mode: 'forward' | 'reverse') => {
    setCalculationMode(mode);
    setShowCalculationResult(false);
    setCurrentWeekInput('');
  };
  
  // 移除这个条件，允许在没有课表时也能设置周数管理
  
  return (
    <SettingsContainer>
      <h3>课表设置</h3>
      
      <form onSubmit={handleSubmit}>
        {currentSchedule && (
          <>
            <SectionTitle>基本设置</SectionTitle>
            <FormGroup>
              <FormLabel htmlFor="scheduleName">课表名称</FormLabel>
              <GlassInput
                id="scheduleName"
                type="text"
                value={scheduleName}
                onChange={(e) => setScheduleName(e.target.value)}
                placeholder="请输入课表名称"
                required
                fullWidth
              />
            </FormGroup>
            
            <FormGroup>
              <FormLabel htmlFor="totalWeeks">总周数</FormLabel>
              <GlassInput
                id="totalWeeks"
                type="number"
                min="1"
                max="30"
                value={totalWeeks}
                onChange={(e) => setTotalWeeks(e.target.value)}
                placeholder="请输入总周数"
                required
                fullWidth
              />
            </FormGroup>
          </>
        )}
        
        <SectionTitle>周数管理</SectionTitle>
        
        <FormGroup>
          <FormLabel>设置方式</FormLabel>
          <ModeToggle>
            <ModeButton 
              active={calculationMode === 'forward'} 
              onClick={() => handleModeChange('forward')}
              type="button"
            >
              📅 知道开学日期
            </ModeButton>
            <ModeButton 
              active={calculationMode === 'reverse'} 
              onClick={() => handleModeChange('reverse')}
              type="button"
            >
              🔢 知道当前周数
            </ModeButton>
          </ModeToggle>
        </FormGroup>

        {calculationMode === 'forward' ? (
          <FormGroup>
            <FormLabel htmlFor="semesterStartDate">学期开始日期</FormLabel>
            <GlassInput
              id="semesterStartDate"
              type="date"
              value={semesterStartDate}
              onChange={(e) => setSemesterStartDate(e.target.value)}
              required
              fullWidth
            />
            <SettingDescription>
              设置学期开始的日期，系统将根据此日期自动计算当前周数
            </SettingDescription>
          </FormGroup>
        ) : (
          <FormGroup>
            <ReverseCalculationContainer>
              <FormLabel htmlFor="currentWeekInput">今天是第几周？</FormLabel>
              <GlassInput
                id="currentWeekInput"
                type="number"
                min="1"
                max="30"
                value={currentWeekInput}
                onChange={(e) => setCurrentWeekInput(e.target.value)}
                placeholder="例如：第5周"
                fullWidth
              />
              <CalculateButton
                type="button"
                onClick={handleReverseCalculation}
                disabled={!currentWeekInput}
              >
                🧮 计算学期开始日期
              </CalculateButton>
              
              {showCalculationResult && (
                <ResultDisplay>
                  <ResultText>
                    📊 计算结果：学期开始日期为 <strong>{calculatedStartDate}</strong>
                  </ResultText>
                  <CalculateButton
                    type="button"
                    onClick={applyCalculatedDate}
                    style={{ marginTop: '0.5rem', marginRight: '0.5rem' }}
                  >
                    ✅ 应用这个日期
                  </CalculateButton>
                  <CalculateButton
                    type="button"
                    onClick={() => setShowCalculationResult(false)}
                    style={{ marginTop: '0.5rem', background: 'rgba(255, 69, 58, 0.6)' }}
                  >
                    ❌ 重新计算
                  </CalculateButton>
                </ResultDisplay>
              )}
            </ReverseCalculationContainer>
            
            <SettingDescription>
              💡 如果您不知道具体的开学日期，可以输入今天是第几周，系统将自动计算出学期开始日期
            </SettingDescription>
          </FormGroup>
        )}

        <FormGroup>
          <CheckboxGroup>
            <CheckboxInput
              id="autoUpdateWeek"
              type="checkbox"
              checked={autoUpdateWeek}
              onChange={(e) => setAutoUpdateWeek(e.target.checked)}
            />
            <CheckboxLabel htmlFor="autoUpdateWeek">
              自动更新当前周数
            </CheckboxLabel>
          </CheckboxGroup>
          <SettingDescription>
            开启后，系统将根据当前日期和学期开始日期自动计算并更新当前周数
          </SettingDescription>
        </FormGroup>

        {!autoUpdateWeek && (
          <FormGroup>
            <FormLabel htmlFor="currentWeek">当前周数</FormLabel>
            <GlassInput
              id="currentWeek"
              type="number"
              min="1"
              max={totalWeeks}
              value={currentWeek}
              onChange={(e) => setCurrentWeek(e.target.value)}
              placeholder="请输入当前周数"
              required
              fullWidth
            />
            <SettingDescription>
              手动设置当前周数，关闭自动更新时生效
            </SettingDescription>
          </FormGroup>
        )}

        {autoUpdateWeek && (
          <FormGroup>
            <SettingDescription>
              当前计算得出的周数：第 {getCurrentWeek()} 周
            </SettingDescription>
          </FormGroup>
        )}
        
        <FormActions>
          <GlassButton
            type="submit"
            disabled={saving}
          >
            {saving ? '保存中...' : '保存设置'}
          </GlassButton>
        </FormActions>
      </form>
    </SettingsContainer>
  );
};

export default ScheduleSettings; 